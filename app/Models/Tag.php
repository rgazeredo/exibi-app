<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'color',
    ];

    protected static function booted(): void
    {
        static::creating(function (Tag $tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    public function media(): MorphToMany
    {
        return $this->morphedByMany(Media::class, 'taggable')
            ->withTimestamps();
    }

    public function players(): MorphToMany
    {
        return $this->morphedByMany(Player::class, 'taggable')
            ->withTimestamps();
    }

    public function playlists(): MorphToMany
    {
        return $this->morphedByMany(Playlist::class, 'taggable')
            ->withTimestamps();
    }

    /**
     * Get count of all taggables (media + players + playlists)
     */
    public function getUsageCountAttribute(): int
    {
        return $this->media()->count()
            + $this->players()->count()
            + $this->playlists()->count();
    }
}
