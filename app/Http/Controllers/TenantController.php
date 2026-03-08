<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class TenantController extends Controller
{
    public function select(Request $request): Response|RedirectResponse|SymfonyResponse
    {
        $user = $request->user();

        // Get available tenants for user
        if ($user->isSuperAdmin()) {
            $tenants = Tenant::active()->orderBy('name')->get();
        } else {
            $tenants = $user->tenants()->where('is_active', true)->orderBy('name')->get();
        }

        // Auto-redirect if only one tenant
        if ($tenants->count() === 1) {
            session(['current_tenant_id' => $tenants->first()->id]);

            // Use Inertia::location to force full page reload
            // This ensures shared data (permissions) are properly loaded
            return Inertia::location(route('dashboard'));
        }

        // No tenants available
        if ($tenants->isEmpty()) {
            return Inertia::render('tenant/no-access');
        }

        return Inertia::render('tenant/select', [
            'tenants' => $tenants->map(fn ($tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'role' => $user->isSuperAdmin() ? 'super_admin' : $tenant->pivot?->role,
            ]),
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    public function switch(Request $request): RedirectResponse|SymfonyResponse
    {
        $request->validate([
            'tenant_id' => ['required', 'uuid'],
        ]);

        $user = $request->user();
        $tenantId = $request->input('tenant_id');

        // Validate access
        if ($user->isSuperAdmin()) {
            $tenant = Tenant::findOrFail($tenantId);
        } else {
            $tenant = $user->tenants()->where('tenant_id', $tenantId)->firstOrFail();
        }

        if (! $tenant->is_active) {
            return back()->withErrors(['tenant_id' => 'This organization is not active.']);
        }

        session(['current_tenant_id' => $tenant->id]);

        // Use Inertia::location to force full page reload
        // This ensures shared data (permissions) are properly loaded
        return Inertia::location(route('dashboard'));
    }

    public function current(Request $request): array
    {
        $user = $request->user();
        $tenantId = session('current_tenant_id');

        if (! $tenantId) {
            return ['tenant' => null];
        }

        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            return ['tenant' => null];
        }

        return [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'role' => $user->isSuperAdmin() ? 'super_admin' : $user->roleInTenant($tenant),
            ],
        ];
    }
}
