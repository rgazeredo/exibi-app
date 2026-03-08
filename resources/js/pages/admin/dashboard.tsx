import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CheckCircle,
    HardDrive,
    MonitorPlay,
    Users,
    XCircle,
} from 'lucide-react';

interface Stats {
    tenants: {
        total: number;
        active: number;
        inactive: number;
    };
    players: {
        total: number;
        online: number;
        offline: number;
    };
    storage: {
        total_bytes: number;
        media_count: number;
    };
    users: {
        total: number;
        super_admins: number;
    };
}

interface TenantSummary {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    players_count: number;
    media_count: number;
    users_count: number;
    storage_usage_mb: number;
    created_at: string;
}

interface TenantStorage {
    id: string;
    name: string;
    storage_usage_mb: number;
    storage_limit_mb: number | null;
}

interface AdminDashboardProps {
    stats: Stats;
    recentTenants: TenantSummary[];
    topTenantsByStorage: TenantStorage[];
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatStorage(mb: number): string {
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
}

export default function AdminDashboard({ stats, recentTenants, topTenantsByStorage }: AdminDashboardProps) {
    const { t } = useT();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('nav.dashboard'), href: '/admin/dashboard' },
    ];

    const onlinePercentage = stats.players.total > 0
        ? Math.round((stats.players.online / stats.players.total) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.dashboard')} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('admin.dashboard')}</h1>
                    <p className="text-muted-foreground">
                        {t('admin.dashboardDesc')}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Tenants */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('nav.organizations')}</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.tenants.total}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{stats.tenants.active} {t('admin.active')}</span>
                                {stats.tenants.inactive > 0 && (
                                    <span className="text-yellow-600"> · {stats.tenants.inactive} {t('admin.inactive')}</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Players */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.totalPlayers')}</CardTitle>
                            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.players.total}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{stats.players.online} {t('admin.online')}</span>
                                <span className="text-gray-500"> · {stats.players.offline} {t('admin.offline')}</span>
                            </p>
                            {stats.players.total > 0 && (
                                <Progress value={onlinePercentage} className="mt-2 h-1" />
                            )}
                        </CardContent>
                    </Card>

                    {/* Storage */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('admin.totalStorage')}</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatBytes(stats.storage.total_bytes)}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.storage.media_count} {t('admin.mediaFiles')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Users */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.users.super_admins} {t('admin.superAdmins')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Tenants */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.recentOrgs')}</CardTitle>
                            <CardDescription>{t('admin.recentOrgsDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentTenants.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t('admin.noOrgsYet')}</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentTenants.map((tenant) => (
                                        <div key={tenant.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/tenants/${tenant.id}/edit`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {tenant.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{tenant.players_count} {t('admin.playersLabel')}</span>
                                                        <span>·</span>
                                                        <span>{tenant.users_count} {t('admin.usersLabel')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                                                    {tenant.is_active ? (
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                    ) : (
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                    )}
                                                    {tenant.is_active ? t('common.active') : t('common.inactive')}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Tenants by Storage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.topStorage')}</CardTitle>
                            <CardDescription>{t('admin.topStorageDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topTenantsByStorage.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t('admin.noStorageYet')}</p>
                            ) : (
                                <div className="space-y-4">
                                    {topTenantsByStorage.map((tenant) => {
                                        const percentage = tenant.storage_limit_mb
                                            ? Math.min(100, Math.round((tenant.storage_usage_mb / tenant.storage_limit_mb) * 100))
                                            : 0;
                                        return (
                                            <div key={tenant.id} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <Link
                                                        href={`/admin/tenants/${tenant.id}/edit`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {tenant.name}
                                                    </Link>
                                                    <span className="text-muted-foreground">
                                                        {formatStorage(tenant.storage_usage_mb)}
                                                        {tenant.storage_limit_mb && (
                                                            <span> / {formatStorage(tenant.storage_limit_mb)}</span>
                                                        )}
                                                    </span>
                                                </div>
                                                {tenant.storage_limit_mb ? (
                                                    <Progress
                                                        value={percentage}
                                                        className={percentage >= 90 ? '[&>div]:bg-destructive' : ''}
                                                    />
                                                ) : (
                                                    <div className="h-2 rounded-full bg-primary/20">
                                                        <div className="h-full w-full rounded-full bg-primary/40" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
