<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Mídia
            ['module' => 'media', 'action' => 'view', 'name' => 'Visualizar Mídias', 'sort_order' => 1],
            ['module' => 'media', 'action' => 'create', 'name' => 'Criar Mídias', 'sort_order' => 2],
            ['module' => 'media', 'action' => 'edit', 'name' => 'Editar Mídias', 'sort_order' => 3],
            ['module' => 'media', 'action' => 'delete', 'name' => 'Deletar Mídias', 'sort_order' => 4],

            // Playlists
            ['module' => 'playlists', 'action' => 'view', 'name' => 'Visualizar Playlists', 'sort_order' => 5],
            ['module' => 'playlists', 'action' => 'create', 'name' => 'Criar Playlists', 'sort_order' => 6],
            ['module' => 'playlists', 'action' => 'edit', 'name' => 'Editar Playlists', 'sort_order' => 7],
            ['module' => 'playlists', 'action' => 'delete', 'name' => 'Deletar Playlists', 'sort_order' => 8],

            // Players
            ['module' => 'players', 'action' => 'view', 'name' => 'Visualizar Players', 'sort_order' => 9],
            ['module' => 'players', 'action' => 'create', 'name' => 'Criar Players', 'sort_order' => 10],
            ['module' => 'players', 'action' => 'edit', 'name' => 'Editar Players', 'sort_order' => 11],
            ['module' => 'players', 'action' => 'delete', 'name' => 'Deletar Players', 'sort_order' => 12],

            // Widgets
            ['module' => 'widgets', 'action' => 'view', 'name' => 'Visualizar Widgets', 'sort_order' => 13],
            ['module' => 'widgets', 'action' => 'create', 'name' => 'Criar Widgets', 'sort_order' => 14],
            ['module' => 'widgets', 'action' => 'edit', 'name' => 'Editar Widgets', 'sort_order' => 15],
            ['module' => 'widgets', 'action' => 'delete', 'name' => 'Deletar Widgets', 'sort_order' => 16],

            // Tags
            ['module' => 'tags', 'action' => 'view', 'name' => 'Visualizar Tags', 'sort_order' => 17],
            ['module' => 'tags', 'action' => 'create', 'name' => 'Criar Tags', 'sort_order' => 18],
            ['module' => 'tags', 'action' => 'edit', 'name' => 'Editar Tags', 'sort_order' => 19],
            ['module' => 'tags', 'action' => 'delete', 'name' => 'Deletar Tags', 'sort_order' => 20],

            // Relatórios
            ['module' => 'reports', 'action' => 'view', 'name' => 'Visualizar Relatórios', 'sort_order' => 21],

            // Usuários
            ['module' => 'users', 'action' => 'view', 'name' => 'Visualizar Usuários', 'sort_order' => 22],
            ['module' => 'users', 'action' => 'create', 'name' => 'Criar Usuários', 'sort_order' => 23],
            ['module' => 'users', 'action' => 'edit', 'name' => 'Editar Usuários', 'sort_order' => 24],
            ['module' => 'users', 'action' => 'delete', 'name' => 'Deletar Usuários', 'sort_order' => 25],

            // Papéis e Permissões
            ['module' => 'roles', 'action' => 'view', 'name' => 'Visualizar Papéis', 'sort_order' => 26],
            ['module' => 'roles', 'action' => 'create', 'name' => 'Criar Papéis', 'sort_order' => 27],
            ['module' => 'roles', 'action' => 'edit', 'name' => 'Editar Papéis', 'sort_order' => 28],
            ['module' => 'roles', 'action' => 'delete', 'name' => 'Deletar Papéis', 'sort_order' => 29],

            // Configurações
            ['module' => 'settings', 'action' => 'manage', 'name' => 'Gerenciar Configurações', 'sort_order' => 30],
        ];

        $now = now();

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['module' => $permission['module'], 'action' => $permission['action']],
                [
                    'id' => Str::uuid(),
                    'name' => $permission['name'],
                    'sort_order' => $permission['sort_order'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
