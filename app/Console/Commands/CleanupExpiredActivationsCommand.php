<?php

namespace App\Console\Commands;

use App\Models\PendingPlayerActivation;
use Illuminate\Console\Command;

class CleanupExpiredActivationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activations:cleanup
                            {--dry-run : Show how many records would be deleted without deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete expired and old player activation records';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        // Count expired activations
        $expiredCount = PendingPlayerActivation::where('expires_at', '<', now())
            ->whereNull('activated_at')
            ->count();

        // Count old activated records
        $oldActivatedCount = PendingPlayerActivation::whereNotNull('activated_at')
            ->where('activated_at', '<', now()->subDay())
            ->count();

        $totalCount = $expiredCount + $oldActivatedCount;

        if ($totalCount === 0) {
            $this->info('No expired or old activation records found.');

            return Command::SUCCESS;
        }

        $this->info("Found {$expiredCount} expired activations and {$oldActivatedCount} old activated records.");

        if ($dryRun) {
            $this->info("[Dry Run] Would delete {$totalCount} records total.");

            return Command::SUCCESS;
        }

        // Delete expired activations
        $deletedExpired = PendingPlayerActivation::where('expires_at', '<', now())
            ->whereNull('activated_at')
            ->delete();

        // Delete old activated records
        $deletedOld = PendingPlayerActivation::whereNotNull('activated_at')
            ->where('activated_at', '<', now()->subDay())
            ->delete();

        $this->info("Deleted {$deletedExpired} expired activations.");
        $this->info("Deleted {$deletedOld} old activated records.");
        $this->info('Total deleted: '.($deletedExpired + $deletedOld));

        return Command::SUCCESS;
    }
}
