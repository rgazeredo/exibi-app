<?php

namespace App\Console\Commands;

use App\Models\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateMediaHashes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:generate-hashes
                            {--force : Regenerate hashes even for media that already have one}
                            {--limit= : Limit the number of media to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate SHA-256 hashes for existing media files';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = $this->option('force');
        $limit = $this->option('limit');

        $query = Media::query();

        if (! $force) {
            $query->whereNull('sha256_hash');
        }

        if ($limit) {
            $query->limit((int) $limit);
        }

        $total = $query->count();

        if ($total === 0) {
            $this->info('No media files need hash generation.');

            return Command::SUCCESS;
        }

        $this->info("Processing {$total} media files...");
        $this->newLine();

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $processed = 0;
        $failed = 0;
        $skipped = 0;

        $query->chunk(50, function ($mediaItems) use ($bar, &$processed, &$failed, &$skipped) {
            foreach ($mediaItems as $media) {
                try {
                    if (! $media->path) {
                        $skipped++;
                        $bar->advance();

                        continue;
                    }

                    // Download file content from S3
                    $content = Storage::disk('s3')->get($media->path);

                    if (! $content) {
                        $this->newLine();
                        $this->warn("Could not read file for media {$media->id}: {$media->path}");
                        $failed++;
                        $bar->advance();

                        continue;
                    }

                    // Calculate SHA-256 hash
                    $hash = hash('sha256', $content);

                    // Update media record
                    $media->update(['sha256_hash' => $hash]);

                    $processed++;
                } catch (\Exception $e) {
                    $this->newLine();
                    $this->error("Error processing media {$media->id}: {$e->getMessage()}");
                    $failed++;
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Processed: {$processed}");

        if ($skipped > 0) {
            $this->warn("⏭️  Skipped (no path): {$skipped}");
        }

        if ($failed > 0) {
            $this->error("❌ Failed: {$failed}");

            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
