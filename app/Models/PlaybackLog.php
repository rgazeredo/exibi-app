<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaybackLog extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'player_id',
        'media_id',
        'playlist_id',
        'started_at',
        'ended_at',
        'duration_played_seconds',
        'completed',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'duration_played_seconds' => 'integer',
            'completed' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('completed', true);
    }

    public function scopeIncomplete($query)
    {
        return $query->where('completed', false);
    }

    public function scopeForPlayer($query, $playerId)
    {
        return $query->where('player_id', $playerId);
    }

    public function scopeForMedia($query, $mediaId)
    {
        return $query->where('media_id', $mediaId);
    }

    public function scopeInDateRange($query, $start, $end)
    {
        return $query->whereBetween('started_at', [$start, $end]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('started_at', today());
    }

    public function markCompleted(): void
    {
        $this->update([
            'ended_at' => now(),
            'completed' => true,
            'duration_played_seconds' => $this->started_at->diffInSeconds(now()),
        ]);
    }
}
