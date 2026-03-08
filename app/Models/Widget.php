<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Cron\CronExpression;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Widget extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    public const TYPE_WEATHER = 'weather';

    public const TYPE_LOTTERY = 'lottery';

    public const TYPE_NEWS = 'news';

    public const STATUS_PENDING = 'pending';

    public const STATUS_GENERATING = 'generating';

    public const STATUS_READY = 'ready';

    public const STATUS_ERROR = 'error';

    // Cron expressions for automatic regeneration
    public const WEATHER_CRON = '0 5,10,15,20 * * *'; // 4x/day at 05h, 10h, 15h, 20h

    public const LOTTERY_CRON = '0 6 * * *'; // 1x/day at 6h

    public const NEWS_CRON = '0 */6 * * *'; // Every 6 hours

    protected $fillable = [
        'tenant_id',
        'widget_type',
        'name',
        'config',
        'regeneration_cron',
        'last_generated_at',
        'next_regeneration_at',
        'current_media_id',
        'status',
        'is_active',
        'last_error',
        'generation_request_id',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'last_generated_at' => 'datetime',
            'next_regeneration_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Override the BelongsToTenant boot to include global widgets
     */
    protected static function booted(): void
    {
        // Remove the default 'tenant' scope from BelongsToTenant trait
        // This is replaced by a custom scope that includes global widgets
        static::addGlobalScope('tenant', function ($builder) {
            $tenantId = session('current_tenant_id');
            if ($tenantId) {
                // Include both tenant-specific widgets AND global widgets (tenant_id = NULL)
                $builder->where(function ($q) use ($tenantId) {
                    $q->where('widgets.tenant_id', $tenantId)
                        ->orWhereNull('widgets.tenant_id');
                });
            }
        });
    }

    /**
     * Check if this is a global widget (shared across all tenants)
     */
    public function isGlobal(): bool
    {
        return $this->tenant_id === null;
    }

    /**
     * Scope for global widgets only (tenant_id = NULL)
     */
    public function scopeGlobal($query)
    {
        return $query->whereNull('tenant_id');
    }

    /**
     * Scope for widgets belonging to a specific tenant
     */
    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope for tenant-owned widgets only (excludes global)
     */
    public function scopeTenantOwned($query)
    {
        return $query->whereNotNull('tenant_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function currentMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'current_media_id');
    }

    /**
     * Get the effective duration for this widget
     */
    public function getEffectiveDuration(): int
    {
        return $this->config['duration_seconds'] ?? 30;
    }

    /**
     * Calculate the next regeneration time based on cron expression
     */
    public function calculateNextRegeneration(): ?Carbon
    {
        if (! $this->regeneration_cron) {
            return null;
        }

        try {
            $cron = new CronExpression($this->regeneration_cron);

            return Carbon::instance($cron->getNextRunDate());
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if this widget needs regeneration
     */
    public function needsRegeneration(): bool
    {
        if ($this->status === self::STATUS_GENERATING) {
            return false;
        }

        if (! $this->regeneration_cron) {
            return false;
        }

        if (! $this->next_regeneration_at) {
            return true;
        }

        return $this->next_regeneration_at->isPast();
    }

    /**
     * Check if the widget is ready to be displayed
     */
    public function isReady(): bool
    {
        return $this->status === self::STATUS_READY && $this->current_media_id !== null;
    }

    /**
     * Get default regeneration cron for widget type
     */
    public static function getDefaultCron(string $widgetType): string
    {
        return match ($widgetType) {
            self::TYPE_WEATHER => self::WEATHER_CRON, // 6x/day: 05h, 08h, 11h, 14h, 17h, 20h
            self::TYPE_LOTTERY => self::LOTTERY_CRON, // 1x/day at 9h
            self::TYPE_NEWS => self::NEWS_CRON,       // Every 6 hours
            default => self::WEATHER_CRON,
        };
    }

    /**
     * Get available widget types with labels
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_WEATHER => [
                'label' => 'Previsão do Tempo',
                'icon' => 'cloud-sun',
                'description' => 'Exibe a previsão do tempo para uma cidade',
            ],
            self::TYPE_LOTTERY => [
                'label' => 'Loteria',
                'icon' => 'ticket',
                'description' => 'Exibe os resultados das loterias',
            ],
            self::TYPE_NEWS => [
                'label' => 'Notícias',
                'icon' => 'newspaper',
                'description' => 'Exibe notícias por categoria',
            ],
        ];
    }

    /**
     * Get human-readable type label
     */
    public function getTypeLabel(): string
    {
        return match ($this->widget_type) {
            self::TYPE_WEATHER => 'Clima',
            self::TYPE_LOTTERY => 'Loteria',
            self::TYPE_NEWS => 'Notícias',
            default => ucfirst($this->widget_type),
        };
    }

    /**
     * Get human-readable status label
     */
    public function getStatusLabel(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Pendente',
            self::STATUS_GENERATING => 'Gerando...',
            self::STATUS_READY => 'Pronto',
            self::STATUS_ERROR => 'Erro',
            default => ucfirst($this->status),
        };
    }

    /**
     * Get human-readable cron description
     */
    public function getCronDescription(): ?string
    {
        if (! $this->regeneration_cron) {
            return 'Apenas manual';
        }

        return match ($this->regeneration_cron) {
            self::WEATHER_CRON, '0 5,8,11,14,17,20 * * *' => '6x ao dia (05h, 08h, 11h, 14h, 17h, 20h)',
            self::LOTTERY_CRON, '0 9 * * *' => 'Uma vez por dia (9h)',
            self::NEWS_CRON, '0 */6 * * *' => 'A cada 6 horas',
            '0 * * * *' => 'A cada hora',
            '0 */2 * * *' => 'A cada 2 horas',
            '0 */4 * * *' => 'A cada 4 horas',
            '0 */12 * * *' => 'A cada 12 horas',
            '0 0 * * *' => 'Uma vez por dia (meia-noite)',
            '0 6 * * *' => 'Uma vez por dia (6h)',
            '0 9,14,21 * * *' => '3 vezes ao dia (9h, 14h, 21h)',
            default => $this->regeneration_cron,
        };
    }

    /**
     * Scope to get only ready widgets
     */
    public function scopeReady($query)
    {
        return $query->where('status', self::STATUS_READY);
    }

    /**
     * Scope to get widgets by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('widget_type', $type);
    }
}
