import { Badge } from '@/components/ui/badge';
import { Globe, HardDrive, Headphones, Shield, Zap } from 'lucide-react';

const stats = [
    {
        value: '99.9%',
        label: 'Uptime garantido',
        description:
            'SLA de disponibilidade com infraestrutura redundante e monitoramento contínuo',
    },
    {
        value: '24/7',
        label: 'Monitoramento',
        description:
            'Datacenters monitorados 24 horas por dia, 365 dias por ano',
    },
    {
        value: '100%',
        label: 'Backups automáticos',
        description:
            'Seus dados replicados em múltiplos servidores de forma automática',
    },
];

const badges = [
    {
        icon: Globe,
        label: 'Infraestrutura global',
    },
    {
        icon: Shield,
        label: 'Proteção anti-DDoS',
    },
    {
        icon: HardDrive,
        label: 'Backups redundantes',
    },
    {
        icon: Zap,
        label: 'CDN de alta performance',
    },
    {
        icon: Headphones,
        label: 'Suporte em Português',
    },
];

export default function InstitutionalSection() {
    return (
        <section className="bg-slate-50 py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Grid */}
                <div className="mb-16 grid gap-8 md:grid-cols-3 lg:gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="mb-2 text-4xl font-bold text-green-600 lg:text-5xl">
                                {stat.value}
                            </div>
                            <div className="mb-1 text-lg font-semibold text-slate-900">
                                {stat.label}
                            </div>
                            <p className="text-sm text-slate-600">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Trust Message */}
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900 lg:text-2xl">
                        Infraestrutura de classe mundial
                    </h3>
                    <p className="text-slate-600">
                        Sua operação roda em datacenters de alta
                        disponibilidade, com proteção integrada contra ataques,
                        backups automáticos e replicação de dados para garantir
                        que seu conteúdo esteja sempre disponível.
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
                    {badges.map((badge, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                        >
                            <badge.icon className="mr-2 h-4 w-4" />
                            {badge.label}
                        </Badge>
                    ))}
                </div>
            </div>
        </section>
    );
}
