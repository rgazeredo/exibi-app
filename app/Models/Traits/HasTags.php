<?php

namespace App\Models\Traits;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasTags
{
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')
            ->withTimestamps();
    }

    /**
     * Sync tags by IDs
     */
    public function syncTags(array $tagIds): void
    {
        $this->tags()->sync($tagIds);
    }

    /**
     * Attach tags by IDs
     */
    public function attachTags(array $tagIds): void
    {
        $this->tags()->syncWithoutDetaching($tagIds);
    }

    /**
     * Detach tags by IDs
     */
    public function detachTags(array $tagIds): void
    {
        $this->tags()->detach($tagIds);
    }

    /**
     * Sync tags by names (creates new tags if they don't exist)
     */
    public function syncTagsByName(array $tagNames, ?string $tenantId = null): void
    {
        $tenantId = $tenantId ?? $this->tenant_id;

        $tagIds = collect($tagNames)->map(function ($name) use ($tenantId) {
            return Tag::firstOrCreate(
                ['tenant_id' => $tenantId, 'slug' => \Str::slug($name)],
                ['name' => $name, 'tenant_id' => $tenantId]
            )->id;
        })->toArray();

        $this->tags()->sync($tagIds);
    }

    /**
     * Check if model has a specific tag
     */
    public function hasTag(string $tagIdOrSlug): bool
    {
        return $this->tags()
            ->where(function ($query) use ($tagIdOrSlug) {
                $query->where('tags.id', $tagIdOrSlug)
                    ->orWhere('tags.slug', $tagIdOrSlug);
            })
            ->exists();
    }

    /**
     * Check if model has any of the given tags
     */
    public function hasAnyTag(array $tagIdsOrSlugs): bool
    {
        return $this->tags()
            ->where(function ($query) use ($tagIdsOrSlugs) {
                $query->whereIn('tags.id', $tagIdsOrSlugs)
                    ->orWhereIn('tags.slug', $tagIdsOrSlugs);
            })
            ->exists();
    }

    /**
     * Check if model has all of the given tags
     */
    public function hasAllTags(array $tagIdsOrSlugs): bool
    {
        $count = $this->tags()
            ->where(function ($query) use ($tagIdsOrSlugs) {
                $query->whereIn('tags.id', $tagIdsOrSlugs)
                    ->orWhereIn('tags.slug', $tagIdsOrSlugs);
            })
            ->count();

        return $count === count($tagIdsOrSlugs);
    }

    /**
     * Scope to filter by tags
     */
    public function scopeWithAnyTags($query, array $tagIds)
    {
        return $query->whereHas('tags', function ($q) use ($tagIds) {
            $q->whereIn('tags.id', $tagIds);
        });
    }

    /**
     * Scope to filter by all tags
     */
    public function scopeWithAllTags($query, array $tagIds)
    {
        foreach ($tagIds as $tagId) {
            $query->whereHas('tags', function ($q) use ($tagId) {
                $q->where('tags.id', $tagId);
            });
        }

        return $query;
    }
}
