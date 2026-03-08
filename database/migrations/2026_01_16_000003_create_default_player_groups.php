<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Create default group for each existing tenant
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            $groupId = (string) Str::uuid();

            DB::table('player_groups')->insert([
                'id' => $groupId,
                'tenant_id' => $tenant->id,
                'name' => 'Grupo Padrão',
                'description' => 'Grupo padrão para os players',
                'playlist_id' => null,
                'is_default' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign all players of this tenant to the default group
            DB::table('players')
                ->where('tenant_id', $tenant->id)
                ->update(['player_group_id' => $groupId]);
        }
    }

    public function down(): void
    {
        // Set all player_group_id to null
        DB::table('players')->update(['player_group_id' => null]);

        // Delete all player groups
        DB::table('player_groups')->delete();
    }
};
