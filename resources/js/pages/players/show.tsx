import {
    HeartbeatHistoryModal,
    PlayerDiagnostics,
    type HeartbeatEntry,
} from '@/components/PlayerDiagnostics';
import { TagBadges } from '@/components/tag-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    Download,
    Edit,
    History as HistoryIcon,
    Keyboard,
    LayoutGrid,
    ListRestart,
    Loader2,
    MonitorPlay,
    Power,
    Replace,
    Trash2,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface SystemInfo {
    cpu_usage?: number;
    memory_total_mb?: number;
    memory_available_mb?: number;
    memory_used_percent?: number;
    storage_total_gb?: number;
    storage_available_gb?: number;
    storage_used_percent?: number;
    temperature?: number;
    battery_level?: number;
    battery_charging?: boolean;
    screen_brightness?: number;
    wifi_signal_strength?: number;
    network_type?: string;
}

interface DeviceInfo {
    manufacturer?: string;
    model?: string;
    android_version?: string;
    sdk_version?: number;
    build_number?: string;
    serial?: string;
    mac_address?: string;
    screen_resolution?: string;
    screen_density?: number;
}

interface Diagnostics {
    ip_address: string | null;
    app_version: string | null;
    system_info: SystemInfo | null;
    status: string | null;
    last_update: string | null;
    last_update_human: string | null;
}

interface PlaybackLogEntry {
    id: string;
    media_title: string | null;
    media_type: 'video' | 'image' | null;
    media_thumbnail_url: string | null;
    playlist_name: string | null;
    started_at: string | null;
    duration_played_seconds: number | null;
    completed: boolean;
}

interface OperatingHoursStatus {
    enabled: boolean;
    is_within_hours: boolean;
    should_show_black_screen: boolean;
    next_start: string | null;
    next_start_human: string | null;
}

interface Player {
    id: string;
    name: string;
    description: string | null;
    api_token: string;
    is_online: boolean;
    last_seen_at: string | null;
    last_seen_at_full: string | null;
    effective_layout: {
        id: string;
        name: string;
        source: 'player' | 'group';
        group_name: string | null;
        region_count: number;
        region_playlists: Array<{
            region_name: string;
            playlist: {
                id: string;
                name: string;
            } | null;
        }>;
    } | null;
    player_layouts: Array<{
        id: string;
        layout: { id: string; name: string } | null;
        schedule_type: string;
        schedule_description: string;
        priority: number;
        is_default: boolean;
        is_active: boolean;
    }>;
    player_group: {
        id: string;
        name: string;
        is_default: boolean;
        layout?: {
            id: string;
            name: string;
        } | null;
    } | null;
    tags: Tag[];
    config: {
        orientation?: string;
        update_interval_minutes?: number;
        volume?: number;
        brightness?: number;
    };

    created_at: string;
    device_id: string | null;
    mac_address: string | null;
    public_ip: string | null;
    geolocation: {
        city?: string;
        region?: string;
        country?: string;
        isp?: string;
        lat?: number;
        lon?: number;
        timezone?: string;
    } | null;
    device_info: DeviceInfo | null;
    diagnostics: Diagnostics | null;
}

interface PlayerShowProps {
    player: Player;
    heartbeat_history: HeartbeatEntry[];
}

