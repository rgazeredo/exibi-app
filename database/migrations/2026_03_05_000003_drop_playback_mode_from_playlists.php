<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getSchemaBuilder()->hasColumn('playlists', 'playback_mode')) {
            DB::statement('ALTER TABLE playlists DROP COLUMN playback_mode');
        }
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE playlists ADD COLUMN playback_mode VARCHAR(20) DEFAULT 'sequential'");
    }
};
