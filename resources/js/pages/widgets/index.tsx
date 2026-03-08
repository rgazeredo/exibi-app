import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Cloud, Clock, Construction, Info, Loader2, Newspaper, Pencil, Plus, RefreshCw, Search, Ticket, Trash2, Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Widget {
    id: string;
    name: string;
    widget_type: 'weather' | 'lottery' | 'news';
    widget_type_label: string;
    status: string;
    status_label: string;
    config: Record<string, any>;
    regeneration_cron: string | null;
    regeneration_description: string | null;
    last_generated_at: string | null;
    last_generated_at_human: string | null;
    next_regeneration_at: string | null;
    thumbnail_url: string | null;
    video_url: string | null;
    duration_seconds: number;
    is_global: boolean;
    created_at: string;
}

interface Stats {
    weather: {
        total: number;
        ready: number;
        generating: number;
        error: number;
    };
    global: {
        lottery: number;
        news: number;
        ready: number;
    };
}

interface WidgetsIndexProps {
    filters: {
        search?: string;
        type?: string;
        status?: string;
    };
    stats: Stats;
}

const BRAZILIAN_STATES: Record<string, string> = {
    'AC': 'Acre',
    'AL': 'Alagoas',
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goiás',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraima',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins',
};

const THEMES = { 'dark': 'Escuro', 'light': 'Claro' };
const ORIENTATIONS = { 'landscape': 'Paisagem', 'portrait': 'Retrato' };
const DURATION_OPTIONS = [
    { value: 5, label: '5 segundos' },
    { value: 10, label: '10 segundos' },
    { value: 15, label: '15 segundos' },
];

function getWidgetIcon(widgetType: string, className = 'h-5 w-5') {
    switch (widgetType) {
        case 'weather':
            return <Cloud className={`${className} text-cyan-600`} />;
        case 'lottery':
            return <Ticket className={`${className} text-amber-600`} />;
        case 'news':
            return <Newspaper className={`${className} text-purple-600`} />;
        default:
            return <Cloud className={`${className} text-gray-600`} />;
    }
}

function getStatusBadge(status: string, statusLabel: string) {
    switch (status) {
        case 'ready':
            return <Badge variant="default" className="bg-green-500">{statusLabel}</Badge>;
        case 'generating':
            return <Badge variant="secondary" className="bg-blue-100 text-blue-700">{statusLabel}</Badge>;
        case 'error':
            return <Badge variant="destructive">{statusLabel}</Badge>;
        default:
            return <Badge variant="outline">{statusLabel}</Badge>;
    }
}

