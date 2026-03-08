<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Converts black_screen config to operating_hours config for player_groups and players.
     * The logic is inverted: black_screen defines when to show black, operating_hours defines when to operate.
     *
     * For simple schedules (recurring with a single time range), we invert the times.
     * For complex schedules, we default to 24/7 operation since manual configuration is needed.
     */
    public function up(): void
    {
        // Process player_groups
        $groups = DB::table('player_groups')
            ->whereNotNull('config')
            ->get();

        foreach ($groups as $group) {
            $config = json_decode($group->config, true) ?? [];

            // Skip if already has operating_hours
            if (isset($config['operating_hours'])) {
                continue;
            }

            // Skip if no black_screen config
            if (! isset($config['black_screen'])) {
                continue;
            }

            $blackScreen = $config['black_screen'];
            $operatingHours = $this->convertBlackScreenToOperatingHours($blackScreen);

            // Add operating_hours to config
            $config['operating_hours'] = $operatingHours;

            // Update the record
            DB::table('player_groups')
                ->where('id', $group->id)
                ->update(['config' => json_encode($config)]);
        }

        // Process players
        $players = DB::table('players')
            ->whereNotNull('config')
            ->get();

        foreach ($players as $player) {
            $config = json_decode($player->config, true) ?? [];

            // Skip if already has operating_hours
            if (isset($config['operating_hours'])) {
                continue;
            }

            // Skip if no black_screen config
            if (! isset($config['black_screen'])) {
                continue;
            }

            $blackScreen = $config['black_screen'];
            $operatingHours = $this->convertBlackScreenToOperatingHours($blackScreen);

            // Add operating_hours to config
            $config['operating_hours'] = $operatingHours;

            // Update the record
            DB::table('players')
                ->where('id', $player->id)
                ->update(['config' => json_encode($config)]);
        }
    }

    /**
     * Convert a black_screen config to operating_hours config.
     */
    private function convertBlackScreenToOperatingHours(array $blackScreen): array
    {
        // If black_screen is disabled, operating_hours is disabled (24/7 operation)
        if (! ($blackScreen['enabled'] ?? false)) {
            return [
                'enabled' => false,
                'outside_hours_behavior' => 'black_screen', // Default (doesn't matter when disabled)
                'template_id' => null,
                'rules' => [],
            ];
        }

        $scheduleType = $blackScreen['schedule_type'] ?? 'always';

        // If always black screen, set operating_hours with no rules (never operates)
        if ($scheduleType === 'always') {
            return [
                'enabled' => true,
                'outside_hours_behavior' => 'black_screen',
                'template_id' => null,
                'rules' => [], // No rules = never within operating hours
            ];
        }

        // For recurring schedules with day_schedules, try to invert the time ranges
        if ($scheduleType === 'recurring' && ! empty($blackScreen['day_schedules'])) {
            $rules = [];

            foreach ($blackScreen['day_schedules'] as $slot) {
                $timeStart = $slot['time_start'] ?? '00:00';
                $timeEnd = $slot['time_end'] ?? '23:59';
                $days = $slot['days'] ?? [];

                // Invert the time range:
                // If black screen is from 22:00 to 06:00, operating hours are 06:00 to 22:00
                // This simple inversion works for most common cases
                $invertedRules = $this->invertTimeRange($timeStart, $timeEnd, $days);
                $rules = array_merge($rules, $invertedRules);
            }

            return [
                'enabled' => true,
                'outside_hours_behavior' => 'black_screen',
                'template_id' => null,
                'rules' => $rules,
            ];
        }

        // For date_range or complex schedules, default to 24/7 operation
        // Users need to manually configure if they want specific operating hours
        return [
            'enabled' => false,
            'outside_hours_behavior' => 'black_screen', // Default (doesn't matter when disabled)
            'template_id' => null,
            'rules' => [],
        ];
    }

    /**
     * Invert a time range (black_screen time → operating time).
     * Returns one or two rules depending on whether the range crosses midnight.
     */
    private function invertTimeRange(string $blackStart, string $blackEnd, array $days): array
    {
        // If black screen is 00:00 to 23:59, no operating hours at all
        if ($blackStart === '00:00' && $blackEnd === '23:59') {
            return [];
        }

        // If black screen is overnight (e.g., 22:00 to 06:00)
        if ($blackStart > $blackEnd) {
            // Operating hours are from blackEnd to blackStart
            // E.g., black 22:00-06:00 → operate 06:00-22:00
            return [
                [
                    'days' => $days,
                    'time_start' => $blackEnd,
                    'time_end' => $blackStart,
                ],
            ];
        }

        // If black screen is during the day (e.g., 12:00 to 14:00)
        // Operating hours are before and after: 00:00-12:00 and 14:00-23:59
        $rules = [];

        if ($blackStart !== '00:00') {
            $rules[] = [
                'days' => $days,
                'time_start' => '00:00',
                'time_end' => $blackStart,
            ];
        }

        if ($blackEnd !== '23:59') {
            $rules[] = [
                'days' => $days,
                'time_start' => $blackEnd,
                'time_end' => '23:59',
            ];
        }

        return $rules;
    }

    /**
     * Reverse the migrations.
     *
     * Note: We don't remove operating_hours because it would lose user data.
     * The old black_screen config is still preserved for backwards compatibility.
     */
    public function down(): void
    {
        // No rollback needed - we keep both configs for backwards compatibility
    }
};
