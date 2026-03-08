<?php

namespace App\Events;

use App\Models\Media;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MediaProcessingComplete implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Media $media
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('admin.media');
    }

    public function broadcastAs(): string
    {
        return 'processing.complete';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->media->id,
            'title' => $this->media->title,
            'type' => $this->media->type,
            'thumbnail_url' => $this->media->getThumbnailUrl(),
            'duration_seconds' => $this->media->duration_seconds,
            'formatted_duration' => $this->media->getFormattedDuration(),
            'size_bytes' => $this->media->size_bytes,
            'formatted_size' => $this->media->getFormattedSize(),
            'resolution' => $this->media->getResolution(),
            'orientation' => $this->media->isPortrait() ? 'portrait' : 'landscape',
        ];
    }
}
