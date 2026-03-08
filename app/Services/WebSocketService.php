<?php

namespace App\Services;

use App\Events\PlayerCommand;
use App\Models\Player;
use Illuminate\Support\Facades\Log;

/**
 * Serviço para enviar comandos via WebSocket para players.
 *
 * Usa Pusher/Soketi para comunicação real-time bidirecional.
 */
class WebSocketService
{
    /**
     * Envia um comando genérico para o player via WebSocket.
     */
    public function sendCommand(Player $player, string $command, array $data = []): bool
    {
        try {
            event(new PlayerCommand($player, $command, $data));

            Log::info('WebSocket command sent', [
                'player_id' => $player->id,
                'player_name' => $player->name,
                'command' => $command,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('WebSocket command failed: '.$e->getMessage(), [
                'player_id' => $player->id,
                'command' => $command,
                'exception' => $e,
            ]);

            return false;
        }
    }

    /**
     * Envia comando para atualizar a playlist.
     */
    public function refreshPlaylist(Player $player, bool $showToast = false): bool
    {
        return $this->sendCommand($player, 'refresh_playlist', [
            'show_toast' => $showToast,
        ]);
    }

    /**
     * Envia comando para verificar atualizações do app.
     */
    public function refreshApp(Player $player): bool
    {
        return $this->sendCommand($player, 'refresh_app');
    }

    /**
     * Envia comando para reiniciar o player.
     */
    public function reboot(Player $player): bool
    {
        return $this->sendCommand($player, 'reboot');
    }

    /**
     * Envia comando para múltiplos players.
     *
     * @param  \Illuminate\Support\Collection  $players
     * @return array<string, bool> Array com player_id => success
     */
    public function sendCommandToMany($players, string $command, array $data = []): array
    {
        $results = [];

        foreach ($players as $player) {
            $results[$player->id] = $this->sendCommand($player, $command, $data);
        }

        return $results;
    }

    /**
     * Retorna a configuração do WebSocket para o player.
     * Usado na ativação para configurar o Android app.
     */
    public function getConfig(): array
    {
        $scheme = env('PUSHER_PUBLIC_SCHEME', env('PUSHER_SCHEME', 'http'));
        $wsScheme = $scheme === 'https' ? 'wss' : 'ws';
        $host = env('PUSHER_PUBLIC_HOST', env('PUSHER_HOST', 'localhost'));
        $port = env('PUSHER_PUBLIC_PORT', env('PUSHER_PORT', 6001));

        // Se porta for 443 (HTTPS padrão), não incluir na URL
        $portSuffix = ($port == 443 || $port == 80) ? '' : ':'.$port;

        return [
            'url' => $wsScheme.'://'.$host.$portSuffix,
            'key' => env('PUSHER_APP_KEY'),
        ];
    }
}
