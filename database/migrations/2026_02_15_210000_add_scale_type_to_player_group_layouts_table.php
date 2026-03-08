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
        Schema::table('player_group_layouts', function (Blueprint $table) {
            // Scale type: 'aspect' (maintain aspect ratio) or 'stretched' (fill region)
            $table->string('scale_type', 20)->default('aspect')->after('regions_overlay');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('player_group_layouts', function (Blueprint $table) {
            $table->dropColumn('scale_type');
        });
    }
};
