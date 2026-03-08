<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AppRelease extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'version_name',
        'version_code',
        'apk_path',
        'apk_size_bytes',
        'release_notes',
        'force_update',
        'min_version_code',
        'is_active',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'version_code' => 'integer',
            'apk_size_bytes' => 'integer',
            'force_update' => 'boolean',
            'min_version_code' => 'integer',
            'is_active' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Get the APK download URL.
     */
    public function getApkUrl(): ?string
    {
        // Check for invalid apk_path values (null, empty, 0, '0', false)
        if (! $this->apk_path || $this->apk_path === '0' || $this->apk_path === 0) {
            Log::warning('AppRelease has invalid apk_path', [
                'release_id' => $this->id,
                'version_code' => $this->version_code,
                'apk_path' => $this->apk_path,
                'apk_path_type' => gettype($this->apk_path),
            ]);

            return null;
        }

        // Validate that apk_path looks like a valid path (should contain 'releases/')
        if (! str_contains($this->apk_path, 'releases/')) {
            Log::warning('AppRelease has suspicious apk_path', [
                'release_id' => $this->id,
                'version_code' => $this->version_code,
                'apk_path' => $this->apk_path,
            ]);

            return null;
        }

        return Storage::disk('s3')->url($this->apk_path);
    }

    /**
     * Get formatted file size.
     */
    public function getFormattedSize(): string
    {
        $bytes = $this->apk_size_bytes;

        if ($bytes === 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $i), 2).' '.$units[$i];
    }

    /**
     * Scope to get the active release.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get published releases.
     */
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at');
    }

    /**
     * Get the current active release.
     */
    public static function getCurrentRelease(): ?self
    {
        return static::active()->first();
    }

    /**
     * Activate this release and deactivate others.
     */
    public function activate(): void
    {
        // Deactivate all other releases
        static::where('id', '!=', $this->id)->update(['is_active' => false]);

        // Activate this one
        $this->update([
            'is_active' => true,
            'published_at' => $this->published_at ?? now(),
        ]);
    }

    /**
     * Check if a given version code needs update.
     */
    public function needsUpdate(int $currentVersionCode): bool
    {
        return $currentVersionCode < $this->version_code;
    }

    /**
     * Check if update is mandatory for given version code.
     */
    public function isMandatoryFor(int $currentVersionCode): bool
    {
        if ($this->force_update) {
            return true;
        }

        return $currentVersionCode < $this->min_version_code;
    }
}
