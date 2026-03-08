<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LayoutRegion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'layout_id',
        'name',
        'position',
        'x_percent',
        'y_percent',
        'width_percent',
        'height_percent',
        'is_main',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'x_percent' => 'float',
            'y_percent' => 'float',
            'width_percent' => 'float',
            'height_percent' => 'float',
            'is_main' => 'boolean',
        ];
    }

    /**
     * Get the layout that owns this region.
     */
    public function layout(): BelongsTo
    {
        return $this->belongsTo(Layout::class);
    }

    /**
     * Get player group playlist assignments for this region.
     */
    public function playerGroupRegionPlaylists(): HasMany
    {
        return $this->hasMany(PlayerGroupRegionPlaylist::class);
    }

    /**
     * Get player playlist assignments for this region.
     */
    public function playerRegionPlaylists(): HasMany
    {
        return $this->hasMany(PlayerRegionPlaylist::class);
    }

    /**
     * Get display name with dimensions.
     */
    public function getDisplayName(): string
    {
        return sprintf(
            '%s (%d%% x %d%%)',
            ucfirst(str_replace('_', ' ', $this->name)),
            (int) $this->width_percent,
            (int) $this->height_percent
        );
    }
}
