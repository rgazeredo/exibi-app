<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Player;
use App\Models\Playlist;
use App\Models\PlaylistItem;
use App\Models\Widget;
use App\Services\PlaylistService;
use App\Services\WebSocketService;
use App\Support\TimezoneHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlaylistController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('playlists/index', [
            'filters' => $request->only(['search', 'tag']),
        ]);
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'media_count', 'players_count', 'is_active', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        $playlists = Playlist::query()
            ->with('tags')
            ->withCount(['media'])
            ->when($request->search, fn($q, $search) => $q->where('name', 'ilike', "%{$search}%"))
            ->when($request->tag, fn($q, $tagId) => $q->whereHas('tags', fn($tq) => $tq->where('tags.id', $tagId)))
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $playlists->through(fn($playlist) => [
                'id' => $playlist->id,
                'name' => $playlist->name,
                'description' => $playlist->description,
                'is_active' => $playlist->is_active,
                'media_count' => $playlist->media_count,
                'players_count' => $playlist->getEffectivePlayersCount(),
                'tags' => $playlist->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'created_at' => $playlist->created_at->toISOString(),
            ]),
            'meta' => [
                'current_page' => $playlists->currentPage(),
                'last_page' => $playlists->lastPage(),
                'per_page' => $playlists->perPage(),
                'total' => $playlists->total(),
                'from' => $playlists->firstItem(),
                'to' => $playlists->lastItem(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('playlists/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'media_items' => ['nullable', 'array'],
            'media_items.*.media_id' => ['required', 'uuid', 'exists:media,id'],
            'media_items.*.duration_override' => ['nullable', 'integer', 'min:1'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['uuid', 'exists:tags,id'],
        ]);

        $tags = $validated['tags'] ?? [];

        $playlist = Playlist::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Sync tags
        if (! empty($tags)) {
            $playlist->syncTags($tags);
        }

        if (! empty($validated['media_items'])) {
            foreach ($validated['media_items'] as $position => $item) {
                // Add to playlist_media (legacy)
                $playlist->media()->attach($item['media_id'], [
                    'position' => $position,
                    'duration_override' => $item['duration_override'] ?? null,
                    'is_active' => true,
                ]);

                // Add to playlist_items (new)
                $playlist->items()->create([
                    'item_type' => 'media',
                    'item_id' => $item['media_id'],
                    'position' => $position,
                    'duration_override' => $item['duration_override'] ?? null,
                    'is_active' => true,
                ]);
            }
        }

        return redirect()->route('playlists.show', $playlist)
            ->with('success', 'Playlist created successfully.');
    }

    public function show(Playlist $playlist, PlaylistService $playlistService): Response
    {
        $playlist->load(['items.media', 'items.childPlaylist', 'items.widget.currentMedia', 'tags']);

        // Get available playlists that can be added as sub-playlists
        $availablePlaylists = $playlistService->getAvailableSubPlaylists($playlist);

        // Get available widgets that can be added
        $availableWidgets = Widget::where('status', Widget::STATUS_READY)
            ->whereNotNull('current_media_id')
            ->get();

        return Inertia::render('playlists/show', [
            'playlist' => [
                'id' => $playlist->id,
                'name' => $playlist->name,
                'description' => $playlist->description,
                'is_active' => $playlist->is_active,
                'total_duration' => $playlist->getTotalDuration(),
                'total_media_count' => $playlistService->getTotalMediaCount($playlist),
                'can_contain_subplaylists' => $playlist->canContainSubPlaylists(),
                'created_at' => $playlist->created_at->toDateTimeString(),
                'tags' => $playlist->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'items' => $playlistService->getPlaylistStructure($playlist),
            ],
            'availablePlaylists' => $availablePlaylists->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'media_count' => $p->getMediaCount(),
                'total_duration' => $p->getTotalDuration(),
                'items' => $this->getPlaylistNestedItems($p),
            ])->values(),
            'availableWidgets' => $availableWidgets->map(fn($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'widget_type' => $w->widget_type,
                'widget_type_label' => $w->getTypeLabel(),
                'duration_seconds' => $w->getEffectiveDuration(),
                'thumbnail_url' => $w->currentMedia?->getThumbnailUrl(),
            ])->values(),
        ]);
    }

    public function update(Request $request, Playlist $playlist): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['uuid', 'exists:tags,id'],
        ]);

        $playlist->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Sync tags
        $playlist->syncTags($validated['tags'] ?? []);

        // Return JSON for pure AJAX requests (not Inertia)
        if (($request->ajax() || $request->wantsJson()) && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'playlist' => [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                ],
            ]);
        }

        return redirect()->route('playlists.show', $playlist)
            ->with('success', 'Playlist updated successfully.');
    }

    public function updateItems(Request $request, Playlist $playlist, PlaylistService $playlistService): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['nullable', 'array'],
            'items.*.item_type' => ['required', 'in:media,playlist,widget'],
            'items.*.item_id' => ['required', 'uuid'],
            'items.*.duration_override' => ['nullable', 'integer', 'min:1'],
            'items.*.schedule_type' => ['nullable', 'in:always,date_range,recurring'],
            'items.*.schedule_mode' => ['nullable', 'in:always,available,priority_once,priority_loop'],
            'items.*.priority_order' => ['nullable', 'integer', 'min:1'],
            'items.*.starts_at' => ['nullable', 'date'],
            'items.*.ends_at' => ['nullable', 'date'],
            // day_schedules is an array of slot objects
            'items.*.day_schedules' => ['nullable', 'array'],
            'items.*.day_schedules.*.id' => ['required', 'string'],
            'items.*.day_schedules.*.days' => ['required', 'array', 'min:1'],
            'items.*.day_schedules.*.days.*' => ['integer', 'min:0', 'max:6'],
            'items.*.day_schedules.*.time_start' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'],
            'items.*.day_schedules.*.time_end' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'],
            'items.*.day_schedules.*.starts_at' => ['nullable', 'date'],
            'items.*.day_schedules.*.ends_at' => ['nullable', 'date'],
        ]);

        // Clear existing items
        $playlist->items()->delete();
        $playlist->media()->detach();

        // Get tenant timezone for converting dates
        $tenant = $playlist->tenant ?? auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        if (! empty($validated['items'])) {
            foreach ($validated['items'] as $position => $item) {
                $itemType = $item['item_type'];
                $itemId = $item['item_id'];

                // Validate sub-playlist if adding one
                if ($itemType === 'playlist') {
                    $childPlaylist = Playlist::find($itemId);
                    if ($childPlaylist) {
                        $errors = $playlistService->validateNesting($playlist, $childPlaylist);
                        if (! empty($errors)) {
                            return redirect()->route('playlists.items', $playlist)
                                ->with('error', implode(' ', $errors));
                        }
                    }
                }

                // Convert dates from tenant timezone to UTC for storage
                $startsAt = isset($item['starts_at'])
                    ? TimezoneHelper::toUtc($item['starts_at'], $timezone)
                    : null;
                $endsAt = isset($item['ends_at'])
                    ? TimezoneHelper::toUtc($item['ends_at'], $timezone)
                    : null;

                // Convert day_schedules dates to UTC (starts_at/ends_at inside each slot)
                $daySchedules = $item['day_schedules'] ?? null;
                if ($daySchedules) {
                    $daySchedules = $this->convertDaySchedulesToUtc($daySchedules, $timezone);
                }

                // Add to playlist_items with scheduling
                $playlist->items()->create([
                    'item_type' => $itemType,
                    'item_id' => $itemId,
                    'position' => $position,
                    'duration_override' => $item['duration_override'] ?? null,
                    'is_active' => true,
                    'schedule_type' => $item['schedule_type'] ?? 'always',
                    'schedule_mode' => $item['schedule_mode'] ?? 'always',
                    'priority_order' => $item['priority_order'] ?? null,
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'day_schedules' => $daySchedules,
                ]);

                // Also add to playlist_media for backward compatibility (media only)
                if ($itemType === 'media') {
                    $playlist->media()->attach($itemId, [
                        'position' => $position,
                        'duration_override' => $item['duration_override'] ?? null,
                        'is_active' => true,
                    ]);
                }
            }
        }

        // Mark playlist content as updated
        $playlist->touchContentUpdatedAt();

        return redirect()->route('playlists.show', $playlist)
            ->with('success', 'Playlist items updated successfully.');
    }

    public function destroy(Playlist $playlist): RedirectResponse
    {
        $playlist->delete();

        return redirect()->route('playlists.index')
            ->with('success', 'Playlist deleted successfully.');
    }

    public function reorderItems(Request $request, Playlist $playlist): JsonResponse
    {
        $validated = $request->validate([
            'item_ids' => ['required', 'array'],
            'item_ids.*' => ['required', 'uuid'],
        ]);

        foreach ($validated['item_ids'] as $position => $itemId) {
            PlaylistItem::where('id', $itemId)
                ->where('playlist_id', $playlist->id)
                ->update(['position' => $position]);
        }

        // Also reorder in playlist_media for backward compatibility
        $playlist->load('items');
        $mediaIds = $playlist->items
            ->where('item_type', 'media')
            ->sortBy('position')
            ->pluck('item_id')
            ->toArray();

        foreach ($mediaIds as $position => $mediaId) {
            $playlist->media()->updateExistingPivot($mediaId, [
                'position' => $position,
            ]);
        }

        // Mark playlist content as updated
        $playlist->touchContentUpdatedAt();

        return response()->json(['success' => true]);
    }

    /**
     * Add a single item (media, playlist, or widget) to the playlist.
     */
    public function addItem(Request $request, Playlist $playlist, PlaylistService $playlistService): JsonResponse
    {
        $validated = $request->validate([
            'item_type' => ['required', 'in:media,playlist,widget'],
            'item_id' => ['required', 'uuid'],
            'duration_override' => ['nullable', 'integer', 'min:1'],
        ]);

        $itemType = $validated['item_type'];
        $itemId = $validated['item_id'];

        // Validate sub-playlist if adding one
        if ($itemType === 'playlist') {
            $childPlaylist = Playlist::find($itemId);
            if (! $childPlaylist) {
                return response()->json(['error' => 'Playlist não encontrada.'], 404);
            }

            $errors = $playlistService->validateNesting($playlist, $childPlaylist);
            if (! empty($errors)) {
                return response()->json(['errors' => $errors], 422);
            }
        }

        // Validate widget if adding one
        if ($itemType === 'widget') {
            $widget = Widget::find($itemId);
            if (! $widget) {
                return response()->json(['error' => 'Widget não encontrado.'], 404);
            }

            if (! $widget->isReady()) {
                return response()->json(['error' => 'Widget ainda não está pronto. Aguarde a geração do vídeo.'], 422);
            }
        }

        $maxPosition = $playlist->items()->max('position') ?? -1;

        $item = $playlist->items()->create([
            'item_type' => $itemType,
            'item_id' => $itemId,
            'position' => $maxPosition + 1,
            'duration_override' => $validated['duration_override'] ?? null,
            'is_active' => true,
        ]);

        // Also add to playlist_media for backward compatibility (media only)
        if ($itemType === 'media') {
            $playlist->media()->attach($itemId, [
                'position' => $maxPosition + 1,
                'duration_override' => $validated['duration_override'] ?? null,
                'is_active' => true,
            ]);
        }

        // Mark playlist content as updated
        $playlist->touchContentUpdatedAt();

        return response()->json(['success' => true, 'item' => $item]);
    }

    /**
     * Remove a single item from the playlist.
     */
    public function removeItem(Playlist $playlist, PlaylistItem $item): JsonResponse
    {
        if ($item->playlist_id !== $playlist->id) {
            return response()->json(['error' => 'Item não pertence a esta playlist.'], 403);
        }

        // Remove from playlist_media if it's a media item
        if ($item->isMedia()) {
            $playlist->media()->detach($item->item_id);
        }

        $item->delete();
        $playlist->reorderItems();

        // Mark playlist content as updated
        $playlist->touchContentUpdatedAt();

        return response()->json(['success' => true]);
    }

    public function duplicate(Playlist $playlist): RedirectResponse
    {
        $playlist->load(['items']);

        $newPlaylist = Playlist::create([
            'name' => "Cópia de {$playlist->name}",
            'description' => $playlist->description,
            'is_active' => false,
        ]);

        foreach ($playlist->items as $item) {
            // Create in playlist_items
            $newPlaylist->items()->create([
                'item_type' => $item->item_type,
                'item_id' => $item->item_id,
                'position' => $item->position,
                'duration_override' => $item->duration_override,
                'is_active' => $item->is_active,
                'settings' => $item->settings,
                'starts_at' => $item->starts_at,
                'ends_at' => $item->ends_at,
            ]);

            // Also add to playlist_media for backward compatibility (media only)
            if ($item->isMedia()) {
                $newPlaylist->media()->attach($item->item_id, [
                    'position' => $item->position,
                    'duration_override' => $item->duration_override,
                    'is_active' => $item->is_active,
                    'settings' => $item->settings,
                ]);
            }
        }

        return redirect()->route('playlists.show', $newPlaylist)
            ->with('success', 'Playlist duplicated successfully.');
    }

    public function preview(Playlist $playlist, PlaylistService $playlistService): Response
    {
        // Load active items only to match what getFlattenedMedia() uses
        $playlist->load([
            'activeItems.media',
            'activeItems.widget.currentMedia',
            'activeItems.childPlaylist.activeItems.media',
            'activeItems.childPlaylist.activeItems.widget.currentMedia',
        ]);

        // Get flattened media (resolves nested playlists)
        $flattenedMedia = $playlist->getFlattenedMedia();

        return Inertia::render('playlists/preview', [
            'playlist' => [
                'id' => $playlist->id,
                'name' => $playlist->name,
                'total_duration' => $playlist->getTotalDuration(),
                'total_media_count' => $playlistService->getTotalMediaCount($playlist),
                'media' => $flattenedMedia->map(fn($item, $index) => [
                    'id' => $item['media']->id,
                    'title' => $item['media']->title,
                    'type' => $item['media']->type,
                    'url' => $item['media']->getPublicUrl(),
                    'thumbnail_url' => $item['media']->getThumbnailUrl(),
                    'duration' => $item['duration_override'] ?? $item['media']->duration_seconds ?? 10,
                    'position' => $index,
                    'source' => $item['source'],
                    'source_playlist_id' => $item['source_playlist_id'],
                    'source_widget_id' => $item['source_widget_id'] ?? null,
                ])->values(),
            ],
        ]);
    }

    /**
     * Convert day_schedules dates (starts_at/ends_at inside each slot) from tenant timezone to UTC.
     * Note: time_start and time_end are kept as-is because they represent local time for recurring schedules.
     */
    private function convertDaySchedulesToUtc(array $daySchedules, string $timezone): array
    {
        return array_map(function ($slot) use ($timezone) {
            // Convert slot's validity period dates to UTC if present
            if (! empty($slot['starts_at'])) {
                $converted = TimezoneHelper::toUtc($slot['starts_at'], $timezone);
                $slot['starts_at'] = $converted?->toIso8601String();
            }
            if (! empty($slot['ends_at'])) {
                $converted = TimezoneHelper::toUtc($slot['ends_at'], $timezone);
                $slot['ends_at'] = $converted?->toIso8601String();
            }

            // Note: time_start and time_end are NOT converted - they represent
            // "local time" for the tenant (e.g., "09:00" means 9 AM in tenant's timezone)

            return $slot;
        }, $daySchedules);
    }

    /**
     * Send refresh_player command to all players using this playlist.
     */
    public function refreshPlayers(Playlist $playlist, WebSocketService $webSocketService): JsonResponse
    {
        // Get all players using this playlist via their layouts
        $players = Player::query()
            ->where('tenant_id', $playlist->tenant_id)
            ->whereHas('regionPlaylists', fn($q) => $q->where('playlist_id', $playlist->id))
            ->get();

        if ($players->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'Nenhum player usando esta playlist',
                'updated' => 0,
            ]);
        }

        $results = $webSocketService->sendCommandToMany($players, 'refresh_player');

        return response()->json([
            'success' => true,
            'results' => $results,
            'updated' => collect($results)->filter(fn($success) => $success === true)->count(),
            'total' => $players->count(),
        ]);
    }

    /**
     * Get nested items for a playlist (for accordion visualization).
     */
    protected function getPlaylistNestedItems(Playlist $playlist): array
    {
        $playlist->load(['items.media', 'items.childPlaylist', 'items.widget.currentMedia']);

        return $playlist->items->map(function ($item) {
            $data = [
                'id' => $item->id,
                'item_type' => $item->item_type,
                'item_id' => $item->item_id,
                'position' => $item->position,
            ];

            if ($item->item_type === 'media' && $item->media) {
                $data['media'] = [
                    'id' => $item->media->id,
                    'title' => $item->media->title,
                    'type' => $item->media->type,
                    'thumbnail_url' => $item->media->getThumbnailUrl(),
                    'duration_seconds' => $item->media->duration_seconds,
                ];
            } elseif ($item->item_type === 'playlist' && $item->childPlaylist) {
                $data['playlist'] = [
                    'id' => $item->childPlaylist->id,
                    'name' => $item->childPlaylist->name,
                    'media_count' => $item->childPlaylist->items()->count(),
                    'total_duration' => $item->childPlaylist->getTotalDuration(),
                ];
            } elseif ($item->item_type === 'widget' && $item->widget) {
                $data['widget'] = [
                    'id' => $item->widget->id,
                    'name' => $item->widget->name,
                    'widget_type' => $item->widget->widget_type,
                    'thumbnail_url' => $item->widget->currentMedia?->getThumbnailUrl(),
                    'duration_seconds' => $item->widget->duration_seconds,
                ];
            }

            return $data;
        })->toArray();
    }
}
