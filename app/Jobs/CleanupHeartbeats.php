<?php

namespace App\Jobs;

use App\Models\PlayerHeartbeat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CleanupHeartbeats implements ShouldQueue
{
    use Queueable;

    /**
     * Number of days to retain heartbeats.
     */
    protected int $retentionDays;

    /**
     * Create a new job instance.
     */
    public function __construct(?int $retentionDays = null)
    {
        $this->retentionDays = $retentionDays ?? (int) config('app.heartbeat_retention_days', 7);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $cutoffDate = now()->subDays($this->retentionDays);

        $deleted = PlayerHeartbeat::where('created_at', '<', $cutoffDate)->delete();

        Log::info('CleanupHeartbeats completed', [
            'retention_days' => $this->retentionDays,
            'cutoff_date' => $cutoffDate->toDateTimeString(),
            'deleted_count' => $deleted,
        ]);
    }
}
