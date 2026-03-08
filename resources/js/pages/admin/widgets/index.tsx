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
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Clock, Loader2, Newspaper, Pause, Pencil, Plus, RefreshCw, Search, Ticket, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Widget {
    id: string;
    name: string;
    widget_type: 'lottery' | 'news';
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
    is_active: boolean;
    last_error: string | null;
    created_at: string;
}

interface WidgetType {
    value: string;
    label: string;
}

interface Stats {
    total: number;
    ready: number;
    generating: number;
    pending: number;
    error: number;
    active: number;
    inactive: number;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface AdminWidgetsIndexProps {
    filters: {
        search?: string;
        type?: string;
        status?: string;
    };
    stats: Stats;
    widgetTypes: WidgetType[];
}

const LOTTERIES = [
    { value: 'megasena', label: 'Mega-Sena' },
    { value: 'lotofacil', label: 'Lotofácil' },
    { value: 'quina', label: 'Quina' },
    { value: 'lotomania', label: 'Lotomania' },
    { value: 'timemania', label: 'Timemania' },
    { value: 'duplasena', label: 'Dupla Sena' },
    { value: 'diadesorte', label: 'Dia de Sorte' },
    { value: 'supersete', label: 'Super Sete' },
    { value: 'maismilionaria', label: '+Milionária' },
];

const NEWS_CATEGORIES = [
    { value: 'economia', label: 'Economia' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'esportes', label: 'Esportes' },
    { value: 'politica', label: 'Política' },
    { value: 'entretenimento', label: 'Entretenimento' },
    { value: 'saude', label: 'Saúde' },
    { value: 'ciencia', label: 'Ciência' },
];

function getWidgetIcon(widgetType: string, className = 'h-5 w-5') {
    switch (widgetType) {
        case 'lottery':
            return <Ticket className={`${className} text-amber-600`} />;
        case 'news':
            return <Newspaper className={`${className} text-purple-600`} />;
        default:
            return <Ticket className={`${className} text-gray-600`} />;
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

export default function AdminWidgetsIndex({ filters, stats, widgetTypes }: AdminWidgetsIndexProps) {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [regenerating, setRegenerating] = useState<string | null>(null);
    const [regeneratingAll, setRegeneratingAll] = useState<string | null>(null);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [editDuration, setEditDuration] = useState<number>(30);
    const [editIsActive, setEditIsActive] = useState<boolean>(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Create modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createWidgetType, setCreateWidgetType] = useState<'lottery' | 'news'>('lottery');
    const [createName, setCreateName] = useState('');
    const [createOrientation, setCreateOrientation] = useState<'landscape' | 'portrait'>('landscape');
    const [createLottery, setCreateLottery] = useState('megasena');
    const [createCategory, setCreateCategory] = useState('economia');
    const [createDuration, setCreateDuration] = useState(30);
    const [createIsActive, setCreateIsActive] = useState(true);
    const [creating, setCreating] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Widgets Globais', href: '/admin/widgets' },
    ];

    const fetchWidgets = useCallback(async (page = currentPage) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (activeFilter !== 'all') params.set('is_active', activeFilter);
        params.set('page', page.toString());
        params.set('per_page', '10');

        try {
            const response = await fetch(`/admin/api/widgets/search?${params.toString()}`);
            const data = await response.json();
            setWidgets(data.data || []);
            setPagination(data.meta || null);
        } catch (error) {
            console.error('Failed to fetch widgets:', error);
        } finally {
            setLoading(false);
        }
    }, [search, typeFilter, statusFilter, activeFilter, currentPage]);

    useEffect(() => {
        fetchWidgets(currentPage);
    }, [fetchWidgets, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, statusFilter, activeFilter]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRegenerate = async (widgetId: string) => {
        setRegenerating(widgetId);
        try {
            const response = await fetch(`/admin/widgets/${widgetId}/regenerate`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                fetchWidgets();
            } else {
                alert(data.message || 'Erro ao regenerar widget');
            }
        } catch (error) {
            console.error('Failed to regenerate widget:', error);
        } finally {
            setRegenerating(null);
        }
    };

    const handleRegenerateAll = async (type: string) => {
        if (!confirm(`Regenerar todos os widgets de ${type === 'lottery' ? 'loteria' : 'notícias'}?`)) {
            return;
        }

        setRegeneratingAll(type);
        try {
            const response = await fetch('/admin/widgets/regenerate-all', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type }),
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                fetchWidgets();
            } else {
                alert(data.message || 'Erro ao regenerar widgets');
            }
        } catch (error) {
            console.error('Failed to regenerate all widgets:', error);
        } finally {
            setRegeneratingAll(null);
        }
    };

