<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate existing playlist_media data to playlist_items
        DB::statement("
            INSERT INTO playlist_items (id, playlist_id, item_type, item_id, position, duration_override, is_active, settings, created_at, updated_at)
            SELECT id, playlist_id, 'media', media_id, position, duration_override, is_active, settings, created_at, updated_at
            FROM playlist_media
        ");
    }

    public function down(): void
    {
        // Clear migrated data (only media items that came from playlist_media)
        DB::table('playlist_items')->where('item_type', 'media')->delete();
    }
};
