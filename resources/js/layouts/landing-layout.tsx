import LandingFooter from '@/components/landing/footer';
import LandingHeader from '@/components/landing/header';
import { Head } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface LandingLayoutProps {
    title?: string;
}

export default function LandingLayout({
    children,
    title = 'Exibi - Plataforma de Sinalização Digital',
}: PropsWithChildren<LandingLayoutProps>) {
    return (
        <div className="min-h-screen bg-white">
            <Head title={title} />
            <LandingHeader />
            <main>{children}</main>
            <LandingFooter />
        </div>
    );
}
