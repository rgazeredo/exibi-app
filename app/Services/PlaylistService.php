<?php

namespace App\Services;

use App\Models\Playlist;
use App\Models\PlaylistItem;
use App\Support\TimezoneHelper;
use Illuminate\Support\Collection;

class PlaylistService
{
    /**
     * Validate that a playlist can be added as a sub-playlist.
     * Rules:
     * 1. Cannot add itself
     * 2. Child cannot already have sub-playlists (1 level limit)
     * 3. Must be same tenant
     * 4. Cannot create circular reference
     */
    public function validateNesting(Playlist $parent, Playlist $child): array
    {
        $errors = [];

        // Cannot add itself
        if ($parent->id === $child->id) {
            $errors[] = 'Uma playlist não pode conter ela mesma.';
        }

        // Child cannot have sub-playlists (1 level limit)
        if ($child->hasSubPlaylists()) {
            $errors[] = 'A playlist selecionada já contém outras playlists. Limite de 1 nível de aninhamento.';
        }

        // Parent cannot be used as a child elsewhere (would violate 1 level limit)
        if (! $parent->canContainSubPlaylists()) {
            $errors[] = 'Esta playlist já é usada como sub-playlist em outra. Não pode conter sub-playlists.';
        }

        // Same tenant
        if ($parent->tenant_id !== $child->tenant_id) {
            $errors[] = 'A playlist deve pertencer ao mesmo tenant.';
        }

        // Check for circular reference (parent is already a child of the child)
        if ($this->wouldCreateCircularReference($parent, $child)) {
            $errors[] = 'Isso criaria uma referência circular.';
        }

        return $errors;
    }

    /**
     * Check if adding child to parent would create a circular reference.
     */
    protected function wouldCreateCircularReference(Playlist $parent, Playlist $child): bool
    {
        // Check if parent is already contained in child (as a sub-playlist)
        return PlaylistItem::where('playlist_id', $child->id)
            ->where('item_type', 'playlist')
            ->where('item_id', $parent->id)
            ->exists();
    }

    /**
     * Get flattened playlist for player API.
     * Returns array of media items with metadata.
     * Items outside their scheduled period are filtered out by Playlist::getFlattenedMedia().
     *
     * @deprecated Use getAllItemsForPlayer() instead - player should handle scheduling
     */
    public function getFlattenedPlaylist(Playlist $playlist): array
    {
        $flattenedMedia = $playlist->getFlattenedMedia();

        return $flattenedMedia->map(function ($item) {
            $media = $item['media'];

            return [
                'id' => $media->id,
                'type' => $media->type,
                'title' => $media->title,
                'url' => $media->getOptimizedUrl(),
                'thumbnail_url' => $media->getThumbnailUrl(),
                'duration_seconds' => $item['duration_override'] ?? $media->duration_seconds,
                'width' => $media->width,
                'height' => $media->height,
                'size_bytes' => $media->size_bytes,
                'sha256_hash' => $media->sha256_hash,
                'source' => $item['source'],
                'source_playlist_id' => $item['source_playlist_id'] ?? null,
                'source_widget_id' => $item['source_widget_id'] ?? null,
                'starts_at' => $item['starts_at'] ?? null,
                'ends_at' => $item['ends_at'] ?? null,
            ];
        })->values()->toArray();
    }

    /**
     * Get all playlist items for player API with full schedule info.
     * Does NOT filter by schedule - player handles scheduling based on server_time.
     * Returns all active items with their schedule configuration.
     *
     * Playback modes:
     * - sequential: items from sub-playlists are expanded in order
     * - interleaved: items from sub-playlists are interleaved (1 from each, round-robin)
     * - auto: proportional distribution based on group sizes
     * - random: sequential order but shuffled
     */
    public function getAllItemsForPlayer(Playlist $playlist): array
    {
        // Load all active items without schedule filtering
        $playlist->load([
            'activeItems.media',
            'activeItems.widget.currentMedia',
            'activeItems.childPlaylist.activeItems.media',
            'activeItems.childPlaylist.activeItems.widget.currentMedia',
        ]);

        return $this->buildSequentialItems($playlist);
    }

