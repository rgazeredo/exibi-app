<?php

namespace App\Http\Controllers\Api;

use App\Events\PlayerMediaChanged;
use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Recebe webhooks do Soketi (WebSocket server).
 *
 * Eventos:
 * - channel_occupied: Player conectou ao canal
 * - channel_vacated: Player desconectou do canal
 * - client_event: Player enviou evento (heartbeat com dados)
 */
class SoketiWebhookController extends Controller
{
    /**
     * Handle incoming Soketi webhook.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::debug('Soketi webhook received', $payload);

        // Verificar assinatura do webhook (opcional, para segurança)
        // $this->verifySignature($request);

        $events = $payload['events'] ?? [$payload];

        foreach ($events as $event) {
            $this->processEvent($event);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Process a single Soketi event.
     */
    private function processEvent(array $event): void
    {
        $webhookType = $event['name'] ?? null;
        $channel = $event['channel'] ?? null;
        $clientEvent = $event['event'] ?? null; // Nome do evento do cliente (ex: client-heartbeat)

        if (! $channel) {
            return;
        }

        // Extrair player_id do canal (private-player.{uuid} ou player.{uuid})
        $playerId = null;
        if (str_starts_with($channel, 'private-player.')) {
            $playerId = str_replace('private-player.', '', $channel);
        } elseif (str_starts_with($channel, 'player.')) {
            $playerId = str_replace('player.', '', $channel);
        } else {
            return; // Canal desconhecido
        }

        switch ($webhookType) {
            case 'channel_occupied':
                $this->handlePlayerConnected($playerId);
                break;

            case 'channel_vacated':
                $this->handlePlayerDisconnected($playerId);
                break;

            case 'client_event':
                if ($clientEvent === 'client-heartbeat') {
                    $this->handleClientEvent($playerId, $event);
                }
                break;
        }
    }

    /**
     * Player conectou ao WebSocket.
     */
    private function handlePlayerConnected(string $playerId): void
    {
        $player = Player::withoutGlobalScope('tenant')->find($playerId);

        if (! $player) {
            Log::warning('Soketi webhook: Player not found', ['player_id' => $playerId]);

            return;
        }

        // NÃO atualizar last_seen_at aqui - este evento também é disparado
        // quando o admin panel se inscreve no canal para receber atualizações.
        // O last_seen_at só deve ser atualizado por heartbeats do player real.

        Log::info('Channel occupied for player', [
            'player_id' => $playerId,
            'player_name' => $player->name,
        ]);
    }

    /**
     * Player desconectou do WebSocket.
     */
    private function handlePlayerDisconnected(string $playerId): void
    {
        $player = Player::withoutGlobalScope('tenant')->find($playerId);

        if (! $player) {
            return;
        }

        // NÃO atualizar last_seen_at aqui - este evento também é disparado
        // quando o admin panel sai do canal. O last_seen_at só deve ser
        // atualizado por heartbeats do player real.

        Log::info('Channel vacated for player', [
            'player_id' => $playerId,
            'player_name' => $player->name,
        ]);
    }

    /**
     * Player enviou evento cliente (heartbeat com dados).
     */
    private function handleClientEvent(string $playerId, array $event): void
    {
        $player = Player::withoutGlobalScope('tenant')->find($playerId);

        if (! $player) {
            Log::warning('Soketi webhook: Player not found', ['player_id' => $playerId]);

            return;
        }

        $data = $event['data'] ?? [];
        if (is_string($data)) {
            $data = json_decode($data, true) ?? [];
        }

        $status = $data['status'] ?? 'unknown';
        $newMediaId = $data['current_media_id'] ?? null;
        $regionsPlayback = $data['regions_playback'] ?? null;
        $appVersion = $data['app_version'] ?? null;
        $systemInfo = $data['system_info'] ?? [];
        $ipAddress = $data['ip_address'] ?? null;

        // Get previous heartbeat to detect changes
        $previousHeartbeat = $player->heartbeats()->latest('created_at')->first();
        $previousMediaId = $previousHeartbeat?->status['current_media_id'] ?? null;
        $previousRegionsPlayback = $previousHeartbeat?->status['regions_playback'] ?? null;

        // Build status data with current_media_id and regions_playback for tracking
        $statusData = [
            'state' => $status,
            'current_media_id' => $newMediaId,
            'regions_playback' => $regionsPlayback,
        ];

        // Record heartbeat
        $player->recordHeartbeat([
            'ip_address' => $ipAddress,
            'app_version' => $appVersion,
            'system_info' => $systemInfo,
            'status' => $statusData,
        ]);

        // Check if any media changed (main region or any other region)
        $mainMediaChanged = $newMediaId !== $previousMediaId;
        $regionsChanged = $this->hasRegionsPlaybackChanged($previousRegionsPlayback, $regionsPlayback);

        // Broadcast if any media changed (real-time update to admin panel)
        if ($mainMediaChanged || $regionsChanged) {
            $media = $newMediaId ? Media::withoutGlobalScope('tenant')->find($newMediaId) : null;

            event(new PlayerMediaChanged(
                player: $player,
                media: $media,
                startedAt: now()->toDateTimeString(),
            ));

            Log::info('Soketi webhook: Media changed, broadcasting', [
                'player_id' => $playerId,
                'previous_media' => $previousMediaId,
                'new_media' => $newMediaId,
                'regions_changed' => $regionsChanged,
            ]);
        }

        // Atualizar downloads_status se fornecido
        if (! empty($data['downloads_status'])) {
            $player->updateDownloadsStatus($data['downloads_status']);
        }

        Log::debug('Player heartbeat via WebSocket', [
            'player_id' => $playerId,
            'status' => $status,
            'media_id' => $newMediaId,
        ]);
    }

    /**
     * Check if regions playback has changed.
     * Compares media_id of each region.
     */
    private function hasRegionsPlaybackChanged(?array $previous, ?array $current): bool
    {
        // If both are null/empty, no change
        if (empty($previous) && empty($current)) {
            return false;
        }

        // If one is empty and other isn't, changed
        if (empty($previous) || empty($current)) {
            return true;
        }

        // Build maps of region_id => media_id for comparison
        $previousMap = [];
        foreach ($previous as $region) {
            $regionId = $region['region_id'] ?? null;
            if ($regionId) {
                $previousMap[$regionId] = $region['media_id'] ?? null;
            }
        }

        $currentMap = [];
        foreach ($current as $region) {
            $regionId = $region['region_id'] ?? null;
            if ($regionId) {
                $currentMap[$regionId] = $region['media_id'] ?? null;
            }
        }

        // Compare the maps
        return $previousMap !== $currentMap;
    }
}
