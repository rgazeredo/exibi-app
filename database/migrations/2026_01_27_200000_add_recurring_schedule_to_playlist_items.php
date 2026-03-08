<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('playlist_items', function (Blueprint $table) {
            // Schedule type: 'always', 'date_range', 'recurring'
            $table->string('schedule_type', 20)->default('always')->after('ends_at');

            // Time of day for recurring schedules (HH:MM format)
            $table->string('time_start', 5)->nullable()->after('schedule_type');
            $table->string('time_end', 5)->nullable()->after('time_start');

            // Days of week (JSON array: [0,1,2,3,4,5,6] where 0=Sunday)
            $table->jsonb('days_of_week')->nullable()->after('time_end');
        });
    }

    public function down(): void
    {
        Schema::table('playlist_items', function (Blueprint $table) {
            $table->dropColumn(['schedule_type', 'time_start', 'time_end', 'days_of_week']);
        });
    }
};
