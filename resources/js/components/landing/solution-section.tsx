import { Badge } from '@/components/ui/badge';
import { Eye, LayoutDashboard, MonitorCheck, Zap } from 'lucide-react';

const solutions = [
    {
        icon: Zap,
        title: 'Atualização instantânea',
        description:
            'Altere o conteúdo de qualquer tela em segundos, de onde você estiver. Sem visitas técnicas.',
        problem: 'Atualizações demoradas',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        icon: MonitorCheck,
        title: 'Player sempre online',
        description:
            'Aplicativo robusto e atualizado constantemente. Nunca mais tela travada.',
        problem: 'Player travado',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
    },
    {
        icon: Eye,
        title: 'Monitoramento em tempo real',
        description:
            'Saiba exatamente o que está sendo exibido em cada tela, a qualquer momento.',
        problem: 'Falta de controle',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
    },
    {
        icon: LayoutDashboard,
        title: 'Gestão centralizada',
        description:
            'Um único painel para gerenciar todas as telas, equipes e clientes. Processos padronizados.',
        problem: 'Gestão descentralizada',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
    },
];

export default function SolutionSection() {
    return (
        <section className="bg-slate-50 py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left: Dashboard Image */}
                    <div className="relative order-2 lg:order-1">
                        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                            {/* Dashboard mockup */}
                            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                {/* Browser bar */}
                                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2">
                                    <div className="flex gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-red-400" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                        <div className="h-3 w-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="mx-4 flex-1">
                                        <div className="flex h-6 items-center rounded-md bg-white px-3">
                                            <span className="text-xs text-slate-400">
                                                app.exibi.com.br
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard content */}
                                <div className="p-4">
                                    <div className="flex gap-4">
                                        {/* Sidebar */}
                                        <div className="w-40 space-y-2">
                                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2">
                                                <div className="h-6 w-6 rounded bg-blue-600" />
                                                <span className="text-xs font-medium text-blue-700">
                                                    Dashboard
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg p-2">
                                                <div className="h-6 w-6 rounded bg-slate-200" />
                                                <span className="text-xs text-slate-500">
                                                    Players
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg p-2">
                                                <div className="h-6 w-6 rounded bg-slate-200" />
                                                <span className="text-xs text-slate-500">
                                                    Playlists
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg p-2">
                                                <div className="h-6 w-6 rounded bg-slate-200" />
                                                <span className="text-xs text-slate-500">
                                                    Mídia
                                                </span>
                                            </div>
                                        </div>

                                        {/* Main content */}
                                        <div className="flex-1 space-y-3">
                                            {/* Stats row */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="rounded-lg bg-green-50 p-3">
                                                    <div className="text-lg font-bold text-green-700">
                                                        24
                                                    </div>
                                                    <div className="text-xs text-green-600">
                                                        Online
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-red-50 p-3">
                                                    <div className="text-lg font-bold text-red-700">
                                                        2
                                                    </div>
                                                    <div className="text-xs text-red-600">
                                                        Offline
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-blue-50 p-3">
                                                    <div className="text-lg font-bold text-blue-700">
                                                        8
                                                    </div>
                                                    <div className="text-xs text-blue-600">
                                                        Playlists
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chart placeholder */}
                                            <div className="h-24 rounded-lg bg-slate-50 p-3">
                                                <div className="flex h-full items-end justify-between gap-1">
                                                    {[
                                                        40, 65, 45, 80, 55, 70,
                                                        60, 85, 50, 75,
                                                    ].map((h, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400"
                                                            style={{
                                                                height: `${h}%`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="order-1 lg:order-2">
                        <Badge className="mb-4 border-green-600 bg-green-600 text-xs font-semibold tracking-wider text-white uppercase">
                            A solução
                        </Badge>
                        <h2 className="mb-6 text-3xl font-bold text-slate-900 lg:text-4xl xl:text-5xl">
                            Cada problema,{' '}
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                uma solução
                            </span>
                        </h2>
                        <p className="mb-8 text-lg text-slate-600">
                            A AZSign foi desenvolvida para resolver os desafios
                            reais de quem gerencia redes de sinalização digital.
                        </p>

                        <div className="space-y-6">
                            {solutions.map((solution, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                                >
                                    <div
                                        className={`h-12 w-12 flex-shrink-0 rounded-xl ${solution.iconBg} flex items-center justify-center`}
                                    >
                                        <solution.icon
                                            className={`h-6 w-6 ${solution.iconColor}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900">
                                                {solution.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {solution.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
