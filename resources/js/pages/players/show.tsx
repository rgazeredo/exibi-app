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
    Clock,
    Download,
    Edit,
    Eye,
    Film,
    Image,
    Keyboard,
    ListRestart,
    Loader2,
    MonitorPlay,
    Play,
    Power,
    Replace,
    Trash2,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface CurrentlyPlayingMedia {
    id: string;
    title: string;
    type: 'video' | 'image';
    url: string | null;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    duration_formatted: string | null;
}

interface RegionPlayback {
    region_id: string;
    region_name: string;
    is_main: boolean;
    media: CurrentlyPlayingMedia | null;
    playlist_name: string | null;
}

interface CurrentlyPlaying {
    media: CurrentlyPlayingMedia | null;
    confidence: 'high' | 'medium' | 'low' | 'none';
    source: 'heartbeat' | 'playback_log' | 'estimated' | 'unknown';
    position: number | null;
    total_items: number | null;
    started_at: string | null;
    started_at_human: string | null;
    playlist_name: string | null;
    regions?: RegionPlayback[];
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
    is_active: boolean;
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
    currently_playing: CurrentlyPlaying | null;
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
    const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
    const [previewMedia, setPreviewMedia] =
        useState<CurrentlyPlayingMedia | null>(null);

    // Replace player states
    const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
    const [activationCode, setActivationCode] = useState('');
    const [replaceLoading, setReplaceLoading] = useState(false);

    // Currently playing state (with WebSocket)
    const [currentlyPlaying, setCurrentlyPlaying] =
        useState<CurrentlyPlaying | null>(player.currently_playing);
    const [playerOnline, setPlayerOnline] = useState(player.is_online);
    const [lastSeenAt, setLastSeenAt] = useState(player.last_seen_at);
    const [lastSeenTimestamp, setLastSeenTimestamp] = useState<Date | null>(
        player.last_seen_at_full ? new Date(player.last_seen_at_full) : null,
    );
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [wsConnected, setWsConnected] = useState(false);
    const [wsState, setWsState] = useState<string>('connecting');

    // Check if player went offline (no heartbeat in 5 minutes)
    useEffect(() => {
        const checkOnlineStatus = () => {
            if (lastSeenTimestamp) {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                const isStillOnline = lastSeenTimestamp > fiveMinutesAgo;
                setPlayerOnline(isStillOnline);
            }
        };

        // Check immediately
        checkOnlineStatus();

        // Check every 30 seconds
        const interval = setInterval(checkOnlineStatus, 30000);

        return () => clearInterval(interval);
    }, [lastSeenTimestamp]);

    // Listen for WebSocket updates (100% real-time, no polling)
    useEffect(() => {
        let channel: ReturnType<typeof window.Echo.channel> | null = null;

        if (!window.Echo) {
            setWsState('unavailable');
            return;
        }

        try {
            // Get Pusher instance for connection state management
            const pusher = window.Echo.connector?.pusher;

            if (pusher) {
                // Bind to connection state changes
                pusher.connection.bind(
                    'state_change',
                    (states: { current: string; previous: string }) => {
                        setWsState(states.current);
                        setWsConnected(states.current === 'connected');
                    },
                );

                // Check initial state
                const initialState = pusher.connection.state;
                setWsState(initialState);
                setWsConnected(initialState === 'connected');

                // Pusher has built-in reconnection with exponential backoff
                // but we can configure it for more aggressive reconnection
                pusher.connection.bind('disconnected', () => {
                    // Pusher will auto-reconnect, but we track state
                    setWsConnected(false);
                });

                pusher.connection.bind('connected', () => {
                    setWsConnected(true);
                    setLastUpdate(new Date());
                });
            }

            // Subscribe to player channel
            channel = window.Echo.channel(`player.${player.id}`);

            // Listen for media change events
            channel.listen(
                '.media.changed',
                (data: {
                    player_id: string;
                    is_online: boolean;
                    last_seen_at: string | null;
                    currently_playing: CurrentlyPlaying | null;
                }) => {
                    setCurrentlyPlaying(data.currently_playing);
                    setPlayerOnline(data.is_online);
                    setLastSeenAt(data.last_seen_at);
                    // Update timestamp when we receive an event (player is communicating)
                    if (data.is_online) {
                        setLastSeenTimestamp(new Date());
                    }
                    setLastUpdate(new Date());
                },
            );
        } catch (error) {
            console.error('WebSocket setup failed:', error);
            setWsState('failed');
            setWsConnected(false);
        }

        return () => {
            if (channel) {
                channel.stopListening('.media.changed');
                window.Echo?.leave(`player.${player.id}`);
            }
        };
    }, [player.id]);

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
                        label: t('players.refreshPlaylist'),
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
                                        player.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {player.is_active
                                        ? t('players.status.active')
                                        : t('players.status.inactive')}
                                </Badge>
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
                                {t('players.refreshPlaylist')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('players.refreshPlaylistDesc')}
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
                                {t('players.refreshPlaylist')}
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

