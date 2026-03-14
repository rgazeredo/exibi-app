<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use App\Models\Traits\HasTags;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Playlist extends Model
{
    use BelongsToTenant, HasFactory, HasTags, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'is_active',
        'is_default',
        'content_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'content_updated_at' => 'datetime',
        ];
    }

    /**
     * Get all items in this playlist (media and sub-playlists).
     */
    public function items(): HasMany
    {
        return $this->hasMany(PlaylistItem::class)->orderBy('position');
    }

    /**
     * Get only active items.
     */
    public function activeItems(): HasMany
    {
        return $this->items()->where('is_active', true);
    }

    /**
     * Get only media items.
     */
    public function mediaItems(): HasMany
    {
        return $this->items()->where('item_type', 'media');
    }

    /**
     * Get only playlist items (sub-playlists).
     */
    public function playlistItems(): HasMany
    {
        return $this->items()->where('item_type', 'playlist');
    }

    /**
     * Get only widget items.
     */
    public function widgetItems(): HasMany
    {
        return $this->items()->where('item_type', 'widget');
    }

    /**
     * Check if this playlist contains sub-playlists.
     */
    public function hasSubPlaylists(): bool
    {
        return $this->playlistItems()->exists();
    }

    /**
     * Check if this playlist can contain sub-playlists.
     * A playlist can only contain sub-playlists if it's not already a sub-playlist of another.
     */
    public function canContainSubPlaylists(): bool
    {
        // Check if this playlist is used as a child in any other playlist
        return ! PlaylistItem::where('item_type', 'playlist')
            ->where('item_id', $this->id)
            ->exists();
    }

    // ============================================
    // Legacy methods for backward compatibility
    // (uses playlist_media table directly)
    // ============================================

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'playlist_media')
            ->using(PlaylistMedia::class)
            ->withPivot(['id', 'position', 'duration_override', 'is_active', 'settings'])
            ->withTimestamps()
            ->orderByPivot('position');
    }

    public function activeMedia(): BelongsToMany
    {
        return $this->media()->wherePivot('is_active', true);
    }

    // ============================================
    // Other relationships
    // ============================================

    /**
     * Get count of players effectively using this playlist.
     * Counts players that use this playlist through:
     * - Player's own layout region playlists
     * - Player group's layout region playlists
     */
    public function getEffectivePlayersCount(): int
    {
        return Player::query()
            ->where('tenant_id', $this->tenant_id)
            ->whereHas('regionPlaylists', fn ($q) => $q->where('playlist_id', $this->id))
            ->count();
    }

    public function playbackLogs(): HasMany
    {
        return $this->hasMany(PlaybackLog::class);
    }

    // ============================================
    // Scopes
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // ============================================
    // Content update tracking
    // ============================================

    /**
     * Update the content_updated_at timestamp.
     * Call this when playlist items are modified.
     */
    public function touchContentUpdatedAt(): void
    {
        $this->update(['content_updated_at' => now()]);
    }

    // ============================================
    // Duration and count methods
    // ============================================

    /**
     * Get total duration of all items in seconds.
     */
    public function getTotalDuration(): int
    {
        $total = 0;

        foreach ($this->activeItems as $item) {
            $total += $item->getEffectiveDuration();
        }

        return $total;
    }

    /**
     * Get count of direct media items.
     */
    public function getMediaCount(): int
    {
        return $this->mediaItems()->count();
    }

    /**
     * Get count of active direct media items.
     */
    public function getActiveMediaCount(): int
    {
        return $this->mediaItems()->where('is_active', true)->count();
    }

    /**
     * Get count of sub-playlists.
     */
    public function getPlaylistCount(): int
    {
        return $this->playlistItems()->count();
    }

    /**
     * Get total count of all items (media + playlists).
     */
    public function getItemsCount(): int
    {
        return $this->items()->count();
    }

    // ============================================
    // Item management methods
    // ============================================

    /**
     * Add a media item to this playlist.
     */
    public function addMediaItem(Media $media, array $attributes = []): PlaylistItem
    {
        $maxPosition = $this->items()->max('position') ?? -1;

        return $this->items()->create(array_merge([
            'item_type' => 'media',
            'item_id' => $media->id,
            'position' => $maxPosition + 1,
            'is_active' => true,
        ], $attributes));
    }

    /**
     * Add a sub-playlist to this playlist.
     */
    public function addPlaylistItem(Playlist $playlist, array $attributes = []): PlaylistItem
    {
        $maxPosition = $this->items()->max('position') ?? -1;

        return $this->items()->create(array_merge([
            'item_type' => 'playlist',
            'item_id' => $playlist->id,
            'position' => $maxPosition + 1,
            'is_active' => true,
        ], $attributes));
    }

    /**
     * Remove an item from this playlist.
     */
    public function removeItem(PlaylistItem $item): void
    {
        $item->delete();
        $this->reorderItems();
    }

    /**
     * Reorder items by position.
     */
    public function reorderItems(?array $itemIds = null): void
    {
        if ($itemIds === null) {
            $itemIds = $this->items()->pluck('id')->toArray();
        }

        foreach ($itemIds as $position => $itemId) {
            PlaylistItem::where('id', $itemId)
                ->where('playlist_id', $this->id)
                ->update(['position' => $position]);
        }
    }

    // ============================================
    // Legacy item management (for backward compat)
    // ============================================

    public function addMedia(Media $media, array $attributes = []): PlaylistMedia
    {
        $maxPosition = $this->media()->max('position') ?? -1;

        $this->media()->attach($media->id, array_merge([
            'position' => $maxPosition + 1,
            'is_active' => true,
        ], $attributes));

        // Also add to playlist_items for consistency
        $this->addMediaItem($media, $attributes);

        return PlaylistMedia::where('playlist_id', $this->id)
            ->where('media_id', $media->id)
            ->first();
    }

    public function removeMedia(Media $media): void
    {
        $this->media()->detach($media->id);

        // Also remove from playlist_items
        $this->items()
            ->where('item_type', 'media')
            ->where('item_id', $media->id)
            ->delete();

        $this->reorderMedia();
        $this->reorderItems();
    }

    public function reorderMedia(?array $mediaIds = null): void
    {
        if ($mediaIds === null) {
            $mediaIds = $this->media()->pluck('media.id')->toArray();
        }

        foreach ($mediaIds as $position => $mediaId) {
            PlaylistMedia::where('playlist_id', $this->id)
                ->where('media_id', $mediaId)
                ->update(['position' => $position]);
        }
    }

    // ============================================
    // Flattening methods for player API
    // ============================================

    /**
     * Get all media flattened in sequential order.
     * This resolves sub-playlists into their media items.
     */
    public function getFlattenedMedia(): Collection
    {
        return $this->flattenSequential();
    }

    /**
     * Flatten in sequential mode: items in order, sub-playlists expanded inline.
     * Filters out items that are outside their scheduled period.
     */
    protected function flattenSequential(): Collection
    {
        $result = collect();

        // Get tenant timezone for schedule checks
        $timezone = $this->tenant?->getTimezone() ?? 'America/Sao_Paulo';

        foreach ($this->activeItems as $item) {
            // Skip items outside their scheduled period
            if (! $item->isScheduledNow($timezone)) {
                continue;
            }

            if ($item->isMedia() && $item->media) {
                $result->push([
                    'media' => $item->media,
                    'duration_override' => $item->duration_override,
                    'source' => 'direct',
                    'source_playlist_id' => null,
                    'source_widget_id' => null,
                    'starts_at' => $item->starts_at?->getTimestampMs(),
                    'ends_at' => $item->ends_at?->getTimestampMs(),
                ]);
            } elseif ($item->isWidget() && $item->widget && $item->widget->currentMedia) {
                // Widget with generated video
                $result->push([
                    'media' => $item->widget->currentMedia,
                    'duration_override' => $item->duration_override ?? $item->widget->getEffectiveDuration(),
                    'source' => 'widget',
                    'source_playlist_id' => null,
                    'source_widget_id' => $item->widget->id,
                    'starts_at' => $item->starts_at?->getTimestampMs(),
                    'ends_at' => $item->ends_at?->getTimestampMs(),
                ]);
            } elseif ($item->isPlaylist() && $item->childPlaylist) {
                // Expand sub-playlist media
                foreach ($item->childPlaylist->activeItems as $subItem) {
                    // Skip sub-items outside their scheduled period
                    if (! $subItem->isScheduledNow($timezone)) {
                        continue;
                    }

                    if ($subItem->isMedia() && $subItem->media) {
                        // Sub-item inherits parent schedule if it doesn't have its own
                        $startsAt = $subItem->starts_at ?? $item->starts_at;
                        $endsAt = $subItem->ends_at ?? $item->ends_at;

                        $result->push([
                            'media' => $subItem->media,
                            'duration_override' => $subItem->duration_override,
                            'source' => 'playlist',
                            'source_playlist_id' => $item->childPlaylist->id,
                            'source_widget_id' => null,
                            'starts_at' => $startsAt?->getTimestampMs(),
                            'ends_at' => $endsAt?->getTimestampMs(),
                        ]);
                    } elseif ($subItem->isWidget() && $subItem->widget && $subItem->widget->currentMedia) {
                        // Widget inside sub-playlist
                        $startsAt = $subItem->starts_at ?? $item->starts_at;
                        $endsAt = $subItem->ends_at ?? $item->ends_at;

                        $result->push([
                            'media' => $subItem->widget->currentMedia,
                            'duration_override' => $subItem->duration_override ?? $subItem->widget->getEffectiveDuration(),
                            'source' => 'widget',
                            'source_playlist_id' => $item->childPlaylist->id,
                            'source_widget_id' => $subItem->widget->id,
                            'starts_at' => $startsAt?->getTimestampMs(),
                            'ends_at' => $endsAt?->getTimestampMs(),
                        ]);
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Flatten in interleaved mode: round-robin through items.
     * Direct media is treated as a "playlist of 1".
     * Filters out items that are outside their scheduled period.
     */
    protected function flattenInterleaved(): Collection
    {
        $groups = $this->buildGroups();

        if (empty($groups)) {
            return collect();
        }

        // Round-robin interleave
        $result = collect();
        $maxLength = max(array_map('count', $groups));

        for ($round = 0; $round < $maxLength; $round++) {
            foreach ($groups as $groupIndex => $group) {
                if (isset($group[$round])) {
                    $result->push($group[$round]);
                }
            }
        }

        return $result;
    }

    /**
     * Flatten in auto mode: proportional distribution based on group sizes.
     * Ensures fair distribution by calculating how many items each group
     * should contribute relative to the smallest group.
     *
     * Example: Groups with 6, 4, and 2 items become proportions 3:2:1
     * Result: A1,A2,A3,B1,B2,C1,A4,A5,A6,B3,B4,C2 (roughly)
     */
    protected function flattenAuto(): Collection
    {
        $groups = $this->buildGroups();

        if (empty($groups)) {
            return collect();
        }

        // If only one group, just return it
        if (count($groups) === 1) {
            return collect($groups[0]);
        }

        // Find the smallest group size (minimum 1)
        $sizes = array_map('count', $groups);
        $minSize = max(1, min($sizes));

        // Calculate proportions relative to smallest group
        $proportions = [];
        foreach ($sizes as $index => $size) {
            // How many items from this group per "round"
            // A group with 6 items when min is 2 gets proportion 3 (6/2)
            $proportions[$index] = max(1, (int) round($size / $minSize));
        }

        // Build result using proportional distribution
        $result = collect();
        $indexes = array_fill(0, count($groups), 0);
        $totalItems = array_sum($sizes);
        $addedItems = 0;

        // Keep going until all items are added
        while ($addedItems < $totalItems) {
            foreach ($groups as $groupIndex => $group) {
                // Add 'proportion' items from this group per round
                $itemsToAdd = $proportions[$groupIndex];

                for ($i = 0; $i < $itemsToAdd; $i++) {
                    $itemIndex = $indexes[$groupIndex];
                    if (isset($group[$itemIndex])) {
                        $result->push($group[$itemIndex]);
                        $indexes[$groupIndex]++;
                        $addedItems++;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Build groups of media from active items.
     * Each item becomes a group (direct media = group of 1, sub-playlist = group of its items).
     */
    protected function buildGroups(): array
    {
        $groups = [];
        $timezone = $this->tenant?->getTimezone() ?? 'America/Sao_Paulo';

        foreach ($this->activeItems as $item) {
            if (! $item->isScheduledNow($timezone)) {
                continue;
            }

            if ($item->isMedia() && $item->media) {
                $groups[] = [[
                    'media' => $item->media,
                    'duration_override' => $item->duration_override,
                    'source' => 'direct',
                    'source_playlist_id' => null,
                    'source_widget_id' => null,
                    'starts_at' => $item->starts_at?->getTimestampMs(),
                    'ends_at' => $item->ends_at?->getTimestampMs(),
                ]];
            } elseif ($item->isWidget() && $item->widget && $item->widget->currentMedia) {
                $groups[] = [[
                    'media' => $item->widget->currentMedia,
                    'duration_override' => $item->duration_override ?? $item->widget->getEffectiveDuration(),
                    'source' => 'widget',
                    'source_playlist_id' => null,
                    'source_widget_id' => $item->widget->id,
                    'starts_at' => $item->starts_at?->getTimestampMs(),
                    'ends_at' => $item->ends_at?->getTimestampMs(),
                ]];
            } elseif ($item->isPlaylist() && $item->childPlaylist) {
                $subMedia = [];
                foreach ($item->childPlaylist->activeItems as $subItem) {
                    if (! $subItem->isScheduledNow($timezone)) {
                        continue;
                    }

                    if ($subItem->isMedia() && $subItem->media) {
                        $startsAt = $subItem->starts_at ?? $item->starts_at;
                        $endsAt = $subItem->ends_at ?? $item->ends_at;

                        $subMedia[] = [
                            'media' => $subItem->media,
                            'duration_override' => $subItem->duration_override,
                            'source' => 'playlist',
                            'source_playlist_id' => $item->childPlaylist->id,
                            'source_widget_id' => null,
                            'starts_at' => $startsAt?->getTimestampMs(),
                            'ends_at' => $endsAt?->getTimestampMs(),
                        ];
                    } elseif ($subItem->isWidget() && $subItem->widget && $subItem->widget->currentMedia) {
                        $startsAt = $subItem->starts_at ?? $item->starts_at;
                        $endsAt = $subItem->ends_at ?? $item->ends_at;

                        $subMedia[] = [
                            'media' => $subItem->widget->currentMedia,
                            'duration_override' => $subItem->duration_override ?? $subItem->widget->getEffectiveDuration(),
                            'source' => 'widget',
                            'source_playlist_id' => $item->childPlaylist->id,
                            'source_widget_id' => $subItem->widget->id,
                            'starts_at' => $startsAt?->getTimestampMs(),
                            'ends_at' => $endsAt?->getTimestampMs(),
                        ];
                    }
                }
                if (! empty($subMedia)) {
                    $groups[] = $subMedia;
                }
            }
        }

        return $groups;
    }
}
