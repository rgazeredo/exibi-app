<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerHeartbeat extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'player_id',
        'ip_address',
        'app_version',
        'system_info',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'system_info' => 'array',
            'status' => 'array',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    public function scopeForPlayer($query, $playerId)
    {
        return $query->where('player_id', $playerId);
    }
}
