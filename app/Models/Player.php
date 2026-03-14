<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use App\Models\Traits\HasTags;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Player extends Model
{
    use BelongsToTenant, HasFactory, HasTags, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'device_id',
        'mac_address',
        'public_ip',
        'geolocation',
        'device_info',
        'api_token',
        'config',
        'downloads_status',
        'last_seen_at',
        'content_synced_at',
        'last_screenshot_url',
        'last_screenshot_at',
        'layout_id',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'device_info' => 'array',
            'geolocation' => 'array',
            'downloads_status' => 'array',
            'last_seen_at' => 'datetime',
            'content_synced_at' => 'datetime',
            'last_screenshot_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Player $player) {
            if (empty($player->api_token)) {
                $player->api_token = Str::random(64);
            }
        });
    }

    /**
     * Get the player's layout.
     */
    public function layout(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Layout::class);
    }

    /**
     * Get the player's region playlist assignments.
     */
    public function regionPlaylists(): HasMany
    {
        return $this->hasMany(PlayerRegionPlaylist::class);
    }

    /**
     * Get the effective layout for this player.
     */
    public function getEffectiveLayout(): ?Layout
    {
        return $this->layout;
    }

    /**
     * Get the effective config for this player.
     */
    public function getEffectiveConfig(): array
    {
        $defaultConfig = self::getDefaultConfig();

        $playerConfig = $this->config ?? [];

        $effectiveConfig = $defaultConfig;

        foreach ($playerConfig as $key => $value) {
            if ($value !== null) {
                if (is_array($value) && isset($effectiveConfig[$key]) && is_array($effectiveConfig[$key])) {
                    $effectiveConfig[$key] = array_merge($effectiveConfig[$key], $value);
                } else {
                    $effectiveConfig[$key] = $value;
                }
            }
        }

        return $effectiveConfig;
    }

    /**
     * Get the default config values for a player.
     */
    public static function getDefaultConfig(): array
    {
        return [
            'orientation' => 'landscape',
            'update_interval_minutes' => 15,
            'volume' => 100,
        ];
    }

    public function heartbeats(): HasMany
    {
        return $this->hasMany(PlayerHeartbeat::class);
    }

    public function playbackLogs(): HasMany
    {
        return $this->hasMany(PlaybackLog::class);
    }

    public function scopeOnline($query, int $minutes = 5)
    {
        return $query->where('last_seen_at', '>=', now()->subMinutes($minutes));
    }

    public function scopeOffline($query, int $minutes = 5)
    {
        return $query->where(function ($q) use ($minutes) {
            $q->whereNull('last_seen_at')
                ->orWhere('last_seen_at', '<', now()->subMinutes($minutes));
        });
    }

    public function isOnline(int $minutes = 5): bool
    {
        return $this->last_seen_at && $this->last_seen_at->gte(now()->subMinutes($minutes));
    }

    public function recordHeartbeat(array $data = []): PlayerHeartbeat
    {
        $this->update(['last_seen_at' => now()]);

        return $this->heartbeats()->create([
            'ip_address' => $data['ip_address'] ?? null,
            'app_version' => $data['app_version'] ?? null,
            'system_info' => $data['system_info'] ?? null,
            'status' => $data['status'] ?? null,
        ]);
    }

    public function regenerateToken(): string
    {
        $this->api_token = Str::random(64);
        $this->save();

        return $this->api_token;
    }

    // ============================================
    // Downloads Status Methods
    // ============================================

    /**
     * Get the list of downloaded media IDs.
     */
    public function getDownloadedMediaIds(): array
    {
        return $this->downloads_status['downloaded_media_ids'] ?? [];
    }

    /**
     * Get the list of pending (not yet downloaded) media IDs.
     */
    public function getPendingMediaIds(): array
    {
        return $this->downloads_status['pending_media_ids'] ?? [];
    }

    /**
     * Get download progress for each media item.
     */
    public function getDownloadProgress(): array
    {
        return $this->downloads_status['download_progress'] ?? [];
    }

    /**
     * Get total downloaded size in MB.
     */
    public function getTotalDownloadedSizeMb(): ?int
    {
        return $this->downloads_status['total_size_mb'] ?? null;
    }

    /**
     * Get when the downloads status was last updated.
     */
    public function getDownloadsUpdatedAt(): ?Carbon
    {
        $timestamp = $this->downloads_status['updated_at'] ?? null;

        return $timestamp ? Carbon::parse($timestamp) : null;
    }

    /**
     * Update the downloads status from heartbeat data.
     */
    public function updateDownloadsStatus(array $data): void
    {
        $this->update([
            'downloads_status' => array_merge($data, [
                'updated_at' => now()->toIso8601String(),
            ]),
        ]);
    }

    // ============================================
    // Currently Playing Methods
    // ============================================

    /**
     * Get information about what media is currently playing on this player.
     * Returns media data, confidence level, and source of information.
     *
     * @return array{media: ?Media, confidence: string, source: string, position: ?int, total_items: ?int, started_at: ?Carbon, playlist_name: ?string}
     */
    public function getCurrentPlayingMedia(): array
    {
        $result = [
            'media' => null,
            'confidence' => 'none',  // 'high', 'medium', 'low', 'none'
            'source' => 'unknown',   // 'heartbeat', 'playback_log', 'estimated', 'unknown'
            'position' => null,      // Position in playlist (1-indexed for display)
            'total_items' => null,   // Total items in playlist
            'started_at' => null,    // When this media started playing
            'playlist_name' => null, // Name of the playlist
        ];

        // Get the main region's playlist from the layout
        $layout = $this->getEffectiveLayout();
        $flattenedMedia = collect();
        if ($layout) {
            $mainRegion = $layout->regions?->first(fn ($r) => $r->is_main);
        }

        // Strategy 1: Player is online - use heartbeat data
        if ($this->isOnline()) {
            $latestHeartbeat = $this->heartbeats()
                ->latest('created_at')
                ->first();

            if ($latestHeartbeat) {
                $currentMediaId = $latestHeartbeat->status['current_media_id'] ?? null;

                if ($currentMediaId) {
                    $media = Media::find($currentMediaId);
                    if ($media) {
                        $result['media'] = $media;
                        $result['confidence'] = 'high';
                        $result['source'] = 'heartbeat';
                        $result['started_at'] = $this->getMediaStartTimeFromLogs($currentMediaId);

                        // Find position in playlist if we have one
                        if ($flattenedMedia->isNotEmpty()) {
                            $position = $this->findMediaPositionInPlaylist($currentMediaId, $flattenedMedia);
                            if ($position !== null) {
                                $result['position'] = $position + 1; // 1-indexed for display
                            }
                        }

                        return $result;
                    }
                }
            }
        }

        // Strategy 2: Player is offline - use latest playback log
        $latestLog = $this->playbackLogs()
            ->with('media')
            ->latest('started_at')
            ->first();

        if ($latestLog && $latestLog->media) {
            $minutesSinceLastSeen = $this->last_seen_at
                ? $this->last_seen_at->diffInMinutes(now())
                : PHP_INT_MAX;

            // If offline for less than 30 minutes, we have medium confidence
            // that the playlist is still running from where it was
            if ($minutesSinceLastSeen < 30) {
                $result['media'] = $latestLog->media;
                $result['confidence'] = 'medium';
                $result['source'] = 'playback_log';
                $result['started_at'] = $latestLog->started_at;

                if ($flattenedMedia->isNotEmpty()) {
                    $position = $this->findMediaPositionInPlaylist($latestLog->media_id, $flattenedMedia);
                    if ($position !== null) {
                        $result['position'] = $position + 1;
                    }
                }

                return $result;
            }

            // If offline for 30min to 2 hours, try to estimate based on playlist loop
            if ($minutesSinceLastSeen < 120 && $flattenedMedia->isNotEmpty()) {
                $estimated = $this->estimateCurrentMedia($latestLog, $flattenedMedia, $minutesSinceLastSeen);
                if ($estimated) {
                    $result['media'] = $estimated['media'];
                    $result['confidence'] = 'low';
                    $result['source'] = 'estimated';
                    $result['position'] = $estimated['position'] + 1;

                    return $result;
                }
            }

            // Offline for too long - just show last known media with low confidence
            if ($minutesSinceLastSeen < 1440) { // Less than 24 hours
                $result['media'] = $latestLog->media;
                $result['confidence'] = 'low';
                $result['source'] = 'playback_log';
                $result['started_at'] = $latestLog->started_at;

                if ($flattenedMedia->isNotEmpty()) {
                    $position = $this->findMediaPositionInPlaylist($latestLog->media_id, $flattenedMedia);
                    if ($position !== null) {
                        $result['position'] = $position + 1;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Get currently playing media for all regions in the active layout.
     * Uses regions_playback from heartbeat when available.
     *
     * @return array<string, array{region_id: string, region_name: string, is_main: bool, media: ?array, playlist_name: ?string}>
     */
    public function getAllRegionsCurrentlyPlaying(): array
    {
        $regions = [];

        // Get the layout
        $layout = $this->getEffectiveLayout();
        if (! $layout) {
            return $regions;
        }

        $layoutRegions = $layout->regions ?? collect();

        if ($layoutRegions->isEmpty()) {
            return $regions;
        }

        // Get regions_playback from heartbeat if available
        $regionsPlayback = [];
        if ($this->isOnline()) {
            $latestHeartbeat = $this->heartbeats()
                ->latest('created_at')
                ->first();

            if ($latestHeartbeat && isset($latestHeartbeat->status['regions_playback'])) {
                foreach ($latestHeartbeat->status['regions_playback'] as $rp) {
                    if (isset($rp['region_id'])) {
                        $regionsPlayback[$rp['region_id']] = $rp;
                    }
                }
            }
        }

        // Build region data
        foreach ($layoutRegions as $region) {
            $mediaId = $regionsPlayback[$region->id]['media_id'] ?? null;
            $media = null;

            if ($mediaId) {
                $mediaModel = Media::find($mediaId);
                if ($mediaModel) {
                    $media = [
                        'id' => $mediaModel->id,
                        'title' => $mediaModel->title,
                        'type' => $mediaModel->type,
                        'url' => $mediaModel->getPublicUrl(),
                        'thumbnail_url' => $mediaModel->getThumbnailUrl(),
                        'duration_seconds' => $mediaModel->duration_seconds,
                        'duration_formatted' => $mediaModel->getFormattedDuration(),
                    ];
                }
            }

            $regions[$region->id] = [
                'region_id' => $region->id,
                'region_name' => $region->name,
                'is_main' => $region->is_main,
                'media' => $media,
                'playlist_name' => null,
            ];
        }

        return $regions;
    }

    /**
     * Find the position of a media item in the flattened playlist.
     */
    protected function findMediaPositionInPlaylist(string $mediaId, $flattenedMedia): ?int
    {
        foreach ($flattenedMedia as $index => $item) {
            if ($item['media']->id === $mediaId) {
                return $index;
            }
        }

        return null;
    }

    /**
     * Get the start time of a media from playback logs.
     */
    protected function getMediaStartTimeFromLogs(string $mediaId): ?Carbon
    {
        $log = $this->playbackLogs()
            ->where('media_id', $mediaId)
            ->latest('started_at')
            ->first();

        return $log?->started_at;
    }

    /**
     * Estimate which media should be playing based on playlist loop calculation.
     */
    protected function estimateCurrentMedia($lastLog, $flattenedMedia, int $minutesSinceLastSeen): ?array
    {
        // Find position of last known media
        $lastPosition = null;
        foreach ($flattenedMedia as $index => $item) {
            if ($item['media']->id === $lastLog->media_id) {
                $lastPosition = $index;
                break;
            }
        }

        if ($lastPosition === null) {
            return null;
        }

        // Calculate total playlist duration
        $totalDuration = 0;
        $durations = [];
        foreach ($flattenedMedia as $item) {
            $media = $item['media'];
            $duration = $item['duration_override']
                ?? $media->duration_seconds
                ?? ($media->type === 'image' ? 10 : 30);
            $durations[] = $duration;
            $totalDuration += $duration;
        }

        if ($totalDuration === 0) {
            return null;
        }

        // Calculate time elapsed since last log
        $secondsSinceLog = $lastLog->started_at
            ? $lastLog->started_at->diffInSeconds(now())
            : $minutesSinceLastSeen * 60;

        // Calculate how many seconds into the playlist we should be
        // Starting from where the last media started
        $playlistPositionSeconds = 0;
        for ($i = 0; $i < $lastPosition; $i++) {
            $playlistPositionSeconds += $durations[$i];
        }

        // Add the time elapsed
        $currentPositionSeconds = ($playlistPositionSeconds + $secondsSinceLog) % $totalDuration;

        // Find which media this corresponds to
        $accumulatedDuration = 0;
        foreach ($flattenedMedia as $index => $item) {
            $accumulatedDuration += $durations[$index];
            if ($accumulatedDuration > $currentPositionSeconds) {
                return [
                    'media' => $item['media'],
                    'position' => $index,
                ];
            }
        }

        // Fallback to first item
        return [
            'media' => $flattenedMedia->first()['media'],
            'position' => 0,
        ];
    }

    /**
     * Check if the player is outdated (hasn't synced latest playlist changes).
     */
    public function isOutdated(): bool
    {
        // Get the max content_updated_at from all playlists assigned to this player
        $maxPlaylistUpdate = $this->regionPlaylists()
            ->join('playlists', 'player_region_playlists.playlist_id', '=', 'playlists.id')
            ->max('playlists.content_updated_at');

        // If no playlists assigned or no content_updated_at, not outdated
        if (! $maxPlaylistUpdate) {
            return false;
        }

        // If player has never synced but has playlists, it's outdated
        if (! $this->content_synced_at) {
            return true;
        }

        return Carbon::parse($maxPlaylistUpdate)->gt($this->content_synced_at);
    }
}
