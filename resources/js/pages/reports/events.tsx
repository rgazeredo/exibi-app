import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    AlertCircle,
    AlertTriangle,
    ArrowUpDown,
    Bug,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronRight as ChevronRightIcon,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    Info,
    Loader2,
    X,
    Zap,
} from 'lucide-react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

interface Player {
    id: string;
    name: string;
}

interface SystemEventEntry {
    id: string;
    player_id: string;
    player_name: string;
    event_type: string;
    event_type_label: string;
    severity: string;
    severity_color: string;
    message: string;
    error_code: string | null;
    error_class: string | null;
    stack_trace: string | null;
    component: string | null;
    device_id: string | null;
    app_version: string | null;
    network_type: string | null;
    memory_free_mb: number | null;
    storage_free_mb: number | null;
    extra_data: Record<string, unknown> | null;
    event_timestamp: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface EventsPageProps {
    filters: {
        date_range?: string;
        player_id?: string;
        event_type?: string;
        severity?: string;
        date_from?: string;
        date_to?: string;
    };
    players: Player[];
    eventTypes: string[];
    severities: string[];
}

// Detail row component for expanded view
function EventDetailsRow({ event }: { event: SystemEventEntry }) {
    const { t } = useT();

    return (
        <div className="bg-muted/30 p-4 border-t">
            <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                            {t('reports.events.component')}
                        </span>
                        <span className="font-medium">{event.component || '-'}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                            {t('reports.events.deviceId')}
                        </span>
                        <span className="font-mono text-xs">{event.device_id || '-'}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                            {t('reports.events.appVersion')}
                        </span>
                        <span className="font-medium">{event.app_version || '-'}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                            {t('reports.events.networkType')}
                        </span>
                        <Badge variant="outline">{event.network_type || '-'}</Badge>
                    </div>
                </div>

                {/* Memory & Storage */}
                {(event.memory_free_mb || event.storage_free_mb) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {event.memory_free_mb && (
                            <div>
                                <span className="text-muted-foreground block text-xs mb-1">
                                    {t('reports.events.memoryFree')}
                                </span>
                                <span className="font-medium">{event.memory_free_mb} MB</span>
                            </div>
                        )}
                        {event.storage_free_mb && (
                            <div>
                                <span className="text-muted-foreground block text-xs mb-1">
                                    {t('reports.events.storageFree')}
                                </span>
                                <span className="font-medium">{event.storage_free_mb} MB</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Info */}
                {(event.error_code || event.error_class) && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {event.error_code && (
                                <div>
                                    <span className="text-muted-foreground block text-xs mb-1">
                                        {t('reports.events.errorCode')}
                                    </span>
                                    <Badge variant="destructive">{event.error_code}</Badge>
                                </div>
                            )}
                            {event.error_class && (
                                <div>
                                    <span className="text-muted-foreground block text-xs mb-1">
                                        {t('reports.events.errorClass')}
                                    </span>
                                    <span className="font-mono text-xs">{event.error_class}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stack Trace */}
                {event.stack_trace && (
                    <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                            {t('reports.events.stackTrace')}
                        </span>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">
                            {event.stack_trace}
                        </pre>
                    </div>
                )}

                {/* Extra Data */}
                {event.extra_data && Object.keys(event.extra_data).length > 0 && (
                    <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                            {t('reports.events.extraData')}
                        </span>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                            {JSON.stringify(event.extra_data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EventsPage({ filters, players, eventTypes, severities }: EventsPageProps) {
    const { t } = useT();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('reports.title'), href: '/reports' },
        { title: t('reports.events.title'), href: '/reports/events' },
    ];

    const [events, setEvents] = useState<SystemEventEntry[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'event_timestamp', desc: true },
    ]);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Filters state
    const [dateRange, setDateRange] = useState(filters.date_range || '7d');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [playerId, setPlayerId] = useState(filters.player_id || 'all');
    const [eventType, setEventType] = useState(filters.event_type || 'all');
    const [severity, setSeverity] = useState(filters.severity || 'all');
    const [page, setPage] = useState(1);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('date_range', dateRange);
            if (dateRange === 'custom') {
                if (dateFrom) params.set('date_from', dateFrom);
                if (dateTo) params.set('date_to', dateTo);
            }
            if (playerId !== 'all') params.set('player_id', playerId);
            if (eventType !== 'all') params.set('event_type', eventType);
            if (severity !== 'all') params.set('severity', severity);
            params.set('page', page.toString());
            params.set('per_page', '20');

            if (sorting.length > 0) {
                params.set('sort', sorting[0].id);
                params.set('direction', sorting[0].desc ? 'desc' : 'asc');
            }

            const response = await fetch(`/api/reports/events?${params.toString()}`);
            const data = await response.json();

            setEvents(data.data);
            setMeta(data.meta);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange, dateFrom, dateTo, playerId, eventType, severity, page, sorting]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const getSeverityIcon = (sev: string) => {
        switch (sev) {
            case 'critical':
                return <Zap className="h-4 w-4 text-purple-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            case 'debug':
                return <Bug className="h-4 w-4 text-gray-500" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getSeverityBadgeColor = (sev: string) => {
        switch (sev) {
            case 'critical':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'info':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'debug':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return '';
        }
    };

    const columns: ColumnDef<SystemEventEntry>[] = useMemo(
        () => [
            {
                id: 'expander',
                header: () => null,
                cell: ({ row }) => {
                    const isExpanded = expandedRows[row.original.id] || false;
                    return (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                                setExpandedRows(prev => ({
                                    ...prev,
                                    [row.original.id]: !prev[row.original.id],
                                }));
                            }}
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRightIcon className="h-4 w-4" />
                            )}
                        </Button>
                    );
                },
            },
            {
                accessorKey: 'event_timestamp',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting()}
                        className="-ml-4"
                    >
                        {t('reports.events.timestamp')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const date = new Date(row.original.event_timestamp);
                    return (
                        <div className="text-sm">
                            <div>{date.toLocaleDateString()}</div>
                            <div className="text-muted-foreground text-xs">
                                {date.toLocaleTimeString()}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'severity',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting()}
                        className="-ml-4"
                    >
                        {t('reports.events.severity')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {getSeverityIcon(row.original.severity)}
                        <Badge
                            variant="outline"
                            className={getSeverityBadgeColor(row.original.severity)}
                        >
                            {row.original.severity}
                        </Badge>
                    </div>
                ),
            },
            {
                accessorKey: 'event_type',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting()}
                        className="-ml-4"
                    >
                        {t('reports.events.type')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <Badge variant="secondary">{row.original.event_type_label}</Badge>
                ),
            },
            {
                accessorKey: 'player_name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting()}
                        className="-ml-4"
                    >
                        {t('reports.player')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <Link
                        href={`/players/${row.original.player_id}`}
                        className="text-primary hover:underline"
                    >
                        {row.original.player_name}
                    </Link>
                ),
            },
            {
                accessorKey: 'message',
                header: t('reports.events.message'),
                cell: ({ row }) => (
                    <div className="max-w-md truncate" title={row.original.message}>
                        {row.original.message}
                    </div>
                ),
            },
        ],
        [t, expandedRows],
    );

    const table = useReactTable({
        data: events,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualSorting: true,
        onSortingChange: (updater) => {
            setSorting(typeof updater === 'function' ? updater(sorting) : updater);
            setPage(1);
        },
        state: {
            sorting,
        },
    });

    const clearFilters = () => {
        setDateRange('7d');
        setDateFrom('');
        setDateTo('');
        setPlayerId('all');
        setEventType('all');
        setSeverity('all');
        setPage(1);
    };

    const hasActiveFilters =
        dateRange !== '7d' ||
        playerId !== 'all' ||
        eventType !== 'all' ||
        severity !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('reports.events.title')} />

            <div className="flex flex-col gap-6">
                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-4 w-4" />
                            <span className="font-medium">{t('common.filters')}</span>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="ml-auto"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    {t('common.clearFilters')}
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Date Range */}
                            <div className="space-y-2">
                                <Label>{t('reports.dateRange')}</Label>
                                <Select value={dateRange} onValueChange={setDateRange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">{t('reports.today')}</SelectItem>
                                        <SelectItem value="7d">{t('reports.last7Days')}</SelectItem>
                                        <SelectItem value="30d">{t('reports.last30Days')}</SelectItem>
                                        <SelectItem value="90d">{t('reports.last90Days')}</SelectItem>
                                        <SelectItem value="custom">{t('reports.customRange')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Custom Date Range */}
                            {dateRange === 'custom' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>{t('reports.dateFrom')}</Label>
                                        <Input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('reports.dateTo')}</Label>
                                        <Input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Player Filter */}
                            <div className="space-y-2">
                                <Label>{t('reports.player')}</Label>
                                <Select value={playerId} onValueChange={setPlayerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('common.all')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        {players.map((player) => (
                                            <SelectItem key={player.id} value={player.id}>
                                                {player.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Event Type Filter */}
                            <div className="space-y-2">
                                <Label>{t('reports.events.type')}</Label>
                                <Select value={eventType} onValueChange={setEventType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('common.all')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        {eventTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Severity Filter */}
                            <div className="space-y-2">
                                <Label>{t('reports.events.severity')}</Label>
                                <Select value={severity} onValueChange={setSeverity}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('common.all')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        {severities.map((sev) => (
                                            <SelectItem key={sev} value={sev}>
                                                <div className="flex items-center gap-2">
                                                    {getSeverityIcon(sev)}
                                                    {sev}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Events Table */}
                <Card>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>{t('reports.events.noEventsFound')}</p>
                                <p className="text-sm">{t('reports.tryAdjustingFilters')}</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <TableHead key={header.id}>
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext(),
                                                        )}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.map((row) => (
                                            <Fragment key={row.id}>
                                                <TableRow>
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                                {expandedRows[row.original.id] && (
                                                    <TableRow>
                                                        <TableCell colSpan={columns.length} className="p-0">
                                                            <EventDetailsRow event={row.original} />
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {meta && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            {t('common.showingResults', {
                                                from: meta.from || 0,
                                                to: meta.to || 0,
                                                total: meta.total,
                                            })}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(1)}
                                                disabled={page === 1}
                                            >
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(page - 1)}
                                                disabled={page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm">
                                                {page} / {meta.last_page}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(page + 1)}
                                                disabled={page === meta.last_page}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(meta.last_page)}
                                                disabled={page === meta.last_page}
                                            >
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
