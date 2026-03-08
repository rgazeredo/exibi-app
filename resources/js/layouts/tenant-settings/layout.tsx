import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useT } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Building2, Settings, Shield, Users } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export default function TenantSettingsLayout({ children }: PropsWithChildren) {
    const { t } = useT();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const sidebarNavItems: NavItem[] = [
        {
            title: t('tenant.settingsNav.general') || 'Geral',
            href: '/tenant/settings',
            icon: Settings,
        },
        {
            title: t('tenant.settingsNav.users') || 'Usuários',
            href: '/tenant/settings/users',
            icon: Users,
        },
        {
            title: t('tenant.settingsNav.roles') || 'Papéis',
            href: '/tenant/settings/roles',
            icon: Shield,
        },
    ];

    const isActive = (href: string) => {
        if (href === '/tenant/settings') {
            return currentPath === '/tenant/settings';
        }
        return currentPath.startsWith(href);
    };

    return (
        <div className="px-4 py-6">
            <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t('tenant.orgSettings') || 'Configurações da Organização'}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('tenant.orgSettingsDesc') || 'Gerencie a identidade visual e preferências da sua organização'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-56">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isActive(item.href as string),
                                })}
                            >
                                <Link href={item.href as string}>
                                    {item.icon && (
                                        <item.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1">
                    <section className="space-y-6">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
