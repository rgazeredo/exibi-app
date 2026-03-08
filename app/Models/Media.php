<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use App\Models\Traits\HasTags;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use BelongsToTenant, HasFactory, HasTags, HasUuids;

    protected $table = 'media';

    protected $fillable = [
        'tenant_id',
        'folder_id',
        'type',
        'title',
        'filename',
        'path',
        'url',
        'mime_type',
        'size_bytes',
        'sha256_hash',
        'duration_seconds',
        'width',
        'height',
        'thumbnail_path',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'duration_seconds' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class, 'playlist_media')
            ->using(PlaylistMedia::class)
            ->withPivot(['position', 'duration_override', 'is_active', 'settings'])
            ->withTimestamps();
    }

    public function playbackLogs(): HasMany
    {
        return $this->hasMany(PlaybackLog::class);
    }

    public function scopeVideos($query)
    {
        return $query->where('type', 'video');
    }

    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    public function isVideo(): bool
    {
        return $this->type === 'video';
    }

    public function isImage(): bool
    {
        return $this->type === 'image';
    }

    public function getPublicUrl(): ?string
    {
        if ($this->url) {
            return $this->url;
        }

        if ($this->path) {
            // Use public URL for MinIO (bucket is public)
            $baseUrl = config('filesystems.disks.s3.url') ?? env('AWS_URL');

            return rtrim($baseUrl, '/').'/'.$this->path;
        }

        return null;
    }

    public function getThumbnailUrl(): ?string
    {
        if (! $this->thumbnail_path) {
            return null;
        }

        // Use public URL for MinIO (bucket is public)
        $baseUrl = config('filesystems.disks.s3.url') ?? env('AWS_URL');

        return rtrim($baseUrl, '/').'/'.$this->thumbnail_path;
    }

    public function getFormattedSize(): string
    {
        $bytes = $this->size_bytes;

        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2).' GB';
        }

        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        }

        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' KB';
        }

        return $bytes.' bytes';
    }

    public function getFormattedDuration(): ?string
    {
        if (! $this->duration_seconds) {
            return null;
        }

        $hours = floor($this->duration_seconds / 3600);
        $minutes = floor(($this->duration_seconds % 3600) / 60);
        $seconds = $this->duration_seconds % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    public function getResolution(): ?string
    {
        if (! $this->width || ! $this->height) {
            return null;
        }

        return "{$this->width}x{$this->height}";
    }

    /**
     * Check if video is portrait orientation
     */
    public function isPortrait(): bool
    {
        if (! $this->width || ! $this->height) {
            return false;
        }

        return $this->height > $this->width;
    }

    /**
     * Get transcoded versions
     */
    public function getTranscodedVersions(): array
    {
        return $this->metadata['transcoded_versions'] ?? [];
    }

    /**
     * Get best transcoded version for a target resolution
     */
    public function getBestTranscodedVersion(?int $targetHeight = null): ?array
    {
        $versions = $this->getTranscodedVersions();

        if (empty($versions)) {
            return null;
        }

        if (! $targetHeight) {
            // Return highest quality available
            $qualities = ['1080p', '720p', '480p'];
            foreach ($qualities as $quality) {
                if (isset($versions[$quality])) {
                    return $versions[$quality];
                }
            }

            return null;
        }

        // Find best match for target height
        $targetQuality = "{$targetHeight}p";
        if (isset($versions[$targetQuality])) {
            return $versions[$targetQuality];
        }

        // Return next available quality
        $qualities = ['1080p', '720p', '480p'];
        foreach ($qualities as $quality) {
            if (isset($versions[$quality])) {
                $height = (int) str_replace('p', '', $quality);
                if ($height <= $targetHeight) {
                    return $versions[$quality];
                }
            }
        }

        // Return any available version
        return array_values($versions)[0] ?? null;
    }

    /**
     * Get URL for best transcoded version or original
     */
    public function getOptimizedUrl(?int $targetHeight = null): string
    {
        $version = $this->getBestTranscodedVersion($targetHeight);

        if ($version && isset($version['path'])) {
            $baseUrl = config('filesystems.disks.s3.url') ?? env('AWS_URL');

            return rtrim($baseUrl, '/').'/'.$version['path'];
        }

        return $this->getPublicUrl() ?? '';
    }

    /**
     * Get transcoding status
     */
    public function getTranscodingStatus(): ?string
    {
        return $this->metadata['transcoding_status'] ?? null;
    }

    /**
     * Check if transcoding is pending or in progress
     */
    public function isTranscoding(): bool
    {
        return in_array($this->getTranscodingStatus(), ['pending', 'processing']);
    }

    /**
     * Check if transcoding completed
     */
    public function isTranscoded(): bool
    {
        return $this->getTranscodingStatus() === 'completed';
    }

    /**
     * Get total size including all transcoded versions
     */
    public function getTotalSizeBytes(): int
    {
        $total = $this->size_bytes ?? 0;

        foreach ($this->getTranscodedVersions() as $version) {
            $total += $version['size_bytes'] ?? 0;
        }

        return $total;
    }

    /**
     * Get total storage used by all media (original + transcoded)
     */
    public static function getTotalStorageBytes(): int
    {
        $total = 0;

        static::chunk(100, function ($mediaItems) use (&$total) {
            foreach ($mediaItems as $media) {
                $total += $media->getTotalSizeBytes();
            }
        });

        return $total;
    }

    /**
     * Format bytes to human readable string (MB or GB)
     */
    public static function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2).' GB';
        }

        return number_format($bytes / 1048576, 2).' MB';
    }
}
