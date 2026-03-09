<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\PendingPlayerActivation;
use App\Models\Player;
use App\Models\Playlist;
use App\Models\SystemEvent;
use App\Services\PlaylistService;
use App\Services\WebSocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PlayerActivationController extends Controller
{
    /**
     * Request a new activation code (TV calls this on startup)
     */
    public function requestActivation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_id' => ['nullable', 'string', 'max:255'],
            'device_info' => ['nullable', 'array'],
        ]);

        $activation = PendingPlayerActivation::createForDevice(
            $validated['device_id'] ?? null,
            $validated['device_info'] ?? null
        );

        return response()->json([
            'activation_code' => $activation->activation_code,
            'expires_at' => $activation->expires_at->toIso8601String(),
        ]);
    }

    /**
     * Check if activation code has been claimed (TV polls this)
     */
    public function checkActivation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activation_code' => ['required', 'string', 'size:7'],
        ]);

        $activation = PendingPlayerActivation::findByCode($validated['activation_code']);

        if (! $activation) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Activation code not found or expired',
            ], 404);
        }

        if ($activation->isExpired()) {
            return response()->json([
                'status' => 'expired',
                'message' => 'Activation code has expired',
            ], 410);
        }

        if (! $activation->isClaimed()) {
            return response()->json([
                'status' => 'pending',
                'message' => 'Waiting for admin to enter the code',
            ]);
        }

        // Activation is claimed - return token to device
        $activation->markActivated();

        $webSocketService = app(WebSocketService::class);

        return response()->json([
            'status' => 'activated',
            'api_token' => $activation->api_token,
            'player_id' => $activation->player_id,
            // WebSocket config for real-time communication
            'websocket' => $webSocketService->getConfig(),
        ]);
    }

    /**
     * Get the current playlist for the player.
     *
     * Supports two modes:
     * 1. Layout mode: Returns layout with multiple regions, each with its own playlist
     * 2. Legacy mode: Returns single playlist (backward compatible)
     *
     * Response includes:
     * - server_time: Current server timestamp in milliseconds (for time sync)
     * - splash_screen_url: Tenant's splash screen to show when playlist is empty
     * - layout: Layout configuration with regions (null for legacy mode)
     * - playlist: Single playlist for legacy mode (null when using layout)
     */
    public function playlist(Request $request, PlaylistService $playlistService, WebSocketService $webSocketService): JsonResponse
    {
        /** @var Player $player */
        $player = $request->player;

        // Capture public IP from this HTTP request and save directly to player
        // This is needed because WebSocket heartbeats only have the local IP
        $publicIp = $request->ip();
        if ($publicIp && ! $this->isPrivateIp($publicIp)) {
            // Fetch geolocation if IP changed OR if geolocation is missing
            $needsGeolocation = $player->public_ip !== $publicIp || empty($player->geolocation);

            if ($needsGeolocation) {
                $geolocation = $this->fetchGeolocation($publicIp);
                $player->update([
                    'public_ip' => $publicIp,
                    'geolocation' => $geolocation,
                ]);
            }

            // Also update latest heartbeat for backward compatibility
            $latestHeartbeat = $player->heartbeats()->latest('created_at')->first();
            if ($latestHeartbeat && $latestHeartbeat->ip_address !== $publicIp) {
                $latestHeartbeat->update(['ip_address' => $publicIp]);
            }
        }

        // Load tenant for splash screen URL
        $tenant = $player->tenant;
        $splashScreenUrl = $tenant?->getSplashUrl();

        // WebSocket config for real-time communication (allows existing players to update config)
        $webSocketConfig = $webSocketService->getConfig();

        // Get player's assigned layout
        $layout = $player->getEffectiveLayout();

        if ($layout) {
            return $this->buildLegacyLayoutResponse($player, $layout, $playlistService, $splashScreenUrl, $webSocketConfig, $request);
        }

        // No layout assigned
        return $this->buildLegacyPlaylistResponse($player, $playlistService, $splashScreenUrl, $webSocketConfig, $request);
    }

    /**
     * Build response with layout and region playlists.
     */
    private function buildLegacyLayoutResponse(
        Player $player,
        \App\Models\Layout $layout,
        PlaylistService $playlistService,
        ?string $splashScreenUrl,
        array $webSocketConfig,
        Request $request
    ): JsonResponse {
        // Load regions
        $layout->load('regions');

        $regionsData = $layout->regions->map(function ($region) use ($player, $playlistService) {
            $regionPlaylist = $player->regionPlaylists()
                ->where('layout_region_id', $region->id)
                ->with('playlist')
                ->first();
            $playlist = $regionPlaylist?->playlist;

            $playlistData = null;
            if ($playlist) {
                // Load playlist items
                $playlist->load([
                    'activeItems.media',
                    'activeItems.widget.currentMedia',
                    'activeItems.childPlaylist.activeItems.media',
                    'activeItems.childPlaylist.activeItems.widget.currentMedia',
                ]);

                $playlistData = [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                    'items' => $playlistService->getAllItemsForPlayer($playlist),
                ];
            }

            return [
                'id' => $region->id,
                'name' => $region->name,
                'x_percent' => (float) $region->x_percent,
                'y_percent' => (float) $region->y_percent,
                'width_percent' => (float) $region->width_percent,
                'height_percent' => (float) $region->height_percent,
                'is_main' => $region->is_main,
                'scale_type' => 'aspect', // Default for legacy layouts
                'playlist' => $playlistData,
            ];
        });

        $config = $player->getEffectiveConfig();

        return response()->json([
            'server_time' => now()->getTimestampMs(),
            'show_toast' => $request->input('show_toast', false),
            'splash_screen_url' => $splashScreenUrl,
            'config' => $config,
            // Operating hours status (new system)

            // Backwards compatibility

            'kiosk_settings' => $player->tenant?->getKioskSettings(),
            'layout' => [
                'id' => $layout->id,
                'name' => $layout->name,
                'orientation' => $layout->orientation,
                'regions_overlay' => false,
                'regions' => $regionsData,
            ],
            'playlist' => null, // Null when using layout
            // WebSocket config for real-time commands (allows existing players to update config)
            'websocket' => $webSocketConfig,
        ]);
    }

    /**
     * Build response when no layout is configured.
     * Returns empty response with splash screen.
     */
    private function buildLegacyPlaylistResponse(
        Player $player,
        PlaylistService $playlistService,
        ?string $splashScreenUrl,
        array $webSocketConfig,
        Request $request
    ): JsonResponse {
        $config = $player->getEffectiveConfig();

        return response()->json([
            'server_time' => now()->getTimestampMs(),
            'splash_screen_url' => $splashScreenUrl,
            'config' => $config,
            // Operating hours status (new system)

            // Backwards compatibility

            'kiosk_settings' => $player->tenant?->getKioskSettings(),
            'layout' => null,
            'playlist' => null,
            'message' => 'No layout or playlist assigned',
            // WebSocket config for real-time commands (allows existing players to update config)
            'websocket' => $webSocketConfig,
        ]);
    }

    /**
     * Record player heartbeat
     *
     * Response includes server_time for time synchronization.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        /** @var Player $player */
        $player = $request->player;

        $validated = $request->validate([
            'ip_address' => ['nullable', 'ip'],
            'app_version' => ['nullable', 'string', 'max:50'],
            'system_info' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'max:50'],
            'current_media_id' => ['nullable', 'uuid'],
            // Multi-region playback info
            'regions_playback' => ['nullable', 'array'],
            'regions_playback.*.region_id' => ['required_with:regions_playback', 'uuid'],
            'regions_playback.*.region_name' => ['nullable', 'string'],
            'regions_playback.*.media_id' => ['nullable', 'uuid'],
            'regions_playback.*.is_main' => ['nullable', 'boolean'],
            // Downloads status from Android app
            'downloads_status' => ['nullable', 'array'],
            'downloads_status.downloaded_media_ids' => ['nullable', 'array'],
            'downloads_status.downloaded_media_ids.*' => ['uuid'],
            'downloads_status.pending_media_ids' => ['nullable', 'array'],
            'downloads_status.pending_media_ids.*' => ['uuid'],
            'downloads_status.download_progress' => ['nullable', 'array'],
            'downloads_status.total_size_mb' => ['nullable', 'integer'],
        ]);

        // Use the server-seen IP (public IP) - this is the real public IP as seen by the server
        // The app may report its local IP which is not useful for geolocation
        $publicIp = $request->ip();
        $localIp = $validated['ip_address'] ?? null;

        // Merge local IP into system_info for debugging if different from public
        $systemInfo = $validated['system_info'] ?? [];
        if ($localIp && $localIp !== $publicIp) {
            $systemInfo['local_ip'] = $localIp;
        }

        // Get previous heartbeat to detect changes
        $previousHeartbeat = $player->heartbeats()->latest('created_at')->first();
        $previousMediaId = $previousHeartbeat?->status['current_media_id'] ?? null;
        $previousRegionsPlayback = $previousHeartbeat?->status['regions_playback'] ?? null;

        // Build status as array with current_media_id and regions_playback for better tracking
        $newMediaId = $validated['current_media_id'] ?? null;
        $regionsPlayback = $validated['regions_playback'] ?? null;
        $statusData = [
            'state' => $validated['status'] ?? 'unknown',
            'current_media_id' => $newMediaId,
            'regions_playback' => $regionsPlayback,
        ];

        $player->recordHeartbeat([
            'ip_address' => $publicIp,
            'app_version' => $validated['app_version'] ?? null,
            'system_info' => $systemInfo,
            'status' => $statusData,
        ]);

        // Check if any media changed (main region or any other region)
        $mainMediaChanged = $newMediaId !== $previousMediaId;
        $regionsChanged = $this->hasRegionsPlaybackChanged($previousRegionsPlayback, $regionsPlayback);

        // Broadcast if any media changed (real-time update to admin panel)
        if ($mainMediaChanged || $regionsChanged) {
            $media = $newMediaId ? \App\Models\Media::find($newMediaId) : null;
            event(new \App\Events\PlayerMediaChanged(
                player: $player,
                media: $media,
                startedAt: now()->toDateTimeString(),
            ));
        }

        // Update device info if provided in system_info
        $systemInfo = $validated['system_info'] ?? [];
        if (! empty($systemInfo)) {
            $updateData = [];

            // Update mac_address if provided and not already set
            if (! empty($systemInfo['mac_address']) && empty($player->mac_address)) {
                $updateData['mac_address'] = $systemInfo['mac_address'];
            }

            // Update device_id if provided and not already set
            if (! empty($systemInfo['device_id']) && empty($player->device_id)) {
                $updateData['device_id'] = $systemInfo['device_id'];
            }

            if (! empty($updateData)) {
                $player->update($updateData);
            }
        }

        // Update downloads status if provided
        if (isset($validated['downloads_status'])) {
            $player->updateDownloadsStatus($validated['downloads_status']);
        }

        return response()->json([
            'success' => true,
            'server_time' => now()->getTimestampMs(),
        ]);
    }

    /**
     * Log playback events (batch)
     */
    public function log(Request $request): JsonResponse
    {
        /** @var Player $player */
        $player = $request->player;

        $validated = $request->validate([
            'logs' => ['required', 'array', 'max:100'],
            'logs.*.media_id' => ['required', 'uuid'],
            'logs.*.playlist_id' => ['nullable', 'uuid'],
            'logs.*.started_at' => ['required', 'date'],
            'logs.*.ended_at' => ['nullable', 'date'],
            'logs.*.duration_seconds' => ['nullable', 'integer', 'min:0'],
            'logs.*.completed' => ['nullable', 'boolean'],
            // Proof of Play metadata (12 campos extras)
            'logs.*.metadata' => ['nullable', 'array'],
            'logs.*.metadata.device_id' => ['nullable', 'string', 'max:100'],
            'logs.*.metadata.content_type' => ['nullable', 'string', 'in:video,image'],
            'logs.*.metadata.content_title' => ['nullable', 'string', 'max:255'],
            'logs.*.metadata.playback_source' => ['nullable', 'string', 'in:online,cache,offline'],
            'logs.*.metadata.region_id' => ['nullable', 'uuid'],
            'logs.*.metadata.layout_id' => ['nullable', 'uuid'],
            'logs.*.metadata.screen_width' => ['nullable', 'integer', 'min:0'],
            'logs.*.metadata.screen_height' => ['nullable', 'integer', 'min:0'],
            'logs.*.metadata.network_type' => ['nullable', 'string', 'max:50'],
            'logs.*.metadata.app_version' => ['nullable', 'string', 'max:50'],
            'logs.*.metadata.error_code' => ['nullable', 'string', 'max:100'],
            'logs.*.metadata.error_message' => ['nullable', 'string', 'max:500'],
        ]);

        // Get all media IDs from logs and check which ones exist
        $mediaIds = collect($validated['logs'])->pluck('media_id')->unique()->toArray();
        $existingMediaIds = Media::withoutGlobalScope('tenant')
            ->whereIn('id', $mediaIds)
            ->pluck('id')
            ->toArray();

        $logged = 0;
        foreach ($validated['logs'] as $log) {
            // Skip logs for media that no longer exists (may have been deleted)
            if (! in_array($log['media_id'], $existingMediaIds)) {
                continue;
            }

            $player->playbackLogs()->create([
                'tenant_id' => $player->tenant_id,
                'media_id' => $log['media_id'],
                'playlist_id' => $log['playlist_id'] ?? null,
                'started_at' => $log['started_at'],
                'ended_at' => $log['ended_at'] ?? null,
                'duration_played_seconds' => $log['duration_seconds'] ?? null,
                'completed' => $log['completed'] ?? false,
                'metadata' => $log['metadata'] ?? null, // Proof of Play extra data
            ]);
            $logged++;
        }

        return response()->json(['success' => true, 'logged' => $logged]);
    }

    /**
     * Log system events (batch)
     * Records boot, crash, errors, network changes, etc.
     */
    public function events(Request $request): JsonResponse
    {
        /** @var Player $player */
        $player = $request->player;

        $validated = $request->validate([
            'events' => ['required', 'array', 'max:100'],
            'events.*.event_type' => ['required', 'string', 'max:50'],
            'events.*.severity' => ['required', 'string', 'in:debug,info,warning,error,critical'],
            'events.*.message' => ['required', 'string', 'max:1000'],
            'events.*.timestamp' => ['required', 'date'],
            // Error details
            'events.*.error_code' => ['nullable', 'string', 'max:100'],
            'events.*.error_class' => ['nullable', 'string', 'max:255'],
            'events.*.stack_trace' => ['nullable', 'string', 'max:10000'],
            // Context
            'events.*.component' => ['nullable', 'string', 'max:100'],
            'events.*.action' => ['nullable', 'string', 'max:255'],
            'events.*.media_id' => ['nullable', 'uuid'],
            'events.*.playlist_id' => ['nullable', 'uuid'],
            // Device info
            'events.*.device_id' => ['nullable', 'string', 'max:100'],
            'events.*.app_version' => ['nullable', 'string', 'max:50'],
            'events.*.network_type' => ['nullable', 'string', 'max:20'],
            'events.*.memory_free_mb' => ['nullable', 'integer', 'min:0'],
            'events.*.storage_free_mb' => ['nullable', 'integer', 'min:0'],
            // Extra data
            'events.*.extra_data' => ['nullable', 'array'],
        ]);

        $logged = 0;
        foreach ($validated['events'] as $event) {
            // Validate media_id exists if provided
            $mediaId = $event['media_id'] ?? null;
            if ($mediaId) {
                $exists = Media::withoutGlobalScope('tenant')->where('id', $mediaId)->exists();
                if (! $exists) {
                    $mediaId = null;
                }
            }

            // Validate playlist_id exists if provided
            $playlistId = $event['playlist_id'] ?? null;
            if ($playlistId) {
                $exists = Playlist::withoutGlobalScope('tenant')->where('id', $playlistId)->exists();
                if (! $exists) {
                    $playlistId = null;
                }
            }

            SystemEvent::create([
                'tenant_id' => $player->tenant_id,
                'player_id' => $player->id,
                'event_type' => $event['event_type'],
                'severity' => $event['severity'],
                'message' => $event['message'],
                'error_code' => $event['error_code'] ?? null,
                'error_class' => $event['error_class'] ?? null,
                'stack_trace' => $event['stack_trace'] ?? null,
                'component' => $event['component'] ?? null,
                'action' => $event['action'] ?? null,
                'media_id' => $mediaId,
                'playlist_id' => $playlistId,
                'device_id' => $event['device_id'] ?? null,
                'app_version' => $event['app_version'] ?? null,
                'network_type' => $event['network_type'] ?? null,
                'memory_free_mb' => $event['memory_free_mb'] ?? null,
                'storage_free_mb' => $event['storage_free_mb'] ?? null,
                'extra_data' => $event['extra_data'] ?? null,
                'event_timestamp' => $event['timestamp'],
            ]);
            $logged++;
        }

        return response()->json(['success' => true, 'logged' => $logged]);
    }

    /**
     * Upload screenshot from player.
     * Called when player captures and sends a screenshot.
     */
    public function uploadScreenshot(Request $request): JsonResponse
    {
        /** @var Player $player */
        $player = $request->player;

        $validated = $request->validate([
            'image' => ['required', 'string'], // base64 encoded JPEG
        ]);

        // Decode base64 image
        $imageData = base64_decode($validated['image']);

        if ($imageData === false) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid base64 image data',
            ], 422);
        }

        // Generate filename
        $filename = "screenshots/{$player->tenant_id}/{$player->id}/".now()->format('Y-m-d_H-i-s').'.jpg';

        // Store in S3
        Storage::disk('s3')->put($filename, $imageData, 'public');
        $url = Storage::disk('s3')->url($filename);

        // Update player with last screenshot
        $player->update([
            'last_screenshot_url' => $url,
            'last_screenshot_at' => now(),
        ]);

        // Broadcast to admin panel
        event(new \App\Events\PlayerScreenshotReady($player, $url));

        Log::info('Player screenshot uploaded', [
            'player_id' => $player->id,
            'url' => $url,
        ]);

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }

    /**
     * Fetch geolocation data for an IP address.
     */
    private function fetchGeolocation(string $ip): ?array
    {
        try {
            $response = Http::timeout(5)->get("https://ipwho.is/{$ip}");

            if ($response->successful() && $response->json('success') === true) {
                $data = $response->json();

                return [
                    'city' => $data['city'] ?? null,
                    'region' => $data['region'] ?? null,
                    'country' => $data['country'] ?? null,
                    'country_code' => $data['country_code'] ?? null,
                    'isp' => $data['connection']['isp'] ?? null,
                    'lat' => $data['latitude'] ?? null,
                    'lon' => $data['longitude'] ?? null,
                    'timezone' => $data['timezone']['id'] ?? null,
                ];
            }
        } catch (\Exception $e) {
            Log::warning('Failed to fetch geolocation', [
                'ip' => $ip,
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Check if an IP address is private/local.
     */
    private function isPrivateIp(string $ip): bool
    {
        return str_starts_with($ip, '192.168.') ||
               str_starts_with($ip, '10.') ||
               str_starts_with($ip, '172.16.') ||
               str_starts_with($ip, '172.17.') ||
               str_starts_with($ip, '172.18.') ||
               str_starts_with($ip, '172.19.') ||
               str_starts_with($ip, '172.2') ||
               str_starts_with($ip, '172.30.') ||
               str_starts_with($ip, '172.31.') ||
               $ip === '127.0.0.1' ||
               $ip === 'localhost';
    }

    /**
     * Check if regions playback has changed.
     * Compares media_id of each region.
     */
    private function hasRegionsPlaybackChanged(?array $previous, ?array $current): bool
    {
        // If both are null/empty, no change
        if (empty($previous) && empty($current)) {
            return false;
        }

        // If one is empty and other isn't, changed
        if (empty($previous) || empty($current)) {
            return true;
        }

        // Build maps of region_id => media_id for comparison
        $previousMap = [];
        foreach ($previous as $region) {
            $regionId = $region['region_id'] ?? null;
            if ($regionId) {
                $previousMap[$regionId] = $region['media_id'] ?? null;
            }
        }

        $currentMap = [];
        foreach ($current as $region) {
            $regionId = $region['region_id'] ?? null;
            if ($regionId) {
                $currentMap[$regionId] = $region['media_id'] ?? null;
            }
        }

        // Compare the maps
        return $previousMap !== $currentMap;
    }
}
