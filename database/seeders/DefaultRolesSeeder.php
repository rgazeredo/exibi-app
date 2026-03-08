<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DefaultRolesSeeder extends Seeder
{
    /**
     * Define default roles and their permissions.
     */
    private array $defaultRoles = [
        'admin' => [
            'name' => 'Administrador',
            'description' => 'Acesso total ao sistema',
            'permissions' => '*', // All permissions
        ],
        'editor' => [
            'name' => 'Editor',
            'description' => 'Gerencia conteúdo (mídias, playlists, players)',
            'permissions' => [
                'media.view', 'media.create', 'media.edit', 'media.delete',
                'playlists.view', 'playlists.create', 'playlists.edit', 'playlists.delete',
                'players.view', 'players.create', 'players.edit', 'players.delete',
                'player_groups.view', 'player_groups.create', 'player_groups.edit', 'player_groups.delete',
                'widgets.view', 'widgets.create', 'widgets.edit', 'widgets.delete',
                'tags.view', 'tags.create', 'tags.edit', 'tags.delete',
                'reports.view',
            ],
        ],
        'viewer' => [
            'name' => 'Visualizador',
            'description' => 'Apenas visualização',
            'permissions' => [
                'media.view',
                'playlists.view',
                'players.view',
                'player_groups.view',
                'widgets.view',
                'tags.view',
                'reports.view',
            ],
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all permissions
        $permissions = DB::table('permissions')->get()->keyBy(function ($item) {
            return $item->module.'.'.$item->action;
        });

        // Get all tenants
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            $this->createRolesForTenant($tenant->id, $permissions);
        }

        // Migrate existing users to new role system
        $this->migrateExistingUsers();
    }

    /**
     * Create default roles for a tenant.
     */
    private function createRolesForTenant(string $tenantId, $permissions): void
    {
        $now = now();

        foreach ($this->defaultRoles as $slug => $roleData) {
            // Check if role already exists
            $existingRole = DB::table('tenant_roles')
                ->where('tenant_id', $tenantId)
                ->where('slug', $slug)
                ->first();

            if ($existingRole) {
                $roleId = $existingRole->id;
            } else {
                $roleId = (string) Str::uuid();
                DB::table('tenant_roles')->insert([
                    'id' => $roleId,
                    'tenant_id' => $tenantId,
                    'name' => $roleData['name'],
                    'slug' => $slug,
                    'description' => $roleData['description'],
                    'is_system' => true,
                    'is_deletable' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // Assign permissions
            $rolePermissions = $roleData['permissions'];

            if ($rolePermissions === '*') {
                // All permissions
                foreach ($permissions as $permission) {
                    $this->assignPermission($roleId, $permission->id);
                }
            } else {
                foreach ($rolePermissions as $permKey) {
                    if (isset($permissions[$permKey])) {
                        $this->assignPermission($roleId, $permissions[$permKey]->id);
                    }
                }
            }
        }
    }

    /**
     * Assign a permission to a role.
     */
    private function assignPermission(string $roleId, string $permissionId): void
    {
        $exists = DB::table('tenant_role_permissions')
            ->where('tenant_role_id', $roleId)
            ->where('permission_id', $permissionId)
            ->exists();

        if (! $exists) {
            DB::table('tenant_role_permissions')->insert([
                'id' => (string) Str::uuid(),
                'tenant_role_id' => $roleId,
                'permission_id' => $permissionId,
                'created_at' => now(),
            ]);
        }
    }

    /**
     * Migrate existing users from role string to tenant_role_id.
     */
    private function migrateExistingUsers(): void
    {
        // Get all tenant_user records that don't have tenant_role_id
        $users = DB::table('tenant_user')
            ->whereNull('tenant_role_id')
            ->get();

        foreach ($users as $user) {
            // Find the matching tenant_role
            $role = DB::table('tenant_roles')
                ->where('tenant_id', $user->tenant_id)
                ->where('slug', $user->role)
                ->first();

            if ($role) {
                DB::table('tenant_user')
                    ->where('tenant_id', $user->tenant_id)
                    ->where('user_id', $user->user_id)
                    ->update(['tenant_role_id' => $role->id]);
            }
        }
    }
}
