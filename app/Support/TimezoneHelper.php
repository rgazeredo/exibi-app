<?php

namespace App\Support;

use Carbon\Carbon;

/**
 * Helper class for timezone conversions.
 *
 * Strategy:
 * - All dates are stored in UTC in the database
 * - On INPUT (save): Convert from tenant timezone to UTC
 * - On OUTPUT (display): Convert from UTC to tenant timezone
 * - For API: Keep UTC (player syncs with server_time)
 */
class TimezoneHelper
{
    /**
     * Convert a datetime from tenant timezone to UTC for storage.
     *
     * @param  string|Carbon|null  $datetime  The datetime in tenant timezone
     * @param  string  $fromTimezone  The source timezone (tenant's timezone)
     * @return Carbon|null The datetime in UTC
     */
    public static function toUtc(string|Carbon|null $datetime, string $fromTimezone): ?Carbon
    {
        if (! $datetime) {
            return null;
        }

        if (is_string($datetime)) {
            // Parse assuming the string is in the tenant's timezone
            $carbon = Carbon::parse($datetime, $fromTimezone);
        } else {
            // Clone and set timezone
            $carbon = $datetime->copy()->shiftTimezone($fromTimezone);
        }

        return $carbon->utc();
    }

    /**
     * Convert a datetime from UTC to tenant timezone for display.
     *
     * @param  string|Carbon|null  $datetime  The datetime in UTC
     * @param  string  $toTimezone  The target timezone (tenant's timezone)
     * @return Carbon|null The datetime in tenant timezone
     */
    public static function fromUtc(string|Carbon|null $datetime, string $toTimezone): ?Carbon
    {
        if (! $datetime) {
            return null;
        }

        if (is_string($datetime)) {
            $carbon = Carbon::parse($datetime, 'UTC');
        } else {
            $carbon = $datetime->copy()->utc();
        }

        return $carbon->setTimezone($toTimezone);
    }

    /**
     * Format a UTC datetime for display in tenant timezone.
     *
     * @param  string|Carbon|null  $datetime  The datetime in UTC
     * @param  string  $toTimezone  The target timezone
     * @param  string  $format  The output format (default: ISO 8601)
     */
    public static function formatForDisplay(string|Carbon|null $datetime, string $toTimezone, string $format = 'Y-m-d\TH:i:s'): ?string
    {
        $converted = self::fromUtc($datetime, $toTimezone);

        return $converted?->format($format);
    }

    /**
     * Convert a time string (HH:MM) from tenant timezone to UTC.
     * This is used for recurring schedules where only time matters.
     *
     * Note: For recurring schedules, we don't convert times because
     * they represent "local time" for the tenant. The comparison
     * should be done in the tenant's timezone context.
     */
    public static function convertTimeToUtc(string $time, string $fromTimezone): string
    {
        // For recurring schedules, we keep times as-is in tenant timezone
        // The scheduling logic should compare in tenant timezone
        return $time;
    }

    /**
     * Get the current time in a specific timezone.
     */
    public static function nowInTimezone(string $timezone): Carbon
    {
        return now()->setTimezone($timezone);
    }
}
