import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Cloud, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface WidgetType {
    value: string;
    label: string;
    description: string;
    states: Record<string, string>;
    themes: Record<string, string>;
    orientations: Record<string, string>;
}

interface DurationOption {
    value: number;
    label: string;
}

interface Widget {
    id: string;
    name: string;
    widget_type: string;
    config: Record<string, any>;
}

interface WidgetFormProps {
    widget: Widget | null;
    widgetType: WidgetType;
    durationOptions: DurationOption[];
}

export default function WidgetForm({ widget, widgetType, durationOptions }: WidgetFormProps) {
    const isEditing = !!widget;

    const [name, setName] = useState(widget?.name || '');
    const [city, setCity] = useState(widget?.config?.city || '');
    const [state, setState] = useState(widget?.config?.state || '');
    const [theme, setTheme] = useState(widget?.config?.theme || 'dark');
    const [orientation, setOrientation] = useState(widget?.config?.orientation || 'landscape');
    const [durationSeconds, setDurationSeconds] = useState<number>(widget?.config?.duration_seconds || 5);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Painel', href: '/dashboard' },
        { title: 'Widgets', href: '/widgets' },
        { title: isEditing ? 'Editar Widget' : 'Novo Widget de Clima', href: '#' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const data = {
            name,
            config: {
                city,
                state,
                theme,
                orientation,
                duration_seconds: durationSeconds,
            },
        };

        if (isEditing) {
            router.put(`/widgets/${widget.id}`, data, {
                onError: (errors) => setErrors(errors),
                onFinish: () => setSaving(false),
            });
        } else {
            router.post('/widgets', data, {
                onError: (errors) => setErrors(errors),
                onFinish: () => setSaving(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Editar Widget' : 'Novo Widget de Clima'} />

            <div className="flex flex-col gap-6 p-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/widgets">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Editar Widget de Clima' : 'Novo Widget de Clima'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? 'Atualize as configurações do widget de clima'
                                : 'Configure a previsão do tempo para uma cidade'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                            <CardDescription>Nome do widget de clima</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Widget</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Clima São Paulo"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cloud className="h-5 w-5 text-cyan-600" />
                                Localização
                            </CardTitle>
                            <CardDescription>Cidade para exibir a previsão do tempo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">
                                        Cidade <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Ex: São Paulo"
                                    />
                                    {errors['config.city'] && (
                                        <p className="text-sm text-destructive">{errors['config.city']}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">
                                        Estado <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={state} onValueChange={setState}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(widgetType.states).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors['config.state'] && (
                                        <p className="text-sm text-destructive">{errors['config.state']}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Aparência</CardTitle>
                            <CardDescription>Configurações visuais do widget</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Tema</Label>
                                    <Select value={theme} onValueChange={setTheme}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tema" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(widgetType.themes).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="orientation">Orientação</Label>
                                    <Select value={orientation} onValueChange={setOrientation}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a orientação" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(widgetType.orientations).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">
                                    Duração <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={durationSeconds.toString()}
                                    onValueChange={(value) => setDurationSeconds(parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a duração" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {durationOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors['config.duration_seconds'] && (
                                    <p className="text-sm text-destructive">{errors['config.duration_seconds']}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Tempo que o widget será exibido na playlist
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info about regeneration */}
                    <Card className="bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Cloud className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-cyan-900 dark:text-cyan-100">Atualização Automática</p>
                                    <p className="text-sm text-cyan-700 dark:text-cyan-300">
                                        O widget de clima é atualizado automaticamente 6 vezes ao dia:
                                        às 05h, 08h, 11h, 14h, 17h e 20h. Não há atualização entre 22h e 04h.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={saving || !city || !state}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Salvar Alterações' : 'Criar Widget'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/widgets">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
