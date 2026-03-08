import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { AlertCircle, ArrowRight, BarChart3, CheckCircle, Clock, Film, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ReportsIndexProps {
    filters: {
        date_range?: string;
    };
}

interface Stats {
    total_playbacks: number;
    total_duration_seconds: number;
    completed_count: number;
    unique_media: number;
    unique_players: number;
    completion_rate: number;
}

interface DailyPlayback {
    date: string;
    count: number;
}

interface TopMedia {
    media_id: string;
    title: string;
    type: string;
    playback_count: number;
    total_duration: number;
}

interface LogEntry {
    id: string;
    player_name: string;
    media_title: string;
    media_type: string;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    completed: boolean;
}

export default function ReportsIndex({ filters }: ReportsIndexProps) {
    const { t } = useT();
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.is_super_admin === true;
    const [dateRange, setDateRange] = useState(filters.date_range || '7d');
    const [stats, setStats] = useState<Stats | null>(null);
    const [dailyPlaybacks, setDailyPlaybacks] = useState<DailyPlayback[]>([]);
    const [topMedia, setTopMedia] = useState<TopMedia[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'started_at', desc: true }]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ date_range: dateRange });
            const [dataRes, logsRes] = await Promise.all([
                fetch(`/api/reports/data?${params}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }),
                fetch(`/api/reports/logs?${params}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }),
            ]);
            const data = await dataRes.json();
            const logsData = await logsRes.json();

            setStats(data.stats);
            setDailyPlaybacks(data.daily_playbacks);
            setTopMedia(data.top_media);
            setLogs(logsData.data);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDuration = (seconds: number | null) => {
        if (seconds === null || seconds === undefined) return '-';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const columns: ColumnDef<LogEntry>[] = useMemo(
        () => [
            {
                accessorKey: 'started_at',
                header: t('reports.startedAt'),
                cell: ({ row }) => formatDate(row.getValue('started_at')),
            },
            {
                accessorKey: 'player_name',
                header: t('reports.player'),
            },
            {
                accessorKey: 'media_title',
                header: t('reports.media'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{row.original.media_type}</Badge>
                        {row.getValue('media_title')}
                    </div>
                ),
            },
            {
                accessorKey: 'duration_seconds',
                header: t('reports.duration'),
                cell: ({ row }) => formatDuration(row.getValue('duration_seconds')),
            },
            {
                accessorKey: 'completed',
                header: t('reports.completed'),
                cell: ({ row }) => (
                    <Badge variant={row.getValue('completed') ? 'default' : 'secondary'}>
                        {row.getValue('completed') ? t('common.yes') : t('common.no')}
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
        state: { sorting },
        onSortingChange: setSorting,
    });

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('reports.title'), href: '/reports' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('reports.title')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                            <BarChart3 className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{t('reports.title')}</h1>
                            <p className="text-muted-foreground">{t('reports.subtitle')}</p>
                        </div>
                    </div>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">{t('reports.today')}</SelectItem>
                            <SelectItem value="7d">{t('reports.last7days')}</SelectItem>
                            <SelectItem value="30d">{t('reports.last30days')}</SelectItem>
                            <SelectItem value="90d">{t('reports.last90days')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('reports.totalPlaybacks')}
                                    </CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats?.total_playbacks ?? 0}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('reports.totalDuration')}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatDuration(stats?.total_duration_seconds ?? 0)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('reports.completionRate')}
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats?.completion_rate ?? 0}%
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('reports.uniqueMedia')}
                                    </CardTitle>
                                    <Film className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats?.unique_media ?? 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Daily Playbacks Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('reports.playbacksOverTime')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dailyPlaybacks.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={dailyPlaybacks}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                            {t('reports.noData')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Top Media Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('reports.topMedia')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {topMedia.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={topMedia} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis
                                                    dataKey="title"
                                                    type="category"
                                                    width={150}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="playback_count"
                                                    fill="hsl(var(--primary))"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                            {t('reports.noData')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Events - Super Admin only */}
                        {isSuperAdmin && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-medium">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {t('reports.events.title')}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {t('reports.events.subtitle')}
                                    </p>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/reports/events?date_range=${dateRange}`}>
                                            {t('reports.viewAll')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detailed Logs Table */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{t('reports.detailedLogs')}</CardTitle>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/reports/logs?date_range=${dateRange}`}>
                                        {t('reports.viewAll')}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {logs.length > 0 ? (
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                                        {t('reports.noData')}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
