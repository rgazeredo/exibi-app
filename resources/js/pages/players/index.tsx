import { TagBadges } from '@/components/tag-input';
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
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
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
    Eye,
    ListRestart,
    Loader2,
    MonitorPlay,
    MoreHorizontal,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface LayoutPlaylist {
    id: string;
    name: string;
}

interface PlayerGroupLayout {
    id: string;
    name: string;
    playlists: LayoutPlaylist[];
}

interface PlayerGroup {
    id: string;
    name: string;
    is_default: boolean;
    layout: PlayerGroupLayout | null;
}

interface Player {
    id: string;
    name: string;
    description: string | null;
    is_online: boolean;
    is_outdated: boolean;
    last_seen_at: string | null;
    effective_layout: {
        id: string;
        name: string;
        source: 'player' | 'group';
        playlists: LayoutPlaylist[];
    } | null;
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

interface PlayersIndexProps {
    filters: {
        search?: string;
        status?: string;
        tag?: string;
    };
    canCreate: boolean;
}

export default function PlayersIndex({
    filters,
    canCreate,
}: PlayersIndexProps) {
    const { t } = useT();
    const [data, setData] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(
        filters.search || '',
    );
    const [status, setStatus] = useState(filters.status || 'all');
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
    const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
    const [refreshingPlayerId, setRefreshingPlayerId] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('players.title'), href: '/players' },
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
                if (status && status !== 'all') params.set('status', status);
                if (tagFilter && tagFilter !== 'all')
                    params.set('tag', tagFilter);
                params.set('page', page.toString());
                params.set('per_page', '10');

                if (sorting.length > 0) {
                    params.set('sort', sorting[0].id);
                    params.set('direction', sorting[0].desc ? 'desc' : 'asc');
                }

                const response = await fetch(
                    `/api/players/search?${params.toString()}`,
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
                console.error('Failed to fetch players:', error);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, status, tagFilter, sorting],
    );

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearch, status, tagFilter, sorting]);

    const handleDelete = (player: Player) => {
        setPlayerToDelete(player);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (playerToDelete) {
            router.delete(`/players/${playerToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPlayerToDelete(null);
                    fetchData(pagination.current_page);
                },
            });
        }
    };

    const handleRefreshPlayer = async (player: Player) => {
        if (!player.is_online) return;
        setRefreshingPlayerId(player.id);
        try {
            await axios.post(`/players/${player.id}/refresh-playlist`);
        } catch (error) {
            console.error('Failed to refresh player:', error);
        } finally {
            setRefreshingPlayerId(null);
        }
    };

    // Column definitions
    const columns: ColumnDef<Player>[] = useMemo(
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
                    const player = row.original;
                    return (
                        <div className="ml-2">
                            <Link
                                href={`/players/${player.id}`}
                                className="font-medium hover:underline"
                            >
                                {player.name}
                            </Link>
                            {player.description && (
                                <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                                    {player.description}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'is_online',
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
                cell: ({ row }) => {
                    const player = row.original;
                    return (
                        <div className="flex items-center gap-1.5">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${player.is_online ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}
                            >
                                {player.is_online ? (
                                    <Wifi className="h-4 w-4 text-green-600" />
                                ) : (
                                    <WifiOff className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                            {player.is_outdated && (
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900"
                                    title={t('players.outdatedTooltip')}
                                >
                                    <RefreshCw className="h-4 w-4 text-amber-600" />
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'effective_layout',
                header: t('players.layout'),
                cell: ({ row }) => {
                    const effectiveLayout = row.original.effective_layout;

                    if (!effectiveLayout) {
                        return (
                            <span className="text-sm text-muted-foreground italic">
                                {t('players.noLayout')}
                            </span>
                        );
                    }

                    return (
                        <span className="text-sm">{effectiveLayout.name}</span>
                    );
                },
                enableSorting: false,
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
                accessorKey: 'last_seen_at',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('players.lastSeen')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.last_seen_at || t('common.never')}
                    </span>
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
                    const player = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">
                                        {t('common.actions')}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/players/${player.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('players.view')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleRefreshPlayer(player)}
                                    disabled={!player.is_online || refreshingPlayerId === player.id}
                                >
                                    {refreshingPlayerId === player.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ListRestart className="mr-2 h-4 w-4" />
                                    )}
                                    {t('players.refreshPlayer')}
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/players/${player.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t('common.edit')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleDelete(player)}
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

    const hasFilters = search || status !== 'all' || tagFilter !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('players.title')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                            <MonitorPlay className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {t('players.title')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('players.subtitle')}
                            </p>
                        </div>
                    </div>
                    {canCreate ? (
                        <Button asChild>
                            <Link href="/players/create">
                                <Plus className="mr-2 h-4 w-4" />
                                {t('players.addPlayer')}
                            </Link>
                        </Button>
                    ) : (
                        <Button disabled title={t('players.limitReached')}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('players.addPlayer')}
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="relative max-w-sm min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('players.searchPlayers')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder={t('common.status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('players.allStatus')}
                            </SelectItem>
                            <SelectItem value="online">
                                {t('players.status.online')}
                            </SelectItem>
                            <SelectItem value="offline">
                                {t('players.status.offline')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue
                                placeholder={t('players.filterByTag')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('players.allTags')}
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
                                            <MonitorPlay className="h-10 w-10 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-semibold">
                                                {t('players.noPlayersFound')}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {hasFilters
                                                    ? t(
                                                          'players.tryAdjustingFilters',
                                                      )
                                                    : t('players.getStarted')}
                                            </p>
                                            {!hasFilters && canCreate && (
                                                <Button
                                                    asChild
                                                    className="mt-4"
                                                >
                                                    <Link href="/players/create">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        {t('players.addPlayer')}
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
                            {t('players.deletePlayer')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('players.deleteConfirm', {
                                name: playerToDelete?.name,
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
        </AppLayout>
    );
}
