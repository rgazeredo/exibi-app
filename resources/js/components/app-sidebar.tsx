import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useT } from '@/hooks/use-translations';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    Cloud,
    HardDrive,
    LayoutGrid,
    ListVideo,
    MonitorPlay,
    Settings,
    Smartphone,
    Tags,
    Ticket,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { tenant, auth } = page.props;
    const { t } = useT();
    const isSuperAdmin = auth.user?.is_super_admin === true;
    const hasTenantContext = !!tenant;
    const isTenantAdmin =
        tenant?.role === 'admin' || tenant?.role === 'super_admin';
    const permissions = tenant?.permissions || [];

    // Check if we're in the admin area based on URL path
    const isInAdminArea = page.url.startsWith('/admin');

    // Helper function to check permissions
    const hasPermission = (permission: string): boolean => {
        if (isSuperAdmin) return true;
        return permissions.includes(permission);
    };

    const canViewModule = (module: string): boolean => {
        return hasPermission(`${module}.view`);
    };

    // Menus when a tenant is selected
    // Order based on workflow: Content → Organization → Distribution → Monitoring → Admin
    const tenantNavItems: NavItem[] = (() => {
        const items: NavItem[] = [
            {
                title: t('nav.dashboard'),
                href: '/dashboard',
                icon: LayoutGrid,
            },
        ];

        if (canViewModule('media')) {
            items.push({
                title: t('nav.media'),
                href: '/media',
                icon: HardDrive,
            });
        }

        if (canViewModule('playlists')) {
            items.push({
                title: t('nav.playlists'),
                href: '/playlists',
                icon: ListVideo,
            });
        }

        if (canViewModule('players')) {
            items.push({
                title: t('nav.players'),
                href: '/players',
                icon: MonitorPlay,
            });
        }

        if (canViewModule('widgets')) {
            items.push({
                title: t('nav.widgets'),
                href: '/widgets',
                icon: Cloud,
            });
        }

        if (canViewModule('tags')) {
            items.push({
                title: t('nav.tags'),
                href: '/tags',
                icon: Tags,
            });
        }

        if (canViewModule('reports')) {
            items.push({
                title: t('nav.reports'),
                href: '/reports',
                icon: BarChart3,
            });
        }

        return items;
    })();

    const tenantAdminNavItems: NavItem[] = (() => {
        const items: NavItem[] = [];

        if (hasPermission('settings.manage')) {
            items.push({
                title: t('nav.settings'),
                href: '/tenant/settings',
                icon: Settings,
            });
        }

        return items;
    })();

    // Menus for super admin without tenant context
    const superAdminNavItems: NavItem[] = useMemo(
        () => [
            {
                title: t('nav.dashboard'),
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: t('nav.organizations'),
                href: '/admin/tenants',
                icon: Building2,
            },
            {
                title: t('nav.administrators'),
                href: '/admin/users',
                icon: Users,
            },
            {
                title: t('nav.globalWidgets'),
                href: '/admin/widgets',
                icon: Ticket,
            },
            {
                title: t('nav.appReleases'),
                href: '/admin/releases',
                icon: Smartphone,
            },
        ],
        [t],
    );

    const footerNavItems: NavItem[] = [];

    const mainNavItems = useMemo(() => {
        // In admin area - always show admin menus
        if (isInAdminArea && isSuperAdmin) {
            return superAdminNavItems;
        }

        // Super admin without tenant context - show admin menus
        if (isSuperAdmin && !hasTenantContext) {
            return superAdminNavItems;
        }

        // With tenant context - show tenant menus
        let items = [...tenantNavItems];
        if (isTenantAdmin) {
            items = [...items, ...tenantAdminNavItems];
        }
        // Add link to admin area for super admins even when in tenant context
        if (isSuperAdmin) {
            items = [
                ...items,
                {
                    title: t('nav.adminArea'),
                    href: '/admin/dashboard',
                    icon: Building2,
                },
            ];
        }
        return items;
    }, [
        isSuperAdmin,
        hasTenantContext,
        isTenantAdmin,
        isInAdminArea,
        superAdminNavItems,
        tenantNavItems,
        tenantAdminNavItems,
        t,
    ]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    isInAdminArea
                                        ? '/admin/dashboard'
                                        : '/dashboard'
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
