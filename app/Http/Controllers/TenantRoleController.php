<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\TenantRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TenantRoleController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('tenant/settings/roles', [
            'filters' => $request->only(['search']),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSortFields = ['name', 'is_system', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        $query = TenantRole::query()
            ->withCount('users')
            ->withCount('permissions')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'ilike', "%{$search}%"))
            ->orderBy($sortField, $sortDirection);

        $roles = $query->paginate($perPage);

        return response()->json([
            'data' => $roles->through(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'is_system' => $role->is_system,
                'is_deletable' => $role->is_deletable,
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions_count,
                'created_at' => $role->created_at?->diffForHumans(),
            ]),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'last_page' => $roles->lastPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
                'from' => $roles->firstItem(),
                'to' => $roles->lastItem(),
            ],
        ]);
    }

    public function create(): Response
    {
        $permissions = Permission::where('module', '!=', 'player_groups')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('roles/form', [
            'role' => null,
            'permissions' => $permissions->map(fn ($p) => [
                'id' => $p->id,
                'module' => $p->module,
                'action' => $p->action,
                'name' => $p->name,
            ]),
            'permissionsByModule' => $permissions->groupBy('module')->map(fn ($items) => $items->map(fn ($p) => [
                'id' => $p->id,
                'action' => $p->action,
                'name' => $p->name,
            ])),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['uuid', 'exists:permissions,id'],
        ]);

        $slug = Str::slug($validated['name']);

        // Check if role with same slug already exists in this tenant
        $exists = TenantRole::where('slug', $slug)->exists();
        if ($exists) {
            return back()->withErrors(['name' => 'Um papel com este nome já existe.']);
        }

        $role = TenantRole::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'is_system' => false,
            'is_deletable' => true,
        ]);

        $role->permissions()->sync($validated['permissions']);

        return redirect()->route('tenant.settings.roles')
            ->with('success', 'Papel criado com sucesso.');
    }

    public function edit(TenantRole $role): Response
    {
        $permissions = Permission::where('module', '!=', 'player_groups')
            ->orderBy('sort_order')
            ->get();
        $rolePermissionIds = $role->permissions()
            ->where('module', '!=', 'player_groups')
            ->pluck('permissions.id')
            ->toArray();

        return Inertia::render('roles/form', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'is_system' => $role->is_system,
                'is_deletable' => $role->is_deletable,
                'permissions' => $rolePermissionIds,
            ],
            'permissions' => $permissions->map(fn ($p) => [
                'id' => $p->id,
                'module' => $p->module,
                'action' => $p->action,
                'name' => $p->name,
            ]),
            'permissionsByModule' => $permissions->groupBy('module')->map(fn ($items) => $items->map(fn ($p) => [
                'id' => $p->id,
                'action' => $p->action,
                'name' => $p->name,
            ])),
        ]);
    }

    public function update(Request $request, TenantRole $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['uuid', 'exists:permissions,id'],
        ]);

        // If it's a system role, only allow updating permissions, not name
        if ($role->is_system) {
            $role->permissions()->sync($validated['permissions']);

            // Clear permissions cache for users with this role
            $this->clearUsersCacheForRole($role);

            return redirect()->route('tenant.settings.roles')
                ->with('success', 'Permissões atualizadas com sucesso.');
        }

        $slug = Str::slug($validated['name']);

        // Check if another role with same slug already exists
        $exists = TenantRole::where('slug', $slug)
            ->where('id', '!=', $role->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'Um papel com este nome já existe.']);
        }

        $role->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        $role->permissions()->sync($validated['permissions']);

        // Clear permissions cache for users with this role
        $this->clearUsersCacheForRole($role);

        return redirect()->route('tenant.settings.roles')
            ->with('success', 'Papel atualizado com sucesso.');
    }

    public function destroy(TenantRole $role): RedirectResponse
    {
        if (! $role->is_deletable) {
            return back()->withErrors(['error' => 'Este papel não pode ser excluído.']);
        }

        // Check if any users are using this role
        if ($role->users()->count() > 0) {
            return back()->withErrors(['error' => 'Não é possível excluir um papel que está sendo usado por usuários.']);
        }

        $role->delete();

        return back()->with('success', 'Papel excluído com sucesso.');
    }

    /**
     * API endpoint to list all roles for select inputs
     */
    public function list(Request $request): JsonResponse
    {
        $roles = TenantRole::query()
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'is_system']);

        return response()->json($roles);
    }

    /**
     * Clear permissions cache for all users with a specific role
     */
    private function clearUsersCacheForRole(TenantRole $role): void
    {
        $tenantId = $role->tenant_id;

        $role->users()
            ->with('user')
            ->get()
            ->each(function ($tenantUser) use ($tenantId) {
                if ($tenantUser->user) {
                    cache()->forget("user:{$tenantUser->user->id}:tenant:{$tenantId}:permissions");
                }
            });
    }
}
