<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_region_playlists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('layout_region_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('playlist_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['player_id', 'layout_region_id'], 'prp_player_region_unique');
            $table->index('player_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_region_playlists');
    }
};
