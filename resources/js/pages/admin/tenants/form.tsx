import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { useT } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, HardDrive, Mail, MonitorPlay, UserPlus } from 'lucide-react';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    storage_limit_mb: number | null;
    players_limit: number | null;
    is_active: boolean;
    storage_usage_mb: number;
    players_count: number;
}

interface TenantFormProps {
    tenant?: TenantData;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export default function TenantForm({ tenant }: TenantFormProps) {
    const { t } = useT();
    const isEditing = !!tenant?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        name: tenant?.name || '',
        slug: tenant?.slug || '',
        storage_limit_mb: tenant?.storage_limit_mb?.toString() || '',
        players_limit: tenant?.players_limit?.toString() || '',
        is_active: tenant?.is_active ?? true,
        create_admin: false,
        admin_name: '',
        admin_email: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('nav.organizations'), href: '/admin/tenants' },
        { title: isEditing ? t('admin.tenants.editTenant') : t('admin.tenants.newTenant'), href: '#' },
    ];

    const handleNameChange = (value: string) => {
        setData('name', value);
        if (!isEditing) {
            setData('slug', slugify(value));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/tenants/${tenant.id}`);
        } else {
            post('/admin/tenants');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? t('admin.tenants.editTenant') : t('admin.tenants.newTenant')} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? t('admin.tenants.editTenant') : t('admin.tenants.newTenant')}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? t('admin.tenants.editOrgDesc')
                            : t('admin.tenants.createOrgDesc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {t('playlists.basicInfo')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.tenants.basicInfoDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('admin.tenants.orgName')} *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder={t('admin.tenants.orgNamePlaceholder')}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">{t('admin.tenants.slug')} *</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">/</span>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', slugify(e.target.value))}
                                        placeholder={t('admin.tenants.slugPlaceholder')}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.tenants.slugHelp')}
                                </p>
                                <InputError message={errors.slug} />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">{t('admin.tenants.activeStatus')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.tenants.activeStatusHelp')}
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Limits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.tenants.resourceLimits')}</CardTitle>
                            <CardDescription>
                                {t('admin.tenants.resourceLimitsDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="storage_limit_mb" className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4" />
                                    {t('admin.tenants.storageLimitMb')}
                                </Label>
                                <Input
                                    id="storage_limit_mb"
                                    type="number"
                                    min="0"
                                    value={data.storage_limit_mb}
                                    onChange={(e) => setData('storage_limit_mb', e.target.value)}
                                    placeholder={t('admin.tenants.storageLimitPlaceholder')}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.tenants.storageLimitHelp')}
                                    {isEditing && tenant && (
                                        <span className="ml-1">
                                            {t('admin.tenants.currentlyUsing', { value: `${tenant.storage_usage_mb} MB` })}
                                        </span>
                                    )}
                                </p>
                                <InputError message={errors.storage_limit_mb} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="players_limit" className="flex items-center gap-2">
                                    <MonitorPlay className="h-4 w-4" />
                                    {t('admin.tenants.playersLimit')}
                                </Label>
                                <Input
                                    id="players_limit"
                                    type="number"
                                    min="0"
                                    value={data.players_limit}
                                    onChange={(e) => setData('players_limit', e.target.value)}
                                    placeholder={t('admin.tenants.playersLimitPlaceholder')}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.tenants.playersLimitHelp')}
                                    {isEditing && tenant && (
                                        <span className="ml-1">
                                            {t('admin.tenants.currentlyUsing', { value: `${tenant.players_count} players` })}
                                        </span>
                                    )}
                                </p>
                                <InputError message={errors.players_limit} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin User - Only for creation */}
                    {!isEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    {t('admin.tenants.adminUser')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin.tenants.adminUserDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="create_admin">{t('admin.tenants.createAdminUser')}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t('admin.tenants.createAdminUserHelp')}
                                        </p>
                                    </div>
                                    <Switch
                                        id="create_admin"
                                        checked={data.create_admin}
                                        onCheckedChange={(checked) => setData('create_admin', checked)}
                                    />
                                </div>

                                {data.create_admin && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="admin_name">{t('admin.tenants.adminName')} *</Label>
                                            <Input
                                                id="admin_name"
                                                value={data.admin_name}
                                                onChange={(e) => setData('admin_name', e.target.value)}
                                                placeholder={t('admin.tenants.adminNamePlaceholder')}
                                            />
                                            <InputError message={errors.admin_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="admin_email">{t('admin.tenants.adminEmail')} *</Label>
                                            <Input
                                                id="admin_email"
                                                type="email"
                                                value={data.admin_email}
                                                onChange={(e) => setData('admin_email', e.target.value)}
                                                placeholder={t('admin.tenants.adminEmailPlaceholder')}
                                            />
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {t('admin.tenants.adminEmailHelp')}
                                            </p>
                                            <InputError message={errors.admin_email} />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/admin/tenants')}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            {isEditing ? t('admin.tenants.updateOrg') : t('admin.tenants.createOrg')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
