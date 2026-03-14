<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TenantSettingsController extends Controller
{
    public function index(): Response
    {
        $tenant = auth()->user()->currentTenant();

        return Inertia::render('tenant/settings/index', [
            'tenantSettings' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'domain' => $tenant->getDomain(),
                'icon_url' => $tenant->getIconUrl(),
                'splash_url' => $tenant->getSplashUrl(),
                'optimization_quality' => $tenant->getOptimizationQuality(),
                'timezone' => $tenant->getTimezone(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $tenant = auth()->user()->currentTenant();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'domain' => ['nullable', 'string', 'max:255'],
            'optimization_quality' => ['required', 'in:hd,fullhd'],
            'timezone' => ['required', 'string', 'timezone:all'],
        ]);

        $tenant->name = $validated['name'];
        $tenant->setSetting('domain', $validated['domain'] ?? null);
        $tenant->setSetting('optimization_quality', $validated['optimization_quality']);
        $tenant->setSetting('timezone', $validated['timezone']);
        $tenant->save();

        return back()->with('success', 'Settings updated successfully.');
    }

    public function uploadIcon(Request $request): JsonResponse
    {
        $request->validate([
            'icon' => ['required', 'image', 'mimes:png,jpg,jpeg,svg', 'max:2048'],
        ]);

        $tenant = auth()->user()->currentTenant();

        // Delete old icon if exists
        $oldPath = $tenant->getSetting('icon_path');
        if ($oldPath) {
            Storage::disk('s3')->delete($oldPath);
        }

        // Store new icon
        $path = $request->file('icon')->store(
            "tenants/{$tenant->id}/branding",
            's3'
        );

        $tenant->setSetting('icon_path', $path);
        $tenant->save();

        return response()->json([
            'success' => true,
            'icon_url' => $tenant->getIconUrl(),
        ]);
    }

    public function uploadSplash(Request $request): JsonResponse
    {
        $request->validate([
            'splash' => ['required', 'image', 'mimes:png,jpg,jpeg', 'max:5120'],
        ]);

        $tenant = auth()->user()->currentTenant();

        // Delete old splash if exists
        $oldPath = $tenant->getSetting('splash_path');
        if ($oldPath) {
            Storage::disk('s3')->delete($oldPath);
        }

        // Store new splash
        $path = $request->file('splash')->store(
            "tenants/{$tenant->id}/branding",
            's3'
        );

        $tenant->setSetting('splash_path', $path);
        $tenant->save();

        return response()->json([
            'success' => true,
            'splash_url' => $tenant->getSplashUrl(),
        ]);
    }

    public function deleteIcon(): JsonResponse
    {
        $tenant = auth()->user()->currentTenant();

        $path = $tenant->getSetting('icon_path');
        if ($path) {
            Storage::disk('s3')->delete($path);
            $tenant->setSetting('icon_path', null);
            $tenant->save();
        }

        return response()->json(['success' => true]);
    }

    public function deleteSplash(): JsonResponse
    {
        $tenant = auth()->user()->currentTenant();

        $path = $tenant->getSetting('splash_path');
        if ($path) {
            Storage::disk('s3')->delete($path);
            $tenant->setSetting('splash_path', null);
            $tenant->save();
        }

        return response()->json(['success' => true]);
    }
}
