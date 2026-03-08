<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantSelected
{
    protected array $except = [
        'tenant.select',
        'tenant.switch',
        'logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Skip check for excepted routes
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        // Super admins without tenant selected go to admin dashboard
        if ($user->isSuperAdmin()) {
            if (! session('current_tenant_id')) {
                return $this->redirectToAdminDashboard($request);
            }

            return $next($request);
        }

        // Check if user has valid tenant selected
        $tenantId = session('current_tenant_id');

        if (! $tenantId) {
            $userTenants = $user->tenants()->get();

            if ($userTenants->isEmpty()) {
                // User has no tenants - show error
                abort(403, 'You are not associated with any organization.');
            }

            if ($userTenants->count() === 1) {
                // Auto-select single tenant
                session(['current_tenant_id' => $userTenants->first()->id]);

                return $next($request);
            }

            // Multiple tenants - redirect to selection
            return $this->redirectToTenantSelection($request);
        }

        // Validate user still has access to selected tenant
        if (! $user->tenants()->where('tenant_id', $tenantId)->exists()) {
            session()->forget('current_tenant_id');

            return $this->redirectToTenantSelection($request);
        }

        return $next($request);
    }

    protected function shouldSkip(Request $request): bool
    {
        foreach ($this->except as $route) {
            if ($request->routeIs($route)) {
                return true;
            }
        }

        return false;
    }

    protected function redirectToTenantSelection(Request $request): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Please select an organization.',
                'redirect' => route('tenant.select'),
            ], 403);
        }

        return redirect()->route('tenant.select');
    }

    protected function redirectToAdminDashboard(Request $request): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'No organization selected. Redirecting to admin dashboard.',
                'redirect' => route('admin.dashboard'),
            ], 403);
        }

        return redirect()->route('admin.dashboard');
    }
}