// Componente para exibir uma linha de atalho
function ShortcutRow({
    keys,
    description,
    note,
}: {
    keys: string[];
    description: string;
    note?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5">
            <div className="flex flex-shrink-0 items-center gap-1">
                {keys.map((key, index) => (
                    <span key={index}>
                        {key === '+' ||
                        key === '×5' ||
                        key === '×3' ||
                        key === '×7' ? (
                            <span className="px-1 text-xs text-muted-foreground">
                                {key}
                            </span>
                        ) : (
                            <kbd className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border bg-muted px-2 text-xs font-medium shadow-sm">
                                {key}
                            </kbd>
                        )}
                    </span>
                ))}
            </div>
            <div className="text-right text-sm">
                <span>{description}</span>
                {note && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {note}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function PlayerShow({
    player,
    heartbeat_history,
}: PlayerShowProps) {
    const { t } = useT();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const formatDate = (dateString: string) => {
        // Parse date and convert to local timezone
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };
    const [sendingCommand, setSendingCommand] = useState<string | null>(null);
    const [commandFeedback, setCommandFeedback] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    // Screenshot states
    const [screenshotLoading, setScreenshotLoading] = useState(false);
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
    // Playback history states
    const [playbackHistoryOpen, setPlaybackHistoryOpen] = useState(false);
    const [playbackLogs, setPlaybackLogs] = useState<PlaybackLogEntry[]>([]);
    const [playbackLogsLoading, setPlaybackLogsLoading] = useState(false);

    // Replace player states
    const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
    const [activationCode, setActivationCode] = useState('');
    const [replaceLoading, setReplaceLoading] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('players.title'), href: '/players' },
        { title: player.name, href: `/players/${player.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/players/${player.id}`);
    };

    const sendRefreshPlaylist = async () => {
        setRefreshDialogOpen(false);
        setSendingCommand('refresh-playlist');
        setCommandFeedback(null);
        try {
            const response = await axios.post(
                `/players/${player.id}/refresh-playlist`,
                { show_toast: showToast },
            );
            if (response.data.success) {
                setCommandFeedback({
                    type: 'success',
                    message: t('players.commandSent', {
                        label: t('players.refreshPlayer'),
                    }),
                });
            } else {
                setCommandFeedback({
                    type: 'error',
                    message:
                        response.data.message || t('players.commandFailed'),
                });
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 419) {
                window.location.reload();
                return;
            }
            setCommandFeedback({
                type: 'error',
                message: t('players.commandFailed'),
            });
        } finally {
            setSendingCommand(null);
            setShowToast(false);
        }
    };

    const sendCommand = async (
        command: 'refresh-playlist' | 'refresh-app' | 'reboot',
        label: string,
    ) => {
        setSendingCommand(command);
        setCommandFeedback(null);
        try {
            // Use axios which automatically includes CSRF token via Laravel's bootstrap
            const response = await axios.post(
                `/players/${player.id}/${command}`,
            );
            if (response.data.success) {
                setCommandFeedback({
                    type: 'success',
                    message: t('players.commandSent', { label }),
                });
            } else {
                setCommandFeedback({
                    type: 'error',
                    message:
                        response.data.message || t('players.commandFailed'),
                });
            }
        } catch (error) {
            // Handle CSRF token mismatch (419) by refreshing the page
            if (axios.isAxiosError(error) && error.response?.status === 419) {
                window.location.reload();
                return;
            }
            setCommandFeedback({
                type: 'error',
                message: t('players.commandFailed'),
            });
        } finally {
            setSendingCommand(null);
            // Clear feedback after 5 seconds
            setTimeout(() => setCommandFeedback(null), 5000);
        }
    };

    // Screenshot functionality with polling
    const requestScreenshot = async () => {
        setScreenshotLoading(true);
        setScreenshotModalOpen(true);
        setScreenshotUrl(null);

        try {
            // Get current screenshot timestamp before requesting
            const statusBefore = await axios.get(
                `/players/${player.id}/screenshot-status`,
            );
            const timestampBefore = statusBefore.data.timestamp;

            const response = await axios.post(
                `/players/${player.id}/screenshot`,
            );
            if (!response.data.success) {
                setCommandFeedback({
                    type: 'error',
                    message:
                        response.data.message || t('players.screenshotFailed'),
                });
                setScreenshotLoading(false);
                return;
            }

            // Start polling for new screenshot
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds max wait
            const pollInterval = setInterval(async () => {
                attempts++;
                try {
                    const statusResponse = await axios.get(
                        `/players/${player.id}/screenshot-status`,
                    );
                    const newTimestamp = statusResponse.data.timestamp;
                    const newUrl = statusResponse.data.url;

                    // Check if we got a new screenshot (timestamp changed)
                    if (
                        newUrl &&
                        newTimestamp &&
                        newTimestamp !== timestampBefore
                    ) {
                        clearInterval(pollInterval);
                        setScreenshotUrl(newUrl);
                        setScreenshotLoading(false);
                    } else if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        setCommandFeedback({
                            type: 'error',
                            message: t('players.screenshotTimeout'),
                        });
                        setScreenshotLoading(false);
                    }
                } catch {
                    // Ignore polling errors, keep trying
                }
            }, 1000);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 419) {
                window.location.reload();
                return;
            }
            setCommandFeedback({
                type: 'error',
                message: t('players.screenshotFailed'),
            });
            setScreenshotLoading(false);
        }
    };

    const fetchPlaybackLogs = async () => {
        setPlaybackLogsLoading(true);
        try {
            const response = await axios.get(
                `/players/${player.id}/playback-logs`,
            );
            setPlaybackLogs(response.data.logs);
        } catch {
            // ignore
        } finally {
            setPlaybackLogsLoading(false);
        }
    };

    // Format activation code as user types (XXX-XXX)
    const handleActivationCodeChange = (value: string) => {
        // Remove non-alphanumeric and convert to uppercase
        const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        // Add hyphen after 3 characters
        if (cleaned.length <= 3) {
            setActivationCode(cleaned);
        } else {
            setActivationCode(cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6));
        }
    };

    // Handle replace player submit
    const handleReplacePlayer = () => {
        if (activationCode.length !== 7) return;

        setReplaceLoading(true);
        router.post(
            `/players/${player.id}/replace`,
            {
                activation_code: activationCode,
            },
            {
                onFinish: () => {
                    setReplaceLoading(false);
                },
                onError: () => {
                    // Keep dialog open on error so user can see the error message
                },
                onSuccess: () => {
                    setReplaceDialogOpen(false);
                    setActivationCode('');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={player.name} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/players">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div
                            className={`flex h-14 w-14 items-center justify-center rounded-xl ${player.is_online ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                            {player.is_online ? (
                                <Wifi className="h-7 w-7 text-green-600" />
                            ) : (
                                <WifiOff className="h-7 w-7 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {player.name}
                                </h1>
                                <Badge
                                    variant={
                                        player.is_online ? 'default' : 'outline'
                                    }
                                >
                                    {player.is_online
                                        ? t('players.status.online')
                                        : t('players.status.offline')}
                                </Badge>
                            </div>
                            {player.description && (
                                <p className="text-muted-foreground">
                                    {player.description}
                                </p>
                            )}
                            {player.tags && player.tags.length > 0 && (
                                <div className="mt-2">
                                    <TagBadges tags={player.tags} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShortcutsDialogOpen(true)}
                        >
                            <Keyboard className="mr-2 h-4 w-4" />
                            {t('players.remoteShortcuts')}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/players/${player.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('common.edit')}
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setReplaceDialogOpen(true)}
                        >
                            <Replace className="mr-2 h-4 w-4" />
                            {t('players.replacePlayer')}
                        </Button>
                        <Dialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('common.delete')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t('players.deletePlayer')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('players.deleteConfirm', {
                                            name: player.name,
                                        })}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setDeleteDialogOpen(false)
                                        }
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        {t('common.delete')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Replace Player Dialog */}
                <Dialog
                    open={replaceDialogOpen}
                    onOpenChange={(open) => {
                        setReplaceDialogOpen(open);
                        if (!open) {
                            setActivationCode('');
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Replace className="h-5 w-5" />
                                {t('players.replacePlayer')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('players.replacePlayerDesc')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Current player info */}
                            <div className="rounded-md border bg-muted/50 p-3">
                                <p className="text-sm text-muted-foreground">
                                    {t('players.playerToReplace')}
                                </p>
                                <p className="text-lg font-semibold">
                                    {player.name}
                                </p>
                            </div>

                            {/* Activation code input */}
                            <div className="space-y-2">
                                <Label htmlFor="activation-code">
                                    {t('players.newDeviceActivationCode')}
                                </Label>
                                <Input
                                    id="activation-code"
                                    placeholder="XXX-XXX"
                                    value={activationCode}
                                    onChange={(e) =>
                                        handleActivationCodeChange(
                                            e.target.value,
                                        )
                                    }
                                    maxLength={7}
                                    className="text-center font-mono text-2xl tracking-widest uppercase"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('players.activationCodeHelp')}
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <div className="text-sm text-amber-700 dark:text-amber-300">
                                        <p className="font-medium">
                                            {t('players.replaceWarningTitle')}
                                        </p>
                                        <p>
                                            {t('players.replaceWarningNewFlow')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setReplaceDialogOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={handleReplacePlayer}
                                disabled={
                                    activationCode.length !== 7 ||
                                    replaceLoading
                                }
                            >
                                {replaceLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Replace className="mr-2 h-4 w-4" />
                                )}
                                {t('players.confirmReplace')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Refresh Playlist Dialog */}
                <Dialog
                    open={refreshDialogOpen}
                    onOpenChange={setRefreshDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t('players.refreshPlayer')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('players.refreshPlayerDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="show-toast"
                                    checked={showToast}
                                    onCheckedChange={(checked) =>
                                        setShowToast(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="show-toast"
                                    className="cursor-pointer text-sm"
                                >
                                    {t('players.showToastOnPlayer')}
                                </Label>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {t('players.showToastOnPlayerDesc')}
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setRefreshDialogOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={sendRefreshPlaylist}>
                                <ListRestart className="mr-2 h-4 w-4" />
                                {t('players.refreshPlayer')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Remote Shortcuts Dialog */}
                <Dialog
                    open={shortcutsDialogOpen}
                    onOpenChange={setShortcutsDialogOpen}
                >
                    <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Keyboard className="h-5 w-5" />
                                {t('players.remoteShortcuts')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('players.remoteShortcutsDesc')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Modo Kiosk */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    Modo Kiosk / Sistema
                                </h3>
                                <div className="space-y-2">
                                    <ShortcutRow
                                        keys={['BACK', '×5']}
                                        description="Sair do modo kiosk"
                                        note="Requer senha de 6 dígitos"
                                    />
                                    <ShortcutRow
                                        keys={['◀', '×5', '+', 'OK']}
                                        description="Resetar dispositivo"
                                        note="Remove ativação e configurações locais"
                                    />
                                </div>
                            </div>

                            {/* Desbloqueio por Toque - desabilitado por enquanto
                            <div>
                                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                                    Desbloqueio por Toque
                                </h3>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Em dispositivos com tela touch:
                                </p>
                                <div className="space-y-2">
                                    <ShortcutRow
                                        keys={['TAP', '×7']}
                                        description="Sair do modo kiosk"
                                        note="7 toques rápidos no canto superior direito"
                                    />
                                </div>
                            </div>
                            */}
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={() => setShortcutsDialogOpen(false)}
                            >
                                {t('common.close')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Screenshot Modal */}
                <Dialog
                    open={screenshotModalOpen}
                    onOpenChange={setScreenshotModalOpen}
                >
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                {t('players.screenshotTitle')}
                            </DialogTitle>
                            <DialogDescription>{player.name}</DialogDescription>
                        </DialogHeader>

                        {screenshotLoading ? (
                            <div className="flex h-64 flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="mt-3 text-sm text-muted-foreground">
                                    {t('players.capturingScreen')}
                                </span>
                            </div>
                        ) : screenshotUrl ? (
                            <div className="space-y-4">
                                <img
                                    src={screenshotUrl}
                                    alt="Screenshot"
                                    className="w-full rounded-lg border"
                                />
                                <div className="flex gap-2">
                                    <Button variant="outline" asChild>
                                        <a
                                            href={screenshotUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            {t('common.download')}
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={requestScreenshot}
                                        disabled={!player.is_online}
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        {t('players.newScreenshot')}
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>

                {/* Playback History Modal */}
                <Dialog
                    open={playbackHistoryOpen}
                    onOpenChange={setPlaybackHistoryOpen}
                >
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <HistoryIcon className="h-5 w-5" />
                                {t('players.playbackHistory')}
                            </DialogTitle>
                            <DialogDescription>{player.name}</DialogDescription>
                        </DialogHeader>
                        {playbackLogsLoading ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : playbackLogs.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                {t('players.playbackHistoryEmpty')}
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {playbackLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-center gap-3 rounded-md border p-3 text-sm"
                                    >
                                        <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
                                            {log.media_thumbnail_url ? (
                                                <img
                                                    src={
                                                        log.media_thumbnail_url
                                                    }
                                                    alt={log.media_title || ''}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {log.media_title || '-'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.playlist_name ||
                                                    t('players.noneAssigned')}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right text-xs text-muted-foreground">
                                            <p>{log.started_at}</p>
                                            {log.duration_played_seconds !==
                                                null && (
                                                <p>
                                                    {Math.floor(
                                                        log.duration_played_seconds /
                                                            60,
                                                    )}
                                                    :
                                                    {String(
                                                        log.duration_played_seconds %
                                                            60,
                                                    ).padStart(2, '0')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                onClick={() => setPlaybackHistoryOpen(false)}
                            >
                                {t('common.close')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Player Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MonitorPlay className="h-5 w-5" />
                                {t('players.playerDetails')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {t('players.lastSeen')}
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {player.last_seen_at ||
                                            t('common.never')}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {t('players.orientation')}
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {(() => {
                                            const orientation =
                                                player.config?.orientation ||
                                                'landscape';
                                            switch (orientation) {
                                                case 'landscape':
                                                    return t(
                                                        'players.landscape',
                                                    );
                                                case 'landscape_inverted':
                                                    return t(
                                                        'players.landscape_inverted',
                                                    );
                                                case 'portrait_left':
                                                    return t(
                                                        'players.portrait_left',
                                                    );
                                                case 'portrait_right':
                                                    return t(
                                                        'players.portrait_right',
                                                    );
                                                case 'portrait':
                                                    return t(
                                                        'players.portrait_left',
                                                    ); // legacy
                                                default:
                                                    return t(
                                                        'players.landscape',
                                                    );
                                            }
                                        })()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {t('players.updateInterval')}
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {player.config
                                            ?.update_interval_minutes ||
                                            15}{' '}
                                        {t('players.minutes')}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {t('players.created')}
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {formatDate(player.created_at)}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Layout Atual & Remote Commands */}
                    <Card className="gap-2">
                        {/* Layout Atual Section */}
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5" />
                                {t('players.currentLayout')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                            {player.effective_layout ? (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="font-medium">
                                            {player.effective_layout.name}
                                        </span>
                                        {player.effective_layout.source ===
                                        'player' ? (
                                            <span className="text-xs text-primary">
                                                ({t('players.ownLayout')})
                                            </span>
                                        ) : player.effective_layout
                                              .group_name ? (
                                            <span className="text-xs text-muted-foreground">
                                                ({t('players.inheritedFrom')}{' '}
                                                {
                                                    player.effective_layout
                                                        .group_name
                                                }
                                                )
                                            </span>
                                        ) : null}
                                    </div>
                                    {player.effective_layout.region_playlists
                                        .length > 0 && (
                                        <div className="space-y-1">
                                            {player.effective_layout.region_playlists.map(
                                                (rp, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-1.5 text-sm"
                                                    >
                                                        <span className="shrink-0 text-muted-foreground">
                                                            {rp.region_name}:
                                                        </span>
                                                        {rp.playlist ? (
                                                            <Link
                                                                href={`/playlists/${rp.playlist.id}`}
                                                                className="truncate hover:underline"
                                                            >
                                                                {
                                                                    rp.playlist
                                                                        .name
                                                                }
                                                            </Link>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">
                                                                {t(
                                                                    'players.noneAssigned',
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    {t('players.noneAssigned')}
                                </p>
                            )}
                        </CardContent>

                        {/* Remote Commands Section */}
                        <CardHeader className="pt-0 pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Power className="h-4 w-4" />
                                {t('players.remoteCommands')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRefreshDialogOpen(true)}
                                    disabled={sendingCommand !== null}
                                >
                                    {sendingCommand === 'refresh-playlist' ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ListRestart className="mr-2 h-4 w-4" />
                                    )}
                                    {t('players.refreshPlayer')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        sendCommand(
                                            'reboot',
                                            t('players.reboot'),
                                        )
                                    }
                                    disabled={sendingCommand !== null}
                                >
                                    {sendingCommand === 'reboot' ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Power className="mr-2 h-4 w-4" />
                                    )}
                                    {t('players.reboot')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={requestScreenshot}
                                    disabled={
                                        !player.is_online ||
                                        screenshotLoading ||
                                        sendingCommand !== null
                                    }
                                >
                                    {screenshotLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="mr-2 h-4 w-4" />
                                    )}
                                    {t('players.screenshot')}
                                </Button>

                                {/* Separator */}
                                <div className="mx-1 h-8 w-px bg-border" />

                                {/* Connection History */}
                                <HeartbeatHistoryModal
                                    heartbeatHistory={heartbeat_history}
                                    trigger={
                                        <Button variant="outline" size="sm">
                                            <Activity className="mr-2 h-4 w-4" />
                                            {t(
                                                'players.diagnostics.heartbeatHistory',
                                            )}
                                        </Button>
                                    }
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setPlaybackHistoryOpen(true);
                                        fetchPlaybackLogs();
                                    }}
                                >
                                    <HistoryIcon className="mr-2 h-4 w-4" />
                                    {t('players.playbackHistory')}
                                </Button>
                            </div>
                            {commandFeedback && (
                                <div
                                    className={`mt-3 flex items-center gap-2 rounded-md p-3 text-sm ${
                                        commandFeedback.type === 'success'
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    }`}
                                >
                                    {commandFeedback.type === 'success' ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4" />
                                    )}
                                    {commandFeedback.message}
                                </div>
                            )}
                            <p className="mt-3 text-xs text-muted-foreground">
                                {t('players.commandsNote')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Player Diagnostics */}
                <PlayerDiagnostics
                    playerId={player.id}
                    deviceId={player.device_id}
                    macAddress={player.mac_address}
                    publicIp={player.public_ip}
                    geolocation={player.geolocation}
                    deviceInfo={player.device_info}
                    diagnostics={player.diagnostics}
                />
            </div>
        </AppLayout>
    );
}
