<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemEvent extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    // Event types
    public const TYPE_APP_BOOT = 'APP_BOOT';

    public const TYPE_APP_CRASH = 'APP_CRASH';

    public const TYPE_APP_ERROR = 'APP_ERROR';

    public const TYPE_APP_PAUSE = 'APP_PAUSE';

    public const TYPE_APP_RESUME = 'APP_RESUME';

    public const TYPE_NETWORK_CHANGE = 'NETWORK_CHANGE';

    public const TYPE_PLAYBACK_ERROR = 'PLAYBACK_ERROR';

    public const TYPE_DOWNLOAD_ERROR = 'DOWNLOAD_ERROR';

    public const TYPE_API_ERROR = 'API_ERROR';

    public const TYPE_LOW_MEMORY = 'LOW_MEMORY';

    public const TYPE_LOW_STORAGE = 'LOW_STORAGE';

    public const TYPE_CONFIG_CHANGE = 'CONFIG_CHANGE';

    public const TYPE_PLAYLIST_UPDATE = 'PLAYLIST_UPDATE';

    public const TYPE_ACTIVATION = 'ACTIVATION';

    public const TYPE_WEBSOCKET = 'WEBSOCKET';

    public const TYPE_UPDATE = 'UPDATE';

    // Severities
    public const SEVERITY_DEBUG = 'debug';

    public const SEVERITY_INFO = 'info';

    public const SEVERITY_WARNING = 'warning';

    public const SEVERITY_ERROR = 'error';

    public const SEVERITY_CRITICAL = 'critical';

    protected $fillable = [
        'tenant_id',
        'player_id',
        'event_type',
        'severity',
        'message',
        'error_code',
        'error_class',
        'stack_trace',
        'component',
        'action',
        'media_id',
        'playlist_id',
        'device_id',
        'app_version',
        'network_type',
        'memory_free_mb',
        'storage_free_mb',
        'extra_data',
        'event_timestamp',
    ];

    protected function casts(): array
    {
        return [
            'event_timestamp' => 'datetime',
            'memory_free_mb' => 'integer',
            'storage_free_mb' => 'integer',
            'extra_data' => 'array',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }

    // ==================== Scopes ====================

    public function scopeOfType($query, string $type)
    {
        return $query->where('event_type', $type);
    }

    public function scopeOfSeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeCritical($query)
    {
        return $query->whereIn('severity', [self::SEVERITY_ERROR, self::SEVERITY_CRITICAL]);
    }

    public function scopeForPlayer($query, $playerId)
    {
        return $query->where('player_id', $playerId);
    }

    public function scopeInDateRange($query, $start, $end)
    {
        return $query->whereBetween('event_timestamp', [$start, $end]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('event_timestamp', today());
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('event_timestamp', '>=', now()->subHours($hours));
    }

    // ==================== Helpers ====================

    public function isError(): bool
    {
        return in_array($this->severity, [self::SEVERITY_ERROR, self::SEVERITY_CRITICAL]);
    }

    public function isCrash(): bool
    {
        return $this->event_type === self::TYPE_APP_CRASH;
    }

    public function getSeverityColor(): string
    {
        return match ($this->severity) {
            self::SEVERITY_DEBUG => 'gray',
            self::SEVERITY_INFO => 'blue',
            self::SEVERITY_WARNING => 'yellow',
            self::SEVERITY_ERROR => 'red',
            self::SEVERITY_CRITICAL => 'purple',
            default => 'gray',
        };
    }

    public function getEventTypeLabel(): string
    {
        return match ($this->event_type) {
            self::TYPE_APP_BOOT => 'App Boot',
            self::TYPE_APP_CRASH => 'App Crash',
            self::TYPE_APP_ERROR => 'App Error',
            self::TYPE_APP_PAUSE => 'App Pause',
            self::TYPE_APP_RESUME => 'App Resume',
            self::TYPE_NETWORK_CHANGE => 'Network Change',
            self::TYPE_PLAYBACK_ERROR => 'Playback Error',
            self::TYPE_DOWNLOAD_ERROR => 'Download Error',
            self::TYPE_API_ERROR => 'API Error',
            self::TYPE_LOW_MEMORY => 'Low Memory',
            self::TYPE_LOW_STORAGE => 'Low Storage',
            self::TYPE_CONFIG_CHANGE => 'Config Change',
            self::TYPE_PLAYLIST_UPDATE => 'Playlist Update',
            self::TYPE_ACTIVATION => 'Activation',
            self::TYPE_WEBSOCKET => 'WebSocket',
            self::TYPE_UPDATE => 'App Update',
            default => $this->event_type,
        };
    }
}
