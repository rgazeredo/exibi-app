<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('player_group_layout_region_playlists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_group_layout_id')
                ->constrained('player_group_layouts')
                ->cascadeOnDelete();
            $table->foreignUuid('layout_region_id')
                ->constrained('layout_regions')
                ->cascadeOnDelete();
            $table->foreignUuid('playlist_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->timestamps();

            // Unique constraint: one playlist per region per scheduled layout
            $table->unique(
                ['player_group_layout_id', 'layout_region_id'],
                'pgl_region_playlist_unique'
            );

            // Index for faster lookups
            $table->index('player_group_layout_id', 'pgl_region_playlists_pgl_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_group_layout_region_playlists');
    }
};
