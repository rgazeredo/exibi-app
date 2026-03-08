<?php

namespace App\Models;

use App\Support\TimezoneHelper;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaylistItem extends Model
{
    use HasFactory, HasUuids;

    // Schedule mode constants
    public const MODE_ALWAYS = 'always';

    public const MODE_AVAILABLE = 'available';

    public const MODE_PRIORITY_ONCE = 'priority_once';

    public const MODE_PRIORITY_LOOP = 'priority_loop';

    protected $fillable = [
        'playlist_id',
        'item_type',
        'item_id',
        'position',
        'duration_override',
        'is_active',
        'settings',
        'starts_at',
        'ends_at',
        'schedule_type',
        'schedule_mode',
        'priority_order',
        'day_schedules',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'duration_override' => 'integer',
            'is_active' => 'boolean',
            'settings' => 'array',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'day_schedules' => 'array',
            'priority_order' => 'integer',
        ];
    }

    /**
     * Get the parent playlist.
     */
    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }

    /**
     * Get the media if this item is a media type.
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'item_id');
    }

    /**
     * Get the child playlist if this item is a playlist type.
     */
    public function childPlaylist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class, 'item_id');
    }

    /**
     * Get the widget if this item is a widget type.
     */
    public function widget(): BelongsTo
    {
        return $this->belongsTo(Widget::class, 'item_id');
    }

    /**
     * Check if this item is a media.
     */
    public function isMedia(): bool
    {
        return $this->item_type === 'media';
    }

    /**
     * Check if this item is a playlist.
     */
    public function isPlaylist(): bool
    {
        return $this->item_type === 'playlist';
    }

    /**
     * Check if this item is a widget.
     */
    public function isWidget(): bool
    {
        return $this->item_type === 'widget';
    }

    /**
     * Check if this item has priority mode (once or loop).
     */
    public function hasPriority(): bool
    {
        return in_array($this->schedule_mode, [self::MODE_PRIORITY_ONCE, self::MODE_PRIORITY_LOOP]);
    }

    /**
     * Check if this item is in priority loop mode.
     */
    public function isPriorityLoop(): bool
    {
        return $this->schedule_mode === self::MODE_PRIORITY_LOOP;
    }

    /**
     * Check if this item is in priority once mode.
     */
    public function isPriorityOnce(): bool
    {
        return $this->schedule_mode === self::MODE_PRIORITY_ONCE;
    }

    /**
     * Check if this item is in available mode (joins rotation during period).
     */
    public function isAvailableMode(): bool
    {
        return $this->schedule_mode === self::MODE_AVAILABLE;
    }

    /**
     * Check if this item is always available (no scheduling).
     */
    public function isAlwaysMode(): bool
    {
        return $this->schedule_mode === self::MODE_ALWAYS || empty($this->schedule_mode);
    }

    /**
     * Get the schedule mode label for display.
     */
    public function getScheduleModeLabel(): string
    {
        return match ($this->schedule_mode) {
            self::MODE_AVAILABLE => 'Disponível no período',
            self::MODE_PRIORITY_ONCE => 'Prioridade (uma vez)',
            self::MODE_PRIORITY_LOOP => 'Prioridade (repetir)',
            default => 'Sempre',
        };
    }

    /**
     * Get the actual item (Media, Playlist, or Widget).
     */
    public function getItem(): Media|Playlist|Widget|null
    {
        if ($this->isMedia()) {
            return $this->media;
        }

        if ($this->isPlaylist()) {
            return $this->childPlaylist;
        }

        if ($this->isWidget()) {
            return $this->widget;
        }

        return null;
    }

    /**
     * Get the effective duration for this item.
     * For media: duration_override or media's native duration or 10 (default for images)
     * For playlist: sum of all media durations in the child playlist
     * For widget: duration_override or widget's configured duration
     */
    public function getEffectiveDuration(): int
    {
        if ($this->isMedia()) {
            if ($this->duration_override) {
                return $this->duration_override;
            }

            $media = $this->media;
            if ($media && $media->duration_seconds) {
                return $media->duration_seconds;
            }

            return 10; // Default for images
        }

        if ($this->isPlaylist()) {
            $childPlaylist = $this->childPlaylist;
            if ($childPlaylist) {
                return $childPlaylist->getTotalDuration();
            }
        }

        if ($this->isWidget()) {
            if ($this->duration_override) {
                return $this->duration_override;
            }

            $widget = $this->widget;
            if ($widget) {
                return $widget->getEffectiveDuration();
            }
        }

        return 0;
    }

    /**
     * Check if this item is currently active based on scheduling.
     *
     * Schedule types:
     * - 'always': No scheduling, always plays
     * - 'date_range': Plays between starts_at and ends_at (one-time window)
     * - 'recurring': Plays at specific times/days, optionally within a date range
     *
     * Note: starts_at and ends_at are stored in UTC, but time_start/time_end
     * in day_schedules are in tenant local time.
     *
     * @param  string|null  $timezone  The tenant's timezone for recurring time comparisons
     */
    public function isScheduledNow(?string $timezone = null): bool
    {
        $scheduleType = $this->schedule_type ?? 'always';

        // No scheduling = always active
        if ($scheduleType === 'always') {
            return true;
        }

        // Get timezone from tenant if not provided
        if (! $timezone) {
            $tenant = $this->playlist?->tenant ?? auth()->user()?->currentTenant();
            $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';
        }

        $now = now(); // Server time (should be UTC or configured timezone)

        // Check date range validity (applies to both 'date_range' and 'recurring')
        // starts_at/ends_at are stored in UTC, so compare with UTC time
        if (! $this->isWithinDateRange($now)) {
            return false;
        }

        // For date_range, only check the date bounds
        if ($scheduleType === 'date_range') {
            return true;
        }

        // For recurring, check day of week and time in tenant's timezone
        if ($scheduleType === 'recurring') {
            return $this->isWithinRecurringSchedule($now, $timezone);
        }

        return true;
    }

    /**
     * Check if current time is within the date range (starts_at to ends_at).
     */
    protected function isWithinDateRange($now): bool
    {
        // Has start date but not reached yet
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        // Has end date and already passed
        if ($this->ends_at && $now->gt($this->ends_at)) {
            return false;
        }

        return true;
    }

    /**
     * Check if current time matches the recurring schedule.
     * Uses day_schedules format: array of slots, each with days[], time_start, time_end, starts_at, ends_at
     *
     * Note: time_start and time_end are in tenant's local time, while
     * slot's starts_at/ends_at are stored in UTC.
     *
     * @param  \Carbon\Carbon  $now  Current time (UTC)
     * @param  string  $timezone  Tenant's timezone for time comparisons
     */
    protected function isWithinRecurringSchedule($now, string $timezone): bool
    {
        // No day schedules configured = always active
        if (! $this->day_schedules || empty($this->day_schedules)) {
            return true;
        }

        // Convert $now to tenant's timezone for day of week and time comparisons
        $nowInTenantTz = $now->copy()->setTimezone($timezone);
        $currentDayOfWeek = (int) $nowInTenantTz->dayOfWeek; // 0 = Sunday, 6 = Saturday
        $currentTime = $nowInTenantTz->format('H:i');

        // Check each slot
        foreach ($this->day_schedules as $slot) {
            // Check if current day is in this slot's days
            $slotDays = $slot['days'] ?? [];
            if (! in_array($currentDayOfWeek, $slotDays, true)) {
                continue;
            }

            // Check slot's validity period (if defined) - these are stored in UTC
            if (! empty($slot['starts_at'])) {
                $slotStartsAt = \Carbon\Carbon::parse($slot['starts_at']);
                if ($now->lt($slotStartsAt)) {
                    continue;
                }
            }
            if (! empty($slot['ends_at'])) {
                $slotEndsAt = \Carbon\Carbon::parse($slot['ends_at']);
                if ($now->gt($slotEndsAt)) {
                    continue;
                }
            }

            // Check time range (time_start/time_end are in tenant's local time)
            $timeStart = $slot['time_start'] ?? null;
            $timeEnd = $slot['time_end'] ?? null;

            $timeMatch = true;
            if ($timeStart && $currentTime < $timeStart) {
                $timeMatch = false;
            }
            if ($timeEnd && $currentTime > $timeEnd) {
                $timeMatch = false;
            }

            if ($timeMatch) {
                return true; // Found a matching slot
            }
        }

        return false; // No slot matches
    }

    /**
     * Get a human-readable description of the schedule.
     * Dates are displayed in the tenant's timezone.
     *
     * @param  string|null  $timezone  The tenant's timezone for date display
     */
    public function getScheduleDescription(?string $timezone = null): ?string
    {
        $scheduleType = $this->schedule_type ?? 'always';

        if ($scheduleType === 'always') {
            return null;
        }

        // Get timezone from tenant if not provided
        if (! $timezone) {
            $tenant = $this->playlist?->tenant ?? auth()->user()?->currentTenant();
            $timezone = $tenant?->getTimezone() ?? 'America/Sao_Paulo';
        }

        $parts = [];

        if ($scheduleType === 'date_range') {
            // Convert UTC dates to tenant timezone for display
            $startsAtDisplay = $this->starts_at
                ? TimezoneHelper::fromUtc($this->starts_at, $timezone)
                : null;
            $endsAtDisplay = $this->ends_at
                ? TimezoneHelper::fromUtc($this->ends_at, $timezone)
                : null;

            if ($startsAtDisplay && $endsAtDisplay) {
                $parts[] = $startsAtDisplay->format('d/m/Y H:i').' - '.$endsAtDisplay->format('d/m/Y H:i');
            } elseif ($startsAtDisplay) {
                $parts[] = 'A partir de '.$startsAtDisplay->format('d/m/Y H:i');
            } elseif ($endsAtDisplay) {
                $parts[] = 'Até '.$endsAtDisplay->format('d/m/Y H:i');
            }
        }

        if ($scheduleType === 'recurring') {
            $dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

            if ($this->day_schedules && ! empty($this->day_schedules)) {
                $slotCount = count($this->day_schedules);

                if ($slotCount === 1) {
                    // Single slot - show detailed info
                    $slot = $this->day_schedules[0];
                    $days = $slot['days'] ?? [];
                    sort($days);

                    $dayLabels = array_map(fn ($d) => $dayNames[$d] ?? '', $days);
                    $parts[] = implode(', ', $dayLabels);

                    $timeStart = $slot['time_start'] ?? null;
                    $timeEnd = $slot['time_end'] ?? null;

                    if ($timeStart && $timeEnd) {
                        $parts[] = $timeStart.' - '.$timeEnd;
                    } elseif ($timeStart) {
                        $parts[] = 'A partir das '.$timeStart;
                    } elseif ($timeEnd) {
                        $parts[] = 'Até '.$timeEnd;
                    }

                    // Slot validity period (dates stored in UTC, display in tenant timezone)
                    if (! empty($slot['starts_at']) || ! empty($slot['ends_at'])) {
                        $dateRange = [];
                        if (! empty($slot['starts_at'])) {
                            $slotStart = TimezoneHelper::fromUtc($slot['starts_at'], $timezone);
                            $dateRange[] = 'de '.$slotStart?->format('d/m/Y');
                        }
                        if (! empty($slot['ends_at'])) {
                            $slotEnd = TimezoneHelper::fromUtc($slot['ends_at'], $timezone);
                            $dateRange[] = 'até '.$slotEnd?->format('d/m/Y');
                        }
                        $parts[] = '('.implode(' ', $dateRange).')';
                    }
                } else {
                    // Multiple slots - show count
                    $parts[] = $slotCount.' horários configurados';
                }
            }
        }

        return implode(' | ', $parts);
    }

    /**
     * Scope for active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for media items.
     */
    public function scopeMediaItems($query)
    {
        return $query->where('item_type', 'media');
    }

    /**
     * Scope for playlist items.
     */
    public function scopePlaylistItems($query)
    {
        return $query->where('item_type', 'playlist');
    }

    /**
     * Scope for widget items.
     */
    public function scopeWidgetItems($query)
    {
        return $query->where('item_type', 'widget');
    }

    /**
     * Scope ordered by position.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('position');
    }
}