                            {/* Chamador de Senha */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                    Chamador de Senha
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-normal"
                                    >
                                        Requer habilitação
                                    </Badge>
                                </h3>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Funciona apenas quando "Chamador de Senha"
                                    está habilitado nas configurações do grupo
                                    ou player.
                                </p>
                                <div className="space-y-2">
                                    <ShortcutRow
                                        keys={['▲', '+', 'OK']}
                                        description="Chamar próxima senha (incrementar)"
                                    />
                                    <ShortcutRow
                                        keys={['▼', '+', 'OK']}
                                        description="Decrementar senha"
                                    />
                                    <ShortcutRow
                                        keys={['OK', '×3']}
                                        description="Rechamar senha atual (sem incrementar)"
                                    />
                                    <ShortcutRow
                                        keys={['◀', '×3', '+', 'OK']}
                                        description="Zerar senha (volta para 0)"
                                    />
                                    <ShortcutRow
                                        keys={['▶', '×3', '+', 'OK']}
                                        description="Abrir configuração de senha"
                                    />
                                </div>
                            </div>

                            {/* Configuração de Senha */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    Modo Configuração de Senha
                                </h3>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Quando o overlay de configuração está aberto
                                    (após ▶×3 + OK):
                                </p>
                                <div className="space-y-2">
                                    <ShortcutRow
                                        keys={['▲']}
                                        description="Aumentar número"
                                    />
                                    <ShortcutRow
                                        keys={['▼']}
                                        description="Diminuir número"
                                    />
                                    <ShortcutRow
                                        keys={['0-9']}
                                        description="Digitar número diretamente (até 4 dígitos)"
                                    />
                                    <ShortcutRow
                                        keys={['DEL']}
                                        description="Apagar último dígito"
                                    />
                                    <ShortcutRow
                                        keys={['OK']}
                                        description="Confirmar nova senha"
                                    />
                                    <ShortcutRow
                                        keys={['BACK']}
                                        description="Cancelar"
                                    />
                                </div>
                            </div>
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

                {/* Media Preview Modal */}
                <Dialog
                    open={mediaPreviewOpen}
                    onOpenChange={(open) => {
                        setMediaPreviewOpen(open);
                        if (!open) setPreviewMedia(null);
                    }}
                >
                    <DialogContent className="max-h-[90vh] max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {previewMedia?.type === 'video' ? (
                                    <Film className="h-5 w-5" />
                                ) : (
                                    <Image className="h-5 w-5" />
                                )}
                                {previewMedia?.title ||
                                    t('players.mediaPreview')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center justify-center">
                            {previewMedia?.url &&
                                (previewMedia.type === 'video' ? (
                                    <video
                                        src={previewMedia.url}
                                        controls
                                        autoPlay
                                        className="max-h-[70vh] max-w-full rounded-lg"
                                    />
                                ) : (
                                    <img
                                        src={previewMedia.url}
                                        alt={previewMedia.title}
                                        className="max-h-[70vh] max-w-full rounded-lg object-contain"
                                    />
                                ))}
                        </div>
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
                                        {t('players.layout')}
                                    </dt>
                                    <dd className="text-right text-sm font-medium">
                                        {player.effective_layout ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <div>
                                                    <span className="hover:underline">
                                                        {
                                                            player
                                                                .effective_layout
                                                                .name
                                                        }
                                                    </span>
                                                    {player.effective_layout
                                                        .source === 'player' ? (
                                                        <span className="ml-1 font-normal text-primary">
                                                            (
                                                            {t(
                                                                'players.ownLayout',
                                                            )}
                                                            )
                                                        </span>
                                                    ) : (
                                                        player.effective_layout
                                                            .group_name && (
                                                            <span className="font-normal text-muted-foreground">
                                                                {' '}
                                                                (
                                                                {t(
                                                                    'players.inheritedFrom',
                                                                )}{' '}
                                                                {
                                                                    player
                                                                        .effective_layout
                                                                        .group_name
                                                                }
                                                                )
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                {/* Show region playlists */}
                                                {player.effective_layout
                                                    .region_playlists.length >
                                                    0 && (
                                                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                                        {player.effective_layout.region_playlists.map(
                                                            (rp, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <span className="text-muted-foreground/70">
                                                                        {
                                                                            rp.region_name
                                                                        }
                                                                        :
                                                                    </span>
                                                                    {rp.playlist ? (
                                                                        <Link
                                                                            href={`/playlists/${rp.playlist.id}`}
                                                                            className="text-foreground hover:underline"
                                                                        >
                                                                            {
                                                                                rp
                                                                                    .playlist
                                                                                    .name
                                                                            }
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="italic">
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
                                            <span className="font-normal text-muted-foreground italic">
                                                {t('players.noneAssigned')}
                                            </span>
                                        )}
                                    </dd>
                                </div>
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

                    {/* Now Playing & Remote Commands */}
                    <Card className="gap-2">
                        {/* Now Playing Section */}
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Play className="h-5 w-5" />
                                    {t('players.nowPlaying')}
                                    {playerOnline ? (
                                        <span
                                            className={`ml-2 flex items-center gap-1 text-sm font-normal ${
                                                wsConnected
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : wsState === 'connecting'
                                                      ? 'text-blue-600 dark:text-blue-400'
                                                      : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-2 w-2 rounded-full ${
                                                    wsConnected
                                                        ? 'bg-green-500'
                                                        : wsState ===
                                                            'connecting'
                                                          ? 'animate-pulse bg-blue-500'
                                                          : 'bg-red-500'
                                                }`}
                                            />
                                            {wsConnected
                                                ? t('players.wsConnected')
                                                : wsState === 'connecting'
                                                  ? t('players.wsConnecting')
                                                  : t('players.wsDisconnected')}
                                        </span>
                                    ) : (
                                        <span className="ml-2 flex items-center gap-1 text-sm font-normal text-muted-foreground">
                                            <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                                            {t('players.playerOffline')}
                                        </span>
                                    )}
                                </CardTitle>
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
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                            {/* Multi-region display when layout has multiple regions */}
                            {currentlyPlaying?.regions &&
                            currentlyPlaying.regions.length > 1 ? (
                                <div className="space-y-3">
                                    {currentlyPlaying.regions.map((region) => (
                                        <div
                                            key={region.region_id}
                                            className="flex gap-3 rounded-lg border p-2"
                                        >
                                            {/* Region thumbnail */}
                                            <div
                                                className="group relative h-16 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded bg-muted"
                                                onClick={() => {
                                                    if (region.media?.url) {
                                                        setPreviewMedia(
                                                            region.media,
                                                        );
                                                        setMediaPreviewOpen(
                                                            true,
                                                        );
                                                    }
                                                }}
                                            >
                                                {region.media?.thumbnail_url ? (
                                                    <img
                                                        src={
                                                            region.media
                                                                .thumbnail_url
                                                        }
                                                        alt={region.media.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        {region.media ? (
                                                            region.media
                                                                .type ===
                                                            'video' ? (
                                                                <Film className="h-6 w-6 text-muted-foreground" />
                                                            ) : (
                                                                <Image className="h-6 w-6 text-muted-foreground" />
                                                            )
                                                        ) : (
                                                            <MonitorPlay className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                )}
                                                {region.media?.url && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Eye className="h-5 w-5 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Region info */}
                                            <div className="min-w-0 flex-1">
                                                <span className="text-sm font-medium">
                                                    {region.region_name
                                                        .replace(/_/g, ' ')
                                                        .replace(/\b\w/g, (c) =>
                                                            c.toUpperCase(),
                                                        )}
                                                </span>
                                                {region.media ? (
                                                    <div className="mt-0.5">
                                                        <p className="truncate text-sm">
                                                            {region.media.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Badge
                                                                variant="secondary"
                                                                className="px-1 py-0 text-xs"
                                                            >
                                                                {region.media
                                                                    .type ===
                                                                'video' ? (
                                                                    <>
                                                                        <Film className="mr-0.5 h-2.5 w-2.5" />
                                                                        {t(
                                                                            'media.video',
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Image className="mr-0.5 h-2.5 w-2.5" />
                                                                        {t(
                                                                            'media.image',
                                                                        )}
                                                                    </>
                                                                )}
                                                            </Badge>
                                                            {region.playlist_name && (
                                                                <span className="truncate">
                                                                    {
                                                                        region.playlist_name
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {t(
                                                            'players.noMediaPlaying',
                                                        ) ||
                                                            'Nenhuma mídia reproduzindo'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : currentlyPlaying?.media ? (
                                <div className="flex gap-4">
                                    {/* Thumbnail with preview button */}
                                    <div
                                        className="group relative h-20 w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-muted"
                                        onClick={() => {
                                            if (currentlyPlaying.media?.url) {
                                                setPreviewMedia(
                                                    currentlyPlaying.media,
                                                );
                                                setMediaPreviewOpen(true);
                                            }
                                        }}
                                    >
                                        {currentlyPlaying.media
                                            .thumbnail_url ? (
                                            <img
                                                src={
                                                    currentlyPlaying.media
                                                        .thumbnail_url
                                                }
                                                alt={
                                                    currentlyPlaying.media.title
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                {currentlyPlaying.media.type ===
                                                'video' ? (
                                                    <Film className="h-8 w-8 text-muted-foreground" />
                                                ) : (
                                                    <Image className="h-8 w-8 text-muted-foreground" />
                                                )}
                                            </div>
                                        )}
                                        {/* Preview overlay on hover */}
                                        {currentlyPlaying.media.url && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Eye className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                        {/* Type badge */}
                                        <div className="absolute bottom-1 left-1">
                                            <Badge
                                                variant="secondary"
                                                className="px-1.5 py-0 text-xs"
                                            >
                                                {currentlyPlaying.media.type ===
                                                'video' ? (
                                                    <>
                                                        <Film className="mr-1 h-3 w-3" />
                                                        {t('media.video')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Image className="mr-1 h-3 w-3" />
                                                        {t('media.image')}
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Media info */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate font-medium">
                                            {currentlyPlaying.media.title}
                                        </h4>
                                        <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {t('players.mediaDuration')}
                                                    :{' '}
                                                    {currentlyPlaying.media
                                                        .duration_formatted ||
                                                        (currentlyPlaying.media
                                                            .type === 'image'
                                                            ? '0:10'
                                                            : '-')}
                                                </span>
                                                {currentlyPlaying.position &&
                                                    currentlyPlaying.total_items && (
                                                        <span>
                                                            {t(
                                                                'players.itemOf',
                                                                {
                                                                    position:
                                                                        currentlyPlaying.position,
                                                                    total: currentlyPlaying.total_items,
                                                                },
                                                            )}
                                                        </span>
                                                    )}
                                            </div>
                                            {/* Timestamp when media was played */}
                                            {currentlyPlaying.started_at && (
                                                <span className="flex items-center gap-1">
                                                    <Activity className="h-3.5 w-3.5" />
                                                    {t('players.playedAt')}:{' '}
                                                    {formatDate(
                                                        currentlyPlaying.started_at,
                                                    )}
                                                </span>
                                            )}
                                            {/* Playlist name if available */}
                                            {currentlyPlaying.playlist_name && (
                                                <span className="flex items-center gap-1">
                                                    <ListRestart className="h-3.5 w-3.5" />
                                                    {t('players.playlist')}:{' '}
                                                    {
                                                        currentlyPlaying.playlist_name
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="flex h-20 w-32 items-center justify-center rounded-lg bg-muted">
                                        <MonitorPlay className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm">
                                            {playerOnline
                                                ? t('players.nowPlayingEmpty')
                                                : t(
                                                      'players.nowPlayingOffline',
                                                  )}
                                        </p>
                                        {currentlyPlaying?.total_items ===
                                            0 && (
                                            <p className="mt-1 text-xs">
                                                {t(
                                                    'players.noPlaylistAssigned',
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
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
                                    {t('players.refreshPlaylist')}
                                </Button>
                                {/* <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        sendCommand(
                                            'refresh-app',
                                            t('players.checkForUpdates'),
                                        )
                                    }
                                    disabled={sendingCommand !== null}
                                >
                                    {sendingCommand === 'refresh-app' ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                    )}
                                    {t('players.checkForUpdates')}
                                </Button> */}
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
