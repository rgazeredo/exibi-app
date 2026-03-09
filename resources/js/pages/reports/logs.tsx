import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    FileText,
    Filter,
    Loader2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Player {
    id: string;
    name: string;
}

interface Media {
    id: string;
    title: string;
    type: string;
}

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface LogEntry {
    id: string;
    player_id: string;
    player_name: string;
    media_id: string;
    media_title: string;
    media_type: string;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    completed: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface LogsPageProps {
    filters: {
        date_range?: string;
        player_id?: string;
        media_id?: string;
        tag_id?: string;
        completed?: string;
        date_from?: string;
        date_to?: string;
    };
    players: Player[];
    media: Media[];
    tags: Tag[];
}

export default function LogsPage({
    filters,
    players,
    media,
    tags,
}: LogsPageProps) {
    const { t } = useT();

    // Filter states
    const [dateRange, setDateRange] = useState(filters.date_range || '7d');
    const [playerId, setPlayerId] = useState(filters.player_id || '_all');
    const [mediaId, setMediaId] = useState(filters.media_id || '_all');
    const [tagId, setTagId] = useState(filters.tag_id || '_all');
    const [completed, setCompleted] = useState(filters.completed || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Combobox open states
    const [openPlayer, setOpenPlayer] = useState(false);
    const [openMedia, setOpenMedia] = useState(false);
    const [openTag, setOpenTag] = useState(false);

    // Data states
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'started_at', desc: true },
    ]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: null,
        to: null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('reports.title'), href: '/reports' },
        { title: t('reports.detailedLogs'), href: '/reports/logs' },
    ];

    const fetchData = useCallback(
        async (page: number) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set('page', page.toString());
                params.set('per_page', '20');

                if (dateRange === 'custom') {
                    params.set('date_range', 'custom');
                    if (dateFrom) params.set('date_from', dateFrom);
                    if (dateTo) params.set('date_to', dateTo);
                } else {
                    params.set('date_range', dateRange);
                }

                if (playerId && playerId !== '_all')
                    params.set('player_id', playerId);
                if (mediaId && mediaId !== '_all')
                    params.set('media_id', mediaId);
                if (tagId && tagId !== '_all') params.set('tag_id', tagId);
                if (completed !== 'all') params.set('completed', completed);

                if (sorting.length > 0) {
                    params.set('sort', sorting[0].id);
                    params.set('direction', sorting[0].desc ? 'desc' : 'asc');
                }

                const response = await fetch(
                    `/api/reports/logs?${params.toString()}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );
                const result = await response.json();
                setLogs(result.data);
                setPagination(result.meta);
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        },
        [
            dateRange,
            dateFrom,
            dateTo,
            playerId,
            mediaId,
            tagId,
            completed,
            sorting,
        ],
    );

    useEffect(() => {
        fetchData(1);
    }, [
        dateRange,
        dateFrom,
        dateTo,
        playerId,
        mediaId,
        tagId,
        completed,
        sorting,
    ]);

    const formatDuration = (seconds: number | null) => {
        if (seconds === null || seconds === undefined) return '-';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const clearFilters = () => {
        setDateRange('7d');
        setPlayerId('_all');
        setMediaId('_all');
        setTagId('_all');
        setCompleted('all');
        setDateFrom('');
        setDateTo('');
    };

    const hasActiveFilters =
        (playerId && playerId !== '_all') ||
        (mediaId && mediaId !== '_all') ||
        (tagId && tagId !== '_all') ||
        completed !== 'all' ||
        dateRange === 'custom';

    // Helper to get selected item names
    const getSelectedPlayerName = () =>
        players.find((p) => p.id === playerId)?.name;
    const getSelectedMediaTitle = () =>
        media.find((m) => m.id === mediaId)?.title;
    const getSelectedTag = () => tags.find((t) => t.id === tagId);

    const columns: ColumnDef<LogEntry>[] = useMemo(
        () => [
            {
                accessorKey: 'started_at',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('reports.startedAt')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="text-sm">
                        {formatDate(row.getValue('started_at'))}
                    </span>
                ),
            },
            {
                accessorKey: 'player_name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('reports.player')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <Link
                        href={`/players/${row.original.player_id}`}
                        className="text-sm font-medium hover:underline"
                    >
                        {row.getValue('player_name')}
                    </Link>
                ),
            },
            {
                accessorKey: 'media_title',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 justify-start"
                    >
                        {t('reports.media')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {row.original.media_type}
                        </Badge>
                        <Link
                            href={`/media/${row.original.media_id}`}
                            className="text-sm hover:underline"
                        >
                            {row.getValue('media_title')}
                        </Link>
                    </div>
                ),
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
                        {t('reports.duration')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDuration(row.getValue('duration_seconds'))}
                    </span>
                ),
            },
            {
                accessorKey: 'completed',
                header: t('reports.completed'),
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.getValue('completed') ? 'default' : 'secondary'
                        }
                    >
                        {row.getValue('completed')
                            ? t('common.yes')
                            : t('common.no')}
                    </Badge>
                ),
            },
        ],
        [t],
    );

    const table = useReactTable({
        data: logs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        state: { sorting },
        onSortingChange: setSorting,
        pageCount: pagination.last_page,
    });

    const goToPage = (page: number) => {
        fetchData(page);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('reports.detailedLogs')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('reports.detailedLogs')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('reports.logsSubtitle')}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent>
                        <div className="mb-4 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                                {t('common.filters')}
                            </span>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="ml-auto h-8"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    {t('common.clearFilters')}
                                </Button>
                            )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {/* Date Range */}
                            <div className="space-y-2">
                                <Label>{t('reports.dateRange')}</Label>
                                <Select
                                    value={dateRange}
                                    onValueChange={setDateRange}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">
                                            {t('reports.today')}
                                        </SelectItem>
                                        <SelectItem value="7d">
                                            {t('reports.last7days')}
                                        </SelectItem>
                                        <SelectItem value="30d">
                                            {t('reports.last30days')}
                                        </SelectItem>
                                        <SelectItem value="90d">
                                            {t('reports.last90days')}
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            {t('reports.customRange')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Custom Date From */}
                            {dateRange === 'custom' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>{t('reports.dateFrom')}</Label>
                                        <Input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) =>
                                                setDateFrom(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('reports.dateTo')}</Label>
                                        <Input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) =>
                                                setDateTo(e.target.value)
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            {/* Player Filter */}
                            <div className="space-y-2">
                                <Label>{t('reports.player')}</Label>
                                <Popover
                                    open={openPlayer}
                                    onOpenChange={setOpenPlayer}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openPlayer}
                                            className="w-full justify-between font-normal"
                                        >
                                            <span className="truncate">
                                                {playerId === '_all'
                                                    ? t('reports.allPlayers')
                                                    : getSelectedPlayerName() ||
                                                      t('reports.allPlayers')}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[250px] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput
                                                placeholder={t(
                                                    'reports.searchPlayer',
                                                )}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {t('reports.noPlayerFound')}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="_all"
                                                        onSelect={() => {
                                                            setPlayerId('_all');
                                                            setOpenPlayer(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                playerId ===
                                                                    '_all'
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0',
                                                            )}
                                                        />
                                                        {t(
                                                            'reports.allPlayers',
                                                        )}
                                                    </CommandItem>
                                                    {players.map((player) => (
                                                        <CommandItem
                                                            key={player.id}
                                                            value={player.name}
                                                            onSelect={() => {
                                                                setPlayerId(
                                                                    player.id,
                                                                );
                                                                setOpenPlayer(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    playerId ===
                                                                        player.id
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                            {player.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Media Filter */}
                            <div className="space-y-2">
                                <Label>{t('reports.media')}</Label>
                                <Popover
                                    open={openMedia}
                                    onOpenChange={setOpenMedia}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openMedia}
                                            className="w-full justify-between font-normal"
                                        >
                                            <span className="truncate">
                                                {mediaId === '_all'
                                                    ? t('reports.allMedia')
                                                    : getSelectedMediaTitle() ||
                                                      t('reports.allMedia')}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[300px] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput
                                                placeholder={t(
                                                    'reports.searchMedia',
                                                )}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {t('reports.noMediaFound')}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="_all"
                                                        onSelect={() => {
                                                            setMediaId('_all');
                                                            setOpenMedia(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                mediaId ===
                                                                    '_all'
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0',
                                                            )}
                                                        />
                                                        {t('reports.allMedia')}
                                                    </CommandItem>
                                                    {media.map((m) => (
                                                        <CommandItem
                                                            key={m.id}
                                                            value={m.title}
                                                            onSelect={() => {
                                                                setMediaId(
                                                                    m.id,
                                                                );
                                                                setOpenMedia(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    mediaId ===
                                                                        m.id
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                            <Badge
                                                                variant="outline"
                                                                className="mr-2 text-xs"
                                                            >
                                                                {m.type}
                                                            </Badge>
                                                            <span className="truncate">
                                                                {m.title}
                                                            </span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Tag Filter */}
                            <div className="space-y-2">
                                <Label>{t('reports.tag')}</Label>
                                <Popover
                                    open={openTag}
                                    onOpenChange={setOpenTag}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openTag}
                                            className="w-full justify-between font-normal"
                                        >
                                            <span className="flex items-center gap-2 truncate">
                                                {tagId === '_all' ? (
                                                    t('reports.allTags')
                                                ) : getSelectedTag() ? (
                                                    <>
                                                        <span
                                                            className="h-3 w-3 shrink-0 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    getSelectedTag()
                                                                        ?.color,
                                                            }}
                                                        />
                                                        {getSelectedTag()?.name}
                                                    </>
                                                ) : (
                                                    t('reports.allTags')
                                                )}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[250px] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput
                                                placeholder={t(
                                                    'reports.searchTag',
                                                )}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {t('reports.noTagFound')}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="_all"
                                                        onSelect={() => {
                                                            setTagId('_all');
                                                            setOpenTag(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                tagId === '_all'
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0',
                                                            )}
                                                        />
                                                        {t('reports.allTags')}
                                                    </CommandItem>
                                                    {tags.map((tag) => (
                                                        <CommandItem
                                                            key={tag.id}
                                                            value={tag.name}
                                                            onSelect={() => {
                                                                setTagId(
                                                                    tag.id,
                                                                );
                                                                setOpenTag(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    tagId ===
                                                                        tag.id
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                            <span
                                                                className="mr-2 h-3 w-3 shrink-0 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        tag.color,
                                                                }}
                                                            />
                                                            {tag.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Completion Status */}
                            <div className="space-y-2">
                                <Label>{t('reports.completionStatus')}</Label>
                                <Select
                                    value={completed}
                                    onValueChange={setCompleted}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('common.all')}
                                        </SelectItem>
                                        <SelectItem value="yes">
                                            {t('reports.completedOnly')}
                                        </SelectItem>
                                        <SelectItem value="no">
                                            {t('reports.incompleteOnly')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        (header, index) => (
                                            <TableHead
                                                key={header.id}
                                                className={
                                                    index === 0 ? 'pl-4' : ''
                                                }
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
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
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <FileText className="h-10 w-10 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-semibold">
                                                {t('reports.noLogsFound')}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {t(
                                                    'reports.tryAdjustingFilters',
                                                )}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row
                                            .getVisibleCells()
                                            .map((cell, index) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={
                                                        index === 0
                                                            ? 'pl-4'
                                                            : ''
                                                    }
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
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
        </AppLayout>
    );
}
