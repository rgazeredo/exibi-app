<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUuids, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_super_admin',
        'language',
        'appearance',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_super_admin' => 'boolean',
        ];
    }

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class)
            ->using(TenantUser::class)
            ->withPivot('role', 'tenant_role_id', 'created_at');
    }

    public function currentTenant(): ?Tenant
    {
        $tenantId = session('current_tenant_id');

        if (! $tenantId) {
            return null;
        }

        // Super admins podem acessar qualquer tenant
        if ($this->isSuperAdmin()) {
            return Tenant::find($tenantId);
        }

        return $this->tenants()->find($tenantId);
    }

    public function setCurrentTenant(Tenant $tenant): void
    {
        session(['current_tenant_id' => $tenant->id]);
    }

    public function roleInTenant(?Tenant $tenant = null): ?string
    {
        $tenant = $tenant ?? $this->currentTenant();

        if (! $tenant) {
            return null;
        }

        return $this->tenants()
            ->where('tenant_id', $tenant->id)
            ->first()
            ?->pivot
            ?->role;
    }

    public function hasRoleInTenant(string|array $roles, ?Tenant $tenant = null): bool
    {
        $currentRole = $this->roleInTenant($tenant);

        if (! $currentRole) {
            return false;
        }

        $roles = is_array($roles) ? $roles : [$roles];

        return in_array($currentRole, $roles);
    }

    public function isAdminInTenant(?Tenant $tenant = null): bool
    {
        return $this->hasRoleInTenant('admin', $tenant);
    }

    public function canEditInTenant(?Tenant $tenant = null): bool
    {
        return $this->hasRoleInTenant(['admin', 'editor'], $tenant);
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin === true;
    }

    /**
     * Get the user's role in a tenant.
     */
    public function tenantRole(?Tenant $tenant = null): ?TenantRole
    {
        $tenant = $tenant ?? $this->currentTenant();

        if (! $tenant) {
            return null;
        }

        $pivot = $this->tenants()
            ->where('tenant_id', $tenant->id)
            ->first()
            ?->pivot;

        if (! $pivot || ! $pivot->tenant_role_id) {
            return null;
        }

        return TenantRole::find($pivot->tenant_role_id);
    }

    /**
     * Check if user has a specific permission in current tenant.
     */
    public function hasPermission(string $permission, ?Tenant $tenant = null): bool
    {
        // Super admin bypasses all permission checks
        if ($this->isSuperAdmin()) {
            return true;
        }

        $tenant = $tenant ?? $this->currentTenant();

        if (! $tenant) {
            return false;
        }

        // Use cache to avoid repeated queries
        $cacheKey = "user:{$this->id}:tenant:{$tenant->id}:permissions";

        $permissions = Cache::remember($cacheKey, 300, function () use ($tenant) {
            $role = $this->tenantRole($tenant);
            if (! $role) {
                return [];
            }

            return $role->permissions()
                ->get()
                ->map(fn ($p) => "{$p->module}.{$p->action}")
                ->toArray();
        });

        return in_array($permission, $permissions);
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions, ?Tenant $tenant = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission, $tenant)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions, ?Tenant $tenant = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($permissions as $permission) {
            if (! $this->hasPermission($permission, $tenant)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permissions for user in current tenant.
     */
    public function getPermissions(?Tenant $tenant = null): array
    {
        if ($this->isSuperAdmin()) {
            return Permission::all()
                ->map(fn ($p) => "{$p->module}.{$p->action}")
                ->toArray();
        }

        $tenant = $tenant ?? $this->currentTenant();

        if (! $tenant) {
            return [];
        }

        $role = $this->tenantRole($tenant);

        if (! $role) {
            return [];
        }

        return $role->permissions()
            ->get()
            ->map(fn ($p) => "{$p->module}.{$p->action}")
            ->toArray();
    }

    /**
     * Clear cached permissions for this user.
     */
    public function clearPermissionsCache(?Tenant $tenant = null): void
    {
        $tenant = $tenant ?? $this->currentTenant();

        if ($tenant) {
            Cache::forget("user:{$this->id}:tenant:{$tenant->id}:permissions");
        }
    }

    /**
     * Check if user can manage a specific module.
     */
    public function canManage(string $module, ?Tenant $tenant = null): bool
    {
        return $this->hasAnyPermission([
            "{$module}.create",
            "{$module}.edit",
            "{$module}.delete",
        ], $tenant);
    }

    /**
     * Check if user can view a specific module.
     */
    public function canView(string $module, ?Tenant $tenant = null): bool
    {
        return $this->hasPermission("{$module}.view", $tenant);
    }
}
