import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check, Monitor, HardDrive, Sparkles } from 'lucide-react';

const plans = [
    {
        name: 'Básico',
        screens: '30',
        storage: '3 GB',
        price: '150',
        popular: false,
    },
    {
        name: 'Starter',
        screens: '50',
        storage: '5 GB',
        price: '225',
        popular: true,
    },
    {
        name: 'Profissional',
        screens: '100',
        storage: '15 GB',
        price: '400',
        popular: false,
    },
    {
        name: 'Business',
        screens: '300',
        storage: '50 GB',
        price: '999',
        popular: false,
    },
];

const allFeatures = [
    'Todos os widgets inclusos',
    'Atualizações em tempo real',
    'Suporte técnico',
    'Relatórios de exibição',
    'Agendamento de conteúdo',
    'Multi-usuários',
];

export default function PricingSection() {
    return (
        <section id="planos" className="bg-white py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-12 text-center lg:mb-16">
                    <Badge className="mb-4 border-blue-200 bg-blue-100 text-xs font-semibold tracking-wider text-blue-700 uppercase">
                        Planos
                    </Badge>
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl xl:text-5xl">
                        Escolha o plano{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            ideal para você
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600">
                        Planos flexíveis que crescem com o seu negócio. Sem taxas
                        ocultas, cancele quando quiser.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`relative flex flex-col ${
                                plan.popular
                                    ? 'z-10 border-2 border-blue-600 shadow-xl lg:scale-105'
                                    : 'border-slate-200 shadow-sm transition-shadow hover:shadow-lg'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-blue-600 px-3 py-0.5 text-xs text-white">
                                        <Sparkles className="mr-1 h-3 w-3" />
                                        Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="pb-2 pt-6 text-center">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {plan.name}
                                </h3>
                            </CardHeader>

                            <CardContent className="flex-1 text-center">
                                {/* Price */}
                                <div className="mb-4 flex items-baseline justify-center">
                                    <span className="text-sm text-slate-500">
                                        R$
                                    </span>
                                    <span className="text-3xl font-bold text-slate-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        /mês
                                    </span>
                                </div>

                                {/* Specs */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <Monitor className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-slate-700">
                                            {plan.screens}
                                        </span>
                                        <span className="text-slate-500">
                                            telas
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <HardDrive className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-slate-700">
                                            {plan.storage}
                                        </span>
                                        <span className="text-slate-500">
                                            armazenamento
                                        </span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-0">
                                <Button
                                    className={`w-full ${
                                        plan.popular
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : ''
                                    }`}
                                    variant={plan.popular ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                >
                                    <a href="#contato">Contratar</a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Features included in all plans */}
                <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:p-8">
                    <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Incluído em todos os planos
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {allFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 text-sm text-slate-700"
                            >
                                <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Precisa de mais telas ou armazenamento?{' '}
                        <a
                            href="#contato"
                            className="font-medium text-blue-600 hover:text-blue-700"
                        >
                            Monte um plano personalizado
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
