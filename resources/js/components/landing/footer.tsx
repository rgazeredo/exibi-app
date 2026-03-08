import { Separator } from '@/components/ui/separator';
import { Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
    produto: [
        { label: 'Recursos', href: '#recursos' },
        { label: 'Widgets', href: '#widgets' },
        { label: 'Para quem', href: '#para-quem' },
        { label: 'Planos', href: '#planos' },
    ],
    empresa: [
        { label: 'Sobre nós', href: '#sobre' },
        { label: 'Contato', href: '#contato' },
    ],
    legal: [
        { label: 'Termos de uso', href: '/termos' },
        { label: 'Privacidade', href: '/privacidade' },
    ],
};

export default function LandingFooter() {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-2">
                        <img
                            src="/images/exibi-horizontal.png"
                            alt="Exibi"
                            className="h-8 w-auto mb-4 brightness-0 invert"
                        />
                        <p className="text-sm text-slate-400 mb-4 max-w-xs">
                            Plataforma de sinalização digital para gestão de mídia indoor.
                            Atualize suas telas de qualquer lugar, em tempo real.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="YouTube"
                            >
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Produto */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Produto</h4>
                        <ul className="space-y-2">
                            {footerLinks.produto.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Empresa */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Empresa</h4>
                        <ul className="space-y-2">
                            {footerLinks.empresa.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <Separator className="my-8 bg-slate-800" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        {new Date().getFullYear()} Exibi. Todos os direitos reservados.
                    </p>
                    <p className="text-sm text-slate-500">
                        Desenvolvido por{' '}
                        <a
                            href="https://azcode.com.br"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            AZCode
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
