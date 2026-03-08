<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Migrates existing layout assignments from:
     * - player_groups.layout_id → player_group_layouts (with is_default=true)
     * - player_group_region_playlists → player_group_layout_region_playlists
     */
    public function up(): void
    {
        // Step 1: Migrate player_groups with layout_id to player_group_layouts
        $groupsWithLayout = DB::table('player_groups')
            ->whereNotNull('layout_id')
            ->get();

        foreach ($groupsWithLayout as $group) {
            $playerGroupLayoutId = (string) Str::uuid();

            // Create the player_group_layout entry
            DB::table('player_group_layouts')->insert([
                'id' => $playerGroupLayoutId,
                'player_group_id' => $group->id,
                'layout_id' => $group->layout_id,
                'schedule_type' => 'always',
                'starts_at' => null,
                'ends_at' => null,
                'day_schedules' => null,
                'priority' => 0,
                'is_default' => true,
                'regions_overlay' => $group->regions_overlay ?? false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Step 2: Migrate region playlists for this group
            $regionPlaylists = DB::table('player_group_region_playlists')
                ->where('player_group_id', $group->id)
                ->get();

            foreach ($regionPlaylists as $regionPlaylist) {
                DB::table('player_group_layout_region_playlists')->insert([
                    'id' => (string) Str::uuid(),
                    'player_group_layout_id' => $playerGroupLayoutId,
                    'layout_region_id' => $regionPlaylist->layout_region_id,
                    'playlist_id' => $regionPlaylist->playlist_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Note: We keep the old columns (layout_id, regions_overlay, player_group_region_playlists)
        // for backward compatibility during the transition period.
        // They can be removed in a future migration once all code is updated.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear the new tables (data will be restored from original columns)
        DB::table('player_group_layout_region_playlists')->truncate();
        DB::table('player_group_layouts')->truncate();
    }
};
