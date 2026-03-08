import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/gauge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useT } from '@/hooks/use-translations';
import {
    Activity,
    Cpu,
    ExternalLink,
    Globe,
    HardDrive,
    Map,
    MapPin,
    MemoryStick,
    Monitor,
    Network,
    Smartphone,
    Thermometer,
} from 'lucide-react';

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

export interface HeartbeatEntry {
    id: string;
    ip_address: string | null;
    app_version: string | null;
    system_info: SystemInfo | null;
    status: string | null;
    created_at: string;
    created_at_human: string;
}

interface GeoLocation {
    city?: string;
    region?: string;
    country?: string;
    isp?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
}

interface PlayerDiagnosticsProps {
    playerId: string;
    deviceId: string | null;
    macAddress: string | null;
    publicIp: string | null;
    geolocation: GeoLocation | null;
    deviceInfo: DeviceInfo | null;
    diagnostics: Diagnostics | null;
}

export function PlayerDiagnostics({
    playerId,
    deviceId,
    macAddress,
    publicIp,
    geolocation,
    deviceInfo,
    diagnostics,
}: PlayerDiagnosticsProps) {
    const { t } = useT();

    // Geolocation is now fetched from the backend (stored on player model)
    const geoLocation = geolocation;
    const geoLoading = false;

    const formatBytes = (mb: number | undefined) => {
        if (mb === undefined) return '-';
        if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
        return `${mb.toFixed(0)} MB`;
    };

    const getCpuColor = (usage: number | undefined) => {
        if (usage === undefined) return 'text-muted';
        if (usage >= 80) return 'text-red-500';
        if (usage >= 50) return 'text-amber-500';
        return 'text-green-500';
    };

    const getMemoryColor = (percent: number | undefined) => {
        if (percent === undefined) return 'text-muted';
        if (percent >= 90) return 'text-red-500';
        if (percent >= 70) return 'text-amber-500';
        return 'text-blue-500';
    };

    const getStorageColor = (percent: number | undefined) => {
        if (percent === undefined) return 'text-muted';
        if (percent >= 90) return 'text-red-500';
        if (percent >= 75) return 'text-amber-500';
        return 'text-purple-500';
    };

    const getTemperatureGaugeColor = (temp: number | undefined) => {
        if (temp === undefined) return 'text-muted';
        if (temp >= 60) return 'text-red-500';
        if (temp >= 45) return 'text-amber-500';
        return 'text-orange-500';
    };

    const systemInfo = diagnostics?.system_info;
    const hasDeviceInfo = deviceInfo && Object.keys(deviceInfo).length > 0;
    const hasDiagnostics = diagnostics !== null;
    const hasSystemInfo = systemInfo && Object.keys(systemInfo).length > 0;

    if (!hasDiagnostics && !hasDeviceInfo) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        {t('players.diagnostics.title') || 'Diagnóstico'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t('players.diagnostics.noData') ||
                            'Nenhum dado de diagnóstico disponível. O player ainda não enviou informações do sistema.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Row 1: Device Info + System Resources */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Device Info Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4" />
                            {t('players.diagnostics.device') || 'Dispositivo'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {deviceInfo?.manufacturer && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('players.diagnostics.manufacturer') ||
                                            'Fabricante'}
                                    </span>
                                    <span className="font-medium">
                                        {deviceInfo.manufacturer}
                                    </span>
                                </div>
                            )}
                            {deviceInfo?.model && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('players.diagnostics.model') ||
                                            'Modelo'}
                                    </span>
                                    <span className="font-medium">
                                        {deviceInfo.model}
                                    </span>
                                </div>
                            )}
                            {deviceInfo?.android_version && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('players.diagnostics.androidVersion') ||
                                            'Android'}
                                    </span>
                                    <span className="font-medium">
                                        {deviceInfo.android_version}
                                        {deviceInfo.sdk_version &&
                                            ` (SDK ${deviceInfo.sdk_version})`}
                                    </span>
                                </div>
                            )}
                            {deviceInfo?.screen_resolution && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        <Monitor className="mr-1 inline h-3 w-3" />
                                        {t('players.diagnostics.resolution') ||
                                            'Resolução'}
                                    </span>
                                    <span className="font-medium">
                                        {deviceInfo.screen_resolution}
                                    </span>
                                </div>
                            )}
                            {deviceId && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Device ID
                                    </span>
                                    <span className="font-mono text-xs">
                                        {deviceId.length > 16
                                            ? `${deviceId.slice(0, 8)}...${deviceId.slice(-8)}`
                                            : deviceId}
                                    </span>
                                </div>
                            )}
                            {macAddress && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        MAC Address
                                    </span>
                                    <span className="font-mono text-xs">
                                        {macAddress}
                                    </span>
                                </div>
                            )}
                            {diagnostics?.app_version && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('players.diagnostics.appVersion') ||
                                            'Versão do App'}
                                    </span>
                                    <Badge variant="secondary">
                                        v{diagnostics.app_version}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* System Resources Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Cpu className="h-4 w-4" />
                                {t('players.diagnostics.system') ||
                                    'Recursos do Sistema'}
                                {diagnostics?.last_update_human && (
                                    <span className="text-xs text-muted-foreground font-normal">
                                        • {t('players.diagnostics.updated') ||
                                            'Atualizado'}{' '}
                                        {diagnostics.last_update_human}
                                    </span>
                                )}
                            </CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/players/${playerId}/downloads`}>
                                    <HardDrive className="mr-2 h-4 w-4" />
                                    {t('players.storage') || 'Armazenamento'}
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {hasSystemInfo ? (
                            <div className="grid grid-cols-2 gap-3">
                                {/* CPU */}
                                {systemInfo.cpu_usage !== undefined && (
                                    <StatCard
                                        value={`${systemInfo.cpu_usage.toFixed(0)}%`}
                                        label="CPU"
                                        icon={<Cpu className="h-4 w-4" />}
                                        colorClass={getCpuColor(systemInfo.cpu_usage)}
                                        percentage={systemInfo.cpu_usage}
                                    />
                                )}

                                {/* Memory */}
                                {systemInfo.memory_used_percent !== undefined && (
                                    <StatCard
                                        value={`${systemInfo.memory_used_percent.toFixed(0)}%`}
                                        label={t('players.diagnostics.memory') || 'Memória'}
                                        sublabel={`${formatBytes(
                                            systemInfo.memory_total_mb &&
                                                systemInfo.memory_available_mb
                                                ? systemInfo.memory_total_mb -
                                                      systemInfo.memory_available_mb
                                                : undefined,
                                        )} / ${formatBytes(systemInfo.memory_total_mb)}`}
                                        icon={<MemoryStick className="h-4 w-4" />}
                                        colorClass={getMemoryColor(systemInfo.memory_used_percent)}
                                        percentage={systemInfo.memory_used_percent}
                                    />
                                )}

                                {/* Storage */}
                                {systemInfo.storage_used_percent !== undefined && (
                                    <StatCard
                                        value={`${systemInfo.storage_used_percent.toFixed(0)}%`}
                                        label={t('players.diagnostics.storage') || 'Armazenamento'}
                                        sublabel={`${(
                                            (systemInfo.storage_total_gb || 0) -
                                            (systemInfo.storage_available_gb || 0)
                                        ).toFixed(1)} / ${systemInfo.storage_total_gb?.toFixed(0)} GB`}
                                        icon={<HardDrive className="h-4 w-4" />}
                                        colorClass={getStorageColor(systemInfo.storage_used_percent)}
                                        percentage={systemInfo.storage_used_percent}
                                    />
                                )}

                                {/* Temperature */}
                                {systemInfo.temperature !== undefined && (
                                    <StatCard
                                        value={`${systemInfo.temperature.toFixed(0)}°C`}
                                        label={t('players.diagnostics.temperature') || 'Temperatura'}
                                        icon={<Thermometer className="h-4 w-4" />}
                                        colorClass={getTemperatureGaugeColor(systemInfo.temperature)}
                                        percentage={(systemInfo.temperature / 80) * 100}
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('players.diagnostics.noSystemInfo') ||
                                    'Aguardando dados do sistema...'}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Network + Map */}
            {(publicIp || diagnostics?.ip_address) && (
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Network / Location Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Network className="h-4 w-4" />
                                {t('players.diagnostics.network') || 'Rede e Localização'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* IP Info */}
                                {publicIp && (
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Globe className="h-3 w-3" />
                                            {t('players.diagnostics.ipAddress') ||
                                                'IP Público'}
                                        </span>
                                        <span className="font-mono">
                                            {publicIp}
                                        </span>
                                    </div>
                                )}
                                {diagnostics?.ip_address && diagnostics.ip_address !== publicIp && (
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Network className="h-3 w-3" />
                                            {t('players.diagnostics.localIp') ||
                                                'IP Local'}
                                        </span>
                                        <span className="font-mono text-muted-foreground">
                                            {diagnostics.ip_address}
                                        </span>
                                    </div>
                                )}
                                {systemInfo?.network_type && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t(
                                                'players.diagnostics.connectionType',
                                            ) || 'Tipo de Conexão'}
                                        </span>
                                        <Badge variant="outline">
                                            {systemInfo.network_type}
                                        </Badge>
                                    </div>
                                )}
                                {systemInfo?.wifi_signal_strength !== undefined && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t(
                                                'players.diagnostics.signalStrength',
                                            ) || 'Sinal WiFi'}
                                        </span>
                                        <span className="font-medium">
                                            {systemInfo.wifi_signal_strength} dBm
                                        </span>
                                    </div>
                                )}

                                {/* Geolocation */}
                                {geoLoading ? (
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            {t('players.diagnostics.locationLabel') || 'Localização'}
                                        </span>
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ) : geoLocation ? (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {t('players.diagnostics.locationLabel') || 'Localização'}
                                            </span>
                                            <span className="text-right">
                                                <span className="font-medium">
                                                    {[geoLocation.city, geoLocation.region]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </span>
                                                {geoLocation.country && (
                                                    <span className="text-muted-foreground">
                                                        {' '}({geoLocation.country})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {geoLocation.isp && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    ISP
                                                </span>
                                                <span className="text-right">
                                                    {geoLocation.isp}
                                                </span>
                                            </div>
                                        )}
                                        {geoLocation.timezone && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {t(
                                                        'players.diagnostics.timezone',
                                                    ) || 'Fuso Horário'}
                                                </span>
                                                <span>
                                                    {geoLocation.timezone}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map Card */}
                    {geoLocation?.lat && geoLocation?.lon ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Map className="h-4 w-4" />
                                        {t('players.diagnostics.location') || 'Localização'}
                                    </CardTitle>
                                    <a
                                        href={`https://www.google.com/maps?q=${geoLocation.lat},${geoLocation.lon}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        {t('players.diagnostics.openInMaps') || 'Abrir no Google Maps'}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-hidden rounded-lg border">
                                    <iframe
                                        title="Player Location"
                                        width="100%"
                                        height="180"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${geoLocation.lon - 0.05},${geoLocation.lat - 0.03},${geoLocation.lon + 0.05},${geoLocation.lat + 0.03}&layer=mapnik&marker=${geoLocation.lat},${geoLocation.lon}`}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {t('players.diagnostics.locationDisclaimer') ||
                                        'Localização aproximada baseada no IP público.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Map className="h-4 w-4" />
                                    {t('players.diagnostics.location') || 'Localização'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {geoLoading
                                        ? t('players.diagnostics.loadingLocation') || 'Carregando localização...'
                                        : t('players.diagnostics.noLocation') || 'Localização não disponível'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

// Heartbeat History Modal Component
interface HeartbeatHistoryModalProps {
    heartbeatHistory: HeartbeatEntry[];
    trigger: React.ReactNode;
}

export function HeartbeatHistoryModal({
    heartbeatHistory,
    trigger,
}: HeartbeatHistoryModalProps) {
    const { t } = useT();

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        {t('players.diagnostics.heartbeatHistory') || 'Histórico de Conexão'}
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {t('players.diagnostics.time') || 'Horário'}
                                </TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>
                                    {t('players.diagnostics.version') || 'Versão'}
                                </TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {heartbeatHistory.length > 0 ? (
                                heartbeatHistory.map((hb) => (
                                    <TableRow key={hb.id}>
                                        <TableCell className="text-sm">
                                            <span title={hb.created_at}>
                                                {hb.created_at_human}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {hb.ip_address || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {hb.app_version || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    hb.status === 'online'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="text-xs"
                                            >
                                                {hb.status || 'unknown'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t('players.diagnostics.noHeartbeats') ||
                                            'Nenhuma conexão registrada'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <p className="text-xs text-muted-foreground">
                    {t('players.diagnostics.lastHeartbeats', {
                        count: heartbeatHistory.length,
                    }) || `Exibindo as últimas ${heartbeatHistory.length} conexões`}
                </p>
            </DialogContent>
        </Dialog>
    );
}
