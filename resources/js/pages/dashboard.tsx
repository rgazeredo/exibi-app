import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Film,
    FolderOpen,
    HardDrive,
    Image,
    LayoutGrid,
    ListVideo,
    MonitorPlay,
    Tag,
    Wifi,
    WifiOff,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Stats {
    players: {
        total: number;
        online: number;
        offline: number;
    };
    media: {
        total: number;
        videos: number;
        images: number;
        total_storage: string;
        total_storage_bytes: number;
    };
    playlists: {
        total: number;
        active: number;
    };
    tags: {
        total: number;
    };
}

interface RecentPlayer {
    id: string;
    name: string;
    is_online: boolean;
    last_seen_at: string | null;
    layout: string | null;
}

interface RecentMedia {
    id: string;
    title: string;
    type: 'video' | 'image';
    formatted_size: string;
    created_at: string;
}

interface ActivityData {
    date: string;
    label: string;
    playbacks: number;
}

interface StorageData {
    name: string;
    value: number;
    formatted: string;
}

interface DashboardProps {
    stats: Stats;
    recentPlayers: RecentPlayer[];
    recentMedia: RecentMedia[];
    charts: {
        activity: ActivityData[];
        storage: StorageData[];
    };
}

const COLORS = {
    primary: '#3b82f6',
    violet: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    cyan: '#06b6d4',
};

export default function Dashboard({
    stats,
    recentPlayers,
    recentMedia,
    charts,
}: DashboardProps) {
    const { t } = useT();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
    ];

    // Data for player status pie chart
    const playerStatusData = [
        {
            name: t('dashboard.online'),
            value: stats.players.online,
            color: COLORS.emerald,
        },
        {
            name: t('dashboard.offline'),
            value: stats.players.offline,
            color: '#94a3b8',
        },
    ];

    // Data for media type pie chart
    const mediaTypeData = [
        {
            name: t('dashboard.videos'),
            value: stats.media.videos,
            color: COLORS.violet,
        },
        {
            name: t('dashboard.images'),
            value: stats.media.images,
            color: COLORS.emerald,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                        <LayoutGrid className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('dashboard.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Stats Cards Row 1 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Players */}
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                                <MonitorPlay className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.totalPlayers')}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.players.total}
                                </p>
                                <div className="flex gap-2 text-xs">
                                    <span className="text-emerald-600">
                                        {stats.players.online}{' '}
                                        {t('dashboard.online')}
                                    </span>
                                    <span className="text-muted-foreground">
                                        ·
                                    </span>
                                    <span className="text-muted-foreground">
                                        {stats.players.offline}{' '}
                                        {t('dashboard.offline')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Media */}
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                                <HardDrive className="h-6 w-6 text-violet-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.mediaFiles')}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.media.total}
                                </p>
                                <div className="flex gap-2 text-xs">
                                    <span className="text-violet-600">
                                        {stats.media.videos}{' '}
                                        {t('dashboard.videos')}
                                    </span>
                                    <span className="text-muted-foreground">
                                        ·
                                    </span>
                                    <span className="text-emerald-600">
                                        {stats.media.images}{' '}
                                        {t('dashboard.images')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Playlists */}
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                <ListVideo className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.playlists')}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.playlists.total}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.playlists.active}{' '}
                                    {t('dashboard.active')}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Storage */}
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                                <FolderOpen className="h-6 w-6 text-amber-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.storage')}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.media.total_storage}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t('dashboard.totalUsed')}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Stats Cards Row 2 */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Tags */}
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                                <Tag className="h-5 w-5 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.tags')}
                                </p>
                                <p className="text-xl font-bold">
                                    {stats.tags.total}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Online Rate */}
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Wifi className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.onlineRate')}
                                </p>
                                <p className="text-xl font-bold">
                                    {stats.players.total > 0
                                        ? Math.round(
                                              (stats.players.online /
                                                  stats.players.total) *
                                                  100,
                                          )
                                        : 0}
                                    %
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Activity Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="h-4 w-4" />
                                {t('dashboard.activityChart')}
                            </CardTitle>
                            <CardDescription>
                                {t('dashboard.activityChartDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.activity}>
                                        <defs>
                                            <linearGradient
                                                id="colorPlaybacks"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor={COLORS.primary}
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor={COLORS.primary}
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                            width={40}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor:
                                                    'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            formatter={(value) => [
                                                value ?? 0,
                                                t('dashboard.playbacks'),
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="playbacks"
                                            stroke={COLORS.primary}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorPlaybacks)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Player Status & Media Type Charts */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                {t('dashboard.distribution')}
                            </CardTitle>
                            <CardDescription>
                                {t('dashboard.distributionDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Player Status */}
                                <div>
                                    <p className="mb-2 text-center text-xs text-muted-foreground">
                                        {t('dashboard.playerStatus')}
                                    </p>
                                    <div className="h-[80px]">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={playerStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={20}
                                                    outerRadius={35}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {playerStatusData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor:
                                                            'hsl(var(--background))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-1 flex justify-center gap-3 text-xs">
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            {stats.players.online}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                                            {stats.players.offline}
                                        </span>
                                    </div>
                                </div>

                                {/* Media Type */}
                                <div>
                                    <p className="mb-2 text-center text-xs text-muted-foreground">
                                        {t('dashboard.mediaType')}
                                    </p>
                                    <div className="h-[80px]">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={mediaTypeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={20}
                                                    outerRadius={35}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {mediaTypeData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor:
                                                            'hsl(var(--background))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-1 flex justify-center gap-3 text-xs">
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-violet-500" />
                                            {stats.media.videos}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            {stats.media.images}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Players */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MonitorPlay className="h-4 w-4" />
                                {t('dashboard.recentPlayers')}
                            </CardTitle>
                            <CardDescription>
                                {t('dashboard.latestRegisteredPlayers')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentPlayers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.noPlayersYet')}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {recentPlayers.map((player) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center gap-4"
                                        >
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                                    player.is_online
                                                        ? 'bg-emerald-500/10'
                                                        : 'bg-muted'
                                                }`}
                                            >
                                                {player.is_online ? (
                                                    <Wifi className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <WifiOff className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Link
                                                    href={`/players/${player.id}`}
                                                    className="text-sm leading-none font-medium hover:underline"
                                                >
                                                    {player.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {player.layout ||
                                                        t(
                                                            'dashboard.noLayoutAssigned',
                                                        )}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {player.last_seen_at ||
                                                    t('common.never')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                {t('dashboard.recentMedia')}
                            </CardTitle>
                            <CardDescription>
                                {t('dashboard.latestUploadedFiles')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentMedia.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.noMediaYet')}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {recentMedia.map((media) => (
                                        <div
                                            key={media.id}
                                            className="flex items-center gap-4"
                                        >
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                                    media.type === 'video'
                                                        ? 'bg-violet-500/10'
                                                        : 'bg-emerald-500/10'
                                                }`}
                                            >
                                                {media.type === 'video' ? (
                                                    <Film className="h-4 w-4 text-violet-500" />
                                                ) : (
                                                    <Image className="h-4 w-4 text-emerald-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Link
                                                    href={`/media/${media.id}`}
                                                    className="text-sm leading-none font-medium hover:underline"
                                                >
                                                    {media.title}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {media.formatted_size}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {media.created_at}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
