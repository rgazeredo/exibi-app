<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        // If authenticated, redirect to appropriate dashboard
        if (auth()->check()) {
            $user = auth()->user();
            if ($user->isSuperAdmin()) {
                return redirect('/admin/dashboard');
            }

            return redirect('/tenant/select');
        }

        return Inertia::render('landing');
    }
}
