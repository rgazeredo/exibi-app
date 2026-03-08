import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const serverIsOpen = usePage<SharedData>().props.sidebarOpen;

    // On screens <= 1024px, start with sidebar collapsed
    const defaultOpen = useMemo(() => {
        if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
            return false;
        }
        return serverIsOpen;
    }, []);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>;
}
