<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds schedule_mode and priority_order columns to playlist_items table.
     *
     * schedule_mode values:
     * - 'always': No scheduling, always in rotation
     * - 'available': Only in rotation during the period (plays multiple times)
     * - 'priority_once': Priority mode, plays once then returns to normal
     * - 'priority_loop': Priority mode, loops until window ends
     *
     * priority_order: Numeric order when multiple priority items overlap (lower = higher priority)
     */
    public function up(): void
    {
        Schema::table('playlist_items', function (Blueprint $table) {
            $table->string('schedule_mode', 20)->default('always')->after('schedule_type');
            $table->integer('priority_order')->nullable()->after('schedule_mode');
        });

        // Migrate existing data: convert schedule_type to schedule_mode
        // 'always' stays 'always'
        // 'date_range' becomes 'available' (default safe behavior)
        // 'recurring' stays as is but uses 'available' mode
        DB::statement("UPDATE playlist_items SET schedule_mode = 'available' WHERE schedule_type IN ('date_range', 'recurring')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('playlist_items', function (Blueprint $table) {
            $table->dropColumn(['schedule_mode', 'priority_order']);
        });
    }
};
