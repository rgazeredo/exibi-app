<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'module',
        'action',
        'name',
        'description',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(TenantRole::class, 'tenant_role_permissions')
            ->withTimestamps();
    }

    /**
     * Get the permission key (module.action format).
     */
    public function getKeyAttribute(): string
    {
        return "{$this->module}.{$this->action}";
    }

    /**
     * Find a permission by module and action.
     */
    public static function findByKey(string $module, string $action): ?self
    {
        return static::where('module', $module)
            ->where('action', $action)
            ->first();
    }

    /**
     * Get all permissions grouped by module.
     */
    public static function groupedByModule(): array
    {
        return static::orderBy('sort_order')
            ->get()
            ->groupBy('module')
            ->toArray();
    }
}
