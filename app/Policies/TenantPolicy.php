<?php

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;

class TenantPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        // Regular users can only see tenants they belong to
        return true;
    }

    public function view(User $user, Tenant $tenant): bool
    {
        return $user->tenants()->where('tenant_id', $tenant->id)->exists();
    }

    public function create(User $user): bool
    {
        // Only super admins can create tenants
        return false;
    }

    public function update(User $user, Tenant $tenant): bool
    {
        // Tenant admins can update their own tenant settings
        return $user->hasRoleInTenant('admin', $tenant);
    }

    public function delete(User $user, Tenant $tenant): bool
    {
        // Only super admins can delete tenants
        return false;
    }

    public function manageUsers(User $user, Tenant $tenant): bool
    {
        return $user->hasRoleInTenant('admin', $tenant);
    }
}
