<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Player;
use App\Models\Tenant;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $this->authorizeSuperAdmin();

        // Tenant stats
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('is_active', true)->count();
        $inactiveTenants = $totalTenants - $activeTenants;

        // Player stats across all tenants
        $totalPlayers = Player::count();
        $onlinePlayers = Player::where('last_seen_at', '>=', now()->subMinutes(5))->count();
        $offlinePlayers = $totalPlayers - $onlinePlayers;

        // Storage stats
        $totalStorageBytes = Media::sum('size_bytes');
        $totalMediaCount = Media::count();

        // User stats
        $totalUsers = User::count();
        $superAdmins = User::where('is_super_admin', true)->count();

        // Recent tenants
        $recentTenants = Tenant::query()
            ->withCount(['players', 'media', 'users'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'is_active' => $tenant->is_active,
                'players_count' => $tenant->players_count,
                'media_count' => $tenant->media_count,
                'users_count' => $tenant->users_count,
                'storage_usage_mb' => $tenant->getStorageUsageMb(),
                'created_at' => $tenant->created_at->diffForHumans(),
            ]);

        // Top tenants by storage
        $topTenantsByStorage = Tenant::query()
            ->select('tenants.*')
            ->leftJoin('media', 'tenants.id', '=', 'media.tenant_id')
            ->groupBy('tenants.id')
            ->orderByRaw('COALESCE(SUM(media.size_bytes), 0) DESC')
            ->limit(5)
            ->get()
            ->map(fn ($tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'storage_usage_mb' => $tenant->getStorageUsageMb(),
                'storage_limit_mb' => $tenant->storage_limit_mb,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'tenants' => [
                    'total' => $totalTenants,
                    'active' => $activeTenants,
                    'inactive' => $inactiveTenants,
                ],
                'players' => [
                    'total' => $totalPlayers,
                    'online' => $onlinePlayers,
                    'offline' => $offlinePlayers,
                ],
                'storage' => [
                    'total_bytes' => $totalStorageBytes,
                    'media_count' => $totalMediaCount,
                ],
                'users' => [
                    'total' => $totalUsers,
                    'super_admins' => $superAdmins,
                ],
            ],
            'recentTenants' => $recentTenants,
            'topTenantsByStorage' => $topTenantsByStorage,
        ]);
    }

    protected function authorizeSuperAdmin(): void
    {
        if (! auth()->user()?->is_super_admin) {
            abort(403, 'This action is restricted to super administrators.');
        }
    }
}
