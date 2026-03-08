<?php

use App\Models\Player;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

/*
|--------------------------------------------------------------------------
| Player Private Channel
|--------------------------------------------------------------------------
| Autoriza conexão WebSocket usando api_token do player.
| Canal: private-player.{player_id}
|
| A autenticação é feita via api_token no header Authorization ou
| como parâmetro 'token' no request.
*/
Broadcast::channel('player.{playerId}', function ($user, $playerId) {
    // Para players, autenticação é via api_token no header
    $token = request()->bearerToken() ?? request()->input('token');

    if (! $token) {
        return false;
    }

    $player = Player::where('api_token', $token)
        ->where('id', $playerId)
        ->first();

    return $player !== null;
});
