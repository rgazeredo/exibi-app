import { Badge } from '@/components/ui/badge';
import { Clover, MoreHorizontal, Newspaper, Sun } from 'lucide-react';

const widgets = [
    {
        icon: Sun,
        title: 'Previsão do Tempo',
        description: 'Atualização local automática',
        iconBg: 'bg-amber-500',
    },
    {
        icon: Clover,
        title: 'Resultados de Loterias',
        description: 'Mega-sena, Quina e mais',
        iconBg: 'bg-green-500',
    },
    {
        icon: Newspaper,
        title: 'Notícias',
        description: 'Manchetes atualizadas em tempo real',
        iconBg: 'bg-green-500',
    },
    {
        icon: MoreHorizontal,
        title: 'E muito mais...',
        description: 'Horóscopo, cotação de moedas, esportes e outros',
        iconBg: 'bg-purple-500',
    },
];

export default function WidgetsSection() {
    return (
        <section id="widgets" className="bg-slate-900 py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left: Content */}
                    <div>
                        <Badge className="mb-4 border-slate-600 bg-slate-700 text-xs font-semibold tracking-wider text-slate-300 uppercase">
                            Conteúdo Dinâmico
                        </Badge>
                        <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl xl:text-5xl">
                            Muito além de vídeos
                        </h2>
                        <p className="mb-8 text-lg text-slate-400">
                            Mantenha a audiência engajada com informações úteis
                            e atualizadas automaticamente. O Exibi oferece
                            widgets prontos para enriquecer sua programação.
                        </p>

                        {/* Widget List */}
                        <div className="space-y-4">
                            {widgets.map((widget, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 transition-colors hover:bg-slate-800"
                                >
                                    <div
                                        className={`h-10 w-10 rounded-lg ${widget.iconBg} flex flex-shrink-0 items-center justify-center`}
                                    >
                                        <widget.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {widget.title}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {widget.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 text-xs text-slate-500">
                            Os widgets do AZSign são fornecidos pela{' '}
                            <a
                                href="https://azcontent.com.br"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 transition-colors hover:text-white"
                            >
                                AZContent
                            </a>
                        </p>
                    </div>

                    {/* Right: Widget Mockups */}
                    <div className="relative">
                        <div className="relative flex items-center justify-center">
                            {/* Background glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-orange-500/20 blur-3xl" />

                            {/* Widget Cards */}
                            <div className="relative grid grid-cols-2 gap-4 p-4">
                                {/* Weather Widget */}
                                <div className="col-span-1 rounded-2xl border border-slate-600/30 bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-5 shadow-xl backdrop-blur-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <Sun className="h-8 w-8 text-amber-400" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">
                                                24°C
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Sunny
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between text-xs text-slate-400">
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                    </div>
                                    <div className="mt-1 flex justify-between">
                                        <span className="text-xs text-white">
                                            22°
                                        </span>
                                        <span className="text-xs text-white">
                                            25°
                                        </span>
                                        <span className="text-xs text-white">
                                            21°
                                        </span>
                                        <span className="text-xs text-white">
                                            23°
                                        </span>
                                    </div>
                                </div>

                                {/* Horoscope Widget */}
                                <div className="col-span-1 rounded-2xl border border-slate-600/30 bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-5 shadow-xl backdrop-blur-sm">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-2 text-4xl text-purple-400">
                                            ♌
                                        </div>
                                        <div className="mb-1 text-xs text-slate-400">
                                            Leão
                                        </div>
                                        <div className="text-xs text-purple-300">
                                            Your daily horoscope
                                        </div>
                                        <div className="mt-3 flex gap-1">
                                            {['Amor', 'Saúde', 'Dinheiro'].map(
                                                (item) => (
                                                    <span
                                                        key={item}
                                                        className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300"
                                                    >
                                                        {item}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Lottery Widget */}
                                <div className="col-span-2 rounded-2xl border border-slate-600/30 bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-5 shadow-xl backdrop-blur-sm">
                                    <div className="mb-3 text-sm font-medium text-white">
                                        Lottery Results
                                    </div>
                                    <div className="mb-2 flex justify-center gap-2">
                                        {[5, 12, 23, 28, 34, 42].map(
                                            (num, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                                                        i < 3
                                                            ? 'bg-green-500'
                                                            : i < 5
                                                              ? 'bg-green-600'
                                                              : 'bg-orange-500'
                                                    }`}
                                                >
                                                    {num
                                                        .toString()
                                                        .padStart(2, '0')}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="text-center text-xs text-slate-400">
                                        Mega-Sena • 2847
                                    </div>
                                </div>

                                {/* News Widget */}
                                <div className="col-span-2 rounded-2xl border border-slate-600/30 bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-5 shadow-xl backdrop-blur-sm">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Newspaper className="h-4 w-4 text-green-400" />
                                        <span className="text-sm font-medium text-white">
                                            Notícias
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-green-400" />
                                            <p className="line-clamp-1 text-xs text-slate-300">
                                                Economia brasileira cresce 2,5%
                                                no trimestre
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-green-400" />
                                            <p className="line-clamp-1 text-xs text-slate-300">
                                                Tecnologia: novos avanços em IA
                                                são anunciados
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
