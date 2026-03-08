import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/hooks/use-translations';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, ChevronRight, Settings, Shield, User } from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    role: string;
}

interface SelectProps {
    tenants: Tenant[];
    isSuperAdmin: boolean;
}

export default function Select({ tenants, isSuperAdmin }: SelectProps) {
    const { t } = useT();

    const roleLabels: Record<string, string> = {
        super_admin: t('users.roles.superAdmin') || 'Super Admin',
        admin: t('users.roles.admin'),
        editor: t('users.roles.editor'),
        viewer: t('users.roles.viewer'),
    };

    const roleIcons: Record<string, typeof Shield> = {
        super_admin: Shield,
        admin: Shield,
        editor: User,
        viewer: User,
    };

    const handleSelect = (tenantId: string) => {
        router.post('/tenant/switch', { tenant_id: tenantId });
    };

    return (
        <AuthLayout
            title={t('tenant.selectOrg') || 'Select Organization'}
            description={t('tenant.chooseOrg') || 'Choose an organization to continue'}
        >
            <Head title={t('tenant.selectOrg') || 'Select Organization'} />

            <div className="flex flex-col gap-3">
                {tenants.map((tenant) => {
                    const RoleIcon = roleIcons[tenant.role] || User;

                    return (
                        <Card
                            key={tenant.id}
                            className="cursor-pointer transition-colors hover:bg-accent"
                            onClick={() => handleSelect(tenant.id)}
                        >
                            <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{tenant.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 text-xs">
                                                <RoleIcon className="h-3 w-3" />
                                                {roleLabels[tenant.role] || tenant.role}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            {isSuperAdmin && (
                <div className="mt-6 border-t pt-6">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/tenants">
                            <Settings className="mr-2 h-4 w-4" />
                            {t('tenant.manageOrgs') || 'Manage Organizations'}
                        </Link>
                    </Button>
                </div>
            )}

            <div className="mt-6 text-center">
                <Button
                    variant="ghost"
                    onClick={() => router.post('/logout')}
                    className="text-sm text-muted-foreground"
                >
                    {t('auth.signOut') || 'Sign out'}
                </Button>
            </div>
        </AuthLayout>
    );
}
