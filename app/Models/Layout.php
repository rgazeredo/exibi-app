<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Layout extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'orientation',
        'is_system',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        // Apply tenant scope unless querying system layouts
        static::addGlobalScope('tenant', function (Builder $query) {
            if ($tenant = auth()->user()?->currentTenant()) {
                $query->where(function ($q) use ($tenant) {
                    $q->where('tenant_id', $tenant->id)
                        ->orWhereNull('tenant_id'); // Include system layouts
                });
            }
        });
    }

    /**
     * Get the tenant that owns the layout.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the regions for this layout.
     */
    public function regions(): HasMany
    {
        return $this->hasMany(LayoutRegion::class)->orderBy('position');
    }

    /**
     * Scope to only system layouts.
     */
    public function scopeSystem(Builder $query): Builder
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope to only active layouts.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if this is a full-screen layout (single region covering 100%).
     */
    public function isFullScreen(): bool
    {
        if ($this->regions()->count() !== 1) {
            return false;
        }

        $region = $this->regions()->first();

        return $region
            && $region->width_percent == 100
            && $region->height_percent == 100;
    }

    /**
     * Get the main region for this layout.
     */
    public function getMainRegion(): ?LayoutRegion
    {
        return $this->regions()->where('is_main', true)->first()
            ?? $this->regions()->first();
    }

    /**
     * Get region count.
     */
    public function getRegionCount(): int
    {
        return $this->regions()->count();
    }

    /**
     * Get the system "Tela Cheia" (fullscreen) layout.
     */
    public static function getFullscreenLayout(): ?self
    {
        return static::withoutGlobalScopes()
            ->where('is_system', true)
            ->where('name', 'Tela Cheia')
            ->whereNull('tenant_id')
            ->first();
    }
}
