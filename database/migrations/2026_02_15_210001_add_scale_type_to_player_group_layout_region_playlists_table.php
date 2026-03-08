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
        Schema::table('player_group_layout_region_playlists', function (Blueprint $table) {
            $table->string('scale_type', 20)->default('aspect')->after('playlist_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('player_group_layout_region_playlists', function (Blueprint $table) {
            $table->dropColumn('scale_type');
        });
    }
};
