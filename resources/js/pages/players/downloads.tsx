import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Database, Download, Film, HardDrive, HelpCircle, Image, Layers, Loader2, Wifi, WifiOff } from 'lucide-react';

interface DownloadItem {
    id: string;
    title: string;
    type: 'video' | 'image';
    thumbnail_url: string | null;
    duration_seconds: number | null;
    size_bytes: number | null;
    is_downloaded: boolean;
    is_pending: boolean;
    download_progress: number | null;
    status_waiting: boolean;
}

interface Player {
    id: string;
    name: string;
    is_online: boolean;
    last_seen_at: string | null;
}

interface Playlist {
    id: string;
    name: string;
}

interface Stats {
    total: number;
    downloaded: number;
    pending: number;
    percentage: number;
    total_size_mb: number | null;
    updated_at: string | null;
    has_data: boolean;
}

interface DownloadsPageProps {
    player: Player;
    playlist: Playlist | null;
    items: DownloadItem[];
    stats: Stats;
}

function formatDuration(seconds: number | null, type: 'video' | 'image' = 'video'): string {
    // For images without duration, use default 10 seconds
    const effectiveSeconds = (seconds === null || seconds === 0) && type === 'image' ? 10 : seconds;
    if (effectiveSeconds === null || effectiveSeconds === 0) return '-';
    const hours = Math.floor(effectiveSeconds / 3600);
    const mins = Math.floor((effectiveSeconds % 3600) / 60);
    const secs = effectiveSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatSize(mb: number | null): string {
    if (mb === null) return '-';
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null || bytes === 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function DownloadsPage({ player, playlist, items, stats }: DownloadsPageProps) {
    const { t } = useT();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('players.title'), href: '/players' },
        { title: player.name, href: `/players/${player.id}` },
        { title: t('players.downloads.title'), href: `/players/${player.id}/downloads` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${player.name} - ${t('players.downloads.title')}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/players/${player.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${player.is_online ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                {player.is_online ? (
                                    <Wifi className="h-5 w-5 text-green-600" />
                                ) : (
                                    <WifiOff className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{player.name}</h1>
                                <p className="text-sm text-muted-foreground">
                                    {t('players.downloads.subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 md:grid-cols-4">
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                <Layers className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {t('players.downloads.totalItems')}
                                </p>
                                <p className="text-2xl leading-none font-bold">
                                    {stats.total}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {t('players.downloads.downloaded')}
                                </p>
                                <p className="text-2xl leading-none font-bold">
                                    {stats.downloaded}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                <Clock className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {t('players.downloads.pending')}
                                </p>
                                <p className="text-2xl leading-none font-bold">
                                    {stats.pending}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="overflow-hidden">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                                <Database className="h-4 w-4 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {t('players.downloads.storageUsed')}
                                </p>
                                <p className="text-2xl leading-none font-bold">
                                    {formatSize(stats.total_size_mb)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* No Data Warning */}
                {!stats.has_data && (
                    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-200">
                                    {t('players.downloads.noDataYet')}
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    {t('players.downloads.noDataYetDesc')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Progress Bar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="h-5 w-5" />
                                    {t('players.downloads.progress')}
                                </CardTitle>
                                <CardDescription>
                                    {playlist ? (
                                        <>
                                            {t('players.downloads.playlist')}: <Link href={`/playlists/${playlist.id}`} className="hover:underline">{playlist.name}</Link>
                                        </>
                                    ) : (
                                        t('players.downloads.noPlaylist')
                                    )}
                                </CardDescription>
                            </div>
                            {stats.updated_at && (
                                <div className="text-right text-sm text-muted-foreground">
                                    <Clock className="mr-1 inline h-4 w-4" />
                                    {t('players.downloads.lastUpdate')}: {stats.updated_at}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{stats.downloaded} {t('players.downloads.of')} {stats.total} {t('players.downloads.items')}</span>
                                <span className="font-medium">{stats.has_data ? `${stats.percentage}%` : '-'}</span>
                            </div>
                            <Progress value={stats.has_data ? stats.percentage : 0} className="h-3" />
                        </div>
                    </CardContent>
                </Card>

                {/* Items List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5" />
                            {t('players.downloads.mediaItems')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                {playlist
                                    ? t('players.downloads.noItems')
                                    : t('players.downloads.noPlaylistAssigned')
                                }
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16"></TableHead>
                                        <TableHead>{t('players.downloads.media')}</TableHead>
                                        <TableHead className="w-24">{t('players.downloads.type')}</TableHead>
                                        <TableHead className="w-24">{t('players.downloads.duration')}</TableHead>
                                        <TableHead className="w-24">{t('players.downloads.size')}</TableHead>
                                        <TableHead className="w-40 text-right">{t('players.downloads.status')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.thumbnail_url ? (
                                                    <img
                                                        src={item.thumbnail_url}
                                                        alt={item.title}
                                                        className="h-10 w-16 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-16 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                                                        <HardDrive className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {item.type === 'video' ? t('media.video') : t('media.image')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDuration(item.duration_seconds, item.type)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatFileSize(item.size_bytes)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.status_waiting ? (
                                                    <Badge variant="outline" className="text-muted-foreground">
                                                        <HelpCircle className="mr-1 h-3 w-3" />
                                                        {t('players.downloads.statusWaiting')}
                                                    </Badge>
                                                ) : item.is_downloaded ? (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        {t('players.downloads.statusDownloaded')}
                                                    </Badge>
                                                ) : item.is_pending && item.download_progress !== null ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                        <span className="text-sm text-blue-600">
                                                            {Math.round(item.download_progress * 100)}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {t('players.downloads.statusPending')}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
