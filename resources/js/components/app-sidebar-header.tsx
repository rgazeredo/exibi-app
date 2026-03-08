import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useT } from '@/hooks/use-translations';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, tenant } = usePage<SharedData>().props;
    const { t } = useT();
    const isSuperAdminInTenantContext = auth?.user?.is_super_admin && tenant;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Indicador para super admin acessando tenant */}
            {isSuperAdminInTenantContext && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                        {t('admin.tenants.accessingAs')}: <strong>{tenant.name}</strong>
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                        onClick={() => router.visit('/admin/tenants')}
                    >
                        <LogOut className="h-3 w-3 mr-1" />
                        {t('admin.tenants.backToAdmin')}
                    </Button>
                </div>
            )}
        </header>
    );
}