    /**
     * Shuffle items array (for random mode).
     */
    private function shuffleItems(array $items): array
    {
        shuffle($items);

        return $items;
    }

    /**
     * Build items in sequential order (default behavior).
     */
    private function buildSequentialItems(Playlist $playlist): array
    {
        $result = [];

        foreach ($playlist->activeItems as $item) {
            if ($item->isMedia() && $item->media) {
                $result[] = $this->buildPlayerItem($item, $item->media, 'direct');
            } elseif ($item->isWidget() && $item->widget && $item->widget->currentMedia) {
                $result[] = $this->buildPlayerItem($item, $item->widget->currentMedia, 'widget', null, $item->widget->id);
            } elseif ($item->isPlaylist() && $item->childPlaylist) {
                // Expand sub-playlist items
                foreach ($item->childPlaylist->activeItems as $subItem) {
                    if ($subItem->isMedia() && $subItem->media) {
                        // Sub-item inherits parent schedule if it doesn't have its own
                        $result[] = $this->buildPlayerItem(
                            $subItem,
                            $subItem->media,
                            'playlist',
                            $item->childPlaylist->id,
                            null,
                            $item // parent item for schedule inheritance
                        );
                    } elseif ($subItem->isWidget() && $subItem->widget && $subItem->widget->currentMedia) {
                        $result[] = $this->buildPlayerItem(
                            $subItem,
                            $subItem->widget->currentMedia,
                            'widget',
                            $item->childPlaylist->id,
                            $subItem->widget->id,
                            $item
                        );
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Build items in interleaved order (round-robin from sub-playlists).
     * Direct media/widgets are added first, then sub-playlist items are interleaved.
     */
    private function buildInterleavedItems(Playlist $playlist): array
    {
        $result = [];
        $subPlaylistItems = []; // Array of arrays: [[items from playlist 1], [items from playlist 2], ...]

        // First pass: collect direct items and prepare sub-playlist item arrays
        foreach ($playlist->activeItems as $item) {
            if ($item->isMedia() && $item->media) {
                $result[] = $this->buildPlayerItem($item, $item->media, 'direct');
            } elseif ($item->isWidget() && $item->widget && $item->widget->currentMedia) {
                $result[] = $this->buildPlayerItem($item, $item->widget->currentMedia, 'widget', null, $item->widget->id);
            } elseif ($item->isPlaylist() && $item->childPlaylist) {
                // Collect sub-playlist items for interleaving
                $playlistItems = [];
                foreach ($item->childPlaylist->activeItems as $subItem) {
                    if ($subItem->isMedia() && $subItem->media) {
                        $playlistItems[] = $this->buildPlayerItem(
                            $subItem,
                            $subItem->media,
                            'playlist',
                            $item->childPlaylist->id,
                            null,
                            $item
                        );
                    } elseif ($subItem->isWidget() && $subItem->widget && $subItem->widget->currentMedia) {
                        $playlistItems[] = $this->buildPlayerItem(
                            $subItem,
                            $subItem->widget->currentMedia,
                            'widget',
                            $item->childPlaylist->id,
                            $subItem->widget->id,
                            $item
                        );
                    }
                }
                if (! empty($playlistItems)) {
                    $subPlaylistItems[] = $playlistItems;
                }
            }
        }

        // Interleave sub-playlist items (round-robin)
        if (! empty($subPlaylistItems)) {
            $maxItems = max(array_map('count', $subPlaylistItems));
            for ($i = 0; $i < $maxItems; $i++) {
                foreach ($subPlaylistItems as $playlistItems) {
                    if (isset($playlistItems[$i])) {
                        $result[] = $playlistItems[$i];
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Build items in proportional order (auto mode).
     * Items from larger sub-playlists appear more frequently.
     *
     * Example: Groups with 6, 4, and 2 items become proportions 3:2:1
     * Result: A1,A2,A3,B1,B2,C1,A4,A5,A6,B3,B4,C2
     */
    private function buildProportionalItems(Playlist $playlist): array
    {
        $result = [];
        $groups = []; // Array of arrays: [[items from group 1], [items from group 2], ...]

        // Collect all groups (direct items as single-item groups, sub-playlists as multi-item groups)
        foreach ($playlist->activeItems as $item) {
            if ($item->isMedia() && $item->media) {
                $groups[] = [$this->buildPlayerItem($item, $item->media, 'direct')];
            } elseif ($item->isWidget() && $item->widget && $item->widget->currentMedia) {
                $groups[] = [$this->buildPlayerItem($item, $item->widget->currentMedia, 'widget', null, $item->widget->id)];
            } elseif ($item->isPlaylist() && $item->childPlaylist) {
                $playlistItems = [];
                foreach ($item->childPlaylist->activeItems as $subItem) {
                    if ($subItem->isMedia() && $subItem->media) {
                        $playlistItems[] = $this->buildPlayerItem(
                            $subItem,
                            $subItem->media,
                            'playlist',
                            $item->childPlaylist->id,
                            null,
                            $item
                        );
                    } elseif ($subItem->isWidget() && $subItem->widget && $subItem->widget->currentMedia) {
                        $playlistItems[] = $this->buildPlayerItem(
                            $subItem,
                            $subItem->widget->currentMedia,
                            'widget',
                            $item->childPlaylist->id,
                            $subItem->widget->id,
                            $item
                        );
                    }
                }
                if (! empty($playlistItems)) {
                    $groups[] = $playlistItems;
                }
            }
        }

        if (empty($groups)) {
            return $result;
        }

        // If only one group, return it directly
        if (count($groups) === 1) {
            return $groups[0];
        }

        // Calculate proportions based on group sizes
        $sizes = array_map('count', $groups);
        $minSize = max(1, min($sizes));

        $proportions = [];
        foreach ($sizes as $index => $size) {
            $proportions[$index] = max(1, (int) round($size / $minSize));
        }

        // Build result using proportional distribution
        $indexes = array_fill(0, count($groups), 0);
        $totalItems = array_sum($sizes);
        $addedItems = 0;

        while ($addedItems < $totalItems) {
            foreach ($groups as $groupIndex => $group) {
                $itemsToAdd = $proportions[$groupIndex];

                for ($i = 0; $i < $itemsToAdd; $i++) {
                    $itemIndex = $indexes[$groupIndex];
                    if (isset($group[$itemIndex])) {
                        $result[] = $group[$itemIndex];
                        $indexes[$groupIndex]++;
                        $addedItems++;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Build a single item for the player API response.
     */
    private function buildPlayerItem(
        \App\Models\PlaylistItem $item,
        \App\Models\Media $media,
        string $source,
        ?string $sourcePlaylistId = null,
        ?string $sourceWidgetId = null,
        ?\App\Models\PlaylistItem $parentItem = null
    ): array {
        // Use parent's schedule if item doesn't have its own and parent has priority
        $scheduleMode = $item->schedule_mode ?? 'always';
        $startsAt = $item->starts_at;
        $endsAt = $item->ends_at;
        $priorityOrder = $item->priority_order;

        // Inherit from parent if needed
        if ($parentItem && $scheduleMode === 'always' && $parentItem->schedule_mode !== 'always') {
            $scheduleMode = $parentItem->schedule_mode;
            $startsAt = $startsAt ?? $parentItem->starts_at;
            $endsAt = $endsAt ?? $parentItem->ends_at;
            $priorityOrder = $priorityOrder ?? $parentItem->priority_order;
        }

        // Get schedule_type and day_schedules from item or parent
        $scheduleType = $item->schedule_type ?? 'always';
        $daySchedules = $item->day_schedules;

        // Inherit from parent if needed
        if ($parentItem && $scheduleType === 'always' && ($parentItem->schedule_type ?? 'always') !== 'always') {
            $scheduleType = $parentItem->schedule_type;
            $daySchedules = $daySchedules ?? $parentItem->day_schedules;
        }

        // Convert day_schedules dates to timestamps for player
        $daySchedulesForPlayer = null;
        if ($daySchedules && ! empty($daySchedules)) {
            $daySchedulesForPlayer = array_map(function ($slot) {
                return [
                    'days' => $slot['days'] ?? [],
                    'time_start' => $slot['time_start'] ?? null,
                    'time_end' => $slot['time_end'] ?? null,
                    'starts_at' => ! empty($slot['starts_at'])
                        ? \Carbon\Carbon::parse($slot['starts_at'])->getTimestampMs()
                        : null,
                    'ends_at' => ! empty($slot['ends_at'])
                        ? \Carbon\Carbon::parse($slot['ends_at'])->getTimestampMs()
                        : null,
                ];
            }, $daySchedules);
        }

        return [
            'id' => $media->id,
            'item_id' => $item->id, // PlaylistItem ID for tracking
            'type' => $media->type,
            'title' => $media->title,
            'url' => $media->getOptimizedUrl(),
            'thumbnail_url' => $media->getThumbnailUrl(),
            'duration_seconds' => $item->duration_override ?? $media->duration_seconds ?? 10,
            'width' => $media->width,
            'height' => $media->height,
            'size_bytes' => $media->size_bytes,
            'sha256_hash' => $media->sha256_hash,
            'source' => $source,
            'source_playlist_id' => $sourcePlaylistId,
            'source_widget_id' => $sourceWidgetId,
            'position' => $item->position,
            // Schedule info for player-side filtering
            'schedule_type' => $scheduleType,
            'schedule_mode' => $scheduleMode,
            'priority_order' => $priorityOrder,
            'starts_at' => $startsAt?->getTimestampMs(),
            'ends_at' => $endsAt?->getTimestampMs(),
            'day_schedules' => $daySchedulesForPlayer,
        ];
    }

    /**
     * Get available playlists that can be added as sub-playlists.
     * Excludes:
     * - The parent playlist itself
     * - Playlists that already have sub-playlists
     * - Playlists from different tenants
     * - Playlists that would create circular references
     */
    public function getAvailableSubPlaylists(Playlist $parent): Collection
    {
        return Playlist::where('tenant_id', $parent->tenant_id)
            ->where('id', '!=', $parent->id)
            ->where('is_active', true)
            ->get()
            ->filter(function ($playlist) use ($parent) {
                // Must not create circular reference
                if ($this->wouldCreateCircularReference($parent, $playlist)) {
                    return false;
                }

                // Already added to this parent
                $alreadyAdded = PlaylistItem::where('playlist_id', $parent->id)
                    ->where('item_type', 'playlist')
                    ->where('item_id', $playlist->id)
                    ->exists();

                return ! $alreadyAdded;
            });
    }

    /**
     * Add a sub-playlist to a parent playlist with validation.
     */
    public function addSubPlaylist(Playlist $parent, Playlist $child, array $attributes = []): PlaylistItem|array
    {
        $errors = $this->validateNesting($parent, $child);

        if (! empty($errors)) {
            return ['errors' => $errors];
        }

        return $parent->addPlaylistItem($child, $attributes);
    }

    /**
     * Get playlist structure for display in admin UI.
     * Dates are converted from UTC to tenant timezone for display.
     */
    public function getPlaylistStructure(Playlist $playlist): array
    {
        $items = $playlist->items()
            ->with(['media', 'childPlaylist', 'widget.currentMedia'])
            ->get();

        // Get tenant timezone for display conversion
        $tenant = $playlist->tenant ?? auth()->user()?->currentTenant();
        $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';

        return $items->map(function ($item) use ($timezone) {
            // Convert dates from UTC to tenant timezone for display
            $startsAt = $item->starts_at
                ? TimezoneHelper::fromUtc($item->starts_at, $timezone)?->toIso8601String()
                : null;
            $endsAt = $item->ends_at
                ? TimezoneHelper::fromUtc($item->ends_at, $timezone)?->toIso8601String()
                : null;

            // Convert day_schedules dates to tenant timezone
            $daySchedules = $this->convertDaySchedulesToTenantTimezone($item->day_schedules, $timezone);

            $data = [
                'id' => $item->id,
                'item_type' => $item->item_type,
                'item_id' => $item->item_id,
                'position' => $item->position,
                'duration_override' => $item->duration_override,
                'is_active' => $item->is_active,
                'schedule_type' => $item->schedule_type ?? 'always',
                'schedule_mode' => $item->schedule_mode ?? 'always',
                'schedule_mode_label' => $item->getScheduleModeLabel(),
                'priority_order' => $item->priority_order,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'day_schedules' => $daySchedules,
                'schedule_description' => $item->getScheduleDescription($timezone),
            ];

            if ($item->isMedia() && $item->media) {
                $data['media'] = [
                    'id' => $item->media->id,
                    'type' => $item->media->type,
                    'title' => $item->media->title,
                    'thumbnail_url' => $item->media->getThumbnailUrl(),
                    'duration_seconds' => $item->media->duration_seconds,
                ];
            } elseif ($item->isWidget() && $item->widget) {
                $data['widget'] = [
                    'id' => $item->widget->id,
                    'widget_type' => $item->widget->widget_type,
                    'name' => $item->widget->name,
                    'status' => $item->widget->status,
                    'last_generated_at' => $item->widget->last_generated_at?->toIso8601String(),
                    'duration_seconds' => $item->widget->getEffectiveDuration(),
                    'thumbnail_url' => $item->widget->currentMedia?->getThumbnailUrl(),
                ];
            } elseif ($item->isPlaylist() && $item->childPlaylist) {
                $data['playlist'] = [
                    'id' => $item->childPlaylist->id,
                    'name' => $item->childPlaylist->name,
                    'media_count' => $item->childPlaylist->getMediaCount(),
                    'total_duration' => $item->childPlaylist->getTotalDuration(),
                ];
            }

            return $data;
        })->toArray();
    }

    /**
     * Calculate total media count including sub-playlists.
     */
    public function getTotalMediaCount(Playlist $playlist): int
    {
        $count = 0;

        foreach ($playlist->activeItems as $item) {
            if ($item->isMedia()) {
                $count++;
            } elseif ($item->isPlaylist() && $item->childPlaylist) {
                $count += $item->childPlaylist->getMediaCount();
            }
        }

        return $count;
    }

    /**
     * Convert day_schedules dates from UTC to tenant timezone for display.
     * Note: time_start and time_end are kept as-is because they represent local time.
     */
    private function convertDaySchedulesToTenantTimezone(?array $daySchedules, string $timezone): ?array
    {
        if (! $daySchedules) {
            return null;
        }

        return array_map(function ($slot) use ($timezone) {
            // Convert slot's validity period dates to tenant timezone if present
            if (! empty($slot['starts_at'])) {
                $converted = TimezoneHelper::fromUtc($slot['starts_at'], $timezone);
                $slot['starts_at'] = $converted?->toIso8601String();
            }
            if (! empty($slot['ends_at'])) {
                $converted = TimezoneHelper::fromUtc($slot['ends_at'], $timezone);
                $slot['ends_at'] = $converted?->toIso8601String();
            }

            // Note: time_start and time_end are NOT converted - they represent
            // "local time" for the tenant (e.g., "09:00" means 9 AM in tenant's timezone)

            return $slot;
        }, $daySchedules);
    }
}
