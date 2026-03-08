<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Create default playlist for each existing tenant and link to default group
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            // Check if tenant already has a default playlist
            $existingDefaultPlaylist = DB::table('playlists')
                ->where('tenant_id', $tenant->id)
                ->where('is_default', true)
                ->first();

            if ($existingDefaultPlaylist) {
                $playlistId = $existingDefaultPlaylist->id;
            } else {
                $playlistId = (string) Str::uuid();

                DB::table('playlists')->insert([
                    'id' => $playlistId,
                    'tenant_id' => $tenant->id,
                    'name' => 'Playlist Padrão',
                    'description' => 'Playlist padrão para os players',
                    'is_active' => true,
                    'is_default' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Link the default playlist to the default player group
            DB::table('player_groups')
                ->where('tenant_id', $tenant->id)
                ->where('is_default', true)
                ->whereNull('playlist_id')
                ->update(['playlist_id' => $playlistId]);
        }
    }

    public function down(): void
    {
        // Unlink playlists from default groups
        DB::table('player_groups')
            ->where('is_default', true)
            ->update(['playlist_id' => null]);

        // Delete default playlists
        DB::table('playlists')
            ->where('is_default', true)
            ->delete();
    }
};
