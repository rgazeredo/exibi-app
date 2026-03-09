<?php

namespace App\Http\Controllers;

use App\Models\PendingPlayerActivation;
use App\Models\Player;
use App\Models\PlayerRegionPlaylist;
use App\Models\Playlist;
use App\Services\PlaylistService;
use App\Services\WebSocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('players/index', [
            'filters' => $request->only(['search', 'status', 'tag']),
            'canCreate' => $request->user()->can('create', Player::class),
        ]);
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'last_seen_at', 'is_online', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = Player::query()
            ->with([
                'tags',
                'layout',
            ])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'ilike', "%{$search}%"))
            ->when($request->status === 'online', fn ($q) => $q->online())
            ->when($request->status === 'offline', fn ($q) => $q->offline())
            ->when($request->tag, fn ($q, $tagId) => $q->whereHas('tags', fn ($tq) => $tq->where('tags.id', $tagId)));

        // Handle is_online sorting with raw SQL (computed from last_seen_at)
        if ($sortField === 'is_online') {
            $query->orderByRaw("CASE WHEN last_seen_at >= NOW() - INTERVAL '5 minutes' THEN 1 ELSE 0 END {$sortDirection}");
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $players = $query->paginate($perPage);

        return response()->json([
            'data' => $players->through(fn ($player) => [
                'id' => $player->id,
                'name' => $player->name,
                'description' => $player->description,
                'is_online' => $player->isOnline(),
                'last_seen_at' => $player->last_seen_at?->diffForHumans(),
                'effective_layout' => $this->getEffectiveLayoutInfo($player),
                'tags' => $player->tags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'created_at' => $player->created_at->toISOString(),
            ]),
            'meta' => [
                'current_page' => $players->currentPage(),
                'last_page' => $players->lastPage(),
                'per_page' => $players->perPage(),
                'total' => $players->total(),
                'from' => $players->firstItem(),
                'to' => $players->lastItem(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Player::class);

        return Inertia::render('players/form', [
            'layouts' => $this->getLayoutOptions(),
            'playlists' => $this->getPlaylistOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Player::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'layout_id' => ['nullable', 'uuid', 'exists:layouts,id'],
            'region_playlists' => ['nullable', 'array'],
            'region_playlists.*.region_id' => ['required', 'uuid'],
            'region_playlists.*.playlist_id' => ['nullable', 'uuid', 'exists:playlists,id'],
            'config' => ['nullable', 'array'],
            'config.orientation' => ['nullable', 'string', 'in:landscape,landscape_inverted,portrait_left,portrait_right'],
            'config.update_interval_minutes' => ['nullable', 'integer', 'min:1', 'max:60'],
            'config.volume' => ['nullable', 'integer', 'min:0', 'max:100'],
            'config.password_caller_enabled' => ['nullable', 'boolean'],
            'activation_code' => ['required', 'string', 'size:7'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['uuid', 'exists:tags,id'],
        ]);

        // Check activation code if provided
        $activation = null;
        if (! empty($validated['activation_code'])) {
            $activation = PendingPlayerActivation::findByCode($validated['activation_code']);

            if (! $activation) {
                return back()
                    ->withInput()
                    ->withErrors(['activation_code' => __('players.invalid_activation_code')]);
            }

            if ($activation->isClaimed()) {
                return back()
                    ->withInput()
                    ->withErrors(['activation_code' => __('players.activation_code_already_used')]);
            }
        }

        $tags = $validated['tags'] ?? [];
        $layoutId = $validated['layout_id'] ?? null;
        $regionPlaylists = $validated['region_playlists'] ?? [];

        unset($validated['tags'], $validated['region_playlists']);

        $player = Player::create($validated);

        // Sync tags
        if (! empty($tags)) {
            $player->syncTags($tags);
        }

        // Sync region playlists
        if (! empty($regionPlaylists)) {
            foreach ($regionPlaylists as $rp) {
                if (! empty($rp['playlist_id'])) {
                    PlayerRegionPlaylist::updateOrCreate(
                        [
                            'player_id' => $player->id,
                            'layout_region_id' => $rp['region_id'],
                        ],
                        [
                            'playlist_id' => $rp['playlist_id'],
                        ]
                    );
                }
            }
        }

        // Claim the activation if we have one
        if ($activation) {
            // Transfer device info from activation to player
            $deviceInfo = $activation->device_info;
            $player->update([
                'device_id' => $activation->device_id,
                'device_info' => $deviceInfo,
                'mac_address' => $deviceInfo['mac_address'] ?? null,
            ]);

            $activation->claim(session('current_tenant_id'), $player);
        }

        return redirect()->route('players.show', $player)
            ->with('success', 'Player created successfully.');
    }

    public function show(Player $player): Response
    {
        $player->load([
            'tags',
            'layout.regions',
            'regionPlaylists.layoutRegion',
        ]);

        // Buscar último heartbeat com informações do sistema
        $latestHeartbeat = $player->heartbeats()
            ->latest('created_at')
            ->first();

        // Buscar histórico de heartbeats (últimos 20)
        $heartbeatHistory = $player->heartbeats()
            ->latest('created_at')
            ->take(20)
            ->get()
            ->map(fn ($hb) => [
                'id' => $hb->id,
                'ip_address' => $hb->ip_address,
                'app_version' => $hb->app_version,
                'system_info' => $hb->system_info,
                'status' => $hb->status['state'] ?? 'unknown',
                'created_at' => $hb->created_at->toDateTimeString(),
                'created_at_human' => $hb->created_at->diffForHumans(),
            ]);

        return Inertia::render('players/show', [
            'player' => [
                'id' => $player->id,
                'name' => $player->name,
                'description' => $player->description,
                'api_token' => $player->api_token,
                'is_online' => $player->isOnline(),
                'last_seen_at' => $player->last_seen_at?->diffForHumans(),
                'last_seen_at_full' => $player->last_seen_at?->toIso8601String(),
                'effective_layout' => $this->getEffectiveLayoutData($player),
                'tags' => $player->tags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'config' => $player->config,
                'operating_hours_status' => $this->getOperatingHoursStatus($player),
                'created_at' => $player->created_at->toDateTimeString(),
                // Dados de diagnóstico
                'device_id' => $player->device_id,
                'mac_address' => $player->mac_address,
                'public_ip' => $player->public_ip,
                'geolocation' => $player->geolocation,
                'device_info' => $player->device_info,
                'diagnostics' => $latestHeartbeat ? [
                    'ip_address' => $latestHeartbeat->ip_address,
                    'app_version' => $latestHeartbeat->app_version,
                    'system_info' => $latestHeartbeat->system_info,
                    'status' => $latestHeartbeat->status,
                    'last_update' => $latestHeartbeat->created_at->toDateTimeString(),
                    'last_update_human' => $latestHeartbeat->created_at->diffForHumans(),
                ] : null,
                'currently_playing' => $this->getCurrentlyPlayingData($player),
            ],
            'heartbeat_history' => $heartbeatHistory,
        ]);
    }

    public function edit(Player $player): Response
    {
        $player->load(['tags', 'layout', 'regionPlaylists']);

        return Inertia::render('players/form', [
            'player' => [
                'id' => $player->id,
                'name' => $player->name,
                'description' => $player->description,
                'layout_id' => $player->layout_id,
                'config' => $player->config,
                'tags' => $player->tags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'region_playlists' => $player->regionPlaylists->map(fn ($rp) => [
                    'region_id' => $rp->layout_region_id,
                    'playlist_id' => $rp->playlist_id,
                ])->toArray(),
            ],
            'layouts' => $this->getLayoutOptions(),
            'playlists' => $this->getPlaylistOptions(),
        ]);
    }

    public function update(Request $request, Player $player): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'layout_id' => ['nullable', 'uuid', 'exists:layouts,id'],
            'region_playlists' => ['nullable', 'array'],
            'region_playlists.*.region_id' => ['required', 'uuid'],
            'region_playlists.*.playlist_id' => ['nullable', 'uuid', 'exists:playlists,id'],
            'config' => ['nullable', 'array'],
            'config.orientation' => ['nullable', 'string', 'in:landscape,landscape_inverted,portrait_left,portrait_right'],
            'config.update_interval_minutes' => ['nullable', 'integer', 'min:1', 'max:60'],
            'config.volume' => ['nullable', 'integer', 'min:0', 'max:100'],
            'config.password_caller_enabled' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['uuid', 'exists:tags,id'],
        ]);

        $tags = $validated['tags'] ?? [];
        $regionPlaylists = $validated['region_playlists'] ?? [];

        unset($validated['tags'], $validated['region_playlists']);

        $player->update($validated);

        // Sync tags
        $player->syncTags($tags);

        // Sync region playlists
        $player->regionPlaylists()->delete();
        foreach ($regionPlaylists as $rp) {
            if (! empty($rp['playlist_id'])) {
                PlayerRegionPlaylist::create([
                    'player_id' => $player->id,
                    'layout_region_id' => $rp['region_id'],
                    'playlist_id' => $rp['playlist_id'],
                ]);
            }
        }

        return redirect()->route('players.show', $player)
            ->with('success', 'Player updated successfully.');
    }

    public function destroy(Player $player): RedirectResponse
    {
        $player->delete();

        return redirect()->route('players.index')
            ->with('success', 'Player deleted successfully.');
    }

    /**
     * Replace a broken player with a new device.
     *
     * Flow:
     * 1. User is on the OLD player's page (the broken one)
     * 2. User enters the activation code from the NEW device's screen
     * 3. System creates the new player with all configs from the old one
     * 4. Old player is deleted
     */
    public function replacePlayer(Request $request, Player $player): RedirectResponse
    {
        $validated = $request->validate([
            'activation_code' => ['required', 'string', 'size:7'],
        ]);

        // Find the pending activation
        $activation = PendingPlayerActivation::findByCode($validated['activation_code']);

        if (! $activation) {
            return back()->withErrors(['activation_code' => __('players.invalid_activation_code')]);
        }

        if ($activation->isClaimed()) {
            return back()->withErrors(['activation_code' => __('players.activation_code_already_used')]);
        }

        $oldPlayerName = $player->name;

        $player->load(['regionPlaylists', 'tags']);

        $newPlayer = DB::transaction(function () use ($player, $activation, $oldPlayerName) {
            // 1. Create new player with old player's configurations
            $newPlayer = Player::create([
                'tenant_id' => $player->tenant_id,
                'name' => $oldPlayerName,
                'description' => $player->description,
                'layout_id' => $player->layout_id,
                'config' => $player->config,
                'is_active' => true,
            ]);

            // 2. Transfer device info from activation to new player
            $deviceInfo = $activation->device_info;
            $newPlayer->update([
                'device_id' => $activation->device_id,
                'device_info' => $deviceInfo,
                'mac_address' => $deviceInfo['mac_address'] ?? null,
            ]);

            // 3. Claim the activation (links device to player)
            $activation->claim($player->tenant_id, $newPlayer);

            // 4. Copy region playlist assignments
            foreach ($player->regionPlaylists as $rp) {
                $newRp = $rp->replicate(['id', 'player_id']);
                $newRp->player_id = $newPlayer->id;
                $newRp->save();
            }

            // 5. Sync tags
            $newPlayer->tags()->sync($player->tags->pluck('id'));

            // 6. Delete old player
            $player->delete();

            return $newPlayer;
        });

        return redirect()->route('players.show', $newPlayer)
            ->with('success', __('players.replaced_successfully'));
    }

    public function regenerateToken(Player $player): RedirectResponse
    {
        $player->regenerateToken();

        return back()->with('success', 'API token regenerated successfully.');
    }

    /**
     * Send refresh_playlist command to player via WebSocket.
     *
     * Accepts optional show_toast parameter to display notification on player after refresh.
     */
    public function refreshPlaylist(
        Request $request,
        Player $player,
        WebSocketService $webSocketService
    ): JsonResponse {
        $showToast = $request->boolean('show_toast', false);

        $success = $webSocketService->refreshPlaylist($player, $showToast);

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Command sent successfully'
                : 'Failed to send command',
        ]);
    }

    /**
     * Send refresh_app command to player via WebSocket.
     */
    public function refreshApp(
        Player $player,
        WebSocketService $webSocketService
    ): JsonResponse {
        $success = $webSocketService->refreshApp($player);

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Command sent successfully'
                : 'Failed to send command',
        ]);
    }

    /**
     * Send reboot command to player via WebSocket.
     */
    public function reboot(
        Player $player,
        WebSocketService $webSocketService
    ): JsonResponse {
        $success = $webSocketService->reboot($player);

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Command sent successfully'
                : 'Failed to send command',
        ]);
    }

    /**
     * Request screenshot from player via WebSocket.
     */
    public function requestScreenshot(
        Player $player,
        WebSocketService $webSocketService
    ): JsonResponse {
        if (! $player->isOnline()) {
            return response()->json([
                'success' => false,
                'message' => 'Player is offline',
            ], 422);
        }

        $success = $webSocketService->sendCommand($player, 'screenshot');

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Screenshot requested'
                : 'Failed to send command',
        ]);
    }

    /**
     * Show downloads status for a player.
     * Compares layout items with what's downloaded on the device.
     */
    public function downloads(Player $player, PlaylistService $playlistService): Response
    {
        $player->load([
            'layout.regions',
            'regionPlaylists.playlist.activeItems.media',
            'regionPlaylists.playlist.activeItems.childPlaylist.activeItems.media',
        ]);

        $layout = $player->layout;

        // Get all media items from the effective playlist OR layout
        $playlistItems = [];
        $contentSource = null;

        // First try layout (if player uses layout mode)
        if ($layout) {
            // Collect items from all region playlists
            foreach ($player->regionPlaylists as $regionPlaylist) {
                if ($regionPlaylist->playlist) {
                    $regionItems = $playlistService->getFlattenedPlaylist($regionPlaylist->playlist);
                    $playlistItems = array_merge($playlistItems, $regionItems);
                }
            }

            // Remove duplicates by ID
            $playlistItems = collect($playlistItems)->unique('id')->values()->toArray();

            $contentSource = [
                'type' => 'layout',
                'id' => $layout->id,
                'name' => $layout->name ?? 'Layout',
            ];
        }

        // Check if we have download data from the device
        $hasDownloadData = $player->downloads_status !== null;

        $downloadedIds = $player->getDownloadedMediaIds();
        $pendingIds = $player->getPendingMediaIds();
        $progress = $player->getDownloadProgress();

        // Map items with download status
        $items = collect($playlistItems)->map(function ($item) use ($downloadedIds, $pendingIds, $progress, $hasDownloadData) {
            $isDownloaded = in_array($item['id'], $downloadedIds);
            $isPending = in_array($item['id'], $pendingIds);
            $downloadProgress = $progress[$item['id']] ?? null;

            return [
                'id' => $item['id'],
                'title' => $item['title'],
                'type' => $item['type'],
                'thumbnail_url' => $item['thumbnail_url'],
                'duration_seconds' => $item['duration_seconds'],
                'size_bytes' => $item['size_bytes'] ?? null,
                'is_downloaded' => $isDownloaded,
                'is_pending' => $hasDownloadData && $isPending && ! $isDownloaded,
                'download_progress' => $downloadProgress,
                'status_waiting' => ! $hasDownloadData,
            ];
        });

        // Calculate stats
        $playlistMediaIds = collect($playlistItems)->pluck('id')->toArray();
        $downloadedInPlaylist = count(array_intersect($playlistMediaIds, $downloadedIds));

        // Calculate total size from playlist items (in MB)
        $totalSizeBytes = collect($playlistItems)->sum('size_bytes');
        $totalSizeMb = $totalSizeBytes > 0 ? round($totalSizeBytes / (1024 * 1024)) : null;

        return Inertia::render('players/downloads', [
            'player' => [
                'id' => $player->id,
                'name' => $player->name,
                'is_online' => $player->isOnline(),
                'last_seen_at' => $player->last_seen_at?->diffForHumans(),
            ],
            'playlist' => $contentSource,
            'items' => $items->values(),
            'stats' => [
                'total' => count($playlistItems),
                'downloaded' => $downloadedInPlaylist,
                'pending' => count($playlistItems) - $downloadedInPlaylist,
                'percentage' => count($playlistItems) > 0
                    ? round(($downloadedInPlaylist / count($playlistItems)) * 100)
                    : 0,
                'total_size_mb' => $totalSizeMb,
                'updated_at' => $player->getDownloadsUpdatedAt()?->diffForHumans(),
                'has_data' => $hasDownloadData,
            ],
        ]);
    }

    /**
     * Get layout options for the scheduled layouts editor.
     */
    protected function getLayoutOptions(): array
    {
        return \App\Models\Layout::query()
            ->where('is_active', true)
            ->with('regions')
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn ($layout) => [
                'id' => $layout->id,
                'name' => $layout->name,
                'description' => $layout->description,
                'orientation' => $layout->orientation,
                'is_system' => $layout->is_system,
                'regions' => $layout->regions->map(fn ($region) => [
                    'id' => $region->id,
                    'name' => $region->name,
                    'x_percent' => $region->x_percent,
                    'y_percent' => $region->y_percent,
                    'width_percent' => $region->width_percent,
                    'height_percent' => $region->height_percent,
                    'is_main' => $region->is_main,
                ])->toArray(),
            ])
            ->toArray();
    }

    /**
     * Get playlist options for the scheduled layouts editor.
     */
    protected function getPlaylistOptions(): array
    {
        return Playlist::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    /**
     * Sync player layouts from form data.
     */
    protected function syncPlayerLayouts(Player $player, array $scheduledLayouts): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($player, $scheduledLayouts) {
            // Delete all existing layouts
            $player->playerLayouts()->delete();

            // Create new layouts
            foreach ($scheduledLayouts as $index => $sl) {
                $regionPlaylists = $sl['region_playlists'] ?? [];
                unset($sl['region_playlists'], $sl['layout'], $sl['id']);

                // Ensure is_default is set properly
                if (! isset($sl['is_default'])) {
                    $sl['is_default'] = $index === 0 && count($scheduledLayouts) > 0;
                }

                // Default layout must always be active
                if ($sl['is_default']) {
                    $sl['is_active'] = true;
                }

                $playerLayout = $player->playerLayouts()->create($sl);

                // Create region playlist assignments
                foreach ($regionPlaylists as $regionId => $regionData) {
                    if (is_array($regionData)) {
                        $playlistId = $regionData['playlist_id'] ?? null;
                        $scaleType = $regionData['scale_type'] ?? 'aspect';
                    } else {
                        $playlistId = $regionData;
                        $scaleType = 'aspect';
                    }

                    if ($playlistId) {
                        $playerLayout->regionPlaylists()->create([
                            'layout_region_id' => $regionId,
                            'playlist_id' => $playlistId,
                            'scale_type' => $scaleType,
                        ]);
                    }
                }
            }
        });
    }

    /**
     * Get effective layout info for a player (for index page).
     */
    protected function getEffectiveLayoutInfo(Player $player): ?array
    {
        $layout = $player->layout;

        if (! $layout) {
            return null;
        }

        $playlists = $player->regionPlaylists
            ->map(fn ($rp) => $rp->playlist)
            ->filter()
            ->unique('id')
            ->values()
            ->map(fn ($playlist) => [
                'id' => $playlist->id,
                'name' => $playlist->name,
            ])
            ->toArray();

        return [
            'id' => $layout->id,
            'name' => $layout->name,
            'playlists' => $playlists,
            'source' => 'player',
        ];
    }

    /**
     * Get operating hours status for a player.
     */
    protected function getOperatingHoursStatus(Player $player): ?array
    {
        $config = $player->getEffectiveConfig();
        $operatingHours = $config['operating_hours'] ?? null;

        // If operating hours is not configured or not enabled
        if (! $operatingHours || ! ($operatingHours['enabled'] ?? false)) {
            return null;
        }

        $isWithinHours = $player->isWithinOperatingHours();
        $shouldShowBlackScreen = ! $isWithinHours;

        $result = [
            'enabled' => true,
            'is_within_hours' => $isWithinHours,
            'should_show_black_screen' => $shouldShowBlackScreen,
            'next_start' => null,
            'next_start_human' => null,
        ];

        // If currently in black screen, calculate next start time
        if ($shouldShowBlackScreen) {
            $nextStart = $this->calculateNextOperatingHoursStart($player, $operatingHours);
            if ($nextStart) {
                $result['next_start'] = $nextStart->toIso8601String();
                $result['next_start_human'] = $nextStart->diffForHumans();
            }
        }

        return $result;
    }

    /**
     * Calculate the next operating hours start time.
     */
    protected function calculateNextOperatingHoursStart(Player $player, array $operatingHours): ?\Carbon\Carbon
    {
        $rules = $operatingHours['rules'] ?? [];
        if (empty($rules)) {
            return null;
        }

        $timezone = $player->tenant?->getTimezone() ?? 'America/Sao_Paulo';
        $now = now($timezone);

        $nextStarts = [];

        // Check next 7 days for the next start time
        for ($dayOffset = 0; $dayOffset <= 7; $dayOffset++) {
            $checkDate = $now->copy()->addDays($dayOffset);
            $dayOfWeek = $checkDate->dayOfWeek;

            foreach ($rules as $rule) {
                $days = $rule['days'] ?? [];
                if (! in_array($dayOfWeek, $days)) {
                    continue;
                }

                $timeStart = $rule['time_start'] ?? '00:00';
                $startDateTime = $checkDate->copy()->setTimeFromTimeString($timeStart);

                // If it's today, only consider if start time is in the future
                if ($dayOffset === 0 && $startDateTime <= $now) {
                    continue;
                }

                $nextStarts[] = $startDateTime;
            }
        }

        if (empty($nextStarts)) {
            return null;
        }

        // Return the earliest next start
        usort($nextStarts, fn ($a, $b) => $a->timestamp - $b->timestamp);

        return $nextStarts[0];
    }

    /**
     * Get effective layout data for a player.
     */
    protected function getEffectiveLayoutData(Player $player): ?array
    {
        $layout = $player->layout;

        if (! $layout) {
            return null;
        }

        // Load regions with their playlists
        $layout->load('regions');
        $regionPlaylists = [];

        foreach ($layout->regions as $region) {
            $regionPlaylist = $player->regionPlaylists
                ->firstWhere('layout_region_id', $region->id);
            $regionPlaylists[] = [
                'region_name' => $region->name,
                'playlist' => $regionPlaylist && $regionPlaylist->playlist ? [
                    'id' => $regionPlaylist->playlist->id,
                    'name' => $regionPlaylist->playlist->name,
                ] : null,
            ];
        }

        return [
            'id' => $layout->id,
            'name' => $layout->name,
            'source' => 'player',
            'region_count' => $layout->regions->count(),
            'region_playlists' => $regionPlaylists,
        ];
    }

    /**
     * Get screenshot status for polling.
     */
    public function screenshotStatus(Player $player): JsonResponse
    {
        return response()->json([
            'url' => $player->last_screenshot_url,
            'timestamp' => $player->last_screenshot_at?->toIso8601String(),
        ]);
    }

    /**
     * Get currently playing media data for a player.
     */
    protected function getCurrentlyPlayingData(Player $player): ?array
    {
        $data = $player->getCurrentPlayingMedia();

        // Get all regions currently playing
        $regions = $player->getAllRegionsCurrentlyPlaying();

        if (! $data['media']) {
            return [
                'media' => null,
                'confidence' => $data['confidence'],
                'source' => $data['source'],
                'position' => null,
                'total_items' => $data['total_items'],
                'started_at' => null,
                'playlist_name' => $data['playlist_name'],
                'regions' => array_values($regions),
            ];
        }

        $media = $data['media'];

        return [
            'media' => [
                'id' => $media->id,
                'title' => $media->title,
                'type' => $media->type,
                'url' => $media->getPublicUrl(),
                'thumbnail_url' => $media->getThumbnailUrl(),
                'duration_seconds' => $media->duration_seconds,
                'duration_formatted' => $media->getFormattedDuration(),
            ],
            'confidence' => $data['confidence'],
            'source' => $data['source'],
            'position' => $data['position'],
            'total_items' => $data['total_items'],
            'started_at' => $data['started_at']?->toIso8601String(),
            'started_at_human' => null,
            'playlist_name' => $data['playlist_name'],
            'regions' => array_values($regions),
        ];
    }

    /**
     * Get the last 20 playback logs for a player.
     */
    public function playbackLogs(Player $player): JsonResponse
    {
        $logs = $player->playbackLogs()
            ->with(['media', 'playlist'])
            ->latest('started_at')
            ->take(20)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'media_title' => $log->media?->title,
                'media_type' => $log->media?->type,
                'media_thumbnail_url' => $log->media?->getThumbnailUrl(),
                'playlist_name' => $log->playlist?->name,
                'started_at' => $log->started_at?->setTimezone('America/Sao_Paulo')->format('d/m/Y H:i'),
                'duration_played_seconds' => $log->duration_played_seconds,
                'completed' => $log->completed,
            ]);

        return response()->json(['logs' => $logs]);
    }

    /**
     * Get currently playing media for polling updates.
     */
    public function currentlyPlaying(Player $player): JsonResponse
    {
        return response()->json([
            'currently_playing' => $this->getCurrentlyPlayingData($player),
            'is_online' => $player->isOnline(),
            'last_seen_at' => $player->last_seen_at?->diffForHumans(),
        ]);
    }
}
