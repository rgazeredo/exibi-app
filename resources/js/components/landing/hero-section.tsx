import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-slate-50 to-white pt-24 pb-20 lg:pt-32 lg:pb-32">
            {/* Decorative elements */}
            <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl" />
            <div className="absolute top-40 left-0 h-80 w-80 rounded-full bg-purple-100/30 blur-3xl" />

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Headline */}
                    <h1 className="mb-6 text-4xl leading-tight font-bold text-slate-900 sm:text-5xl lg:text-6xl">
                        Transforme suas telas em{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ferramentas de comunicação
                        </span>{' '}
                        poderosas
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 sm:text-xl">
                        Gerencie e atualize o conteúdo das suas telas de
                        sinalização digital de qualquer lugar, em tempo real.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="w-full px-8 py-6 text-base sm:w-auto"
                            asChild
                        >
                            <a href="#contato">
                                Solicitar demonstração
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full px-8 py-6 text-base sm:w-auto"
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Assistir vídeo
                        </Button>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative mt-16">
                    <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-2xl">
                        {/* Dashboard mockup */}
                        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            {/* Simulated dashboard UI */}
                            <div className="absolute inset-4 overflow-hidden rounded-lg">
                                <div className="h-full w-full bg-slate-800 p-4">
                                    {/* Header bar */}
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        <div className="ml-4 h-6 flex-1 rounded bg-slate-700" />
                                    </div>
                                    {/* Content grid */}
                                    <div className="grid h-[calc(100%-2rem)] grid-cols-4 gap-4">
                                        {/* Sidebar */}
                                        <div className="col-span-1 rounded-lg bg-slate-700/50 p-3">
                                            <div className="space-y-2">
                                                <div className="h-8 rounded bg-blue-600/50" />
                                                <div className="h-6 rounded bg-slate-600" />
                                                <div className="h-6 rounded bg-slate-600" />
                                                <div className="h-6 rounded bg-slate-600" />
                                            </div>
                                        </div>
                                        {/* Main content */}
                                        <div className="col-span-3 space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="h-20 rounded-lg bg-slate-700/50" />
                                                <div className="h-20 rounded-lg bg-slate-700/50" />
                                                <div className="h-20 rounded-lg bg-slate-700/50" />
                                            </div>
                                            <div className="h-40 rounded-lg bg-slate-700/50" />
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
