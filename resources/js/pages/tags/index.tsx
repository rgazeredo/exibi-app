import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Head, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Image,
    ListVideo,
    Loader2,
    Monitor,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Tags,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
    media_count: number;
    players_count: number;
    playlists_count: number;
    usage_count: number;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface TagsIndexProps {
    filters: {
        search?: string;
    };
}

const colorOptions = [
    { name: 'Gray', value: '#6b7280' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
];

export default function TagsIndex({ filters }: TagsIndexProps) {
    const { t } = useT();
    const [data, setData] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: null,
        to: null,
    });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({ name: '', color: '#6b7280' });
    const [saving, setSaving] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('tags.title'), href: '/tags' },
    ];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data from API
    const fetchData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set('search', debouncedSearch);
            params.set('page', page.toString());
            params.set('per_page', '20');

            if (sorting.length > 0) {
                params.set('sort', sorting[0].id);
                params.set('direction', sorting[0].desc ? 'desc' : 'asc');
            }

            const response = await fetch(`/api/tags/search?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const result = await response.json();
            setData(result.data.data || result.data);
            setPagination(result.meta);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sorting]);

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearch, sorting]);

    const openCreateDialog = () => {
        setFormData({ name: '', color: '#6b7280' });
        setCreateDialogOpen(true);
    };

    const openEditDialog = (tag: Tag) => {
        setSelectedTag(tag);
        setFormData({ name: tag.name, color: tag.color });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (tag: Tag) => {
        setSelectedTag(tag);
        setDeleteDialogOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.post('/tags', formData, {
            onSuccess: () => {
                setCreateDialogOpen(false);
                setSaving(false);
                setFormData({ name: '', color: '#6b7280' });
                fetchData(pagination.current_page);
            },
            onError: () => setSaving(false),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTag) return;
        setSaving(true);
        router.put(`/tags/${selectedTag.id}`, formData, {
            onSuccess: () => {
                setEditDialogOpen(false);
                setSaving(false);
                setSelectedTag(null);
                fetchData(pagination.current_page);
            },
            onError: () => setSaving(false),
        });
    };

    const handleDelete = () => {
        if (!selectedTag) return;
        router.delete(`/tags/${selectedTag.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedTag(null);
                fetchData(pagination.current_page);
            },
        });
    };

    // Column definitions
    const columns: ColumnDef<Tag>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="justify-start"
                >
                    {t('tags.tag')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge
                    style={{ backgroundColor: row.original.color, color: '#fff' }}
                    className="font-medium"
                >
                    {row.original.name}
                </Badge>
            ),
        },
        {
            accessorKey: 'media_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 justify-start"
                >
                    {t('tags.media')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Image className="h-4 w-4" />
                    {row.original.media_count}
                </div>
            ),
        },
        {
            accessorKey: 'players_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 justify-start"
                >
                    {t('players.title')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Monitor className="h-4 w-4" />
                    {row.original.players_count}
                </div>
            ),
        },
        {
            accessorKey: 'playlists_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 justify-start"
                >
                    {t('tags.playlists')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ListVideo className="h-4 w-4" />
                    {row.original.playlists_count}
                </div>
            ),
        },
        {
            accessorKey: 'usage_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 justify-start"
                >
                    {t('tags.totalUsage')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.usage_count}</span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 justify-start"
                >
                    {t('common.created')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) =>
                format(
                    new Date(row.original.created_at),
                    'dd/MM/yyyy HH:mm',
                ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const tag = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => openDeleteDialog(tag)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('common.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
        },
    ], [pagination.current_page]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        pageCount: pagination.last_page,
    });

    const goToPage = (page: number) => {
        fetchData(page);
    };

    const hasFilters = !!search;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('tags.title')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                            <Tags className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{t('tags.title')}</h1>
                            <p className="text-muted-foreground">{t('tags.subtitle')}</p>
                        </div>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('tags.newTag')}
                    </Button>
                </div>

                {/* Search */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('tags.searchTags')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Tags className="h-10 w-10 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-semibold">{t('tags.noTagsFound')}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {hasFilters
                                                    ? t('tags.tryAdjustingSearch')
                                                    : t('tags.getStarted')}
                                            </p>
                                            {!hasFilters && (
                                                <Button onClick={openCreateDialog} className="mt-4">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    {t('tags.newTag')}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t('common.showing')} {pagination.from} {t('common.to')} {pagination.to} {t('common.of')} {pagination.total} {t('common.results')}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(1)}
                                disabled={pagination.current_page === 1 || loading}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1 || loading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm px-2">
                                {t('common.pageOf', { current: pagination.current_page, total: pagination.last_page })}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page || loading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.last_page)}
                                disabled={pagination.current_page === pagination.last_page || loading}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>{t('tags.createTag')}</DialogTitle>
                            <DialogDescription>{t('tags.createTagDesc')}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="create-name">{t('common.name')}</Label>
                                <Input
                                    id="create-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-2"
                                    placeholder="e.g., Featured, Promotional"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <Label>{t('tags.color')}</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value
                                                    ? 'border-foreground scale-110'
                                                    : 'border-transparent hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>{t('tags.preview')}</Label>
                                <div className="mt-2">
                                    <Badge
                                        style={{ backgroundColor: formData.color, color: '#fff' }}
                                        className="font-medium"
                                    >
                                        {formData.name || 'Tag Name'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                                disabled={saving}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={saving || !formData.name.trim()}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('common.create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle>{t('tags.editTag')}</DialogTitle>
                            <DialogDescription>{t('tags.editTagDesc')}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="edit-name">{t('common.name')}</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-2"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <Label>{t('tags.color')}</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value
                                                    ? 'border-foreground scale-110'
                                                    : 'border-transparent hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>{t('tags.preview')}</Label>
                                <div className="mt-2">
                                    <Badge
                                        style={{ backgroundColor: formData.color, color: '#fff' }}
                                        className="font-medium"
                                    >
                                        {formData.name || 'Tag Name'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditDialogOpen(false)}
                                disabled={saving}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={saving || !formData.name.trim()}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('common.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('tags.deleteTag')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('tags.deleteConfirm', { name: selectedTag?.name })}
                            {selectedTag && selectedTag.usage_count > 0 && (
                                <span className="block mt-2 text-destructive">
                                    {t('tags.usedInItems', { count: selectedTag.usage_count })}
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
