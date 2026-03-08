<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorLoginResponse implements TwoFactorLoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        // Super admins always go directly to admin dashboard
        // (ignore intended URL to prevent being sent to tenant pages)
        if ($user->isSuperAdmin()) {
            return $request->wantsJson()
                ? new JsonResponse(['two_factor' => false, 'redirect' => '/admin/dashboard'], 200)
                : redirect('/admin/dashboard');
        }

        // Regular users go to tenant selection (or intended URL if they have one)
        $home = '/tenant/select';

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false, 'redirect' => $home], 200)
            : redirect()->intended($home);
    }
}
