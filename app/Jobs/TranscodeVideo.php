<?php

namespace App\Jobs;

use App\Models\Media;
use App\Services\VideoTranscodingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TranscodeVideo implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 3600; // 1 hour for large videos

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Media $media,
        public ?int $targetHeight = null
    ) {
        $this->onQueue('transcoding');
    }

    /**
     * Execute the job.
     */
    public function handle(VideoTranscodingService $service): void
    {
        Log::info('Starting video transcoding', ['media_id' => $this->media->id]);

        // Update status to processing
        $this->media->update([
            'metadata' => array_merge($this->media->metadata ?? [], [
                'transcoding_status' => 'processing',
                'transcoding_started_at' => now()->toIso8601String(),
            ]),
        ]);

        try {
            // Get max height from tenant settings
            $targetHeight = $this->targetHeight;
            if (! $targetHeight) {
                $quality = $this->media->tenant->getOptimizationQuality();
                $targetHeight = $quality === 'hd' ? 720 : 1080;
            }

            // Store original path for deletion
            $originalPath = $this->media->path;
            $originalSize = $this->media->size_bytes;

            $result = $service->transcode($this->media, $targetHeight);

            if ($result) {
                // Delete original file from S3
                Storage::disk('s3')->delete($originalPath);

                Log::info('Deleted original file after transcoding', [
                    'media_id' => $this->media->id,
                    'original_path' => $originalPath,
                ]);

                // Update media to use transcoded file as the main file
                $this->media->update([
                    'path' => $result['path'],
                    'size_bytes' => $result['size_bytes'],
                    'metadata' => array_merge($this->media->metadata ?? [], [
                        'transcoded_versions' => [$result['quality'] => [
                            'path' => $result['path'],
                            'width' => $result['width'],
                            'height' => $result['height'],
                            'size_bytes' => $result['size_bytes'],
                            'created_at' => now()->toIso8601String(),
                        ]],
                        'transcoding_status' => 'completed',
                        'transcoding_completed_at' => now()->toIso8601String(),
                        'original_deleted' => true,
                        'original_size_bytes' => $originalSize,
                    ]),
                ]);

                Log::info('Video transcoding completed', [
                    'media_id' => $this->media->id,
                    'quality' => $result['quality'],
                    'size_reduction' => $originalSize > 0
                        ? round((1 - $result['size_bytes'] / $originalSize) * 100, 1).'%'
                        : 'N/A',
                ]);
            } else {
                // No transcoding needed or already optimal
                $this->media->update([
                    'metadata' => array_merge($this->media->metadata ?? [], [
                        'transcoding_status' => 'skipped',
                        'transcoding_reason' => 'Video already optimized or smaller than target',
                    ]),
                ]);

                Log::info('Video transcoding skipped', ['media_id' => $this->media->id]);
            }
        } catch (\Exception $e) {
            $this->media->update([
                'metadata' => array_merge($this->media->metadata ?? [], [
                    'transcoding_status' => 'failed',
                    'transcoding_error' => $e->getMessage(),
                    'transcoding_failed_at' => now()->toIso8601String(),
                ]),
            ]);

            Log::error('Video transcoding failed', [
                'media_id' => $this->media->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
