import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertTriangle,
    Clock,
    MonitorOff,
    RefreshCw,
    Users,
} from 'lucide-react';

const problems = [
    {
        icon: Clock,
        title: 'Atualizações demoradas',
        description:
            'Perda de tempo enviando arquivos manualmente ou dependendo de terceiros para atualizar cada tela.',
    },
    {
        icon: MonitorOff,
        title: 'Player travado',
        description:
            'Aplicativo que trava, congela ou fica desatualizado sem que ninguém perceba até o cliente reclamar.',
    },
    {
        icon: AlertTriangle,
        title: 'Falta de controle',
        description:
            'Sem visibilidade do que está sendo exibido em cada ponto. Conteúdo desatualizado passando despercebido.',
    },
    {
        icon: RefreshCw,
        title: 'Processos manuais',
        description:
            'Operação que não escala. Quanto mais telas, mais trabalho e mais chance de erros.',
    },
    {
        icon: Users,
        title: 'Gestão descentralizada',
        description:
            'Dificuldade em manter padrão e qualidade quando diferentes pessoas gerenciam diferentes pontos.',
    },
];

export default function ProblemSection() {
    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-12 text-center lg:mb-16">
                    <Badge
                        variant="outline"
                        className="mb-4 border-red-200 bg-red-50 text-xs font-semibold tracking-wider text-red-600 uppercase"
                    >
                        O desafio
                    </Badge>
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl xl:text-5xl">
                        Gerenciar mídia indoor não precisa ser{' '}
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                            assim tão difícil
                        </span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg text-slate-600">
                        Se você ainda depende de processos manuais para
                        atualizar suas telas, provavelmente já enfrentou alguns
                        desses problemas:
                    </p>
                </div>

                {/* Problem Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {problems.map((problem, index) => (
                        <Card
                            key={index}
                            className="border-slate-100 bg-slate-50 transition-shadow hover:shadow-md"
                        >
                            <CardContent className="pt-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-red-100">
                                    <problem.icon className="h-6 w-6 text-orange-500" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    {problem.title}
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {problem.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
