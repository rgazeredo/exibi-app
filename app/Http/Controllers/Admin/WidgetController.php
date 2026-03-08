<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Widget;
use App\Services\WidgetsApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WidgetController extends Controller
{
    public function __construct(
        protected WidgetsApiService $widgetsService
    ) {}

    /**
     * Display list of all global widgets
     */
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/widgets/index', [
            'filters' => $request->only(['search', 'type', 'status']),
            'stats' => [
                'total' => Widget::global()->withoutGlobalScopes()->count(),
                'ready' => Widget::global()->withoutGlobalScopes()->where('status', Widget::STATUS_READY)->count(),
                'generating' => Widget::global()->withoutGlobalScopes()->where('status', Widget::STATUS_GENERATING)->count(),
                'pending' => Widget::global()->withoutGlobalScopes()->where('status', Widget::STATUS_PENDING)->count(),
                'error' => Widget::global()->withoutGlobalScopes()->where('status', Widget::STATUS_ERROR)->count(),
                'active' => Widget::global()->withoutGlobalScopes()->where('is_active', true)->count(),
                'inactive' => Widget::global()->withoutGlobalScopes()->where('is_active', false)->count(),
            ],
            'widgetTypes' => [
                ['value' => Widget::TYPE_LOTTERY, 'label' => 'Loteria'],
                ['value' => Widget::TYPE_NEWS, 'label' => 'Notícias'],
            ],
        ]);
    }

    /**
     * Search global widgets with pagination for AJAX requests.
     */
    public function search(Request $request): JsonResponse
    {
        $this->authorizeSuperAdmin();

        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSortFields = ['name', 'widget_type', 'status', 'last_generated_at', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        $widgets = Widget::withoutGlobalScopes()
            ->global()
            ->with('currentMedia')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'ilike', "%{$search}%"))
            ->when($request->type && $request->type !== 'all', fn ($q) => $q->where('widget_type', $request->type))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->is_active !== null && $request->is_active !== 'all', function ($q) use ($request) {
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);

                return $q->where('is_active', $isActive);
            })
            ->orderBy($sortField, $sortDirection)
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
            'is_active' => $widget->is_active,
            'last_error' => $widget->last_error,
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
     * Manually regenerate a specific global widget.
     */
    public function regenerate(string $id): JsonResponse
    {
        $this->authorizeSuperAdmin();

        $widget = Widget::withoutGlobalScopes()->global()->findOrFail($id);

        // Don't regenerate if already generating
        if ($widget->status === Widget::STATUS_GENERATING) {
            return response()->json([
                'success' => false,
                'message' => 'Widget já está sendo gerado.',
            ], 400);
        }

        $widget->update([
            'status' => Widget::STATUS_GENERATING,
            'last_error' => null,
        ]);

        $requestId = $this->widgetsService->requestGeneration($widget);

        if ($requestId) {
            $widget->update(['generation_request_id' => $requestId]);

            return response()->json([
                'success' => true,
                'message' => 'Regeneração iniciada.',
                'request_id' => $requestId,
            ]);
        }

        $widget->update([
            'status' => Widget::STATUS_ERROR,
            'last_error' => 'Falha ao solicitar regeneração.',
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Falha ao iniciar regeneração.',
        ], 500);
    }

    /**
     * Store a new global widget.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'widget_type' => 'required|in:'.Widget::TYPE_LOTTERY.','.Widget::TYPE_NEWS,
            'name' => 'required|string|max:255',
            'orientation' => 'required|in:landscape,portrait',
            'lottery' => 'required_if:widget_type,lottery|nullable|string|max:50',
            'category' => 'required_if:widget_type,news|nullable|string|max:50',
            'duration_seconds' => 'nullable|integer|min:5|max:300',
            'is_active' => 'boolean',
        ]);

        $config = [
            'orientation' => $validated['orientation'],
        ];

        if ($validated['widget_type'] === Widget::TYPE_LOTTERY && ! empty($validated['lottery'])) {
            $config['lottery'] = $validated['lottery'];
        }

        if ($validated['widget_type'] === Widget::TYPE_NEWS && ! empty($validated['category'])) {
            $config['category'] = $validated['category'];
        }

        if (! empty($validated['duration_seconds'])) {
            $config['duration_seconds'] = $validated['duration_seconds'];
        }

        $widget = Widget::withoutGlobalScopes()->create([
            'tenant_id' => null, // Global widget
            'widget_type' => $validated['widget_type'],
            'name' => $validated['name'],
            'config' => $config,
            'regeneration_cron' => Widget::getDefaultCron($validated['widget_type']),
            'status' => Widget::STATUS_PENDING,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Widget criado com sucesso.',
            'widget' => [
                'id' => $widget->id,
                'name' => $widget->name,
                'widget_type' => $widget->widget_type,
            ],
        ], 201);
    }

    /**
     * Update a global widget settings (duration, is_active).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $this->authorizeSuperAdmin();

        $widget = Widget::withoutGlobalScopes()->global()->findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'duration_seconds' => 'sometimes|integer|min:5|max:300',
        ]);

        // Update is_active if provided
        if (isset($validated['is_active'])) {
            $widget->is_active = $validated['is_active'];
        }

        // Update duration in config if provided
        if (isset($validated['duration_seconds'])) {
            $config = $widget->config ?? [];
            $config['duration_seconds'] = $validated['duration_seconds'];
            $widget->config = $config;
        }

        $widget->save();

        return response()->json([
            'success' => true,
            'message' => 'Widget atualizado com sucesso.',
            'widget' => [
                'id' => $widget->id,
                'is_active' => $widget->is_active,
                'duration_seconds' => $widget->getEffectiveDuration(),
            ],
        ]);
    }

    /**
     * Delete a global widget.
     */
    public function destroy(string $id): JsonResponse
    {
        $this->authorizeSuperAdmin();

        $widget = Widget::withoutGlobalScopes()->global()->findOrFail($id);

        // Don't delete if currently generating
        if ($widget->status === Widget::STATUS_GENERATING) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir um widget que está sendo gerado.',
            ], 400);
        }

        $widgetName = $widget->name;
        $widget->delete();

        return response()->json([
            'success' => true,
            'message' => "Widget '{$widgetName}' excluído com sucesso.",
        ]);
    }

    /**
     * Regenerate all global widgets of a specific type.
     */
    public function regenerateAll(Request $request): JsonResponse
    {
        $this->authorizeSuperAdmin();

        $type = $request->input('type');
        if (! in_array($type, [Widget::TYPE_LOTTERY, Widget::TYPE_NEWS])) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de widget inválido.',
            ], 400);
        }

        $widgets = Widget::withoutGlobalScopes()
            ->global()
            ->where('widget_type', $type)
            ->where('status', '!=', Widget::STATUS_GENERATING)
            ->get();

        $successCount = 0;
        $errorCount = 0;

        foreach ($widgets as $widget) {
            $widget->update([
                'status' => Widget::STATUS_GENERATING,
                'last_error' => null,
            ]);

            $requestId = $this->widgetsService->requestGeneration($widget);

            if ($requestId) {
                $widget->update(['generation_request_id' => $requestId]);
                $successCount++;
            } else {
                $widget->update([
                    'status' => Widget::STATUS_ERROR,
                    'last_error' => 'Falha ao solicitar regeneração.',
                ]);
                $errorCount++;
            }
        }

        $typeLabel = $type === Widget::TYPE_LOTTERY ? 'loteria' : 'notícias';

        return response()->json([
            'success' => true,
            'message' => "Regeneração de {$successCount} widgets de {$typeLabel} iniciada.".
                ($errorCount > 0 ? " {$errorCount} falharam." : ''),
            'success_count' => $successCount,
            'error_count' => $errorCount,
        ]);
    }

    /**
     * Check if current user is super admin.
     */
    protected function authorizeSuperAdmin(): void
    {
        if (! auth()->user()?->is_super_admin) {
            abort(403, 'Esta ação é restrita a super administradores.');
        }
    }
}
