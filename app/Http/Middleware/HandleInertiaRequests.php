<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'tenant' => $this->getCurrentTenant($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'csrf_token' => csrf_token(),
        ];
    }

    protected function getCurrentTenant(Request $request): ?array
    {
        $user = $request->user();
        $tenantId = session('current_tenant_id');

        if (! $user || ! $tenantId) {
            return null;
        }

        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            return null;
        }

        // Get user's role in tenant
        $tenantRole = $user->tenantRole($tenant);

        return [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'role' => $user->isSuperAdmin() ? 'super_admin' : $user->roleInTenant($tenant),
            'role_name' => $user->isSuperAdmin() ? 'Super Admin' : ($tenantRole?->name ?? null),
            'permissions' => $user->getPermissions($tenant),
        ];
    }
}
