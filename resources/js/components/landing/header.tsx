import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
    { label: 'Recursos', href: '#recursos' },
    { label: 'Widgets', href: '#widgets' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Planos', href: '#planos' },
];

export default function LandingHeader() {
    const [isOpen, setIsOpen] = useState(false);

    const scrollToSection = (href: string) => {
        setIsOpen(false);
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <img
                            src="/images/exibi-horizontal.png"
                            alt="Exibi"
                            className="h-8 lg:h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => scrollToSection(link.href)}
                                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    {/* Desktop CTAs */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/login">Entrar</Link>
                        </Button>
                        <Button asChild>
                            <a href="#contato">Solicitar demonstração</a>
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[280px] p-0 [&>button]:hidden">
                            <div className="flex h-full flex-col">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                    <img
                                        src="/images/exibi-horizontal.png"
                                        alt="Exibi"
                                        className="h-7 w-auto"
                                    />
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 px-4 py-6">
                                    <div className="space-y-1">
                                        {navLinks.map((link) => (
                                            <button
                                                key={link.href}
                                                onClick={() => scrollToSection(link.href)}
                                                className="flex w-full items-center rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
                                            >
                                                {link.label}
                                            </button>
                                        ))}
                                    </div>
                                </nav>

                                {/* Footer CTAs */}
                                <div className="border-t border-slate-100 p-4">
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" asChild className="w-full justify-center">
                                            <Link href="/login">Entrar</Link>
                                        </Button>
                                        <Button asChild className="w-full justify-center">
                                            <a href="#contato" onClick={() => setIsOpen(false)}>
                                                Solicitar demonstração
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
