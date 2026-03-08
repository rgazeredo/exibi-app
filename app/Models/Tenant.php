<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Tenant extends Model
{
    use HasFactory, HasUuids;

    /**
     * Default roles configuration.
     */
    private static array $defaultRoles = [
        'admin' => [
            'name' => 'Administrador',
            'description' => 'Acesso total ao sistema',
            'permissions' => '*', // All permissions
        ],
        'editor' => [
            'name' => 'Editor',
            'description' => 'Gerencia conteúdo (mídias, playlists, players)',
            'permissions' => [
                'media.view', 'media.create', 'media.edit', 'media.delete',
                'playlists.view', 'playlists.create', 'playlists.edit', 'playlists.delete',
                'players.view', 'players.create', 'players.edit', 'players.delete',
                'player_groups.view', 'player_groups.create', 'player_groups.edit', 'player_groups.delete',
                'widgets.view', 'widgets.create', 'widgets.edit', 'widgets.delete',
                'tags.view', 'tags.create', 'tags.edit', 'tags.delete',
                'reports.view',
            ],
        ],
        'viewer' => [
            'name' => 'Visualizador',
            'description' => 'Apenas visualização',
            'permissions' => [
                'media.view',
                'playlists.view',
                'players.view',
                'player_groups.view',
                'widgets.view',
                'tags.view',
                'reports.view',
            ],
        ],
    ];

    protected static function booted(): void
    {
        static::created(function (Tenant $tenant) {
            $tenant->createDefaultRoles();
        });
    }

    protected $fillable = [
        'name',
        'slug',
        'settings',
        'storage_limit_mb',
        'players_limit',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'storage_limit_mb' => 'integer',
            'players_limit' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get a specific setting value.
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Set a specific setting value.
     */
    public function setSetting(string $key, mixed $value): void
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
    }

    /**
     * Get the custom domain.
     */
    public function getDomain(): ?string
    {
        return $this->getSetting('domain');
    }

    /**
     * Get the icon URL.
     */
    public function getIconUrl(): ?string
    {
        $path = $this->getSetting('icon_path');

        return $path ? Storage::disk('s3')->url($path) : null;
    }

    /**
     * Get the splash URL.
     */
    public function getSplashUrl(): ?string
    {
        $path = $this->getSetting('splash_path');

        return $path ? Storage::disk('s3')->url($path) : null;
    }

    /**
     * Check if videos should be auto-optimized.
     */
    public function shouldAutoOptimizeVideos(): bool
    {
        return (bool) $this->getSetting('auto_optimize_videos', true);
    }

    /**
     * Get the optimization quality setting (hd or fullhd).
     */
    public function getOptimizationQuality(): string
    {
        return $this->getSetting('optimization_quality', 'fullhd');
    }

    /**
     * Get the tenant timezone.
     */
    public function getTimezone(): string
    {
        return $this->getSetting('timezone', 'America/Sao_Paulo');
    }

    /**
     * Get storage usage in MB.
     */
    public function getStorageUsageMb(): int
    {
        return (int) ceil($this->media()->sum('size_bytes') / 1024 / 1024);
    }

    /**
     * Get storage usage in bytes.
     */
    public function getStorageUsageBytes(): int
    {
        return (int) $this->media()->sum('size_bytes');
    }

    /**
     * Check if storage limit has been reached.
     */
    public function hasReachedStorageLimit(): bool
    {
        if (! $this->storage_limit_mb) {
            return false;
        }

        return $this->getStorageUsageMb() >= $this->storage_limit_mb;
    }

    /**
     * Get storage usage percentage (0-100).
     */
    public function getStorageUsagePercentage(): int
    {
        if (! $this->storage_limit_mb) {
            return 0;
        }

        return min(100, (int) round(($this->getStorageUsageMb() / $this->storage_limit_mb) * 100));
    }

    /**
     * Get player count.
     */
    public function getPlayersCount(): int
    {
        return $this->players()->count();
    }

    /**
     * Check if players limit has been reached.
     */
    public function hasReachedPlayersLimit(): bool
    {
        if (! $this->players_limit) {
            return false;
        }

        return $this->getPlayersCount() >= $this->players_limit;
    }

    /**
     * Get players usage percentage (0-100).
     */
    public function getPlayersUsagePercentage(): int
    {
        if (! $this->players_limit) {
            return 0;
        }

        return min(100, (int) round(($this->getPlayersCount() / $this->players_limit) * 100));
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role', 'tenant_role_id', 'created_at');
    }

    /**
     * Get tenant roles.
     */
    public function roles(): HasMany
    {
        return $this->hasMany(TenantRole::class);
    }

    /**
     * Get a specific role by slug.
     */
    public function getRole(string $slug): ?TenantRole
    {
        return $this->roles()->where('slug', $slug)->first();
    }

    /**
     * Get the admin role for this tenant.
     */
    public function getAdminRole(): ?TenantRole
    {
        return $this->getRole('admin');
    }

    /**
     * Create default roles for this tenant.
     */
    public function createDefaultRoles(): void
    {
        // Get all permissions
        $permissions = DB::table('permissions')->get()->keyBy(function ($item) {
            return $item->module.'.'.$item->action;
        });

        $now = now();

        foreach (self::$defaultRoles as $slug => $roleData) {
            // Check if role already exists
            $existingRole = $this->roles()->where('slug', $slug)->first();

            if ($existingRole) {
                continue;
            }

            $roleId = (string) Str::uuid();
            DB::table('tenant_roles')->insert([
                'id' => $roleId,
                'tenant_id' => $this->id,
                'name' => $roleData['name'],
                'slug' => $slug,
                'description' => $roleData['description'],
                'is_system' => true,
                'is_deletable' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Assign permissions
            $rolePermissions = $roleData['permissions'];

            if ($rolePermissions === '*') {
                // All permissions
                foreach ($permissions as $permission) {
                    $this->assignPermissionToRole($roleId, $permission->id);
                }
            } else {
                foreach ($rolePermissions as $permKey) {
                    if (isset($permissions[$permKey])) {
                        $this->assignPermissionToRole($roleId, $permissions[$permKey]->id);
                    }
                }
            }
        }
    }

    /**
     * Assign a permission to a role.
     */
    private function assignPermissionToRole(string $roleId, string $permissionId): void
    {
        $exists = DB::table('tenant_role_permissions')
            ->where('tenant_role_id', $roleId)
            ->where('permission_id', $permissionId)
            ->exists();

        if (! $exists) {
            DB::table('tenant_role_permissions')->insert([
                'id' => (string) Str::uuid(),
                'tenant_role_id' => $roleId,
                'permission_id' => $permissionId,
                'created_at' => now(),
            ]);
        }
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function playlists(): HasMany
    {
        return $this->hasMany(Playlist::class);
    }

    /**
     * Get or create the default playlist for this tenant.
     */
    public function getOrCreateDefaultPlaylist(): Playlist
    {
        $defaultPlaylist = $this->playlists()->where('is_default', true)->first();

        if (! $defaultPlaylist) {
            $defaultPlaylist = $this->playlists()->create([
                'name' => 'Playlist Padrão',
                'description' => 'Playlist padrão para os players',
                'is_default' => true,
                'is_active' => true,
            ]);
        }

        return $defaultPlaylist;
    }

    /**
     * Get the default playlist for this tenant.
     */
    public function getDefaultPlaylist(): ?Playlist
    {
        return $this->playlists()->where('is_default', true)->first();
    }

    public function playbackLogs(): HasMany
    {
        return $this->hasMany(PlaybackLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get kiosk settings for Android app.
     * Returns settings that apply to all players of this tenant.
     */
    public function getKioskSettings(): array
    {
        return [];
    }
}
