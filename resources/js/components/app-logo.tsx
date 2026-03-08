import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    if (isCollapsed) {
        return (
            <img
                src="/images/exibi-icon.png"
                alt="Exibi"
                className="h-8 w-auto mx-auto"
            />
        );
    }

    return (
        <img
            src="/images/exibi-horizontal.png"
            alt="Exibi"
            className="h-8 w-auto"
        />
    );
}
