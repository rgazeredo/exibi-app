<?php

namespace App\Jobs;

use App\Models\PlaybackLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CleanupPlaybackLogs implements ShouldQueue
{
    use Queueable;

    /**
     * Number of days to retain playback logs.
     */
    protected int $retentionDays;

    /**
     * Create a new job instance.
     */
    public function __construct(?int $retentionDays = null)
    {
        $this->retentionDays = $retentionDays ?? 30;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $cutoffDate = now()->subDays($this->retentionDays);

        // Delete in chunks to avoid memory issues with large datasets
        $totalDeleted = 0;

        do {
            $deleted = PlaybackLog::where('created_at', '<', $cutoffDate)
                ->limit(1000)
                ->delete();

            $totalDeleted += $deleted;
        } while ($deleted > 0);

        Log::info('CleanupPlaybackLogs completed', [
            'retention_days' => $this->retentionDays,
            'cutoff_date' => $cutoffDate->toDateTimeString(),
            'deleted_count' => $totalDeleted,
        ]);
    }
}
