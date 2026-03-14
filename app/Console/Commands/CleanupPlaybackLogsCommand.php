<?php

namespace App\Console\Commands;

use App\Models\PlaybackLog;
use Illuminate\Console\Command;

class CleanupPlaybackLogsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'playback-logs:cleanup
                            {--days=30 : Number of days to retain}
                            {--dry-run : Show how many records would be deleted without deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete playback log records older than specified days';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');

        $cutoffDate = now()->subDays($days);

        $count = PlaybackLog::where('created_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No playback log records older than '.$days.' days found.');

            return Command::SUCCESS;
        }

        if ($dryRun) {
            $this->info("[Dry Run] Would delete {$count} playback log records older than {$days} days.");

            return Command::SUCCESS;
        }

        $this->info("Deleting {$count} playback log records older than {$days} days...");

        // Delete in chunks to avoid memory issues with large datasets
        $deleted = 0;
        PlaybackLog::where('created_at', '<', $cutoffDate)
            ->chunkById(1000, function ($logs) use (&$deleted) {
                $deleted += $logs->count();
                PlaybackLog::whereIn('id', $logs->pluck('id'))->delete();
            });

        $this->info("Successfully deleted {$deleted} playback log records.");

        return Command::SUCCESS;
    }
}