    const handleOpenEdit = (widget: Widget) => {
        setEditingWidget(widget);
        setEditDuration(widget.duration_seconds);
        setEditIsActive(widget.is_active);
    };

    const handleSaveEdit = async () => {
        if (!editingWidget) return;

        setSaving(true);
        try {
            const response = await fetch(`/admin/widgets/${editingWidget.id}`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    duration_seconds: editDuration,
                    is_active: editIsActive,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setEditingWidget(null);
                fetchWidgets();
            } else {
                alert(data.message || 'Erro ao salvar widget');
            }
        } catch (error) {
            console.error('Failed to save widget:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (widget: Widget) => {
        try {
            const response = await fetch(`/admin/widgets/${widget.id}`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_active: !widget.is_active,
                }),
            });
            const data = await response.json();
            if (data.success) {
                fetchWidgets();
            }
        } catch (error) {
            console.error('Failed to toggle widget:', error);
        }
    };

    const handleOpenCreate = () => {
        setCreateWidgetType('lottery');
        setCreateName('');
        setCreateOrientation('landscape');
        setCreateLottery('megasena');
        setCreateCategory('economia');
        setCreateDuration(30);
        setCreateIsActive(true);
        setShowCreateModal(true);
    };

    const handleCreate = async () => {
        const orientationLabel = createOrientation === 'landscape' ? 'Paisagem' : 'Retrato';
        let defaultName = '';
        if (createWidgetType === 'lottery') {
            const lottery = LOTTERIES.find(l => l.value === createLottery);
            defaultName = `${lottery?.label || createLottery} - ${orientationLabel}`;
        } else {
            const category = NEWS_CATEGORIES.find(c => c.value === createCategory);
            defaultName = `Notícias ${category?.label || createCategory} - ${orientationLabel}`;
        }
        const name = createName.trim() || defaultName;

        setCreating(true);
        try {
            const response = await fetch('/admin/widgets', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    widget_type: createWidgetType,
                    name: name,
                    orientation: createOrientation,
                    lottery: createWidgetType === 'lottery' ? createLottery : null,
                    category: createWidgetType === 'news' ? createCategory : null,
                    duration_seconds: createDuration,
                    is_active: createIsActive,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setShowCreateModal(false);
                fetchWidgets();
            } else {
                alert(data.message || 'Erro ao criar widget');
            }
        } catch (error) {
            console.error('Failed to create widget:', error);
            alert('Erro ao criar widget');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (widget: Widget) => {
        if (!confirm(`Tem certeza que deseja excluir o widget "${widget.name}"?`)) {
            return;
        }

        setDeleting(widget.id);
        try {
            const response = await fetch(`/admin/widgets/${widget.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                fetchWidgets();
            } else {
                alert(data.message || 'Erro ao excluir widget');
            }
        } catch (error) {
            console.error('Failed to delete widget:', error);
            alert('Erro ao excluir widget');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Widgets Globais - Admin" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Widgets Globais</h1>
                        <p className="text-muted-foreground">
                            Gerencie widgets de loteria e notícias compartilhados com todos os tenants
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Widget
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleRegenerateAll('lottery')}
                            disabled={regeneratingAll === 'lottery'}
                        >
                            {regeneratingAll === 'lottery' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Ticket className="h-4 w-4 mr-2" />
                            )}
                            Regenerar Loterias
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleRegenerateAll('news')}
                            disabled={regeneratingAll === 'news'}
                        >
                            {regeneratingAll === 'news' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Newspaper className="h-4 w-4 mr-2" />
                            )}
                            Regenerar Notícias
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setActiveFilter('true')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                            <Check className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setActiveFilter('false')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
                            <Pause className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Prontos</CardTitle>
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gerando</CardTitle>
                            <Loader2 className={`h-4 w-4 text-blue-500 ${stats.generating > 0 ? 'animate-spin' : ''}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.generating}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
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
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            {widgetTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <Select value={activeFilter} onValueChange={setActiveFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Ativo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="true">Ativos</SelectItem>
                            <SelectItem value="false">Inativos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Widgets Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : widgets.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Ticket className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Nenhum widget encontrado</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Execute o seeder para criar os widgets globais.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {widgets.map((widget) => (
                            <Card key={widget.id} className={`overflow-hidden ${!widget.is_active ? 'opacity-60' : ''}`}>
                                <div className={`aspect-video flex items-center justify-center relative ${
                                    widget.widget_type === 'lottery'
                                        ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
                                        : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'
                                }`}>
                                    {widget.thumbnail_url ? (
                                        <img
                                            src={widget.thumbnail_url}
                                            alt={widget.name}
                                            className={`object-cover w-full h-full ${!widget.is_active ? 'grayscale' : ''}`}
                                        />
                                    ) : (
                                        getWidgetIcon(widget.widget_type, 'h-12 w-12')
                                    )}
                                    {!widget.is_active && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className="bg-gray-800 text-white">
                                                Inativo
                                            </Badge>
                                        </div>
                                    )}
                                    {widget.status === 'generating' && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        </div>
                                    )}
                                    {widget.status === 'error' && (
                                        <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">Erro</span>
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
                                        {widget.config.orientation && (
                                            <span className="text-muted-foreground">
                                                ({widget.config.orientation === 'landscape' ? 'Paisagem' : 'Retrato'})
                                            </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {widget.duration_seconds}s
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="h-3 w-3" />
                                            {widget.regeneration_description}
                                        </div>
                                        {widget.last_generated_at_human && (
                                            <div>
                                                Última geração: {widget.last_generated_at_human}
                                            </div>
                                        )}
                                        {widget.last_error && (
                                            <div className="text-red-500 truncate" title={widget.last_error}>
                                                Erro: {widget.last_error}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleOpenEdit(widget)}
                                        >
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleRegenerate(widget.id)}
                                            disabled={regenerating === widget.id || widget.status === 'generating'}
                                        >
                                            {regenerating === widget.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                            )}
                                            Regenerar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(widget)}
                                            disabled={deleting === widget.id || widget.status === 'generating'}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            {deleting === widget.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {pagination.from} a {pagination.to} de {pagination.total} widgets
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? 'default' : 'outline'}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.last_page}
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={!!editingWidget} onOpenChange={() => setEditingWidget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Widget</DialogTitle>
                            <DialogDescription>
                                {editingWidget?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Ativo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Widgets inativos nao sao regenerados automaticamente
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={editIsActive}
                                    onCheckedChange={setEditIsActive}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duracao do video (segundos)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min={5}
                                    max={300}
                                    value={editDuration}
                                    onChange={(e) => setEditDuration(parseInt(e.target.value) || 30)}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Tempo de exibicao do widget na playlist (5-300 segundos)
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingWidget(null)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveEdit} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Dialog */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Novo Widget Global</DialogTitle>
                            <DialogDescription>
                                Crie um novo widget de loteria ou notícias
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="create_type">Tipo de Widget</Label>
                                <Select value={createWidgetType} onValueChange={(v) => setCreateWidgetType(v as 'lottery' | 'news')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lottery">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-4 w-4 text-amber-600" />
                                                Loteria
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="news">
                                            <div className="flex items-center gap-2">
                                                <Newspaper className="h-4 w-4 text-purple-600" />
                                                Notícias
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {createWidgetType === 'lottery' && (
                                <div className="space-y-2">
                                    <Label htmlFor="create_lottery">Loteria</Label>
                                    <Select value={createLottery} onValueChange={setCreateLottery}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LOTTERIES.map((lottery) => (
                                                <SelectItem key={lottery.value} value={lottery.value}>
                                                    {lottery.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {createWidgetType === 'news' && (
                                <div className="space-y-2">
                                    <Label htmlFor="create_category">Categoria</Label>
                                    <Select value={createCategory} onValueChange={setCreateCategory}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {NEWS_CATEGORIES.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="create_orientation">Orientação</Label>
                                <Select value={createOrientation} onValueChange={(v) => setCreateOrientation(v as 'landscape' | 'portrait')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="landscape">Paisagem (16:9)</SelectItem>
                                        <SelectItem value="portrait">Retrato (9:16)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create_name">Nome do Widget</Label>
                                <Input
                                    id="create_name"
                                    value={createName}
                                    onChange={(e) => setCreateName(e.target.value)}
                                    placeholder={
                                        createWidgetType === 'lottery'
                                            ? `${LOTTERIES.find(l => l.value === createLottery)?.label} - ${createOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}`
                                            : `Notícias ${NEWS_CATEGORIES.find(c => c.value === createCategory)?.label} - ${createOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}`
                                    }
                                />
                                <p className="text-sm text-muted-foreground">
                                    Deixe em branco para usar o nome padrão
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create_duration">Duração (segundos)</Label>
                                <Input
                                    id="create_duration"
                                    type="number"
                                    min={5}
                                    max={300}
                                    value={createDuration}
                                    onChange={(e) => setCreateDuration(parseInt(e.target.value) || 30)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="create_is_active">Ativo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Widget será gerado automaticamente
                                    </p>
                                </div>
                                <Switch
                                    id="create_is_active"
                                    checked={createIsActive}
                                    onCheckedChange={setCreateIsActive}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreate} disabled={creating}>
                                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Criar Widget
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
