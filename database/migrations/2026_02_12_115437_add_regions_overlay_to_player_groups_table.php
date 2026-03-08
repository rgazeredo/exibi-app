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
        Schema::table('player_groups', function (Blueprint $table) {
            // When true, main region fills 100% and secondary regions overlay on top
            // When false (default), regions are laid out side by side without overlap
            $table->boolean('regions_overlay')->default(false)->after('layout_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('player_groups', function (Blueprint $table) {
            $table->dropColumn('regions_overlay');
        });
    }
};
