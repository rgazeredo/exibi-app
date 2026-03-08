<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PlaylistMedia extends Pivot
{
    use HasUuids;

    protected $table = 'playlist_media';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'playlist_id',
        'media_id',
        'position',
        'duration_override',
        'is_active',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'duration_override' => 'integer',
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function getEffectiveDuration(): int
    {
        if ($this->duration_override) {
            return $this->duration_override;
        }

        if ($this->media && $this->media->duration_seconds) {
            return $this->media->duration_seconds;
        }

        // Default duration for images
        return 10;
    }
}
