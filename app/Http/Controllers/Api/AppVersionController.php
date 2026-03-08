<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppRelease;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppVersionController extends Controller
{
    /**
     * Check for app updates.
     *
     * GET /api/v1/player/app-version
     * Optional query param: current_version_code (int)
     */
    public function check(Request $request): JsonResponse
    {
        $release = AppRelease::getCurrentRelease();

        if (! $release) {
            return response()->json([
                'update_available' => false,
                'message' => 'No release available',
            ]);
        }

        $currentVersionCode = (int) $request->query('current_version_code', 0);

        $response = [
            'version_name' => $release->version_name,
            'version_code' => $release->version_code,
            'apk_url' => $release->getApkUrl(),
            'release_notes' => $release->release_notes,
            'force_update' => $release->force_update,
            'min_version_code' => $release->min_version_code,
        ];

        // Add update_available flag if current version was provided
        if ($currentVersionCode > 0) {
            $response['update_available'] = $release->needsUpdate($currentVersionCode);
        }

        return response()->json($response);
    }
}
