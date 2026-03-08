<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaProcessingService
{
    protected string $disk = 's3';

    protected string $tempDir;

    public function __construct()
    {
        $this->tempDir = storage_path('app/temp');

        if (! file_exists($this->tempDir)) {
            mkdir($this->tempDir, 0755, true);
        }
    }

    /**
     * Process an uploaded file and create a Media record
     */
    public function processUpload(UploadedFile $file, ?string $title = null, ?string $tenantId = null): Media
    {
        $mimeType = $file->getMimeType();
        $type = str_starts_with($mimeType, 'video/') ? 'video' : 'image';

        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = "media/{$type}s/{$filename}";

        // Calculate SHA-256 hash for file integrity verification
        $fileContent = file_get_contents($file);
        $sha256Hash = hash('sha256', $fileContent);

        // Upload original file to S3 (visibility configured in filesystem config for B2 compatibility)
        Storage::disk($this->disk)->put($path, $fileContent);

        $mediaData = [
            'tenant_id' => $tenantId,
            'type' => $type,
            'title' => $title ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $mimeType,
            'size_bytes' => $file->getSize(),
            'sha256_hash' => $sha256Hash,
        ];

        // Process based on type
        if ($type === 'image') {
            $imageData = $this->processImage($file);
            $mediaData = array_merge($mediaData, $imageData);

            // Generate thumbnail for image
            $thumbnailPath = $this->generateImageThumbnail($file, $filename);
            if ($thumbnailPath) {
                $mediaData['thumbnail_path'] = $thumbnailPath;
            }
        }

        return Media::create($mediaData);
    }

    /**
     * Process image and extract metadata
     */
    protected function processImage(UploadedFile $file): array
    {
        $data = [];

        $imageSize = @getimagesize($file->getRealPath());
        if ($imageSize) {
            $data['width'] = $imageSize[0];
            $data['height'] = $imageSize[1];
        }

        return $data;
    }

    /**
     * Generate thumbnail for an image
     */
    protected function generateImageThumbnail(UploadedFile $file, string $filename): ?string
    {
        try {
            $thumbnailFilename = 'thumb_'.$filename;
            $thumbnailPath = "media/thumbnails/{$thumbnailFilename}";
            $tempThumbnail = $this->tempDir.'/'.$thumbnailFilename;

            // Use GD to create thumbnail
            $sourceImage = $this->createImageFromFile($file->getRealPath(), $file->getMimeType());
            if (! $sourceImage) {
                return null;
            }

            $width = imagesx($sourceImage);
            $height = imagesy($sourceImage);

            // Calculate thumbnail dimensions (max 320x180 maintaining aspect ratio)
            $maxWidth = 320;
            $maxHeight = 180;
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = (int) ($width * $ratio);
            $newHeight = (int) ($height * $ratio);

            $thumbnail = imagecreatetruecolor($newWidth, $newHeight);

            // Handle transparency for PNG/GIF
            if (in_array($file->getMimeType(), ['image/png', 'image/gif'])) {
                imagealphablending($thumbnail, false);
                imagesavealpha($thumbnail, true);
                $transparent = imagecolorallocatealpha($thumbnail, 0, 0, 0, 127);
                imagefill($thumbnail, 0, 0, $transparent);
            }

            imagecopyresampled($thumbnail, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            // Save thumbnail as JPEG
            imagejpeg($thumbnail, $tempThumbnail, 85);

            imagedestroy($sourceImage);
            imagedestroy($thumbnail);

            // Upload to S3 (visibility configured in filesystem config for B2 compatibility)
            Storage::disk($this->disk)->put($thumbnailPath, file_get_contents($tempThumbnail));

            // Cleanup
            @unlink($tempThumbnail);

            return $thumbnailPath;
        } catch (\Exception $e) {
            Log::warning('Failed to generate image thumbnail', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Process video and extract metadata using FFmpeg
     */
    public function processVideo(Media $media): void
    {
        try {
            // Download file to temp location
            $tempFile = $this->tempDir.'/'.Str::uuid().'.'.pathinfo($media->path, PATHINFO_EXTENSION);
            $content = Storage::disk($this->disk)->get($media->path);
            file_put_contents($tempFile, $content);

            // Get video metadata using FFprobe
            $metadata = $this->getVideoMetadata($tempFile);

            if ($metadata) {
                $media->update([
                    'duration_seconds' => $metadata['duration'] ?? null,
                    'width' => $metadata['width'] ?? null,
                    'height' => $metadata['height'] ?? null,
                    'metadata' => $metadata,
                ]);
            }

            // Generate video thumbnail
            $thumbnailPath = $this->generateVideoThumbnail($tempFile, $media);
            if ($thumbnailPath) {
                $media->update(['thumbnail_path' => $thumbnailPath]);
            }

            // Cleanup
            @unlink($tempFile);
        } catch (\Exception $e) {
            Log::error('Failed to process video', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get video metadata using FFprobe
     */
    protected function getVideoMetadata(string $filePath): ?array
    {
        $command = sprintf(
            'ffprobe -v quiet -print_format json -show_format -show_streams %s',
            escapeshellarg($filePath)
        );

        $result = Process::run($command);

        if (! $result->successful()) {
            Log::warning('FFprobe failed', ['output' => $result->errorOutput()]);

            return null;
        }

        $data = json_decode($result->output(), true);
        if (! $data) {
            return null;
        }

        $videoStream = collect($data['streams'] ?? [])->firstWhere('codec_type', 'video');
        $format = $data['format'] ?? [];

        return [
            'duration' => isset($format['duration']) ? (int) floor((float) $format['duration']) : null,
            'width' => $videoStream['width'] ?? null,
            'height' => $videoStream['height'] ?? null,
            'codec' => $videoStream['codec_name'] ?? null,
            'bitrate' => isset($format['bit_rate']) ? (int) $format['bit_rate'] : null,
            'fps' => $this->calculateFps($videoStream),
        ];
    }

    /**
     * Calculate FPS from video stream data
     */
    protected function calculateFps(?array $stream): ?float
    {
        if (! $stream || ! isset($stream['r_frame_rate'])) {
            return null;
        }

        $parts = explode('/', $stream['r_frame_rate']);
        if (count($parts) === 2 && $parts[1] > 0) {
            return round((float) $parts[0] / (float) $parts[1], 2);
        }

        return null;
    }

    /**
     * Generate thumbnail from video using FFmpeg
     */
    protected function generateVideoThumbnail(string $filePath, Media $media): ?string
    {
        try {
            $thumbnailFilename = 'thumb_'.Str::uuid().'.jpg';
            $thumbnailPath = "media/thumbnails/{$thumbnailFilename}";
            $tempThumbnail = $this->tempDir.'/'.$thumbnailFilename;

            // Get duration to seek to 10% of video or 1 second, whichever is greater
            $seekTime = '00:00:01';
            if ($media->duration_seconds && $media->duration_seconds > 10) {
                $seekSeconds = (int) ($media->duration_seconds * 0.1);
                $seekTime = gmdate('H:i:s', $seekSeconds);
            }

            $command = sprintf(
                'ffmpeg -y -ss %s -i %s -vframes 1 -vf "scale=320:-1" -f image2 %s',
                $seekTime,
                escapeshellarg($filePath),
                escapeshellarg($tempThumbnail)
            );

            $result = Process::run($command);

            if (! $result->successful() || ! file_exists($tempThumbnail)) {
                // Try at beginning of video as fallback
                $command = sprintf(
                    'ffmpeg -y -i %s -vframes 1 -vf "scale=320:-1" -f image2 %s',
                    escapeshellarg($filePath),
                    escapeshellarg($tempThumbnail)
                );
                $result = Process::run($command);
            }

            if (! file_exists($tempThumbnail)) {
                Log::warning('Failed to generate video thumbnail', ['output' => $result->errorOutput()]);

                return null;
            }

            // Upload to S3 (visibility configured in filesystem config for B2 compatibility)
            Storage::disk($this->disk)->put($thumbnailPath, file_get_contents($tempThumbnail));

            // Cleanup
            @unlink($tempThumbnail);

            return $thumbnailPath;
        } catch (\Exception $e) {
            Log::warning('Failed to generate video thumbnail', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Create image resource from file
     */
    protected function createImageFromFile(string $path, string $mimeType): ?\GdImage
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/gif' => @imagecreatefromgif($path),
            'image/webp' => @imagecreatefromwebp($path),
            default => null,
        };
    }

    /**
     * Delete media files from storage
     */
    public function deleteMediaFiles(Media $media): void
    {
        if ($media->path) {
            Storage::disk($this->disk)->delete($media->path);
        }

        if ($media->thumbnail_path) {
            Storage::disk($this->disk)->delete($media->thumbnail_path);
        }
    }

    /**
     * Delete all media files from storage including transcoded versions
     */
    public function deleteAllMediaFiles(Media $media): void
    {
        // Delete original file
        if ($media->path) {
            Storage::disk($this->disk)->delete($media->path);
        }

        // Delete thumbnail
        if ($media->thumbnail_path) {
            Storage::disk($this->disk)->delete($media->thumbnail_path);
        }

        // Delete transcoded versions
        $metadata = $media->metadata ?? [];
        $transcodedVersions = $metadata['transcoded_versions'] ?? [];
        foreach ($transcodedVersions as $quality => $version) {
            if (isset($version['path'])) {
                Storage::disk($this->disk)->delete($version['path']);
            }
        }

        // Delete transcoded folder if exists
        $transcodedFolder = "media/transcoded/{$media->id}";
        Storage::disk($this->disk)->deleteDirectory($transcodedFolder);
    }

    /**
     * Replace an existing media file while keeping the same record
     */
    public function replaceMedia(Media $media, UploadedFile $file, ?string $newTitle = null): Media
    {
        // Store previous type for metadata
        $previousType = $media->type;

        // Delete all existing files
        $this->deleteAllMediaFiles($media);

        // Process new file
        $mimeType = $file->getMimeType();
        $newType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';

        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = "media/{$newType}s/{$filename}";

        // Calculate SHA-256 hash for file integrity verification
        $fileContent = file_get_contents($file);
        $sha256Hash = hash('sha256', $fileContent);

        // Upload new file to S3
        Storage::disk($this->disk)->put($path, $fileContent);

        // Build update data
        $updateData = [
            'type' => $newType,
            'title' => $newTitle ?? $media->title,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $mimeType,
            'size_bytes' => $file->getSize(),
            'sha256_hash' => $sha256Hash,
            'duration_seconds' => null,
            'width' => null,
            'height' => null,
            'thumbnail_path' => null,
            'metadata' => [
                'replaced_at' => now()->toIso8601String(),
                'previous_type' => $previousType,
            ],
        ];

        // Process based on type
        if ($newType === 'image') {
            $imageData = $this->processImage($file);
            $updateData = array_merge($updateData, $imageData);

            // Generate thumbnail for image
            $thumbnailPath = $this->generateImageThumbnail($file, $filename);
            if ($thumbnailPath) {
                $updateData['thumbnail_path'] = $thumbnailPath;
            }
        }

        $media->update($updateData);

        return $media->fresh();
    }
}
