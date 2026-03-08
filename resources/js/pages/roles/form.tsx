import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, Shield } from 'lucide-react';
import { useMemo } from 'react';

interface Permission {
    id: string;
    module: string;
    action: string;
    name: string;
}

interface Role {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    is_deletable: boolean;
    permissions: string[];
}

interface PermissionsByModule {
    [module: string]: {
        id: string;
        action: string;
        name: string;
    }[];
}

interface RoleFormProps {
    role: Role | null;
    permissions: Permission[];
    permissionsByModule: PermissionsByModule;
}

const MODULE_LABELS: Record<string, string> = {
    media: 'Mídia',
    playlists: 'Playlists',
    players: 'Players',
    player_groups: 'Grupos de Players',
    widgets: 'Widgets',
    tags: 'Tags',
    reports: 'Relatórios',
    users: 'Usuários',
    roles: 'Papéis e Permissões',
    settings: 'Configurações',
};

const ACTION_LABELS: Record<string, string> = {
    view: 'Visualizar',
    create: 'Criar',
    edit: 'Editar',
    delete: 'Deletar',
    manage: 'Gerenciar',
};

export default function RoleForm({ role, permissions, permissionsByModule }: RoleFormProps) {
    const { t } = useT();
    const isEditing = !!role;

    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        description: role?.description || '',
        permissions: role?.permissions || [],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('roles.title'), href: '/tenant/settings/roles' },
        { title: isEditing ? role.name : t('roles.createRole'), href: '#' },
    ];

    const allPermissionIds = useMemo(() => permissions.map(p => p.id), [permissions]);

    const isAllSelected = data.permissions.length === allPermissionIds.length;
    const isPartiallySelected = data.permissions.length > 0 && data.permissions.length < allPermissionIds.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setData('permissions', allPermissionIds);
        } else {
            setData('permissions', []);
        }
    };

    const handleTogglePermission = (permissionId: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData('permissions', data.permissions.filter(id => id !== permissionId));
        }
    };

    const handleToggleModule = (module: string, checked: boolean) => {
        const modulePermissionIds = (permissionsByModule[module] || []).map(p => p.id);

        if (checked) {
            const newPermissions = [...new Set([...data.permissions, ...modulePermissionIds])];
            setData('permissions', newPermissions);
        } else {
            setData('permissions', data.permissions.filter(id => !modulePermissionIds.includes(id)));
        }
    };

    const isModuleSelected = (module: string): boolean | 'indeterminate' => {
        const modulePermissionIds = (permissionsByModule[module] || []).map(p => p.id);
        const selected = modulePermissionIds.filter(id => data.permissions.includes(id));

        if (selected.length === 0) return false;
        if (selected.length === modulePermissionIds.length) return true;
        return 'indeterminate';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/roles/${role.id}`);
        } else {
            post('/tenant/settings/roles');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? t('roles.editRole') : t('roles.createRole')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                        <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? t('roles.editRole') : t('roles.createRole')}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? t('roles.editRoleDesc') : t('roles.createRoleDesc')}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('roles.basicInfo')}</CardTitle>
                            <CardDescription>{t('roles.basicInfoDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('common.name')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={role?.is_system}
                                    placeholder={t('roles.namePlaceholder')}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                                {role?.is_system && (
                                    <p className="text-sm text-muted-foreground">
                                        {t('roles.systemRoleNameLocked')}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">{t('common.description')}</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={role?.is_system}
                                    placeholder={t('roles.descriptionPlaceholder')}
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t('roles.permissions')}</CardTitle>
                                    <CardDescription>{t('roles.permissionsDesc')}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        ref={(el) => {
                                            if (el) {
                                                (el as HTMLButtonElement).dataset.state = isPartiallySelected ? 'indeterminate' : (isAllSelected ? 'checked' : 'unchecked');
                                            }
                                        }}
                                    />
                                    <Label htmlFor="select-all" className="text-sm font-medium">
                                        {t('roles.selectAll')}
                                    </Label>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {errors.permissions && (
                                <p className="text-sm text-destructive mb-4">{errors.permissions}</p>
                            )}

                            <div className="space-y-6">
                                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => {
                                    const moduleSelected = isModuleSelected(module);

                                    return (
                                        <div key={module} className="space-y-3">
                                            <div className="flex items-center gap-2 border-b pb-2">
                                                <Checkbox
                                                    id={`module-${module}`}
                                                    checked={moduleSelected === true}
                                                    onCheckedChange={(checked) => handleToggleModule(module, !!checked)}
                                                    ref={(el) => {
                                                        if (el) {
                                                            (el as HTMLButtonElement).dataset.state =
                                                                moduleSelected === 'indeterminate'
                                                                    ? 'indeterminate'
                                                                    : (moduleSelected ? 'checked' : 'unchecked');
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`module-${module}`}
                                                    className="font-semibold uppercase text-xs tracking-wider"
                                                >
                                                    {MODULE_LABELS[module] || module}
                                                </Label>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-6">
                                                {modulePermissions.map((permission) => (
                                                    <div key={permission.id} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={permission.id}
                                                            checked={data.permissions.includes(permission.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleTogglePermission(permission.id, !!checked)
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={permission.id}
                                                            className="text-sm font-normal cursor-pointer"
                                                        >
                                                            {ACTION_LABELS[permission.action] || permission.action}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/roles">{t('common.cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? t('roles.savePermissions') : t('roles.createRole')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
