<?php

namespace App\Jobs;

use App\Events\MediaProcessingComplete;
use App\Models\Media;
use App\Services\MediaProcessingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessVideoMedia implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Media $media,
        public bool $transcode = true
    ) {
        $this->onQueue('media');
    }

    /**
     * Execute the job.
     */
    public function handle(MediaProcessingService $service): void
    {
        // First, extract metadata and generate thumbnail
        $service->processVideo($this->media);

        // Refresh media to get updated data
        $this->media->refresh();

        // Broadcast event to admin panel
        event(new MediaProcessingComplete($this->media));

        // Then, dispatch transcoding job if enabled
        if ($this->transcode) {
            // Mark as pending transcoding
            $this->media->update([
                'metadata' => array_merge($this->media->metadata ?? [], [
                    'transcoding_status' => 'pending',
                ]),
            ]);

            // Dispatch transcoding job
            TranscodeVideo::dispatch($this->media);
        }
    }
}
