<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PendingPlayerActivation extends Model
{
    use HasUuids;

    protected $fillable = [
        'activation_code',
        'device_id',
        'device_info',
        'tenant_id',
        'player_id',
        'api_token',
        'claimed_at',
        'activated_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'device_info' => 'array',
            'claimed_at' => 'datetime',
            'activated_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    // Characters that are not ambiguous (no 0/O, 1/I/L)
    private const ALLOWED_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    /**
     * Generate a unique activation code in format XXX-XXX
     */
    public static function generateCode(): string
    {
        $chars = self::ALLOWED_CHARS;
        $maxAttempts = 10;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $code = '';
            for ($i = 0; $i < 3; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $code .= '-';
            for ($i = 0; $i < 3; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }

            // Check if code already exists
            if (! static::where('activation_code', $code)
                ->where('expires_at', '>', now())
                ->exists()) {
                return $code;
            }
        }

        throw new \RuntimeException('Failed to generate unique activation code');
    }

    /**
     * Create a new pending activation for a device
     */
    public static function createForDevice(?string $deviceId = null, ?array $deviceInfo = null): self
    {
        // Clean up expired activations for this device
        if ($deviceId) {
            static::where('device_id', $deviceId)
                ->where('activated_at', null)
                ->delete();
        }

        return static::create([
            'activation_code' => static::generateCode(),
            'device_id' => $deviceId,
            'device_info' => $deviceInfo,
            'expires_at' => now()->addDays(7), // 7 dias para ativar
        ]);
    }

    /**
     * Check if the activation code has expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the code has been claimed by an admin
     */
    public function isClaimed(): bool
    {
        return $this->claimed_at !== null;
    }

    /**
     * Check if the activation is complete
     */
    public function isActivated(): bool
    {
        return $this->activated_at !== null;
    }

    /**
     * Claim the activation code for a tenant (admin action)
     * Also updates the player's last_seen_at since the device is actively polling
     */
    public function claim(string $tenantId, Player $player): void
    {
        $this->update([
            'tenant_id' => $tenantId,
            'player_id' => $player->id,
            'api_token' => $player->api_token,
            'claimed_at' => now(),
        ]);

        // Update player's last_seen_at immediately since we know the device is online
        // (it's actively polling for activation at this moment)
        $player->update([
            'last_seen_at' => now(),
        ]);
    }

    /**
     * Mark the activation as complete (device received token)
     * Also updates the player's last_seen_at so it shows as "online" immediately
     */
    public function markActivated(): void
    {
        $this->update([
            'activated_at' => now(),
        ]);

        // Update player's last_seen_at so it shows as online immediately after activation
        if ($this->player_id) {
            Player::where('id', $this->player_id)->update([
                'last_seen_at' => now(),
            ]);
        }
    }

    /**
     * Scope to find valid (not expired) activations
     */
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope to find pending (not activated) activations
     */
    public function scopePending($query)
    {
        return $query->whereNull('activated_at');
    }

    /**
     * Find by code (case-insensitive)
     */
    public static function findByCode(string $code): ?self
    {
        return static::where('activation_code', strtoupper($code))
            ->valid()
            ->pending()
            ->first();
    }
}