export default function WidgetsIndex({ filters, stats }: WidgetsIndexProps) {
    const [weatherWidgets, setWeatherWidgets] = useState<Widget[]>([]);
    const [globalWidgets, setGlobalWidgets] = useState<Widget[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [globalTypeFilter, setGlobalTypeFilter] = useState<string>('all');
    const [regenerating, setRegenerating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('weather');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Form state
    const [formName, setFormName] = useState('');
    const [formCity, setFormCity] = useState('');
    const [formState, setFormState] = useState('');
    const [formTheme, setFormTheme] = useState('dark');
    const [formOrientation, setFormOrientation] = useState('landscape');
    const [formDuration, setFormDuration] = useState(5);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Painel', href: '/dashboard' },
        { title: 'Widgets', href: '/widgets' },
    ];

    const fetchWeatherWidgets = useCallback(async () => {
        const params = new URLSearchParams();
        params.set('scope', 'weather');
        if (search) params.set('search', search);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        try {
            const response = await fetch(`/api/widgets/search?${params.toString()}`);
            const data = await response.json();
            setWeatherWidgets(data.data || []);
        } catch (error) {
            console.error('Failed to fetch weather widgets:', error);
        }
    }, [search, statusFilter]);

    const fetchGlobalWidgets = useCallback(async () => {
        const params = new URLSearchParams();
        params.set('scope', 'global');
        params.set('per_page', '50');
        if (search) params.set('search', search);
        if (globalTypeFilter !== 'all') params.set('type', globalTypeFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        try {
            const response = await fetch(`/api/widgets/search?${params.toString()}`);
            const data = await response.json();
            setGlobalWidgets(data.data || []);
        } catch (error) {
            console.error('Failed to fetch global widgets:', error);
        }
    }, [search, globalTypeFilter, statusFilter]);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchWeatherWidgets(), fetchGlobalWidgets()]).finally(() => setLoading(false));
    }, [fetchWeatherWidgets, fetchGlobalWidgets]);

    const handleRegenerate = async (widgetId: string) => {
        setRegenerating(widgetId);
        try {
            await fetch(`/widgets/${widgetId}/regenerate`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });
            fetchWeatherWidgets();
        } catch (error) {
            console.error('Failed to regenerate widget:', error);
        } finally {
            setRegenerating(null);
        }
    };

    const handleDelete = (widget: Widget) => {
        if (confirm(`Tem certeza que deseja excluir "${widget.name}"?`)) {
            router.delete(`/widgets/${widget.id}`, {
                onSuccess: () => fetchWeatherWidgets(),
            });
        }
    };

    const openCreateModal = () => {
        setEditingWidget(null);
        setFormName('');
        setFormCity('');
        setFormState('');
        setFormTheme('dark');
        setFormOrientation('landscape');
        setFormDuration(5);
        setFormErrors({});
        setModalOpen(true);
    };

    const openEditModal = (widget: Widget) => {
        setEditingWidget(widget);
        setFormName(widget.name);
        setFormCity(widget.config?.city || '');
        setFormState(widget.config?.state || '');
        setFormTheme(widget.config?.theme || 'dark');
        setFormOrientation(widget.config?.orientation || 'landscape');
        setFormDuration(widget.config?.duration_seconds || 5);
        setFormErrors({});
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormErrors({});

        const data = {
            name: formName,
            config: {
                city: formCity,
                state: formState,
                theme: formTheme,
                orientation: formOrientation,
                duration_seconds: formDuration,
            },
        };

        const url = editingWidget ? `/widgets/${editingWidget.id}` : '/widgets';
        const method = editingWidget ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setModalOpen(false);
                fetchWeatherWidgets();
            } else {
                const result = await response.json();
                if (result.errors) {
                    setFormErrors(result.errors);
                }
            }
        } catch (error) {
            console.error('Failed to save widget:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Widgets" />

            <div className="relative flex flex-col gap-6 p-6">
                {/* Development Overlay */}
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 shadow-lg">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Construction className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">Página em Desenvolvimento</h2>
                            <p className="mt-2 max-w-sm text-muted-foreground">
                                Esta funcionalidade ainda está sendo desenvolvida e estará disponível em breve.
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">Voltar ao Dashboard</Link>
                        </Button>
                    </div>
                </div>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                            <Cloud className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Widgets</h1>
                            <p className="text-muted-foreground">
                                Widgets de clima e acesso a widgets globais de loteria e notícias
                            </p>
                        </div>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Widget de Clima
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="weather" className="gap-2">
                            <Cloud className="h-4 w-4" />
                            Meus Widgets de Clima
                            <Badge variant="secondary" className="ml-1">{stats.weather.total}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="global" className="gap-2">
                            <Ticket className="h-4 w-4" />
                            Widgets Disponíveis
                            <Badge variant="secondary" className="ml-1">{stats.global.lottery + stats.global.news}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* Weather Widgets Tab */}
                    <TabsContent value="weather" className="space-y-4">
                        {/* Weather Stats */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                                    <Cloud className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.weather.total}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Prontos</CardTitle>
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats.weather.ready}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Gerando</CardTitle>
                                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{stats.weather.generating}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{stats.weather.error}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Weather Filters */}
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar widgets de clima..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os status</SelectItem>
                                    <SelectItem value="ready">Pronto</SelectItem>
                                    <SelectItem value="generating">Gerando</SelectItem>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="error">Erro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Weather Widgets Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : weatherWidgets.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Cloud className="h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Nenhum widget de clima encontrado</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Crie seu primeiro widget de clima para exibir a previsão do tempo.
                                    </p>
                                    <Button onClick={openCreateModal} className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Criar Widget de Clima
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {weatherWidgets.map((widget) => (
                                    <Card key={widget.id} className="overflow-hidden">
                                        <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                                            {widget.thumbnail_url ? (
                                                <img
                                                    src={widget.thumbnail_url}
                                                    alt={widget.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <Cloud className="h-16 w-16 text-cyan-600" />
                                            )}
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg truncate">{widget.name}</CardTitle>
                                                {getStatusBadge(widget.status, widget.status_label)}
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                                <Cloud className="h-4 w-4 text-cyan-600" />
                                                {widget.config.city}, {widget.config.state}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {widget.duration_seconds}s
                                                </div>
                                                {widget.regeneration_description && (
                                                    <div className="flex items-center gap-2">
                                                        <RefreshCw className="h-3 w-3" />
                                                        {widget.regeneration_description}
                                                    </div>
                                                )}
                                                {widget.last_generated_at_human && (
                                                    <div className="text-xs">
                                                        Última geração: {widget.last_generated_at_human}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleRegenerate(widget.id)}
                                                    disabled={regenerating === widget.id || widget.status === 'generating'}
                                                >
                                                    {regenerating === widget.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4 w-4" />
                                                    )}
                                                    <span className="ml-2">Regenerar</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(widget)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(widget)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Global Widgets Tab */}
                    <TabsContent value="global" className="space-y-4">
                        {/* Global Stats */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Loteria</CardTitle>
                                    <Ticket className="h-4 w-4 text-amber-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.global.lottery}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Notícias</CardTitle>
                                    <Newspaper className="h-4 w-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.global.news}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Prontos para Uso</CardTitle>
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats.global.ready}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Widgets globais de loteria e notícias estão disponíveis para uso em suas playlists.
                            Estes widgets são atualizados automaticamente pelo sistema.
                        </p>

                        {/* Global Filters */}
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar widgets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={globalTypeFilter} onValueChange={setGlobalTypeFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os tipos</SelectItem>
                                    <SelectItem value="lottery">Loteria</SelectItem>
                                    <SelectItem value="news">Notícias</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Global Widgets Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : globalWidgets.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Ticket className="h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Nenhum widget global encontrado</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Widgets globais serão criados pelo administrador do sistema.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {globalWidgets.map((widget) => (
                                    <Card key={widget.id} className="overflow-hidden">
                                        <div className="aspect-video bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-900/30 dark:to-purple-900/30 flex items-center justify-center relative">
                                            {widget.thumbnail_url ? (
                                                <img
                                                    src={widget.thumbnail_url}
                                                    alt={widget.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                getWidgetIcon(widget.widget_type, 'h-12 w-12')
                                            )}
                                            {widget.status !== 'ready' && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    {widget.status === 'generating' ? (
                                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                    ) : (
                                                        <span className="text-white text-sm">Indisponível</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm truncate">{widget.name}</CardTitle>
                                                {getStatusBadge(widget.status, widget.status_label)}
                                            </div>
                                            <CardDescription className="flex items-center gap-2 text-xs">
                                                {getWidgetIcon(widget.widget_type, 'h-3 w-3')}
                                                {widget.widget_type_label}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {widget.duration_seconds}s
                                                </div>
                                                {widget.last_generated_at_human && (
                                                    <div>
                                                        Atualizado: {widget.last_generated_at_human}
                                                    </div>
                                                )}
                                            </div>
                                            {widget.status === 'ready' && widget.video_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-3"
                                                    asChild
                                                >
                                                    <Link href={`/widgets/${widget.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Visualizar
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingWidget ? 'Editar Widget de Clima' : 'Novo Widget de Clima'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingWidget
                                    ? 'Atualize as configurações do widget de clima'
                                    : 'Configure a previsão do tempo para uma cidade'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Widget</Label>
                                <Input
                                    id="name"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Ex: Clima São Paulo"
                                />
                                {formErrors.name && (
                                    <p className="text-sm text-destructive">{formErrors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        value={formCity}
                                        onChange={(e) => setFormCity(e.target.value)}
                                        placeholder="Ex: São Paulo"
                                    />
                                    {formErrors['config.city'] && (
                                        <p className="text-sm text-destructive">{formErrors['config.city']}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">Estado</Label>
                                    <Select value={formState} onValueChange={setFormState}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(BRAZILIAN_STATES).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors['config.state'] && (
                                        <p className="text-sm text-destructive">{formErrors['config.state']}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Tema</Label>
                                    <Select value={formTheme} onValueChange={setFormTheme}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(THEMES).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="orientation">Orientação</Label>
                                    <Select value={formOrientation} onValueChange={setFormOrientation}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(ORIENTATIONS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duração</Label>
                                    <Select
                                        value={formDuration.toString()}
                                        onValueChange={(v) => setFormDuration(parseInt(v))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DURATION_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>
                                    O widget é atualizado automaticamente 6x ao dia: 05h, 08h, 11h, 14h, 17h e 20h.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving || !formCity || !formState}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingWidget ? 'Salvar' : 'Criar Widget'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
