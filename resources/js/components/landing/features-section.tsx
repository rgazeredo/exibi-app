import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    BarChart3,
    Clock,
    DatabaseBackup,
    Film,
    ListVideo,
    Puzzle,
    RefreshCw,
    Users,
} from 'lucide-react';

const features = [
    {
        icon: Clock,
        title: 'Agendamento',
        description:
            'Programe quando cada conteúdo deve ser exibido. Automação completa da sua grade.',
        iconBg: 'bg-red-400',
    },
    {
        icon: ListVideo,
        title: 'Playlists inteligentes',
        description:
            'Crie sequências de conteúdo com tempo de exibição personalizado para cada item.',
        iconBg: 'bg-orange-500',
    },
    {
        icon: Film,
        title: 'Otimização de vídeos',
        description:
            'Seus vídeos são automaticamente convertidos para HD e Full HD, garantindo qualidade e compatibilidade.',
        iconBg: 'bg-rose-500',
    },
    {
        icon: Users,
        title: 'Multi-usuários',
        description:
            'Crie contas para sua equipe com diferentes níveis de acesso e permissões.',
        iconBg: 'bg-cyan-500',
    },
    {
        icon: Puzzle,
        title: 'Widgets dinâmicos',
        description:
            'Conteúdo automático como previsão do tempo, loterias, horóscopo e notícias.',
        iconBg: 'bg-purple-500',
    },
    {
        icon: RefreshCw,
        title: 'Atualização remota',
        description:
            'Atualize o conteúdo de qualquer tela instantaneamente, sem precisar ir até o local.',
        iconBg: 'bg-teal-500',
    },
    {
        icon: BarChart3,
        title: 'Relatórios detalhados',
        description:
            'Acompanhe métricas de visualização e performance de cada conteúdo e tela.',
        iconBg: 'bg-green-500',
    },
    {
        icon: DatabaseBackup,
        title: 'Backup automático',
        description:
            'Seus dados e mídias sempre seguros com backups automáticos na nuvem.',
        iconBg: 'bg-green-600',
    },
];

export default function FeaturesSection() {
    return (
        <section id="recursos" className="bg-white py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-12 text-center lg:mb-16">
                    <Badge className="mb-4 border-green-200 bg-green-100 text-xs font-semibold tracking-wider text-green-600 uppercase">
                        Funcionalidades
                    </Badge>
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl xl:text-5xl">
                        Recursos poderosos,{' '}
                        <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                            uso simples
                        </span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg text-slate-600">
                        Desenvolvido para facilitar a gestão de redes de mídia
                        indoor, seja você uma agência com centenas de telas ou
                        um operador iniciando.
                    </p>
                </div>

                {/* Features Grid - 4 columns */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="border-slate-200 bg-slate-50 transition-all hover:bg-white hover:shadow-lg"
                        >
                            <CardContent className="pt-6">
                                <div
                                    className={`h-12 w-12 rounded-xl ${feature.iconBg} mb-4 flex items-center justify-center`}
                                >
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
