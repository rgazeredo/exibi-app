<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get the IDs of player_groups permissions
        $permissionIds = DB::table('permissions')
            ->where('module', 'player_groups')
            ->pluck('id');

        if ($permissionIds->isNotEmpty()) {
            // Remove from tenant_role_permissions pivot table
            DB::table('tenant_role_permissions')
                ->whereIn('permission_id', $permissionIds)
                ->delete();

            // Remove the permissions themselves
            DB::table('permissions')
                ->where('module', 'player_groups')
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not reversible - player groups feature has been removed
    }
};
