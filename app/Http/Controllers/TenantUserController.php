<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\TenantRole;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TenantUserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('tenant/settings/users', [
            'filters' => $request->only(['search']),
            'canManageUsers' => $request->user()->isAdminInTenant() || $request->user()->isSuperAdmin(),
        ]);
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $tenantId = session('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'email', 'role', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        // Handle pivot field sorting
        $pivotFields = ['role', 'created_at'];
        $isPivotField = in_array($sortField, $pivotFields);

        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = $tenant->users()
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            }));

        if ($isPivotField) {
            $query->orderByPivot($sortField, $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $users = $query->paginate($perPage);

        // Get all roles for this tenant to map role_id to role info
        $roles = TenantRole::where('tenant_id', $tenantId)->get()->keyBy('id');

        return response()->json([
            'data' => $users->through(function ($user) use ($roles) {
                $role = $user->pivot->tenant_role_id
                    ? ($roles[$user->pivot->tenant_role_id] ?? null)
                    : null;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role?->slug ?? $user->pivot->role,
                    'role_name' => $role?->name ?? ucfirst($user->pivot->role ?? 'viewer'),
                    'tenant_role_id' => $user->pivot->tenant_role_id,
                    'is_super_admin' => $user->is_super_admin,
                    'created_at' => $user->pivot->created_at?->toISOString(),
                ];
            }),
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

    public function create(): Response
    {
        return Inertia::render('users/form', [
            'roles' => $this->getRoleOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = session('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', 'uuid', Rule::exists('tenant_roles', 'id')->where('tenant_id', $tenantId)],
            'send_invitation' => ['boolean'],
        ]);

        $tenantRole = TenantRole::findOrFail($validated['role']);

        // Check if user already exists
        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            // Check if already member of this tenant
            if ($tenant->users()->where('user_id', $user->id)->exists()) {
                return back()->withErrors(['email' => 'This user is already a member of this organization.']);
            }

            // Add existing user to tenant
            $tenant->users()->attach($user->id, [
                'tenant_role_id' => $tenantRole->id,
                'role' => $tenantRole->slug, // Keep for backwards compatibility
                'created_at' => now(),
            ]);

            return redirect()->route('tenant.settings.users')
                ->with('success', "User {$user->name} has been added to the organization.");
        }

        // Create new user with random password (they'll set it via email link)
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make(Str::random(32)),
        ]);

        $tenant->users()->attach($user->id, [
            'tenant_role_id' => $tenantRole->id,
            'role' => $tenantRole->slug, // Keep for backwards compatibility
            'created_at' => now(),
        ]);

        // Send invitation email with password reset link
        $user->notify(new UserInvitation(
            tenantName: $tenant->name,
            role: $tenantRole->name,
            inviterName: $request->user()->name,
        ));

        return redirect()->route('tenant.settings.users')
            ->with('success', "User {$user->name} has been created. An invitation email was sent.");
    }

    public function edit(User $user): Response
    {
        $tenantId = session('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $pivotData = $tenant->users()->where('user_id', $user->id)->first()?->pivot;

        if (! $pivotData) {
            abort(404);
        }

        return Inertia::render('users/form', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $pivotData->tenant_role_id ?? $pivotData->role,
                'is_super_admin' => $user->is_super_admin,
            ],
            'roles' => $this->getRoleOptions(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $tenantId = session('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $validated = $request->validate([
            'role' => ['required', 'uuid', Rule::exists('tenant_roles', 'id')->where('tenant_id', $tenantId)],
        ]);

        $tenantRole = TenantRole::findOrFail($validated['role']);

        // Cannot change role of super admin
        if ($user->is_super_admin) {
            return back()->withErrors(['role' => 'Cannot change the role of a super admin.']);
        }

        // Get admin role for this tenant
        $adminRole = TenantRole::where('tenant_id', $tenantId)
            ->where('slug', 'admin')
            ->first();

        // Cannot demote yourself if you're the only admin
        $currentUser = $request->user();
        if ($user->id === $currentUser->id && $tenantRole->slug !== 'admin') {
            $adminCount = $tenant->users()
                ->wherePivot('tenant_role_id', $adminRole?->id)
                ->where('user_id', '!=', $user->id)
                ->count();

            if ($adminCount === 0) {
                return back()->withErrors(['role' => 'You cannot change your own role. There must be at least one admin.']);
            }
        }

        $tenant->users()->updateExistingPivot($user->id, [
            'tenant_role_id' => $tenantRole->id,
            'role' => $tenantRole->slug, // Keep for backwards compatibility
        ]);

        // Clear user's permissions cache
        $user->clearPermissionsCache($tenant);

        return redirect()->route('tenant.settings.users')
            ->with('success', 'User role has been updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $tenantId = session('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        // Cannot remove super admin
        if ($user->is_super_admin) {
            return back()->withErrors(['error' => 'Cannot remove a super admin from the organization.']);
        }

        // Cannot remove yourself
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'You cannot remove yourself from the organization.']);
        }

        // Check if this would leave no admins
        $userRole = $tenant->users()->where('user_id', $user->id)->first()?->pivot?->role;
        if ($userRole === 'admin') {
            $adminCount = $tenant->users()
                ->wherePivot('role', 'admin')
                ->where('user_id', '!=', $user->id)
                ->count();

            if ($adminCount === 0) {
                return back()->withErrors(['error' => 'Cannot remove the last admin from the organization.']);
            }
        }

        $tenant->users()->detach($user->id);

        return redirect()->route('tenant.settings.users')
            ->with('success', 'User has been removed from the organization.');
    }

    protected function getRoleOptions(): array
    {
        $tenantId = session('current_tenant_id');

        return TenantRole::where('tenant_id', $tenantId)
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn ($role) => [
                'value' => $role->id,
                'slug' => $role->slug,
                'label' => $role->name,
                'description' => $role->description ?? '',
                'is_system' => $role->is_system,
            ])
            ->toArray();
    }
}
