<?php

namespace App\Console\Commands;

use App\Models\PlayerHeartbeat;
use Illuminate\Console\Command;

class CleanupHeartbeatsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'heartbeats:cleanup
                            {--days= : Number of days to retain (default: from config)}
                            {--dry-run : Show how many records would be deleted without deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete old player heartbeat records';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = $this->option('days') ?? config('app.heartbeat_retention_days', 7);
        $dryRun = $this->option('dry-run');

        $cutoffDate = now()->subDays($days);

        $count = PlayerHeartbeat::where('created_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No heartbeat records older than '.$days.' days found.');

            return Command::SUCCESS;
        }

        if ($dryRun) {
            $this->info("[Dry Run] Would delete {$count} heartbeat records older than {$days} days.");

            return Command::SUCCESS;
        }

        $this->info("Deleting {$count} heartbeat records older than {$days} days...");

        $deleted = PlayerHeartbeat::where('created_at', '<', $cutoffDate)->delete();

        $this->info("Successfully deleted {$deleted} heartbeat records.");

        return Command::SUCCESS;
    }
}
