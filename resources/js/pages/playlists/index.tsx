import { TagBadges, TagInput } from '@/components/tag-input';
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
import { Checkbox } from '@/components/ui/checkbox';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Copy,
    Eye,
    Film,
    ListVideo,
    Loader2,
    MonitorPlay,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface Playlist {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    media_count: number;
    players_count: number;
    tags: Tag[];
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

interface PlaylistsIndexProps {
    filters: {
        search?: string;
        tag?: string;
    };
}

export default function PlaylistsIndex({ filters }: PlaylistsIndexProps) {
    const { t } = useT();
    const [data, setData] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(
        filters.search || '',
    );
    const [tagFilter, setTagFilter] = useState(filters.tag || 'all');
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'created_at', desc: true },
    ]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(
        null,
    );
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [playlistToDuplicate, setPlaylistToDuplicate] =
        useState<Playlist | null>(null);
    const [duplicating, setDuplicating] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [playlistToEdit, setPlaylistToEdit] = useState<Playlist | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editTags, setEditTags] = useState<Tag[]>([]);
    const [editIsActive, setEditIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('playlists.title'), href: '/playlists' },
    ];

    // Fetch available tags for filter
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags', {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const tags = await response.json();
                setAvailableTags(tags);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        fetchTags();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data from API
    const fetchData = useCallback(
        async (page: number) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (debouncedSearch) params.set('search', debouncedSearch);
                if (tagFilter && tagFilter !== 'all')
                    params.set('tag', tagFilter);
                params.set('page', page.toString());
                params.set('per_page', '10');

                if (sorting.length > 0) {
                    params.set('sort', sorting[0].id);
                    params.set('direction', sorting[0].desc ? 'desc' : 'asc');
                }

                const response = await fetch(
                    `/api/playlists/search?${params.toString()}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );
                const result = await response.json();
                setData(result.data.data || result.data);
                setPagination(result.meta);
            } catch (error) {
                console.error('Failed to fetch playlists:', error);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, tagFilter, sorting],
    );

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearch, tagFilter, sorting]);

    const handleDelete = (playlist: Playlist) => {
        setPlaylistToDelete(playlist);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (playlistToDelete) {
            router.delete(`/playlists/${playlistToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPlaylistToDelete(null);
                    fetchData(pagination.current_page);
                },
            });
        }
    };

    const handleDuplicate = (playlist: Playlist) => {
        setPlaylistToDuplicate(playlist);
        setDuplicateDialogOpen(true);
    };

    const confirmDuplicate = () => {
        if (playlistToDuplicate) {
            setDuplicating(true);
            router.post(
                `/playlists/${playlistToDuplicate.id}/duplicate`,
                {},
                {
                    onSuccess: () => {
                        setDuplicateDialogOpen(false);
                        setPlaylistToDuplicate(null);
                        setDuplicating(false);
                        fetchData(pagination.current_page);
                    },
                    onError: () => {
                        setDuplicating(false);
                    },
                },
            );
        }
    };

    const handleEdit = (playlist: Playlist) => {
        setPlaylistToEdit(playlist);
        setEditName(playlist.name);
        setEditDescription(playlist.description || '');
        setEditTags(playlist.tags || []);
        setEditIsActive(playlist.is_active);
        setEditDialogOpen(true);
    };

    const confirmEdit = async () => {
        if (playlistToEdit) {
            setSaving(true);
            try {
                const response = await fetch(
                    `/playlists/${playlistToEdit.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-XSRF-TOKEN': decodeURIComponent(
                                document.cookie
                                    .split('; ')
                                    .find((row) =>
                                        row.startsWith('XSRF-TOKEN='),
                                    )
                                    ?.split('=')[1] || '',
                            ),
                        },
                        body: JSON.stringify({
                            name: editName,
                            description: editDescription || null,
                            is_active: editIsActive,
                            tags: editTags.map((t) => t.id),
                        }),
                    },
                );

                if (response.ok) {
                    setEditDialogOpen(false);
                    setPlaylistToEdit(null);
                    fetchData(pagination.current_page);
                }
            } catch (error) {
                console.error('Failed to update playlist:', error);
            } finally {
                setSaving(false);
            }
        }
    };

    // Column definitions
    const columns: ColumnDef<Playlist>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="justify-start"
                    >
                        {t('common.name')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const playlist = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <ListVideo className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <Link
                                    href={`/playlists/${playlist.id}`}
                                    className="font-medium hover:underline"
                                >
                                    {playlist.name}
                                </Link>
                                {playlist.description && (
                                    <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                                        {playlist.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'tags',
                header: t('tags.title'),
                cell: ({ row }) => {
                    const tags = row.original.tags || [];
                    return tags.length > 0 ? (
                        <TagBadges tags={tags} />
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: 'media_count',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('media.title')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="flex items-center gap-1 text-sm">
                        <Film className="h-4 w-4 text-muted-foreground" />
                        {row.original.media_count}
                    </span>
                ),
            },
            {
                accessorKey: 'players_count',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('players.title')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="flex items-center gap-1 text-sm">
                        <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                        {row.original.players_count}
                    </span>
                ),
            },
            {
                accessorKey: 'is_active',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('common.status')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.is_active ? 'default' : 'secondary'
                        }
                    >
                        {row.original.is_active
                            ? t('common.active')
                            : t('common.inactive')}
                    </Badge>
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
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
                    const playlist = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/playlists/${playlist.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('common.details')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDuplicate(playlist)}
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    {t('playlists.duplicate')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleEdit(playlist)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleDelete(playlist)}
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
        ],
        [pagination.current_page],
    );

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

    const hasFilters = search || tagFilter !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('playlists.title')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                            <ListVideo className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {t('playlists.title')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('playlists.subtitle')}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/playlists/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('playlists.createPlaylist')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="relative max-w-sm min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={
                                t('playlists.searchPlaylists') ||
                                'Search playlists...'
                            }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Filter by tag" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('tags.allTags') || 'All Tags'}
                            </SelectItem>
                            {availableTags.map((tag) => (
                                <SelectItem key={tag.id} value={tag.id}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                                backgroundColor: tag.color,
                                            }}
                                        />
                                        {tag.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <ListVideo className="h-10 w-10 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-semibold">
                                                {t(
                                                    'playlists.noPlaylistsFound',
                                                )}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {hasFilters
                                                    ? t(
                                                          'playlists.tryAdjustingFilters',
                                                      )
                                                    : t('playlists.getStarted')}
                                            </p>
                                            {!hasFilters && (
                                                <Button
                                                    asChild
                                                    className="mt-4"
                                                >
                                                    <Link href="/playlists/create">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        {t(
                                                            'playlists.createPlaylist',
                                                        )}
                                                    </Link>
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
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
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
                            {t('common.showing')} {pagination.from}{' '}
                            {t('common.to')} {pagination.to} {t('common.of')}{' '}
                            {pagination.total} {t('common.results')}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(1)}
                                disabled={
                                    pagination.current_page === 1 || loading
                                }
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    goToPage(pagination.current_page - 1)
                                }
                                disabled={
                                    pagination.current_page === 1 || loading
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-2 text-sm">
                                {t('common.pageOf', {
                                    current: pagination.current_page,
                                    total: pagination.last_page,
                                })}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    goToPage(pagination.current_page + 1)
                                }
                                disabled={
                                    pagination.current_page ===
                                        pagination.last_page || loading
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.last_page)}
                                disabled={
                                    pagination.current_page ===
                                        pagination.last_page || loading
                                }
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('playlists.deletePlaylist')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('playlists.deleteConfirm', {
                                name: playlistToDelete?.name,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Duplicate Confirmation Dialog */}
            <AlertDialog
                open={duplicateDialogOpen}
                onOpenChange={setDuplicateDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('playlists.duplicatePlaylist')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('playlists.duplicateConfirm', {
                                name: playlistToDuplicate?.name,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={duplicating}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDuplicate}
                            disabled={duplicating}
                        >
                            {duplicating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('playlists.duplicate')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('playlists.editPlaylist') || 'Edit Playlist'}
                        </DialogTitle>
                        <DialogDescription>
                            {t('playlists.editPlaylistDesc') ||
                                'Update the details of this playlist.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit-name">
                                {t('common.name')}
                            </Label>
                            <Input
                                id="edit-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="mt-2"
                                autoFocus
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">
                                {t('common.description')}
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) =>
                                    setEditDescription(e.target.value)
                                }
                                className="mt-2"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>{t('tags.title')}</Label>
                            <div className="mt-2">
                                <TagInput
                                    value={editTags}
                                    onChange={setEditTags}
                                    placeholder={
                                        t('tags.selectTags') || 'Select tags...'
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-is-active"
                                checked={editIsActive}
                                onCheckedChange={(checked) =>
                                    setEditIsActive(checked === true)
                                }
                            />
                            <Label
                                htmlFor="edit-is-active"
                                className="cursor-pointer"
                            >
                                {t('common.active')}
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={saving}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={confirmEdit}
                            disabled={saving || !editName.trim()}
                        >
                            {saving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
