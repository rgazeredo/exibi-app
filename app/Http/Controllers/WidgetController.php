<?php

namespace App\Http\Controllers;

use App\Models\Widget;
use App\Services\WidgetsApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WidgetController extends Controller
{
    public function __construct(
        protected WidgetsApiService $widgetsService
    ) {}

    public function index(Request $request): Response
    {
        $tenantId = session('current_tenant_id');

        // Stats for weather widgets only (tenant-owned)
        $weatherWidgets = Widget::tenantOwned()->where('widget_type', Widget::TYPE_WEATHER);

        return Inertia::render('widgets/index', [
            'filters' => $request->only(['search', 'type', 'status']),
            'stats' => [
                'weather' => [
                    'total' => (clone $weatherWidgets)->count(),
                    'ready' => (clone $weatherWidgets)->where('status', Widget::STATUS_READY)->count(),
                    'generating' => (clone $weatherWidgets)->where('status', Widget::STATUS_GENERATING)->count(),
                    'error' => (clone $weatherWidgets)->where('status', Widget::STATUS_ERROR)->count(),
                ],
                'global' => [
                    'lottery' => Widget::global()->where('widget_type', Widget::TYPE_LOTTERY)->count(),
                    'news' => Widget::global()->where('widget_type', Widget::TYPE_NEWS)->count(),
                    'ready' => Widget::global()->where('status', Widget::STATUS_READY)->count(),
                ],
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('widgets/form', [
            'widget' => null,
            'widgetType' => $this->getWeatherType(),
            'durationOptions' => $this->getDurationOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'config' => ['required', 'array'],
            'config.city' => ['required', 'string', 'max:100'],
            'config.state' => ['required', 'string', 'size:2'],
            'config.theme' => ['nullable', 'string', 'in:dark,light'],
            'config.orientation' => ['nullable', 'string', 'in:landscape,portrait'],
            'config.duration_seconds' => ['required', 'integer', 'in:5,10,15'],
        ]);

        $tenantId = session('current_tenant_id');

        // Only weather widgets can be created by tenants
        $widget = Widget::create([
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'widget_type' => Widget::TYPE_WEATHER,
            'config' => $validated['config'],
            'regeneration_cron' => Widget::WEATHER_CRON, // Fixed cron
            'status' => Widget::STATUS_PENDING,
        ]);

        // Trigger initial generation
        $requestId = $this->widgetsService->requestGeneration($widget);

        if ($requestId) {
            $widget->update([
                'status' => Widget::STATUS_GENERATING,
                'generation_request_id' => $requestId,
            ]);
        }

        if (($request->ajax() || $request->wantsJson()) && ! $request->header('X-Inertia')) {
            return response()->json([
                'id' => $widget->id,
                'name' => $widget->name,
                'widget_type' => $widget->widget_type,
                'status' => $widget->status,
            ], 201);
        }

        return redirect()->route('widgets.index')
            ->with('success', 'Widget criado com sucesso. Gerando vídeo...');
    }

    public function show(string $id): Response
    {
        $widget = Widget::with('currentMedia')->findOrFail($id);

        return Inertia::render('widgets/show', [
            'widget' => [
                'id' => $widget->id,
                'name' => $widget->name,
                'widget_type' => $widget->widget_type,
                'widget_type_label' => $widget->getTypeLabel(),
                'config' => $widget->config,
                'regeneration_cron' => $widget->regeneration_cron,
                'regeneration_description' => $widget->getCronDescription(),
                'status' => $widget->status,
                'status_label' => $widget->getStatusLabel(),
                'last_generated_at' => $widget->last_generated_at?->toIso8601String(),
                'last_generated_at_human' => $widget->last_generated_at?->diffForHumans(),
                'next_regeneration_at' => $widget->next_regeneration_at?->toIso8601String(),
                'next_regeneration_at_human' => $widget->next_regeneration_at?->diffForHumans(),
                'last_error' => $widget->last_error,
                'is_global' => $widget->isGlobal(),
                'current_media' => $widget->currentMedia ? [
                    'id' => $widget->currentMedia->id,
                    'title' => $widget->currentMedia->title,
                    'url' => $widget->currentMedia->getOptimizedUrl(),
                    'thumbnail_url' => $widget->currentMedia->getThumbnailUrl(),
                    'duration_seconds' => $widget->currentMedia->duration_seconds,
                ] : null,
                'created_at' => $widget->created_at?->toIso8601String(),
                'updated_at' => $widget->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function edit(string $id): Response
    {
        $widget = Widget::tenantOwned()->findOrFail($id);

        // Only tenant-owned weather widgets can be edited
        if ($widget->isGlobal()) {
            abort(403, 'Widgets globais não podem ser editados.');
        }

        return Inertia::render('widgets/form', [
            'widget' => [
                'id' => $widget->id,
                'name' => $widget->name,
                'widget_type' => $widget->widget_type,
                'config' => $widget->config,
            ],
            'widgetType' => $this->getWeatherType(),
            'durationOptions' => $this->getDurationOptions(),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $widget = Widget::tenantOwned()->findOrFail($id);

        // Only tenant-owned widgets can be updated
        if ($widget->isGlobal()) {
            abort(403, 'Widgets globais não podem ser editados.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'config' => ['required', 'array'],
            'config.city' => ['required', 'string', 'max:100'],
            'config.state' => ['required', 'string', 'size:2'],
            'config.theme' => ['nullable', 'string', 'in:dark,light'],
            'config.orientation' => ['nullable', 'string', 'in:landscape,portrait'],
            'config.duration_seconds' => ['required', 'integer', 'in:5,10,15'],
        ]);

        $widget->update([
            'name' => $validated['name'],
            'config' => $validated['config'],
        ]);

        if (($request->ajax() || $request->wantsJson()) && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'widget' => [
                    'id' => $widget->id,
                    'name' => $widget->name,
                ],
            ]);
        }

        return redirect()->route('widgets.show', $widget)
            ->with('success', 'Widget atualizado com sucesso.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $widget = Widget::tenantOwned()->findOrFail($id);

        // Only tenant-owned widgets can be deleted
        if ($widget->isGlobal()) {
            abort(403, 'Widgets globais não podem ser excluídos.');
        }

        // Delete associated media if exists
        if ($widget->currentMedia) {
            $widget->currentMedia->delete();
        }

        $widget->delete();

        return redirect()->route('widgets.index')
            ->with('success', 'Widget excluído com sucesso.');
    }

    /**
     * Manually trigger widget regeneration.
     * Only tenant-owned weather widgets can be regenerated by tenants.
     */
    public function regenerate(string $id): RedirectResponse|JsonResponse
    {
        $widget = Widget::tenantOwned()->findOrFail($id);

        // Only tenant-owned widgets can be regenerated
        if ($widget->isGlobal()) {
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Widgets globais só podem ser regenerados por administradores.',
                ], 403);
            }

            return redirect()->back()
                ->with('error', 'Widgets globais só podem ser regenerados por administradores.');
        }

        // Don't regenerate if already generating
        if ($widget->status === Widget::STATUS_GENERATING) {
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Widget já está sendo gerado.',
                ], 400);
            }

            return redirect()->back()
                ->with('error', 'Widget já está sendo gerado.');
        }

        $widget->update([
            'status' => Widget::STATUS_GENERATING,
            'last_error' => null,
        ]);

        $requestId = $this->widgetsService->requestGeneration($widget);

        if ($requestId) {
            $widget->update(['generation_request_id' => $requestId]);

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Regeneração iniciada.',
                    'request_id' => $requestId,
                ]);
            }

            return redirect()->back()
                ->with('success', 'Regeneração do widget iniciada.');
        }

        $widget->update([
            'status' => Widget::STATUS_ERROR,
            'last_error' => 'Falha ao solicitar regeneração.',
        ]);

        if (request()->ajax() || request()->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Falha ao iniciar regeneração.',
            ], 500);
        }

        return redirect()->back()
            ->with('error', 'Falha ao iniciar regeneração do widget.');
    }

    /**
     * Search widgets with pagination for AJAX requests.
     * Returns both tenant-owned weather widgets and global widgets.
     */
    public function search(Request $request): JsonResponse
    {
        $sortField = $request->input('sort', 'widget_type');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSortFields = ['name', 'widget_type', 'status', 'last_generated_at', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'widget_type';
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        // The global scope already includes both tenant-owned and global widgets
        $widgets = Widget::query()
            ->with('currentMedia')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'ilike', "%{$search}%"))
            ->when($request->type && $request->type !== 'all', fn ($q) => $q->where('widget_type', $request->type))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->scope === 'weather', fn ($q) => $q->tenantOwned()->where('widget_type', Widget::TYPE_WEATHER))
            ->when($request->scope === 'global', fn ($q) => $q->global())
            ->orderBy($sortField, $sortDirection)
            ->orderBy('name', 'asc')
            ->paginate($perPage);

        $transformedWidgets = $widgets->getCollection()->map(fn ($widget) => [
            'id' => $widget->id,
            'name' => $widget->name,
            'widget_type' => $widget->widget_type,
            'widget_type_label' => $widget->getTypeLabel(),
            'status' => $widget->status,
            'status_label' => $widget->getStatusLabel(),
            'config' => $widget->config,
            'regeneration_cron' => $widget->regeneration_cron,
            'regeneration_description' => $widget->getCronDescription(),
            'last_generated_at' => $widget->last_generated_at?->toIso8601String(),
            'last_generated_at_human' => $widget->last_generated_at?->diffForHumans(),
            'next_regeneration_at' => $widget->next_regeneration_at?->toIso8601String(),
            'thumbnail_url' => $widget->currentMedia?->getThumbnailUrl(),
            'video_url' => $widget->currentMedia?->url,
            'duration_seconds' => $widget->getEffectiveDuration(),
            'is_global' => $widget->isGlobal(),
            'created_at' => $widget->created_at?->toIso8601String(),
        ]);

        return response()->json([
            'data' => $transformedWidgets,
            'meta' => [
                'current_page' => $widgets->currentPage(),
                'last_page' => $widgets->lastPage(),
                'per_page' => $widgets->perPage(),
                'total' => $widgets->total(),
                'from' => $widgets->firstItem(),
                'to' => $widgets->lastItem(),
            ],
        ]);
    }

    /**
     * Get weather widget type configuration for forms.
     */
    protected function getWeatherType(): array
    {
        return [
            'value' => Widget::TYPE_WEATHER,
            'label' => 'Clima',
            'description' => 'Previsão do tempo para uma cidade',
            'states' => [
                'AC' => 'Acre',
                'AL' => 'Alagoas',
                'AP' => 'Amapá',
                'AM' => 'Amazonas',
                'BA' => 'Bahia',
                'CE' => 'Ceará',
                'DF' => 'Distrito Federal',
                'ES' => 'Espírito Santo',
                'GO' => 'Goiás',
                'MA' => 'Maranhão',
                'MT' => 'Mato Grosso',
                'MS' => 'Mato Grosso do Sul',
                'MG' => 'Minas Gerais',
                'PA' => 'Pará',
                'PB' => 'Paraíba',
                'PR' => 'Paraná',
                'PE' => 'Pernambuco',
                'PI' => 'Piauí',
                'RJ' => 'Rio de Janeiro',
                'RN' => 'Rio Grande do Norte',
                'RS' => 'Rio Grande do Sul',
                'RO' => 'Rondônia',
                'RR' => 'Roraima',
                'SC' => 'Santa Catarina',
                'SP' => 'São Paulo',
                'SE' => 'Sergipe',
                'TO' => 'Tocantins',
            ],
            'themes' => [
                'dark' => 'Escuro',
                'light' => 'Claro',
            ],
            'orientations' => [
                'landscape' => 'Paisagem',
                'portrait' => 'Retrato',
            ],
        ];
    }

    /**
     * Get available duration options for weather widgets.
     */
    protected function getDurationOptions(): array
    {
        return [
            ['value' => 5, 'label' => '5 segundos'],
            ['value' => 10, 'label' => '10 segundos'],
            ['value' => 15, 'label' => '15 segundos'],
        ];
    }
}
