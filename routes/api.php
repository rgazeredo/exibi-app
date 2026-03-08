<?php

use App\Http\Controllers\Api\AppVersionController;
use App\Http\Controllers\Api\PlayerActivationController;
use App\Http\Controllers\Api\SoketiWebhookController;
use App\Http\Controllers\Api\WidgetWebhookController;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Android Player
|--------------------------------------------------------------------------
*/

Route::prefix('v1/player')->group(function () {
    // Public endpoints (no auth required)
    Route::post('request-activation', [PlayerActivationController::class, 'requestActivation']);
    Route::post('check-activation', [PlayerActivationController::class, 'checkActivation']);
    Route::get('app-version', [AppVersionController::class, 'check']);

    // Authenticated endpoints (require api_token)
    Route::middleware('player.auth')->group(function () {
        Route::get('playlist', [PlayerActivationController::class, 'playlist']);
        Route::post('heartbeat', [PlayerActivationController::class, 'heartbeat']);
        Route::post('log', [PlayerActivationController::class, 'log']);
        Route::post('events', [PlayerActivationController::class, 'events']);
        Route::post('screenshot', [PlayerActivationController::class, 'uploadScreenshot']);
    });
});

/*
|--------------------------------------------------------------------------
| WebSocket Authentication
|--------------------------------------------------------------------------
| Endpoint for Pusher/Soketi channel authentication.
| Android players use this to subscribe to private channels.
*/

Route::post('broadcasting/auth', function (Request $request) {
    $token = $request->bearerToken() ?? $request->input('token');

    if (! $token) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $player = Player::where('api_token', $token)->first();

    if (! $player) {
        return response()->json(['error' => 'Invalid token'], 401);
    }

    $channelName = $request->input('channel_name');
    $socketId = $request->input('socket_id');

    // Verify player can access this channel (private-player.{id})
    $expectedChannel = 'private-player.'.$player->id;
    if ($channelName !== $expectedChannel) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    // Generate Pusher auth signature
    $pusher = new \Pusher\Pusher(
        config('broadcasting.connections.pusher.key'),
        config('broadcasting.connections.pusher.secret'),
        config('broadcasting.connections.pusher.app_id'),
        config('broadcasting.connections.pusher.options')
    );

    $auth = $pusher->authorizeChannel($channelName, $socketId);

    return response()->json(json_decode($auth, true));
});

/*
|--------------------------------------------------------------------------
| Webhooks
|--------------------------------------------------------------------------
*/

Route::prefix('webhooks')->group(function () {
    Route::post('widget', [WidgetWebhookController::class, 'handle'])->name('webhooks.widget');
    Route::post('soketi', [SoketiWebhookController::class, 'handle'])->name('webhooks.soketi');
});
