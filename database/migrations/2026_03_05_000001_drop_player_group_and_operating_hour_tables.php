<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop columns first (this removes FK constraints)
        if (Schema::hasColumn('players', 'player_group_id')) {
            DB::statement('ALTER TABLE players DROP COLUMN player_group_id');
        }

        // Then drop tables
        Schema::dropIfExists('player_group_layout_region_playlists');
        Schema::dropIfExists('player_group_layouts');
        Schema::dropIfExists('player_group_region_playlists');
        Schema::dropIfExists('player_groups');
        Schema::dropIfExists('operating_hour_templates');
    }

    public function down(): void
    {
        // Not reversible - data would be lost
    }
};
