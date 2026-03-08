<?php

namespace App\Events;

use App\Models\Media;
use App\Models\Player;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerMediaChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Player $player,
        public ?Media $media,
        public ?string $startedAt = null,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     * Using public channel for simplicity - tenant isolation is handled by player ID.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('player.'.$this->player->id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'media.changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        // Get the main region's playlist from the active layout
        $playlist = null;
        $scheduledLayout = $this->player->getActiveScheduledLayout();
        if ($scheduledLayout) {
            $mainRegion = $scheduledLayout->layout?->regions?->first(fn ($r) => $r->is_main);
            if ($mainRegion) {
                $playlist = $scheduledLayout->getPlaylistForRegion($mainRegion);
            }
        }

        // Get all regions currently playing (for multi-region layouts)
        $regions = $this->player->getAllRegionsCurrentlyPlaying();

        return [
            'player_id' => $this->player->id,
            'is_online' => $this->player->isOnline(),
            'last_seen_at' => $this->player->last_seen_at?->diffForHumans(),
            'currently_playing' => $this->media ? [
                'media' => [
                    'id' => $this->media->id,
                    'title' => $this->media->title,
                    'type' => $this->media->type,
                    'url' => $this->media->getPublicUrl(),
                    'thumbnail_url' => $this->media->getThumbnailUrl(),
                    'duration_seconds' => $this->media->duration_seconds,
                    'duration_formatted' => $this->media->getFormattedDuration(),
                ],
                // Use ISO 8601 format with timezone for proper client-side conversion
                'started_at' => now()->toIso8601String(),
                'started_at_human' => null,
                'playlist_name' => $playlist?->name,
                'position' => null,
                'total_items' => $playlist?->getFlattenedMedia()->count(),
                'regions' => array_values($regions),
            ] : [
                'media' => null,
                'regions' => array_values($regions),
            ],
        ];
    }
}
