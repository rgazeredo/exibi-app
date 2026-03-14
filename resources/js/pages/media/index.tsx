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
import { Card } from '@/components/ui/card';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UploadMediaDialog } from '@/components/upload-media-dialog';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    Eye,
    Film,
    HardDrive,
    Image,
    ListMusic,
    Loader2,
    Monitor,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Smartphone,
    Trash2,
    Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface MediaItem {
    id: string;
    title: string;
    type: 'video' | 'image';
    mime_type: string;
    size_bytes: number;
    formatted_size: string;
    duration_seconds: number | null;
    formatted_duration: string | null;
    resolution: string | null;
    orientation: 'portrait' | 'landscape' | null;
    thumbnail_url: string | null;
    url: string | null;
    tags: Tag[];
    playlists_count: number;
    created_at: string;
    created_at_human: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface MediaStats {
    total: number;
    videos: number;
    images: number;
    total_storage: string;
}

interface MediaIndexProps {
    filters: {
        search?: string;
        type?: string;
    };
    stats: MediaStats;
}

export default function MediaIndex({
    filters,
    stats: initialStats,
}: MediaIndexProps) {
    const { t } = useT();
    const [data, setData] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<MediaStats>(initialStats);
    const [search, setSearch] = useState(filters.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(
        filters.search || '',
    );
    const [type, setType] = useState(filters.type || 'all');
    const [tagFilter, setTagFilter] = useState<string>('all');
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

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [mediaToEdit, setMediaToEdit] = useState<MediaItem | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editTags, setEditTags] = useState<Tag[]>([]);
    const [saving, setSaving] = useState(false);

    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const pageBreadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('media.title'), href: '/media' },
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
                if (type && type !== 'all') params.set('type', type);
                if (tagFilter && tagFilter !== 'all')
                    params.set('tag', tagFilter);
                params.set('page', page.toString());
                params.set('per_page', '10');

                if (sorting.length > 0) {
                    params.set('sort', sorting[0].id);
                    params.set('direction', sorting[0].desc ? 'desc' : 'asc');
                }

                const response = await fetch(
                    `/api/media/search?${params.toString()}`,
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
                // Clear selection when changing folders/filters
                setSelectedIds(new Set());
            } catch (error) {
                console.error('Failed to fetch media:', error);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, type, tagFilter, sorting],
    );

    // Fetch stats from API
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/media/stats', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const newStats = await response.json();
            setStats(newStats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    // Handle upload complete - refresh data and stats
    const handleUploadComplete = useCallback(() => {
        fetchData(1);
        fetchStats();
    }, [fetchData, fetchStats]);

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearch, type, tagFilter, sorting]);

    // Listen for media processing complete events via WebSocket
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('admin.media');

        channel.listen(
            '.processing.complete',
            (mediaData: {
                id: string;
                title: string;
                type: string;
                thumbnail_url: string | null;
                duration_seconds: number | null;
                formatted_duration: string | null;
                size_bytes: number;
                formatted_size: string;
                resolution: string | null;
                orientation: string | null;
            }) => {
                // Update the media item in the local state
                setData((prev) =>
                    prev.map((item) =>
                        item.id === mediaData.id
                            ? {
                                  ...item,
                                  thumbnail_url: mediaData.thumbnail_url,
                                  duration_seconds: mediaData.duration_seconds,
                                  formatted_duration:
                                      mediaData.formatted_duration,
                                  size_bytes: mediaData.size_bytes,
                                  formatted_size: mediaData.formatted_size,
                                  resolution: mediaData.resolution,
                                  orientation: mediaData.orientation as
                                      | 'portrait'
                                      | 'landscape'
                                      | null,
                              }
                            : item,
                    ),
                );

                // Also refresh stats to update storage usage
                fetchStats();
            },
        );

        return () => {
            channel.stopListening('.processing.complete');
            window.Echo?.leave('admin.media');
        };
    }, [fetchStats]);

    // Selection handlers
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(data.map((m) => m.id)));
        }
    };

    // Delete handlers
    const handleDelete = (media: MediaItem) => {
        setMediaToDelete(media);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (mediaToDelete) {
            router.delete(`/media/${mediaToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setMediaToDelete(null);
                    fetchData(pagination.current_page);
                    fetchStats();
                },
            });
        }
    };

    const handleDownload = (media: MediaItem) => {
        if (media.url) {
            const link = document.createElement('a');
            link.href = media.url;
            link.download = media.title;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Edit handlers
    const handleEdit = (media: MediaItem) => {
        setMediaToEdit(media);
        setEditTitle(media.title);
        setEditTags(media.tags || []);
        setEditDialogOpen(true);
    };

    const confirmEdit = async () => {
        if (mediaToEdit) {
            setSaving(true);
            try {
                const response = await fetch(`/media/${mediaToEdit.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': decodeURIComponent(
                            document.cookie
                                .split('; ')
                                .find((row) => row.startsWith('XSRF-TOKEN='))
                                ?.split('=')[1] || '',
                        ),
                    },
                    body: JSON.stringify({
                        title: editTitle,
                        tags: editTags.map((t) => t.id),
                    }),
                });

                if (response.ok) {
                    setEditDialogOpen(false);
                    setMediaToEdit(null);
                    fetchData(pagination.current_page);
                }
            } catch (error) {
                console.error('Failed to update media:', error);
            } finally {
                setSaving(false);
            }
        }
    };

    // Bulk delete handler
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        setBulkDeleting(true);
        try {
            const response = await fetch('/api/media/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] || '',
                    ),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    media_ids: Array.from(selectedIds),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Erro ao excluir mídias');
                return;
            }

            toast.success(
                selectedIds.size === 1
                    ? 'Mídia excluída com sucesso'
                    : `${selectedIds.size} mídias excluídas com sucesso`,
            );

            setBulkDeleteDialogOpen(false);
            setSelectedIds(new Set());
            fetchData(pagination.current_page);
            fetchStats();
            (
                window as unknown as { refreshFolderTree?: () => void }
            ).refreshFolderTree?.();
        } catch (error) {
            console.error('Failed to delete media:', error);
            toast.error('Erro ao excluir mídias');
        } finally {
            setBulkDeleting(false);
        }
    };

    // Column definitions
    const columns: ColumnDef<MediaItem>[] = useMemo(
        () => [
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={
                            data.length > 0 && selectedIds.size === data.length
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedIds.has(row.original.id)}
                        onCheckedChange={() => toggleSelection(row.original.id)}
                        aria-label="Select row"
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'title',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('media.title_column')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <Link
                            href={`/media/${item.id}`}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-10 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                                {item.thumbnail_url ? (
                                    <img
                                        src={item.thumbnail_url}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : item.type === 'video' ? (
                                    <Film className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <Image className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <span className="font-medium hover:underline">
                                {item.title}
                            </span>
                        </Link>
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
                accessorKey: 'type',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('common.type')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const type = row.getValue('type') as string;
                    return (
                        <Badge
                            variant={type === 'video' ? 'default' : 'secondary'}
                        >
                            {type}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'playlists_count',
                header: () => (
                    <span className="flex items-center gap-1.5">
                        <ListMusic className="h-4 w-4" />
                        Playlists
                    </span>
                ),
                cell: ({ row }) => {
                    const count = row.original.playlists_count;
                    return count > 0 ? (
                        <Badge variant="secondary">{count}</Badge>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: 'duration_seconds',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('media.duration')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => row.original.formatted_duration || '-',
            },
            {
                accessorKey: 'resolution',
                header: t('media.resolution'),
                cell: ({ row }) => {
                    const { resolution, orientation } = row.original;
                    if (!resolution) return '-';
                    const isPortrait = orientation === 'portrait';
                    const OrientationIcon = isPortrait ? Smartphone : Monitor;
                    const orientationLabel = isPortrait
                        ? t('media.orientationPortrait')
                        : t('media.orientationLandscape');
                    return (
                        <span className="flex items-center gap-1.5">
                            {resolution}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <OrientationIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    {orientationLabel}
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    );
                },
            },
            {
                accessorKey: 'size_bytes',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('media.size')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => row.original.formatted_size,
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
                        {t('media.created')}
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
                    const media = row.original;
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
                                    <Link href={`/media/${media.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('media.preview')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDownload(media)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {t('media.download')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleEdit(media)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleDelete(media)}
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
        [data, selectedIds, pagination.current_page],
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

    return (
        <AppLayout breadcrumbs={pageBreadcrumbs}>
            <Head title={t('media.title')} />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Main content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                                <HardDrive className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {t('media.title')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('media.subtitle')}
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-3 md:grid-cols-4">
                            <Card className="overflow-hidden">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                        <HardDrive className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('media.totalFiles')}
                                        </p>
                                        <p className="text-2xl leading-none font-bold">
                                            {stats.total}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="overflow-hidden">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                                        <Film className="h-4 w-4 text-violet-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('media.videos')}
                                        </p>
                                        <p className="text-2xl leading-none font-bold">
                                            {stats.videos}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="overflow-hidden">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <Image className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('media.images')}
                                        </p>
                                        <p className="text-2xl leading-none font-bold">
                                            {stats.images}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="overflow-hidden">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                        <HardDrive className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('media.storage')}
                                        </p>
                                        <p className="text-2xl leading-none font-bold">
                                            {stats.total_storage}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Filters and bulk actions */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative max-w-sm min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('media.searchMedia')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('media.allTypes')}
                                    </SelectItem>
                                    <SelectItem value="video">
                                        {t('media.videos')}
                                    </SelectItem>
                                    <SelectItem value="image">
                                        {t('media.images')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={tagFilter}
                                onValueChange={setTagFilter}
                            >
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
                                                        backgroundColor:
                                                            tag.color,
                                                    }}
                                                />
                                                {tag.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Bulk actions */}
                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedIds.size} selecionado(s)
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setBulkDeleteDialogOpen(true)
                                        }
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </Button>
                                </div>
                            )}

                            {/* Upload button */}
                            <Button
                                className="ml-auto"
                                onClick={() => setUploadDialogOpen(true)}
                            >
                                <Upload className="h-4 w-4" />
                                {t('media.uploadMedia')}
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header
                                                                          .column
                                                                          .columnDef
                                                                          .header,
                                                                      header.getContext(),
                                                                  )}
                                                        </TableHead>
                                                    ),
                                                )}
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
                                                    <HardDrive className="h-10 w-10 text-muted-foreground" />
                                                    <h3 className="mt-4 text-lg font-semibold">
                                                        {t(
                                                            'media.noMediaFound',
                                                        )}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {search ||
                                                        type !== 'all' ||
                                                        tagFilter !== 'all'
                                                            ? t(
                                                                  'media.tryAdjustingFilters',
                                                              )
                                                            : t(
                                                                  'media.getStarted',
                                                              )}
                                                    </p>
                                                    {!search &&
                                                        type === 'all' &&
                                                        tagFilter === 'all' && (
                                                            <Button
                                                                className="mt-4"
                                                                onClick={() =>
                                                                    setUploadDialogOpen(
                                                                        true,
                                                                    )
                                                                }
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                {t(
                                                                    'media.uploadMedia',
                                                                )}
                                                            </Button>
                                                        )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className={cn(
                                                    selectedIds.has(
                                                        row.original.id,
                                                    ) && 'bg-muted/50',
                                                )}
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
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
                                    {t('common.to')} {pagination.to}{' '}
                                    {t('common.of')} {pagination.total}{' '}
                                    {t('common.results')}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => goToPage(1)}
                                        disabled={
                                            pagination.current_page === 1 ||
                                            loading
                                        }
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            goToPage(
                                                pagination.current_page - 1,
                                            )
                                        }
                                        disabled={
                                            pagination.current_page === 1 ||
                                            loading
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
                                            goToPage(
                                                pagination.current_page + 1,
                                            )
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
                                        onClick={() =>
                                            goToPage(pagination.last_page)
                                        }
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
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('media.deleteMedia')}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    {t('media.deleteConfirm', {
                                        name: mediaToDelete?.title,
                                    })}
                                </p>
                                {mediaToDelete &&
                                    mediaToDelete.playlists_count > 0 && (
                                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                                            <div className="flex items-start gap-2">
                                                <ListMusic className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                                <div className="text-sm text-amber-800 dark:text-amber-200">
                                                    <p className="font-medium">
                                                        Atenção: mídia em
                                                        playlists
                                                    </p>
                                                    <p className="mt-1">
                                                        Esta mídia está sendo
                                                        usada em{' '}
                                                        {
                                                            mediaToDelete.playlists_count
                                                        }{' '}
                                                        {mediaToDelete.playlists_count ===
                                                        1
                                                            ? 'playlist'
                                                            : 'playlists'}
                                                        . Ao excluir, ela será
                                                        removida automaticamente
                                                        das playlists e os
                                                        players afetados serão
                                                        atualizados.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
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

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('media.editMedia') || 'Edit Media'}
                        </DialogTitle>
                        <DialogDescription>
                            {t('media.editMediaDesc') ||
                                'Update the details of this media file.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit-title">
                                {t('common.title') || 'Title'}
                            </Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="mt-2"
                                autoFocus
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
                            disabled={saving || !editTitle.trim()}
                        >
                            {saving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation */}
            <AlertDialog
                open={bulkDeleteDialogOpen}
                onOpenChange={setBulkDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Excluir {selectedIds.size}{' '}
                            {selectedIds.size === 1 ? 'mídia' : 'mídias'}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    Tem certeza que deseja excluir{' '}
                                    {selectedIds.size === 1
                                        ? 'esta mídia'
                                        : `estas ${selectedIds.size} mídias`}
                                    ? Esta ação não pode ser desfeita e os
                                    arquivos serão removidos permanentemente.
                                </p>
                                {(() => {
                                    const selectedMedia = data.filter((m) =>
                                        selectedIds.has(m.id),
                                    );
                                    const mediaInPlaylists =
                                        selectedMedia.filter(
                                            (m) => m.playlists_count > 0,
                                        );
                                    if (mediaInPlaylists.length === 0)
                                        return null;

                                    const totalPlaylists =
                                        mediaInPlaylists.reduce(
                                            (acc, m) => acc + m.playlists_count,
                                            0,
                                        );

                                    return (
                                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                                            <div className="flex items-start gap-2">
                                                <ListMusic className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                                <div className="text-sm text-amber-800 dark:text-amber-200">
                                                    <p className="font-medium">
                                                        Atenção: mídias em
                                                        playlists
                                                    </p>
                                                    <p className="mt-1">
                                                        {mediaInPlaylists.length ===
                                                        1
                                                            ? `1 mídia está sendo usada em ${totalPlaylists} ${totalPlaylists === 1 ? 'playlist' : 'playlists'}`
                                                            : `${mediaInPlaylists.length} mídias estão sendo usadas em playlists`}
                                                        . Ao excluir, elas serão
                                                        removidas
                                                        automaticamente das
                                                        playlists e os players
                                                        afetados serão
                                                        atualizados.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={bulkDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {bulkDeleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Upload Media Dialog */}
            <UploadMediaDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                folderId={null}
                folderName={null}
                onUploadComplete={handleUploadComplete}
            />
        </AppLayout>
    );
}
