<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Make player_group_id NOT NULL using raw SQL (PostgreSQL compatible)
        DB::statement('ALTER TABLE players ALTER COLUMN player_group_id SET NOT NULL');
    }

    public function down(): void
    {
        // Make player_group_id nullable again
        DB::statement('ALTER TABLE players ALTER COLUMN player_group_id DROP NOT NULL');
    }
};
