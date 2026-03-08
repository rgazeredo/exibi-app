<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerRegionPlaylist extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'player_id',
        'layout_region_id',
        'playlist_id',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function layoutRegion(): BelongsTo
    {
        return $this->belongsTo(LayoutRegion::class, 'layout_region_id');
    }

    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }
}
