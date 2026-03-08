<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add the new column
        Schema::table('playlist_items', function (Blueprint $table) {
            $table->jsonb('day_schedules')->nullable()->after('days_of_week');
        });

        // Step 2: Migrate existing data to array of slots format
        DB::table('playlist_items')
            ->where('schedule_type', 'recurring')
            ->whereNotNull('days_of_week')
            ->get()
            ->each(function ($item) {
                $daysOfWeek = json_decode($item->days_of_week, true);

                if (! is_array($daysOfWeek) || empty($daysOfWeek)) {
                    return;
                }

                // Convert to array of slots format
                $daySchedules = [
                    [
                        'id' => (string) Str::uuid(),
                        'days' => array_map('intval', $daysOfWeek),
                        'time_start' => $item->time_start,
                        'time_end' => $item->time_end,
                        'starts_at' => null,
                        'ends_at' => null,
                    ],
                ];

                DB::table('playlist_items')
                    ->where('id', $item->id)
                    ->update(['day_schedules' => json_encode($daySchedules)]);
            });

        // Step 3: Remove old columns
        Schema::table('playlist_items', function (Blueprint $table) {
            $table->dropColumn(['time_start', 'time_end', 'days_of_week']);
        });
    }

    public function down(): void
    {
        // Step 1: Re-add old columns
        Schema::table('playlist_items', function (Blueprint $table) {
            $table->string('time_start', 5)->nullable()->after('schedule_type');
            $table->string('time_end', 5)->nullable()->after('time_start');
            $table->jsonb('days_of_week')->nullable()->after('time_end');
        });

        // Step 2: Migrate data back (use first slot)
        DB::table('playlist_items')
            ->where('schedule_type', 'recurring')
            ->whereNotNull('day_schedules')
            ->get()
            ->each(function ($item) {
                $daySchedules = json_decode($item->day_schedules, true);

                if (! is_array($daySchedules) || empty($daySchedules)) {
                    return;
                }

                // Get first slot
                $firstSlot = $daySchedules[0] ?? null;
                if (! $firstSlot) {
                    return;
                }

                $daysOfWeek = $firstSlot['days'] ?? [];
                sort($daysOfWeek);

                DB::table('playlist_items')
                    ->where('id', $item->id)
                    ->update([
                        'days_of_week' => json_encode($daysOfWeek),
                        'time_start' => $firstSlot['time_start'] ?? null,
                        'time_end' => $firstSlot['time_end'] ?? null,
                    ]);
            });

        // Step 3: Remove new column
        Schema::table('playlist_items', function (Blueprint $table) {
            $table->dropColumn('day_schedules');
        });
    }
};
