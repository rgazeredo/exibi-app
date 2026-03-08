import { Badge } from '@/components/ui/badge';
import { Sun, Clover, Newspaper, MoreHorizontal } from 'lucide-react';

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
        iconBg: 'bg-blue-500',
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
        <section
            id="widgets"
            className="py-16 lg:py-24 bg-slate-900"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Content */}
                    <div>
                        <Badge className="mb-4 bg-slate-700 text-slate-300 border-slate-600 uppercase tracking-wider text-xs font-semibold">
                            Conteúdo Dinâmico
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6">
                            Muito além de vídeos
                        </h2>
                        <p className="text-lg text-slate-400 mb-8">
                            Mantenha a audiência engajada com informações úteis e atualizadas
                            automaticamente. O AZSign oferece widgets prontos para enriquecer sua
                            programação.
                        </p>

                        {/* Widget List */}
                        <div className="space-y-4">
                            {widgets.map((widget, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-lg ${widget.iconBg} flex items-center justify-center flex-shrink-0`}
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
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                AZContent
                            </a>
                        </p>
                    </div>

                    {/* Right: Widget Mockups */}
                    <div className="relative">
                        <div className="relative flex items-center justify-center">
                            {/* Background glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />

                            {/* Widget Cards */}
                            <div className="relative grid grid-cols-2 gap-4 p-4">
                                {/* Weather Widget */}
                                <div className="col-span-1 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-600/30 shadow-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <Sun className="h-8 w-8 text-amber-400" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">24°C</div>
                                            <div className="text-xs text-slate-400">Sunny</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 mt-4">
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-white">22°</span>
                                        <span className="text-xs text-white">25°</span>
                                        <span className="text-xs text-white">21°</span>
                                        <span className="text-xs text-white">23°</span>
                                    </div>
                                </div>

                                {/* Horoscope Widget */}
                                <div className="col-span-1 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-600/30 shadow-xl">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="text-4xl text-purple-400 mb-2">♌</div>
                                        <div className="text-xs text-slate-400 mb-1">Leão</div>
                                        <div className="text-xs text-purple-300">Your daily horoscope</div>
                                        <div className="flex gap-1 mt-3">
                                            {['Amor', 'Saúde', 'Dinheiro'].map((item) => (
                                                <span key={item} className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Lottery Widget */}
                                <div className="col-span-2 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-600/30 shadow-xl">
                                    <div className="text-sm font-medium text-white mb-3">Lottery Results</div>
                                    <div className="flex justify-center gap-2 mb-2">
                                        {[5, 12, 23, 28, 34, 42].map((num, i) => (
                                            <div
                                                key={i}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                    i < 3 ? 'bg-green-500' : i < 5 ? 'bg-blue-500' : 'bg-orange-500'
                                                }`}
                                            >
                                                {num.toString().padStart(2, '0')}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center text-xs text-slate-400">Mega-Sena • 2847</div>
                                </div>

                                {/* News Widget */}
                                <div className="col-span-2 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-600/30 shadow-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Newspaper className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm font-medium text-white">Notícias</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                            <p className="text-xs text-slate-300 line-clamp-1">Economia brasileira cresce 2,5% no trimestre</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                            <p className="text-xs text-slate-300 line-clamp-1">Tecnologia: novos avanços em IA são anunciados</p>
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
