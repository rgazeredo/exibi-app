<?php

namespace App\Jobs;

use App\Models\Player;
use App\Services\WebSocketService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class RefreshPlayersPlaylist implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     *
     * @param  array<string>  $playerIds
     */
    public function __construct(
        public array $playerIds
    ) {
        $this->onQueue('default');
    }

    /**
     * Execute the job.
     */
    public function handle(WebSocketService $webSocketService): void
    {
        if (empty($this->playerIds)) {
            return;
        }

        $players = Player::whereIn('id', $this->playerIds)->get();

        if ($players->isEmpty()) {
            return;
        }

        Log::info('Refreshing playlists for players after media deletion', [
            'player_count' => $players->count(),
            'player_ids' => $this->playerIds,
        ]);

        $webSocketService->sendCommandToMany($players, 'refresh_player');
    }
}
