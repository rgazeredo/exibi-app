<?php

use App\Http\Controllers\Admin\AppReleaseController as AdminAppReleaseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\TenantController as AdminTenantController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\WidgetController as AdminWidgetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\TenantRoleController;
use App\Http\Controllers\TenantSettingsController;
use App\Http\Controllers\TenantUserController;
use App\Http\Controllers\WidgetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Domain Configuration
|--------------------------------------------------------------------------
|
| Production:
|   - exibi.com.br -> Landing page only
|   - app.exibi.com.br -> Admin panel (login, dashboard, etc.)
|
| Local development:
|   - localhost:8000/ -> Landing page
|   - localhost:8000/login -> Login page
|   - localhost:8000/dashboard -> Dashboard
|   (No subdomain needed locally)
|
*/

$appDomain = config('app.domain', 'localhost');
$isSubdomainMode = ! str_contains($appDomain, 'localhost') && $appDomain !== 'localhost';

/*
|--------------------------------------------------------------------------
| Landing Page Routes
|--------------------------------------------------------------------------
*/

if ($isSubdomainMode) {
    // Production: redirect main domain to app subdomain (temporary)
    Route::domain($appDomain)->group(function () {
        Route::get('/', function () {
            return redirect('https://app.'.config('app.domain'));
        })->name('landing.redirect');

        // Landing page preview at /beta
        Route::get('/beta', [LandingController::class, 'index'])->name('landing');

        // TODO: Restore landing page later by swapping / and /beta routes
    });
} else {
    // Local: landing page at root
    Route::get('/', [LandingController::class, 'index'])->name('landing');
}

/*
|--------------------------------------------------------------------------
| Admin Panel Routes
|--------------------------------------------------------------------------
|
| For production with subdomain:
|   - All admin routes are on app.{domain}
|   - Fortify auth routes need FORTIFY_DOMAIN=app.{domain} in .env
|
| For local development:
|   - All routes at root level (no subdomain)
|   - Fortify auth routes at default paths (/login, /logout, etc.)
|
*/

