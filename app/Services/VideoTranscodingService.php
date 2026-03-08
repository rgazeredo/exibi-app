<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VideoTranscodingService
{
    protected string $disk = 's3';

    protected string $tempDir;

    /**
     * Quality presets for transcoding
     * Format: [height => [bitrate, audio_bitrate]]
     */
    protected array $qualityPresets = [
        1080 => ['6M', '128k'],
        720 => ['3M', '96k'],
        480 => ['1.5M', '64k'],
    ];

    public function __construct()
    {
        $this->tempDir = storage_path('app/temp');

        if (! file_exists($this->tempDir)) {
            mkdir($this->tempDir, 0755, true);
        }
    }

    /**
     * Transcode a video to optimized format for Android
     */
    public function transcode(Media $media, ?int $targetHeight = null): ?array
    {
        if (! $media->isVideo()) {
            return null;
        }

        try {
            // Download original file
            $tempInput = $this->downloadToTemp($media);
            if (! $tempInput) {
                return null;
            }

            // Get video info
            $videoInfo = $this->getVideoInfo($tempInput);
            if (! $videoInfo) {
                @unlink($tempInput);

                return null;
            }

            $isPortrait = $this->isPortrait($videoInfo);
            $originalHeight = $isPortrait ? $videoInfo['width'] : $videoInfo['height'];

            // Determine target height based on original
            if (! $targetHeight) {
                $targetHeight = $this->determineTargetHeight($originalHeight);
            }

            // Skip if original is already smaller than target
            if ($originalHeight <= $targetHeight && $this->isOptimalCodec($videoInfo)) {
                Log::info('Video already optimized, skipping transcoding', ['media_id' => $media->id]);
                @unlink($tempInput);

                return null;
            }

            // Transcode
            $result = $this->transcodeVideo($tempInput, $media, $videoInfo, $targetHeight, $isPortrait);

            // Cleanup
            @unlink($tempInput);

            return $result;
        } catch (\Exception $e) {
            Log::error('Transcoding failed', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Download media file to temp directory
     */
    protected function downloadToTemp(Media $media): ?string
    {
        $extension = pathinfo($media->path, PATHINFO_EXTENSION);
        $tempFile = $this->tempDir.'/'.Str::uuid().'.'.$extension;

        try {
            $content = Storage::disk($this->disk)->get($media->path);
            file_put_contents($tempFile, $content);

            return $tempFile;
        } catch (\Exception $e) {
            Log::error('Failed to download media for transcoding', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Get video information using FFprobe
     */
    protected function getVideoInfo(string $filePath): ?array
    {
        $command = sprintf(
            'ffprobe -v quiet -print_format json -show_format -show_streams %s',
            escapeshellarg($filePath)
        );

        $result = Process::run($command);

        if (! $result->successful()) {
            return null;
        }

        $data = json_decode($result->output(), true);
        if (! $data) {
            return null;
        }

        $videoStream = collect($data['streams'] ?? [])->firstWhere('codec_type', 'video');
        if (! $videoStream) {
            return null;
        }

        // Check for rotation metadata
        $rotation = 0;
        if (isset($videoStream['tags']['rotate'])) {
            $rotation = (int) $videoStream['tags']['rotate'];
        } elseif (isset($videoStream['side_data_list'])) {
            foreach ($videoStream['side_data_list'] as $sideData) {
                if (isset($sideData['rotation'])) {
                    $rotation = abs((int) $sideData['rotation']);
                    break;
                }
            }
        }

        return [
            'width' => (int) $videoStream['width'],
            'height' => (int) $videoStream['height'],
            'codec' => $videoStream['codec_name'] ?? null,
            'duration' => isset($data['format']['duration']) ? (float) $data['format']['duration'] : null,
            'bitrate' => isset($data['format']['bit_rate']) ? (int) $data['format']['bit_rate'] : null,
            'rotation' => $rotation,
        ];
    }

    /**
     * Check if video is portrait orientation
     */
    protected function isPortrait(array $videoInfo): bool
    {
        // If rotated 90 or 270 degrees, swap width/height logic
        if (in_array($videoInfo['rotation'], [90, 270])) {
            return $videoInfo['width'] > $videoInfo['height'];
        }

        return $videoInfo['height'] > $videoInfo['width'];
    }

    /**
     * Check if video already has optimal codec
     */
    protected function isOptimalCodec(array $videoInfo): bool
    {
        return in_array($videoInfo['codec'], ['h264', 'avc', 'hevc', 'h265']);
    }

    /**
     * Determine target height based on original
     */
    protected function determineTargetHeight(int $originalHeight): int
    {
        if ($originalHeight >= 1080) {
            return 1080;
        }

        if ($originalHeight >= 720) {
            return 720;
        }

        return 480;
    }

    /**
     * Transcode video to optimized format
     */
    protected function transcodeVideo(
        string $inputPath,
        Media $media,
        array $videoInfo,
        int $targetHeight,
        bool $isPortrait
    ): array {
        $outputFilename = Str::uuid().'.mp4';
        $tempOutput = $this->tempDir.'/'.$outputFilename;

        // Calculate dimensions maintaining aspect ratio
        $dimensions = $this->calculateDimensions($videoInfo, $targetHeight, $isPortrait);

        // Get quality preset
        $preset = $this->qualityPresets[$targetHeight] ?? $this->qualityPresets[720];
        $videoBitrate = $preset[0];
        $audioBitrate = $preset[1];

        // Build FFmpeg command
        $scaleFilter = sprintf(
            'scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2',
            $dimensions['width'],
            $dimensions['height'],
            $dimensions['width'],
            $dimensions['height']
        );

        $command = sprintf(
            'ffmpeg -y -i %s '.
            '-c:v libx264 -preset medium -crf 23 '.
            '-profile:v high -level 4.1 '.
            '-maxrate %s -bufsize %s '.
            '-c:a aac -b:a %s '.
            '-vf "%s" '.
            '-movflags +faststart '.
            '-threads 0 '.
            '%s 2>&1',
            escapeshellarg($inputPath),
            $videoBitrate,
            str_replace('M', '', $videoBitrate) * 2 .'M',
            $audioBitrate,
            $scaleFilter,
            escapeshellarg($tempOutput)
        );

        Log::info('Transcoding video', [
            'media_id' => $media->id,
            'target_height' => $targetHeight,
            'is_portrait' => $isPortrait,
            'dimensions' => $dimensions,
        ]);

        $result = Process::timeout(3600)->run($command);

        if (! $result->successful() || ! file_exists($tempOutput)) {
            Log::error('FFmpeg transcoding failed', [
                'media_id' => $media->id,
                'output' => $result->output(),
                'error' => $result->errorOutput(),
            ]);

            return [];
        }

        // Upload transcoded file to S3 (visibility configured in filesystem config for B2 compatibility)
        $s3Path = "media/transcoded/{$media->id}/{$outputFilename}";
        Storage::disk($this->disk)->put($s3Path, file_get_contents($tempOutput));

        // Get transcoded file size
        $fileSize = filesize($tempOutput);

        // Cleanup
        @unlink($tempOutput);

        return [
            'path' => $s3Path,
            'width' => $dimensions['width'],
            'height' => $dimensions['height'],
            'size_bytes' => $fileSize,
            'quality' => "{$targetHeight}p",
        ];
    }

    /**
     * Calculate output dimensions maintaining aspect ratio
     */
    protected function calculateDimensions(array $videoInfo, int $targetHeight, bool $isPortrait): array
    {
        $originalWidth = $videoInfo['width'];
        $originalHeight = $videoInfo['height'];

        // Account for rotation
        if (in_array($videoInfo['rotation'], [90, 270])) {
            [$originalWidth, $originalHeight] = [$originalHeight, $originalWidth];
        }

        $aspectRatio = $originalWidth / $originalHeight;

        if ($isPortrait) {
            // Portrait: height is the longer dimension
            // Target: 1080x1920 for 1080p, 720x1280 for 720p, etc.
            $targetWidth = $targetHeight;
            $targetHeightActual = (int) round($targetHeight / $aspectRatio);

            // Ensure dimensions are even (required by H.264)
            $targetWidth = $targetWidth % 2 === 0 ? $targetWidth : $targetWidth - 1;
            $targetHeightActual = $targetHeightActual % 2 === 0 ? $targetHeightActual : $targetHeightActual - 1;

            return [
                'width' => $targetWidth,
                'height' => $targetHeightActual,
            ];
        }

        // Landscape: width is the longer dimension
        // Target: 1920x1080 for 1080p, 1280x720 for 720p, etc.
        $targetWidth = (int) round($targetHeight * $aspectRatio);

        // Ensure dimensions are even (required by H.264)
        $targetWidth = $targetWidth % 2 === 0 ? $targetWidth : $targetWidth - 1;
        $targetHeight = $targetHeight % 2 === 0 ? $targetHeight : $targetHeight - 1;

        return [
            'width' => $targetWidth,
            'height' => $targetHeight,
        ];
    }

    /**
     * Get public URL for transcoded file
     */
    public function getTranscodedUrl(string $path): string
    {
        $baseUrl = config('filesystems.disks.s3.url') ?? env('AWS_URL');

        return rtrim($baseUrl, '/').'/'.$path;
    }
}
