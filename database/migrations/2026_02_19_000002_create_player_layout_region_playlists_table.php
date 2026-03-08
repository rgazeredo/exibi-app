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
        Schema::create('player_layout_region_playlists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_layout_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('layout_region_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('playlist_id')->constrained()->cascadeOnDelete();
            $table->string('scale_type', 20)->default('aspect'); // aspect, stretched
            $table->timestamps();

            $table->unique(['player_layout_id', 'layout_region_id']);
            $table->index('player_layout_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_layout_region_playlists');
    }
};
