<?php

namespace App\Http\Middleware;

use App\Models\Player;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PlayerAuthentication
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $player = Player::where('api_token', $token)->first();

        if (! $player) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        if (! $player->is_active) {
            return response()->json(['error' => 'Player deactivated'], 403);
        }

        // Store player in request for use in controllers
        $request->merge(['player' => $player]);
        $request->setUserResolver(fn () => $player);

        return $next($request);
    }
}
