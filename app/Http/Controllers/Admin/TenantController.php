<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Widget;
use App\Notifications\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/tenants/index');
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->authorizeSuperAdmin();

        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSortFields = ['name', 'slug', 'is_active', 'created_at', 'users_count', 'players_count', 'media_count'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = Tenant::query()
            ->withCount(['users', 'players', 'media', 'playlists']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('slug', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status') !== 'all') {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $tenants = $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $tenants->through(fn ($tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'is_active' => $tenant->is_active,
                'storage_limit_mb' => $tenant->storage_limit_mb,
                'players_limit' => $tenant->players_limit,
                'storage_usage_mb' => $tenant->getStorageUsageMb(),
                'storage_usage_percentage' => $tenant->getStorageUsagePercentage(),
                'players_count' => $tenant->players_count,
                'players_usage_percentage' => $tenant->getPlayersUsagePercentage(),
                'users_count' => $tenant->users_count,
                'media_count' => $tenant->media_count,
                'playlists_count' => $tenant->playlists_count,
                'created_at' => $tenant->created_at->toISOString(),
                'created_at_human' => $tenant->created_at->diffForHumans(),
            ]),
            'meta' => [
                'current_page' => $tenants->currentPage(),
                'last_page' => $tenants->lastPage(),
                'per_page' => $tenants->perPage(),
                'total' => $tenants->total(),
                'from' => $tenants->firstItem(),
                'to' => $tenants->lastItem(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/tenants/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:tenants,slug'],
            'storage_limit_mb' => ['nullable', 'integer', 'min:0'],
            'players_limit' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            // Optional admin user
            'create_admin' => ['boolean'],
            'admin_name' => ['required_if:create_admin,true', 'nullable', 'string', 'max:255'],
            'admin_email' => ['required_if:create_admin,true', 'nullable', 'email', 'max:255'],
        ];

        $validated = $request->validate($rules);

        // Normalize empty limits to null
        if (empty($validated['storage_limit_mb'])) {
            $validated['storage_limit_mb'] = null;
        }
        if (empty($validated['players_limit'])) {
            $validated['players_limit'] = null;
        }

        $tenant = DB::transaction(function () use ($validated, $request) {
            $tenant = Tenant::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'storage_limit_mb' => $validated['storage_limit_mb'],
                'players_limit' => $validated['players_limit'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Create admin user if requested
            if (! empty($validated['create_admin']) && ! empty($validated['admin_email'])) {
                $user = User::where('email', $validated['admin_email'])->first();

                // Get the admin role for this tenant (query directly to avoid cache issues)
                $adminRoleId = DB::table('tenant_roles')
                    ->where('tenant_id', $tenant->id)
                    ->where('slug', 'admin')
                    ->value('id');

                if ($user) {
                    // Add existing user to tenant as admin
                    if (! $tenant->users()->where('user_id', $user->id)->exists()) {
                        $tenant->users()->attach($user->id, [
                            'role' => 'admin',
                            'tenant_role_id' => $adminRoleId,
                            'created_at' => now(),
                        ]);
                    }
                } else {
                    // Create new user
                    $user = User::create([
                        'name' => $validated['admin_name'],
                        'email' => $validated['admin_email'],
                        'password' => Hash::make(Str::random(32)),
                    ]);

                    $tenant->users()->attach($user->id, [
                        'role' => 'admin',
                        'tenant_role_id' => $adminRoleId,
                        'created_at' => now(),
                    ]);

                    // Send invitation email
                    $user->notify(new UserInvitation(
                        tenantName: $tenant->name,
                        role: 'admin',
                        inviterName: $request->user()->name,
                    ));
                }
            }

            return $tenant;
        });

        $message = "Organization '{$tenant->name}' created successfully.";
        if (! empty($validated['create_admin']) && ! empty($validated['admin_email'])) {
            $message .= ' An invitation email was sent to the admin.';
        }

        return redirect()
            ->route('admin.tenants.index')
            ->with('success', $message);
    }

    public function edit(Tenant $tenant): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/tenants/form', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'storage_limit_mb' => $tenant->storage_limit_mb,
                'players_limit' => $tenant->players_limit,
                'is_active' => $tenant->is_active,
                'storage_usage_mb' => $tenant->getStorageUsageMb(),
                'players_count' => $tenant->getPlayersCount(),
            ],
        ]);
    }

    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('tenants', 'slug')->ignore($tenant->id)],
            'storage_limit_mb' => ['nullable', 'integer', 'min:0'],
            'players_limit' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        // Normalize empty limits to null
        if (empty($validated['storage_limit_mb'])) {
            $validated['storage_limit_mb'] = null;
        }
        if (empty($validated['players_limit'])) {
            $validated['players_limit'] = null;
        }

        $tenant->update($validated);

        return redirect()
            ->route('admin.tenants.index')
            ->with('success', "Organization '{$tenant->name}' updated successfully.");
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $name = $tenant->name;

        DB::transaction(function () use ($tenant) {
            // 1. Delete S3 files for all media
            $mediaItems = $tenant->media()->get();
            foreach ($mediaItems as $media) {
                // Delete main file
                if ($media->path) {
                    Storage::disk('s3')->delete($media->path);
                }
                // Delete thumbnail
                if ($media->thumbnail_path) {
                    Storage::disk('s3')->delete($media->thumbnail_path);
                }
                // Delete transcoded versions
                foreach ($media->getTranscodedVersions() as $version) {
                    if (isset($version['path'])) {
                        Storage::disk('s3')->delete($version['path']);
                    }
                }
            }

            // 2. Delete playback logs
            $tenant->playbackLogs()->delete();

            // 3. Delete taggables (morph pivot for tags)
            $mediaIds = $tenant->media()->pluck('id');
            $playlistIds = $tenant->playlists()->pluck('id');
            $playerIds = $tenant->players()->pluck('id');

            DB::table('taggables')
                ->where(function ($query) use ($mediaIds) {
                    $query->where('taggable_type', 'App\\Models\\Media')
                        ->whereIn('taggable_id', $mediaIds);
                })
                ->orWhere(function ($query) use ($playlistIds) {
                    $query->where('taggable_type', 'App\\Models\\Playlist')
                        ->whereIn('taggable_id', $playlistIds);
                })
                ->orWhere(function ($query) use ($playerIds) {
                    $query->where('taggable_type', 'App\\Models\\Player')
                        ->whereIn('taggable_id', $playerIds);
                })
                ->delete();

            // 4. Delete playlist_media and playlist_items pivot records
            DB::table('playlist_media')->whereIn('playlist_id', $playlistIds)->delete();
            DB::table('playlist_items')->whereIn('playlist_id', $playlistIds)->delete();

            // 5. Delete pending player activations
            DB::table('pending_player_activations')->where('tenant_id', $tenant->id)->delete();

            // 6. Delete player heartbeats
            DB::table('player_heartbeats')->whereIn('player_id', $playerIds)->delete();

            // 7. Delete operating hour templates
            DB::table('operating_hour_templates')->where('tenant_id', $tenant->id)->delete();

            // 8. Delete system events
            DB::table('system_events')->where('tenant_id', $tenant->id)->delete();

            // 9. Delete layouts (layout_regions cascade automatically)
            DB::table('layouts')->where('tenant_id', $tenant->id)->delete();

            // 10. Delete media (records already have files deleted)
            $tenant->media()->delete();

            // 11. Delete playlists
            $tenant->playlists()->delete();

            // 12. Delete players (player_layouts, player_region_playlists cascade automatically)
            $tenant->players()->delete();

            // 13. Delete player groups (player_group_layouts, player_group_region_playlists cascade automatically)
            $tenant->playerGroups()->delete();

            // 14. Delete widgets (only tenant-owned, not global)
            Widget::withoutGlobalScopes()->where('tenant_id', $tenant->id)->delete();

            // 15. Delete tags
            Tag::withoutGlobalScopes()->where('tenant_id', $tenant->id)->delete();

            // 16. Delete tenant roles (tenant_role_permissions cascade automatically)
            $tenant->roles()->delete();

            // 18. Get users that ONLY belong to this tenant (to delete them)
            // First get user IDs from this tenant
            $userIds = DB::table('tenant_user')
                ->where('tenant_id', $tenant->id)
                ->pluck('user_id')
                ->toArray();

            // Find users that belong ONLY to this tenant (count = 1) and are not super admins
            $usersToDelete = [];
            if (! empty($userIds)) {
                $usersToDelete = User::whereIn('id', $userIds)
                    ->where('is_super_admin', false)
                    ->get()
                    ->filter(function ($user) {
                        // Count how many tenants this user belongs to
                        return DB::table('tenant_user')
                            ->where('user_id', $user->id)
                            ->count() === 1;
                    })
                    ->pluck('id')
                    ->toArray();
            }

            // 19. Remove all user associations from this tenant
            DB::table('tenant_user')->where('tenant_id', $tenant->id)->delete();

            // 20. Delete users that only belonged to this tenant
            if (! empty($usersToDelete)) {
                User::whereIn('id', $usersToDelete)->delete();
            }

            // 21. Delete tenant
            $tenant->delete();
        });

        return redirect()
            ->route('admin.tenants.index')
            ->with('success', "Organization '{$name}' and all its data deleted successfully.");
    }

    public function toggleStatus(Tenant $tenant): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $tenant->update(['is_active' => ! $tenant->is_active]);

        $status = $tenant->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Organization '{$tenant->name}' {$status} successfully.");
    }

    public function users(Tenant $tenant): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/tenants/users', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
        ]);
    }

    public function searchUsers(Request $request, Tenant $tenant): \Illuminate\Http\JsonResponse
    {
        $this->authorizeSuperAdmin();

        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSortFields = ['name', 'email', 'role', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = $tenant->users();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            if ($role !== 'all') {
                $query->wherePivot('role', $role);
            }
        }

        // Handle sorting - role is in pivot table
        if ($sortField === 'role') {
            $query->orderBy('tenant_user.role', $sortDirection);
        } elseif ($sortField === 'created_at') {
            $query->orderBy('tenant_user.created_at', $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
                'created_at' => $user->pivot->created_at?->toISOString(),
                'created_at_human' => $user->pivot->created_at?->diffForHumans(),
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ],
        ]);
    }

    public function createUser(Tenant $tenant): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/tenants/user-form', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
        ]);
    }

    public function storeUser(Request $request, Tenant $tenant): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'role' => ['required', 'string', 'in:admin,editor,viewer'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Get the role for this tenant
        $tenantRole = $tenant->getRole($validated['role']);

        if ($user) {
            // Check if user is already a member of this tenant
            if ($tenant->users()->where('user_id', $user->id)->exists()) {
                return back()->withErrors([
                    'email' => 'This user is already a member of this organization.',
                ]);
            }

            // Add existing user to tenant
            $tenant->users()->attach($user->id, [
                'role' => $validated['role'],
                'tenant_role_id' => $tenantRole?->id,
                'created_at' => now(),
            ]);
        } else {
            // Create new user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(32)),
            ]);

            $tenant->users()->attach($user->id, [
                'role' => $validated['role'],
                'tenant_role_id' => $tenantRole?->id,
                'created_at' => now(),
            ]);

            // Send invitation email
            $user->notify(new UserInvitation(
                tenantName: $tenant->name,
                role: $validated['role'],
                inviterName: $request->user()->name,
            ));
        }

        return redirect()
            ->route('admin.tenants.users.index', $tenant)
            ->with('success', "User '{$user->name}' added to '{$tenant->name}' successfully.");
    }

    public function destroyUser(Tenant $tenant, User $user): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        if (! $tenant->users()->where('user_id', $user->id)->exists()) {
            abort(404);
        }

        $tenant->users()->detach($user->id);

        return back()->with('success', "User '{$user->name}' removed from '{$tenant->name}' successfully.");
    }

    /**
     * Ensure user is a super admin.
     */
    protected function authorizeSuperAdmin(): void
    {
        if (! auth()->user()?->is_super_admin) {
            abort(403, 'This action is restricted to super administrators.');
        }
    }
}
