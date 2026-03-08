<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Super admins can access any tenant
        if ($user->isSuperAdmin()) {
            $this->setTenantFromSession($request);

            return $next($request);
        }

        // Regular users: validate tenant access
        $tenantId = session('current_tenant_id');

        if ($tenantId && $user->tenants()->where('tenant_id', $tenantId)->exists()) {
            $this->shareTenantWithViews();

            return $next($request);
        }

        // Auto-select if user has only one tenant
        $userTenants = $user->tenants()->get();

        if ($userTenants->count() === 1) {
            $tenant = $userTenants->first();
            session(['current_tenant_id' => $tenant->id]);
            $this->shareTenantWithViews();

            return $next($request);
        }

        return $next($request);
    }

    protected function setTenantFromSession(Request $request): void
    {
        $tenantId = session('current_tenant_id');

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant) {
                $this->shareTenantWithViews();
            }
        }
    }

    protected function shareTenantWithViews(): void
    {
        $tenantId = session('current_tenant_id');

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            view()->share('currentTenant', $tenant);
        }
    }
}
