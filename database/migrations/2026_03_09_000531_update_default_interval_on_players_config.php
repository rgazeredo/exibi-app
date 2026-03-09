<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update players that still have the old default of 15 minutes
        DB::statement("
            UPDATE players
            SET config = jsonb_set(config, '{update_interval_minutes}', '30')
            WHERE (config->>'update_interval_minutes')::int = 15
               OR config->>'update_interval_minutes' IS NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            UPDATE players
            SET config = jsonb_set(config, '{update_interval_minutes}', '15')
            WHERE (config->>'update_interval_minutes')::int = 30
        ");
    }
};
