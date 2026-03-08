<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\PlaylistItem;
use App\Models\Widget;
use App\Services\WidgetsApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WidgetWebhookController extends Controller
{
    public function __construct(
        protected WidgetsApiService $widgetsService
    ) {}

    /**
     * Handle webhook from Widgets API when video generation completes.
     */
    public function handle(Request $request): JsonResponse
    {
        Log::info('Widget webhook received', $request->all());

        $validated = $request->validate([
            'media_id' => ['required', 'string'],
            'video_url' => ['required', 'url'],
        ]);

        $widget = Widget::find($validated['media_id']);

        if (! $widget) {
            Log::warning('Widget webhook received for unknown widget', [
                'media_id' => $validated['media_id'],
            ]);

            return response()->json(['error' => 'Widget not found'], 404);
        }

        return $this->handleSuccess($widget, $validated);
    }

    /**
     * Handle successful video generation.
     */
    protected function handleSuccess(Widget $widget, array $data): JsonResponse
    {
        try {
            // Create media from the external URL
            $media = $this->widgetsService->createMediaFromUrl(
                $widget,
                $data['video_url'],
                []
            );

            // Store old media ID for cleanup
            $oldMediaId = $widget->current_media_id;

            // Update widget status
            $widget->update([
                'current_media_id' => $media->id,
                'status' => Widget::STATUS_READY,
                'last_generated_at' => now(),
                'next_regeneration_at' => $widget->calculateNextRegeneration(),
                'last_error' => null,
                'generation_request_id' => null,
            ]);

            // Delete old media to save space
            if ($oldMediaId) {
                Media::find($oldMediaId)?->delete();
            }

            // Invalidate playlist caches that use this widget
            $this->invalidatePlaylistCaches($widget);

            Log::info('Widget video updated successfully', [
                'widget_id' => $widget->id,
                'media_id' => $media->id,
                'video_url' => $data['video_url'],
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to process widget webhook', [
                'widget_id' => $widget->id,
                'error' => $e->getMessage(),
            ]);

            return $this->handleFailure($widget, $e->getMessage());
        }
    }

    /**
     * Handle failed video generation.
     */
    protected function handleFailure(Widget $widget, string $error): JsonResponse
    {
        $widget->update([
            'status' => Widget::STATUS_ERROR,
            'last_error' => $error,
            'generation_request_id' => null,
        ]);

        Log::warning('Widget video generation failed', [
            'widget_id' => $widget->id,
            'error' => $error,
        ]);

        return response()->json(['success' => true, 'warning' => 'Failure recorded']);
    }

    /**
     * Invalidate playlist caches that contain this widget.
     */
    protected function invalidatePlaylistCaches(Widget $widget): void
    {
        // Find all playlist items that reference this widget
        $playlistIds = PlaylistItem::where('item_type', 'widget')
            ->where('item_id', $widget->id)
            ->pluck('playlist_id')
            ->unique();

        foreach ($playlistIds as $playlistId) {
            // Clear any cache keys for this playlist
            Cache::forget("playlist:{$playlistId}");
        }

        // Also find players that use these playlists and clear their caches
        // This is a simplified version - a full implementation would query the players table
    }
}
