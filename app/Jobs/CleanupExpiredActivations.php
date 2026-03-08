<?php

namespace App\Jobs;

use App\Models\PendingPlayerActivation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CleanupExpiredActivations implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Delete expired activations that were never activated
        $expiredCount = PendingPlayerActivation::where('expires_at', '<', now())
            ->whereNull('activated_at')
            ->delete();

        // Delete old activated records (no longer needed after 24 hours)
        $oldActivatedCount = PendingPlayerActivation::whereNotNull('activated_at')
            ->where('activated_at', '<', now()->subDay())
            ->delete();

        $totalDeleted = $expiredCount + $oldActivatedCount;

        if ($totalDeleted > 0) {
            Log::info('CleanupExpiredActivations completed', [
                'expired_deleted' => $expiredCount,
                'old_activated_deleted' => $oldActivatedCount,
                'total_deleted' => $totalDeleted,
            ]);
        }
    }
}
