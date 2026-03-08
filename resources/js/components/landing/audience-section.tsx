import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Lightbulb,
    Users,
    HeartHandshake,
    MessageCircle,
    ArrowRight,
} from 'lucide-react';

const pillars = [
    {
        icon: Lightbulb,
        title: 'Experiência de mercado',
        description:
            'Nossa equipe tem anos de vivência no setor de mídia indoor. Conhecemos de perto os desafios reais porque já estivemos do outro lado.',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
    },
    {
        icon: Users,
        title: 'Aprendizado com o mercado',
        description:
            'Analisamos as dores de outras plataformas e ouvimos operadores de diferentes portes. Cada funcionalidade nasceu de uma necessidade real.',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        icon: HeartHandshake,
        title: 'Parceria contínua',
        description:
            'Não paramos no lançamento. Evoluímos junto com nossos clientes, priorizando o que realmente faz diferença na operação do dia a dia.',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
    },
];

export default function AudienceSection() {
    return (
        <section id="sobre" className="bg-slate-50 py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
                    <Badge className="mb-4 border-amber-200 bg-amber-100 text-xs font-semibold tracking-wider text-amber-700 uppercase">
                        Nossa filosofia
                    </Badge>
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl xl:text-5xl">
                        Construída por quem{' '}
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            entende o mercado
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600">
                        A AZSign não nasceu de uma ideia abstrata. Nasceu da
                        experiência prática, de anos resolvendo problemas reais
                        e ouvindo quem opera mídia indoor todos os dias.
                    </p>
                </div>

                {/* Pillars */}
                <div className="mb-16 grid gap-6 md:grid-cols-3 lg:gap-8">
                    {pillars.map((pillar, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div
                                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${pillar.iconBg}`}
                            >
                                <pillar.icon
                                    className={`h-6 w-6 ${pillar.iconColor}`}
                                />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                {pillar.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-600">
                                {pillar.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA - Open communication */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 lg:p-12">
                    {/* Background decoration */}
                    <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
                        <div className="flex items-start gap-4 lg:max-w-2xl">
                            <div className="hidden flex-shrink-0 rounded-xl bg-amber-500/20 p-3 sm:block">
                                <MessageCircle className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-xl font-semibold text-white lg:text-2xl">
                                    Sua opinião constrói o produto
                                </h3>
                                <p className="text-slate-300">
                                    Tem uma ideia, sugestão ou um problema que a
                                    plataforma ainda não resolve? Queremos
                                    ouvir. Novas funcionalidades nascem de
                                    conversas como essa.
                                </p>
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <Button
                                size="lg"
                                className="bg-amber-500 px-6 text-slate-900 hover:bg-amber-400"
                                asChild
                            >
                                <a href="#contato">
                                    Fale conosco
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
