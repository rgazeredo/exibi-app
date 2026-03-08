<?php

namespace App\Http\Controllers;

use App\Models\PlaybackLog;
use App\Models\SystemEvent;
use App\Support\TimezoneHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard page.
     */
    public function index(): Response
    {
        $tenant = auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        return Inertia::render('reports/index', [
            'filters' => request()->only(['date_range', 'player_id', 'media_id']),
            'timezone' => $timezone,
        ]);
    }

    /**
     * Display the detailed logs page.
     */
    public function logsIndex(): Response
    {
        // Get tenant timezone
        $tenant = auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        // Fetch players for filter dropdown
        $players = \App\Models\Player::select('id', 'name')
            ->orderBy('name')
            ->get();

        // Fetch media for filter dropdown
        $media = \App\Models\Media::select('id', 'title', 'type')
            ->orderBy('title')
            ->get();

        // Fetch tags for filter dropdown
        $tags = \App\Models\Tag::select('id', 'name', 'color')
            ->orderBy('name')
            ->get();

        return Inertia::render('reports/logs', [
            'filters' => request()->only(['date_range', 'player_id', 'media_id', 'tag_id', 'completed', 'date_from', 'date_to']),
            'players' => $players,
            'media' => $media,
            'tags' => $tags,
            'timezone' => $timezone,
        ]);
    }

    /**
     * Get aggregated report data for charts and stats.
     */
    public function data(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_range' => ['nullable', 'in:today,7d,30d,90d'],
            'player_id' => ['nullable', 'uuid'],
            'media_id' => ['nullable', 'uuid'],
        ]);

        $dateRange = $validated['date_range'] ?? '7d';
        $startDate = match ($dateRange) {
            'today' => now()->startOfDay(),
            '7d' => now()->subDays(7)->startOfDay(),
            '30d' => now()->subDays(30)->startOfDay(),
            '90d' => now()->subDays(90)->startOfDay(),
            default => now()->subDays(7)->startOfDay(),
        };

        $query = PlaybackLog::query()
            ->where('started_at', '>=', $startDate);

        if (! empty($validated['player_id'])) {
            $query->where('player_id', $validated['player_id']);
        }

        if (! empty($validated['media_id'])) {
            $query->where('media_id', $validated['media_id']);
        }

        // Stats gerais
        $totalPlaybacks = (clone $query)->count();
        $totalDuration = (clone $query)->sum('duration_played_seconds') ?? 0;
        $completedCount = (clone $query)->where('completed', true)->count();
        $uniqueMedia = (clone $query)->distinct()->count('media_id');
        $uniquePlayers = (clone $query)->distinct()->count('player_id');

        $stats = [
            'total_playbacks' => $totalPlaybacks,
            'total_duration_seconds' => (int) $totalDuration,
            'completed_count' => $completedCount,
            'unique_media' => $uniqueMedia,
            'unique_players' => $uniquePlayers,
            'completion_rate' => $totalPlaybacks > 0
                ? round(($completedCount / $totalPlaybacks) * 100, 1)
                : 0,
        ];

        // Get tenant timezone for date grouping
        $tenant = auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        // Dados para gráfico de linha (playbacks por dia, grouped in tenant timezone)
        // We use AT TIME ZONE to convert UTC times to tenant timezone for grouping
        $dailyPlaybacks = (clone $query)
            ->select(
                DB::raw("DATE(started_at AT TIME ZONE 'UTC' AT TIME ZONE '{$timezone}') as date"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw("DATE(started_at AT TIME ZONE 'UTC' AT TIME ZONE '{$timezone}')"))
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'count' => (int) $row->count,
            ]);

        // Top mídias
        $topMedia = (clone $query)
            ->select(
                'media_id',
                DB::raw('COUNT(*) as playback_count'),
                DB::raw('COALESCE(SUM(duration_played_seconds), 0) as total_duration')
            )
            ->groupBy('media_id')
            ->orderByDesc('playback_count')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $media = \App\Models\Media::find($row->media_id);

                return [
                    'media_id' => $row->media_id,
                    'title' => $media?->title ?? 'Deleted',
                    'type' => $media?->type ?? 'unknown',
                    'playback_count' => (int) $row->playback_count,
                    'total_duration' => (int) $row->total_duration,
                ];
            });

        // Top players
        $topPlayers = (clone $query)
            ->select('player_id', DB::raw('COUNT(*) as playback_count'))
            ->groupBy('player_id')
            ->orderByDesc('playback_count')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $player = \App\Models\Player::find($row->player_id);

                return [
                    'player_id' => $row->player_id,
                    'name' => $player?->name ?? 'Deleted',
                    'playback_count' => (int) $row->playback_count,
                ];
            });

        return response()->json([
            'stats' => $stats,
            'daily_playbacks' => $dailyPlaybacks,
            'top_media' => $topMedia,
            'top_players' => $topPlayers,
            'timezone' => $timezone,
        ]);
    }

    /**
     * Get detailed playback logs with pagination.
     */
    public function logs(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_range' => ['nullable', 'in:today,7d,30d,90d,custom'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'player_id' => ['nullable', 'uuid'],
            'media_id' => ['nullable', 'uuid'],
            'tag_id' => ['nullable', 'uuid'],
            'completed' => ['nullable', 'in:all,yes,no'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort' => ['nullable', 'in:started_at,duration_played_seconds,player_name,media_title'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);

        $dateRange = $validated['date_range'] ?? '7d';

        // Handle custom date range
        if ($dateRange === 'custom' && ! empty($validated['date_from'])) {
            $startDate = \Carbon\Carbon::parse($validated['date_from'])->startOfDay();
            $endDate = ! empty($validated['date_to'])
                ? \Carbon\Carbon::parse($validated['date_to'])->endOfDay()
                : now()->endOfDay();
        } else {
            $startDate = match ($dateRange) {
                'today' => now()->startOfDay(),
                '7d' => now()->subDays(7)->startOfDay(),
                '30d' => now()->subDays(30)->startOfDay(),
                '90d' => now()->subDays(90)->startOfDay(),
                default => now()->subDays(7)->startOfDay(),
            };
            $endDate = now()->endOfDay();
        }

        $query = PlaybackLog::query()
            ->where('started_at', '>=', $startDate)
            ->where('started_at', '<=', $endDate)
            ->with(['player:id,name', 'media:id,title,type,duration_seconds']);

        if (! empty($validated['player_id'])) {
            $query->where('player_id', $validated['player_id']);
        }

        if (! empty($validated['media_id'])) {
            $query->where('media_id', $validated['media_id']);
        }

        // Filter by tag (media with specific tag)
        if (! empty($validated['tag_id'])) {
            $query->whereHas('media', function ($q) use ($validated) {
                $q->whereHas('tags', function ($tagQuery) use ($validated) {
                    $tagQuery->where('tags.id', $validated['tag_id']);
                });
            });
        }

        // Filter by completion status
        if (! empty($validated['completed']) && $validated['completed'] !== 'all') {
            $query->where('completed', $validated['completed'] === 'yes');
        }

        $sortField = $validated['sort'] ?? 'started_at';
        $sortDirection = $validated['direction'] ?? 'desc';

        // Handle sorting by related fields
        if ($sortField === 'player_name') {
            $query->leftJoin('players', 'playback_logs.player_id', '=', 'players.id')
                ->orderBy('players.name', $sortDirection)
                ->select('playback_logs.*');
        } elseif ($sortField === 'media_title') {
            $query->leftJoin('media', 'playback_logs.media_id', '=', 'media.id')
                ->orderBy('media.title', $sortDirection)
                ->select('playback_logs.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $validated['per_page'] ?? 20;
        $logs = $query->paginate($perPage);

        // Get tenant timezone for display
        $tenant = auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        return response()->json([
            'data' => $logs->map(fn ($log) => [
                'id' => $log->id,
                'player_id' => $log->player_id,
                'player_name' => $log->player?->name ?? 'Deleted',
                'media_id' => $log->media_id,
                'media_title' => $log->media?->title ?? 'Deleted',
                'media_type' => $log->media?->type ?? 'unknown',
                // Convert dates to tenant timezone for display
                'started_at' => TimezoneHelper::fromUtc($log->started_at, $timezone)?->toIso8601String(),
                'ended_at' => $log->ended_at
                    ? TimezoneHelper::fromUtc($log->ended_at, $timezone)?->toIso8601String()
                    : null,
                'duration_seconds' => $log->duration_played_seconds ?? $log->media?->duration_seconds,
                'completed' => $log->completed,
                // Proof of Play metadata
                'metadata' => $log->metadata,
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ],
            // Include timezone info for frontend reference
            'timezone' => $timezone,
        ]);
    }

    /**
     * Display the system events page.
     * Only super admin can access this page.
     */
    public function eventsIndex(): Response
    {
        abort_unless(auth()->user()?->is_super_admin, 403, 'Only super admin can access system events.');

        // Get tenant timezone
        $tenant = auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        // Fetch players for filter dropdown
        $players = \App\Models\Player::select('id', 'name')
            ->orderBy('name')
            ->get();

        // Event types for filter
        $eventTypes = [
            SystemEvent::TYPE_APP_BOOT,
            SystemEvent::TYPE_APP_CRASH,
            SystemEvent::TYPE_APP_ERROR,
            SystemEvent::TYPE_NETWORK_CHANGE,
            SystemEvent::TYPE_PLAYBACK_ERROR,
            SystemEvent::TYPE_DOWNLOAD_ERROR,
            SystemEvent::TYPE_API_ERROR,
            SystemEvent::TYPE_LOW_MEMORY,
            SystemEvent::TYPE_LOW_STORAGE,
            SystemEvent::TYPE_PLAYLIST_UPDATE,
            SystemEvent::TYPE_ACTIVATION,
            SystemEvent::TYPE_UPDATE,
        ];

        // Severities for filter
        $severities = [
            SystemEvent::SEVERITY_DEBUG,
            SystemEvent::SEVERITY_INFO,
            SystemEvent::SEVERITY_WARNING,
            SystemEvent::SEVERITY_ERROR,
            SystemEvent::SEVERITY_CRITICAL,
        ];

        return Inertia::render('reports/events', [
            'filters' => request()->only(['date_range', 'player_id', 'event_type', 'severity', 'date_from', 'date_to']),
            'players' => $players,
            'eventTypes' => $eventTypes,
            'severities' => $severities,
            'timezone' => $timezone,
        ]);
    }

    /**
     * Get system events with pagination.
     * Only super admin can access this endpoint.
     */
    public function events(Request $request): JsonResponse
    {
        abort_unless(auth()->user()?->is_super_admin, 403, 'Only super admin can access system events.');

        $validated = $request->validate([
            'date_range' => ['nullable', 'in:today,7d,30d,90d,custom'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'player_id' => ['nullable', 'uuid'],
            'event_type' => ['nullable', 'string', 'max:50'],
            'severity' => ['nullable', 'string', 'in:debug,info,warning,error,critical'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort' => ['nullable', 'in:event_timestamp,severity,event_type,player_name'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);

        $dateRange = $validated['date_range'] ?? '7d';

        // Handle custom date range
        if ($dateRange === 'custom' && ! empty($validated['date_from'])) {
            $startDate = \Carbon\Carbon::parse($validated['date_from'])->startOfDay();
            $endDate = ! empty($validated['date_to'])
                ? \Carbon\Carbon::parse($validated['date_to'])->endOfDay()
                : now()->endOfDay();
        } else {
            $startDate = match ($dateRange) {
                'today' => now()->startOfDay(),
                '7d' => now()->subDays(7)->startOfDay(),
                '30d' => now()->subDays(30)->startOfDay(),
                '90d' => now()->subDays(90)->startOfDay(),
                default => now()->subDays(7)->startOfDay(),
            };
            $endDate = now()->endOfDay();
        }

        $query = SystemEvent::query()
            ->where('event_timestamp', '>=', $startDate)
            ->where('event_timestamp', '<=', $endDate)
            ->with(['player:id,name']);

        if (! empty($validated['player_id'])) {
            $query->where('player_id', $validated['player_id']);
        }

        if (! empty($validated['event_type'])) {
            $query->where('event_type', $validated['event_type']);
        }

        if (! empty($validated['severity'])) {
            $query->where('severity', $validated['severity']);
        }

        $sortField = $validated['sort'] ?? 'event_timestamp';
        $sortDirection = $validated['direction'] ?? 'desc';

        // Handle sorting by related fields
        if ($sortField === 'player_name') {
            $query->leftJoin('players', 'system_events.player_id', '=', 'players.id')
                ->orderBy('players.name', $sortDirection)
                ->select('system_events.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $validated['per_page'] ?? 20;
        $events = $query->paginate($perPage);

        // Get tenant timezone for display
        $tenant = auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        return response()->json([
            'data' => $events->map(fn ($event) => [
                'id' => $event->id,
                'player_id' => $event->player_id,
                'player_name' => $event->player?->name ?? 'Deleted',
                'event_type' => $event->event_type,
                'event_type_label' => $event->getEventTypeLabel(),
                'severity' => $event->severity,
                'severity_color' => $event->getSeverityColor(),
                'message' => $event->message,
                'error_code' => $event->error_code,
                'error_class' => $event->error_class,
                'stack_trace' => $event->stack_trace,
                'component' => $event->component,
                'device_id' => $event->device_id,
                'app_version' => $event->app_version,
                'network_type' => $event->network_type,
                'memory_free_mb' => $event->memory_free_mb,
                'storage_free_mb' => $event->storage_free_mb,
                'extra_data' => $event->extra_data,
                'event_timestamp' => TimezoneHelper::fromUtc($event->event_timestamp, $timezone)?->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
                'from' => $events->firstItem(),
                'to' => $events->lastItem(),
            ],
            'timezone' => $timezone,
        ]);
    }
}
