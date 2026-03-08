<?php

namespace App\Events;

use App\Models\Player;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento para enviar comandos para players via WebSocket.
 *
 * Comandos suportados:
 * - refresh_playlist: Recarrega a playlist
 * - refresh_app: Verifica atualizações do app
 * - reboot: Reinicia o player
 *
 * Uso:
 * event(new PlayerCommand($player, 'refresh_playlist', ['show_toast' => true]));
 */
class PlayerCommand implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Player $player,
        public string $command,
        public array $data = []
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('player.'.$this->player->id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'command';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'command' => $this->command,
            'data' => $this->data,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
