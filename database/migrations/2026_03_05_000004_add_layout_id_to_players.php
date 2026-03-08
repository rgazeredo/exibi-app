<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->uuid('layout_id')->nullable()->after('player_group_id');
            $table->foreign('layout_id')->references('id')->on('layouts')->onDelete('set null');
        });

        Schema::dropIfExists('player_layout_region_playlists');
        Schema::dropIfExists('player_layouts');
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropForeign(['layout_id']);
            $table->dropColumn('layout_id');
        });
    }
};
