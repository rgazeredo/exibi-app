<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TenantRole extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'is_system',
        'is_deletable',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_deletable' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (TenantRole $role) {
            if (empty($role->slug)) {
                $role->slug = Str::slug($role->name);
            }
        });
    }

    /**
     * Get the tenant that owns the role.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the permissions for this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'tenant_role_permissions')
            ->withTimestamps();
    }

    /**
     * Get the users with this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(TenantUser::class, 'tenant_role_id');
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission(string $module, string $action): bool
    {
        return $this->permissions()
            ->where('module', $module)
            ->where('action', $action)
            ->exists();
    }

    /**
     * Check if role has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            [$module, $action] = explode('.', $permission);
            if ($this->hasPermission($module, $action)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if role has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            [$module, $action] = explode('.', $permission);
            if (! $this->hasPermission($module, $action)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Sync permissions for this role.
     */
    public function syncPermissions(array $permissionIds): void
    {
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Get permissions grouped by module.
     */
    public function getPermissionsGrouped(): array
    {
        return $this->permissions()
            ->orderBy('sort_order')
            ->get()
            ->groupBy('module')
            ->toArray();
    }

    /**
     * Get count of users with this role.
     */
    public function getUsersCountAttribute(): int
    {
        return $this->users()->count();
    }
}