$adminRoutes = function () {
    // Redirect root to dashboard (or login if not authenticated)
    Route::get('/', function () {
        return redirect()->route('dashboard');
    })->middleware(['auth', 'verified'])->name('home');

    // Tenant selection routes (auth required, but no tenant required)
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('tenant/select', [TenantController::class, 'select'])->name('tenant.select');
        Route::post('tenant/switch', [TenantController::class, 'switch'])->name('tenant.switch');
        Route::get('tenant/current', [TenantController::class, 'current'])->name('tenant.current');
    });

    // Super Admin routes (no tenant context required)
    Route::middleware(['auth', 'verified'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

            // Tenants
            Route::resource('tenants', AdminTenantController::class)->except(['show']);
            Route::get('api/tenants/search', [AdminTenantController::class, 'search'])->name('tenants.search');
            Route::post('tenants/{tenant}/toggle-status', [AdminTenantController::class, 'toggleStatus'])
                ->name('tenants.toggle-status');
            Route::get('tenants/{tenant}/users', [AdminTenantController::class, 'users'])
                ->name('tenants.users.index');
            Route::get('api/tenants/{tenant}/users/search', [AdminTenantController::class, 'searchUsers'])
                ->name('tenants.users.search');
            Route::get('tenants/{tenant}/users/create', [AdminTenantController::class, 'createUser'])
                ->name('tenants.users.create');
            Route::post('tenants/{tenant}/users', [AdminTenantController::class, 'storeUser'])
                ->name('tenants.users.store');
            Route::delete('tenants/{tenant}/users/{user}', [AdminTenantController::class, 'destroyUser'])
                ->name('tenants.users.destroy');

            // Admin Users
            Route::resource('users', AdminUserController::class)->except(['show']);
            Route::get('api/users/search', [AdminUserController::class, 'search'])->name('users.search');

            // Releases
            Route::resource('releases', AdminAppReleaseController::class)->except(['show']);
            Route::post('releases/{release}/activate', [AdminAppReleaseController::class, 'activate'])
                ->name('releases.activate');

            // Global Widgets (lottery, news)
            Route::get('widgets', [AdminWidgetController::class, 'index'])->name('widgets.index');
            Route::get('api/widgets/search', [AdminWidgetController::class, 'search'])->name('widgets.search');
            Route::post('widgets', [AdminWidgetController::class, 'store'])->name('widgets.store');
            Route::patch('widgets/{widget}', [AdminWidgetController::class, 'update'])->name('widgets.update');
            Route::delete('widgets/{widget}', [AdminWidgetController::class, 'destroy'])->name('widgets.destroy');
            Route::post('widgets/{widget}/regenerate', [AdminWidgetController::class, 'regenerate'])
                ->name('widgets.regenerate');
            Route::post('widgets/regenerate-all', [AdminWidgetController::class, 'regenerateAll'])
                ->name('widgets.regenerate-all');
        });

    // Routes that require tenant context
    Route::middleware(['auth', 'verified', 'tenant'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Players
        Route::resource('players', PlayerController::class);
        Route::get('api/players/search', [PlayerController::class, 'search'])->name('players.search');
        Route::post('players/{player}/regenerate-token', [PlayerController::class, 'regenerateToken'])
            ->name('players.regenerate-token');
        Route::post('players/{player}/refresh-playlist', [PlayerController::class, 'refreshPlaylist'])
            ->name('players.refresh-playlist');
        Route::post('players/{player}/refresh-app', [PlayerController::class, 'refreshApp'])
            ->name('players.refresh-app');
        Route::post('players/{player}/reboot', [PlayerController::class, 'reboot'])
            ->name('players.reboot');
        Route::post('players/{player}/screenshot', [PlayerController::class, 'requestScreenshot'])
            ->name('players.screenshot');
        Route::get('players/{player}/screenshot-status', [PlayerController::class, 'screenshotStatus'])
            ->name('players.screenshot-status');
        Route::get('players/{player}/currently-playing', [PlayerController::class, 'currentlyPlaying'])
            ->name('players.currently-playing');
        Route::get('players/{player}/downloads', [PlayerController::class, 'downloads'])
            ->name('players.downloads');
        Route::post('players/{player}/replace', [PlayerController::class, 'replacePlayer'])
            ->name('players.replace');

        // Media
        Route::resource('media', MediaController::class);
        Route::get('api/media/search', [MediaController::class, 'search'])->name('media.search');
        Route::get('api/media/stats', [MediaController::class, 'stats'])->name('media.stats');
        Route::post('api/media/move', [MediaController::class, 'move'])->name('media.move');
        Route::post('api/media/bulk-delete', [MediaController::class, 'bulkDelete'])->name('media.bulk-delete');
        Route::get('api/media/{media}', [MediaController::class, 'apiShow'])->name('media.api.show');
        Route::post('media/{media}/replace', [MediaController::class, 'replace'])->name('media.replace');

        // Widgets
        Route::resource('widgets', WidgetController::class);
        Route::get('api/widgets/search', [WidgetController::class, 'search'])->name('widgets.search');
        Route::post('widgets/{widget}/regenerate', [WidgetController::class, 'regenerate'])->name('widgets.regenerate');

        // Playlists
        Route::resource('playlists', PlaylistController::class)->except(['edit']);
        Route::get('api/playlists/search', [PlaylistController::class, 'search'])->name('playlists.search');
        Route::put('playlists/{playlist}/items', [PlaylistController::class, 'updateItems'])
            ->name('playlists.items.update');
        Route::post('playlists/{playlist}/items', [PlaylistController::class, 'addItem'])
            ->name('playlists.items.add');
        Route::delete('playlists/{playlist}/items/{item}', [PlaylistController::class, 'removeItem'])
            ->name('playlists.items.remove');
        Route::post('playlists/{playlist}/reorder', [PlaylistController::class, 'reorderItems'])
            ->name('playlists.reorder');
        Route::post('playlists/{playlist}/duplicate', [PlaylistController::class, 'duplicate'])
            ->name('playlists.duplicate');
        Route::get('playlists/{playlist}/preview', [PlaylistController::class, 'preview'])
            ->name('playlists.preview');
        Route::post('playlists/{playlist}/refresh-players', [PlaylistController::class, 'refreshPlayers'])
            ->name('playlists.refresh-players');

        // Tags
        Route::get('tags', [TagController::class, 'index'])->name('tags.index');
        Route::post('tags', [TagController::class, 'store'])->name('tags.store');
        Route::put('tags/{tag}', [TagController::class, 'update'])->name('tags.update');
        Route::delete('tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');
        Route::get('api/tags/search', [TagController::class, 'search'])->name('tags.search');
        Route::get('api/tags', [TagController::class, 'list'])->name('tags.list');
        Route::post('api/tags', [TagController::class, 'storeApi'])->name('tags.store-api');

        // API routes for users and roles (outside admin middleware for API access)
        Route::get('api/users/search', [TenantUserController::class, 'search'])->name('users.search');
        Route::get('api/roles/search', [TenantRoleController::class, 'search'])->name('roles.search');
        Route::get('api/roles', [TenantRoleController::class, 'list'])->name('roles.list');

        // Tenant Settings (admin only) - includes Users and Roles
        Route::middleware('tenant.role:admin')->prefix('tenant/settings')->group(function () {
            // General Settings
            Route::get('/', [TenantSettingsController::class, 'index'])->name('tenant.settings');
            Route::post('/', [TenantSettingsController::class, 'update'])->name('tenant.settings.update');
            Route::post('/icon', [TenantSettingsController::class, 'uploadIcon'])->name('tenant.settings.icon');
            Route::delete('/icon', [TenantSettingsController::class, 'deleteIcon'])->name('tenant.settings.icon.delete');
            Route::post('/splash', [TenantSettingsController::class, 'uploadSplash'])->name('tenant.settings.splash');
            Route::delete('/splash', [TenantSettingsController::class, 'deleteSplash'])->name('tenant.settings.splash.delete');

            // Users (tenant members management)
            Route::get('/users', [TenantUserController::class, 'index'])->name('tenant.settings.users');
            Route::get('/users/create', [TenantUserController::class, 'create'])->name('tenant.settings.users.create');
            Route::post('/users', [TenantUserController::class, 'store'])->name('tenant.settings.users.store');
            Route::get('/users/{user}/edit', [TenantUserController::class, 'edit'])->name('tenant.settings.users.edit');
            Route::put('/users/{user}', [TenantUserController::class, 'update'])->name('tenant.settings.users.update');
            Route::delete('/users/{user}', [TenantUserController::class, 'destroy'])->name('tenant.settings.users.destroy');

            // Roles and Permissions
            Route::get('/roles', [TenantRoleController::class, 'index'])->name('tenant.settings.roles');
            Route::get('/roles/create', [TenantRoleController::class, 'create'])->name('tenant.settings.roles.create');
            Route::post('/roles', [TenantRoleController::class, 'store'])->name('tenant.settings.roles.store');
            Route::get('/roles/{role}/edit', [TenantRoleController::class, 'edit'])->name('tenant.settings.roles.edit');
            Route::put('/roles/{role}', [TenantRoleController::class, 'update'])->name('tenant.settings.roles.update');
            Route::delete('/roles/{role}', [TenantRoleController::class, 'destroy'])->name('tenant.settings.roles.destroy');
        });

        // Reports
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/logs', [ReportController::class, 'logsIndex'])->name('reports.logs.index');
        Route::get('reports/events', [ReportController::class, 'eventsIndex'])->name('reports.events.index');
        Route::get('api/reports/data', [ReportController::class, 'data'])->name('reports.data');
        Route::get('api/reports/logs', [ReportController::class, 'logs'])->name('reports.logs');
        Route::get('api/reports/events', [ReportController::class, 'events'])->name('reports.events');
    });
};

if ($isSubdomainMode) {
    // Production: admin panel on app.{domain} subdomain
    Route::domain('app.'.$appDomain)->group($adminRoutes);
} else {
    // Local: all routes at root level
    $adminRoutes();
}

require __DIR__.'/settings.php';
