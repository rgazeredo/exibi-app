<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Make player_group_id optional.
     *
     * This allows players to exist without belonging to a group.
     * Players without a group will use default config and their own layouts.
     */
    public function up(): void
    {
        // Make player_group_id nullable using raw SQL (PostgreSQL compatible)
        DB::statement('ALTER TABLE players ALTER COLUMN player_group_id DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * Note: This will fail if there are players without a group.
     * You must assign all players to a group before running this.
     */
    public function down(): void
    {
        // Make player_group_id required again
        DB::statement('ALTER TABLE players ALTER COLUMN player_group_id SET NOT NULL');
    }
};
