<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessVideoMedia;
use App\Jobs\RefreshPlayersPlaylist;
use App\Models\Media;
use App\Models\Player;
use App\Services\MediaProcessingService;
use App\Services\WebSocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __construct(
        protected MediaProcessingService $mediaService
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('media/index', [
            'filters' => $request->only(['search', 'type']),
            'stats' => [
                'total' => Media::count(),
                'videos' => Media::videos()->count(),
                'images' => Media::images()->count(),
                'total_storage' => Media::formatBytes(Media::getTotalStorageBytes()),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('media/upload');
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:512000', 'mimes:mp4,webm,mov,avi,jpg,jpeg,png,gif,webp'],
            'title' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['uuid', 'exists:tags,id'],
        ]);

        $tenant = auth()->user()->currentTenant();

        if ($tenant->hasReachedStorageLimit()) {
            $limitMb = $tenant->storage_limit_mb;
            $usedMb = $tenant->getStorageUsageMb();

            $errorMessage = "Limite de armazenamento atingido. Você tem {$limitMb}MB e já usou {$usedMb}MB.";

            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'errors' => ['file' => $errorMessage],
                ], 422);
            }

            return back()->withErrors(['file' => $errorMessage]);
        }

        $file = $request->file('file');

        // Process upload (handles image thumbnails immediately)
        $media = $this->mediaService->processUpload(
            $file,
            $validated['title'] ?? null,
            $tenant->id
        );

        // Sync tags if provided
        if (! empty($validated['tags'])) {
            $media->syncTags($validated['tags']);
        }

        // Dispatch job for video processing (metadata + thumbnail via FFmpeg)
        if ($media->isVideo()) {
            $tenant = auth()->user()->currentTenant();
            $shouldTranscode = $tenant?->shouldAutoOptimizeVideos() ?? true;
            ProcessVideoMedia::dispatch($media, $shouldTranscode);
        }

        // Return JSON for AJAX requests (e.g., modal uploads)
        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'id' => $media->id,
                'title' => $media->title,
                'type' => $media->type,
                'thumbnail_url' => $media->getThumbnailUrl(),
                'duration_seconds' => $media->duration_seconds,
                'formatted_duration' => $media->getFormattedDuration(),
            ], 201);
        }

        return redirect()->route('media.index')
            ->with('success', 'Media uploaded successfully.');
    }

    public function show(string $id): Response
    {
        $media = Media::with('tags')->findOrFail($id);

        // Build transcoded versions array for frontend
        $transcodedVersions = [];
        foreach ($media->getTranscodedVersions() as $quality => $version) {
            $transcodedVersions[] = [
                'quality' => $quality,
                'width' => $version['width'],
                'height' => $version['height'],
                'size_bytes' => $version['size_bytes'],
                'url' => $media->getOptimizedUrl((int) str_replace('p', '', $quality)),
            ];
        }

        return Inertia::render('media/show', [
            'media' => [
                'id' => $media->id,
                'title' => $media->title,
                'type' => $media->type,
                'filename' => $media->filename,
                'mime_type' => $media->mime_type,
                'formatted_size' => $media->getFormattedSize(),
                'formatted_duration' => $media->getFormattedDuration(),
                'resolution' => $media->getResolution(),
                'orientation' => $media->isPortrait() ? 'portrait' : 'landscape',
                'width' => $media->width,
                'height' => $media->height,
                'url' => $media->getPublicUrl(),
                'optimized_url' => $media->getOptimizedUrl(),
                'thumbnail_url' => $media->getThumbnailUrl(),
                'transcoding_status' => $media->getTranscodingStatus(),
                'transcoded_versions' => $transcodedVersions,
                'metadata' => $media->metadata,
                'tags' => $media->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'created_at' => $media->created_at?->toDateTimeString(),
            ],
        ]);
    }

    public function edit(string $id): Response
    {
        $media = Media::findOrFail($id);

        return Inertia::render('media/form', [
            'media' => [
                'id' => $media->id,
                'title' => $media->title,
                'type' => $media->type,
            ],
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $media = Media::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['uuid', 'exists:tags,id'],
        ]);

        $media->update(['title' => $validated['title']]);

        // Sync tags
        $media->syncTags($validated['tags'] ?? []);

        // Return JSON for pure AJAX requests (not Inertia)
        // Inertia sends X-Inertia header, so we check for AJAX without Inertia
        if (($request->ajax() || $request->wantsJson()) && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'media' => [
                    'id' => $media->id,
                    'title' => $media->title,
                ],
            ]);
        }

        return redirect()->route('media.show', $media)
            ->with('success', 'Media updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $media = Media::findOrFail($id);

        // Collect affected players BEFORE deleting (while relationships still exist)
        $affectedPlayerIds = $this->collectAffectedPlayers(collect([$media]));

        // Delete files from storage
        $this->mediaService->deleteAllMediaFiles($media);

        $media->delete();

        // Dispatch job to refresh affected players asynchronously
        if (! empty($affectedPlayerIds)) {
            RefreshPlayersPlaylist::dispatch($affectedPlayerIds);
        }

        return redirect()->route('media.index')
            ->with('success', 'Media deleted successfully.');
    }

    /**
     * Search media with pagination for AJAX requests
     */
    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['title', 'type', 'size_bytes', 'duration_seconds', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        $media = Media::query()
            ->with(['tags'])
            ->withCount('playlists')
            ->when($request->ids, function ($q) use ($request) {
                // Filter by specific IDs (comma-separated)
                $ids = is_array($request->ids) ? $request->ids : explode(',', $request->ids);

                return $q->whereIn('id', $ids);
            })
            ->when($request->search, fn($q, $search) => $q->where('title', 'ilike', "%{$search}%"))
            ->when($request->type && $request->type !== 'all', fn($q) => $q->where('type', $request->type))
            ->when($request->tag, fn($q, $tagId) => $q->whereHas('tags', fn($tq) => $tq->where('tags.id', $tagId)))
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $media->through(fn($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'type' => $item->type,
                'mime_type' => $item->mime_type,
                'size_bytes' => $item->size_bytes,
                'formatted_size' => $item->getFormattedSize(),
                'duration_seconds' => $item->duration_seconds,
                'formatted_duration' => $item->getFormattedDuration(),
                'resolution' => $item->getResolution(),
                'orientation' => $item->isPortrait() ? 'portrait' : 'landscape',
                'thumbnail_url' => $item->getThumbnailUrl(),
                'url' => $item->getPublicUrl(),
                'tags' => $item->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'playlists_count' => $item->playlists_count,
                'created_at' => $item->created_at?->toISOString(),
                'created_at_human' => $item->created_at?->diffForHumans(),
            ]),
            'meta' => [
                'current_page' => $media->currentPage(),
                'last_page' => $media->lastPage(),
                'per_page' => $media->perPage(),
                'total' => $media->total(),
                'from' => $media->firstItem(),
                'to' => $media->lastItem(),
            ],
        ]);
    }

    /**
     * Get single media item as JSON for API requests
     */
    public function apiShow(Media $media): JsonResponse
    {
        return response()->json([
            'id' => $media->id,
            'title' => $media->title,
            'type' => $media->type,
            'thumbnail_url' => $media->getThumbnailUrl(),
            'duration_seconds' => $media->duration_seconds,
            'formatted_duration' => $media->getFormattedDuration(),
        ]);
    }

    /**
     * Get media stats for AJAX refresh (after upload, delete, etc.)
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Media::count(),
            'videos' => Media::videos()->count(),
            'images' => Media::images()->count(),
            'total_storage' => Media::formatBytes(Media::getTotalStorageBytes()),
        ]);
    }

    /**
     * Move multiple media items (no longer used - folders removed).
     */
    public function move(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'moved' => 0,
        ]);
    }

    /**
     * Bulk delete multiple media items.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'media_ids' => ['required', 'array', 'min:1'],
            'media_ids.*' => ['uuid', 'exists:media,id'],
        ]);

        $mediaItems = Media::whereIn('id', $validated['media_ids'])->get();

        // Collect affected players BEFORE deleting media (while relationships still exist)
        $affectedPlayerIds = $this->collectAffectedPlayers($mediaItems);

        $deleted = 0;
        foreach ($mediaItems as $media) {
            // Delete files from storage
            $this->mediaService->deleteAllMediaFiles($media);
            $media->delete();
            $deleted++;
        }

        // Dispatch job to refresh affected players asynchronously
        if (! empty($affectedPlayerIds)) {
            RefreshPlayersPlaylist::dispatch($affectedPlayerIds);
        }

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
        ]);
    }

    /**
     * Collect all player IDs that use playlists containing these media items.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<Media>  $mediaItems
     * @return array<string>
     */
    protected function collectAffectedPlayers($mediaItems): array
    {
        $allPlaylistIds = [];

        // Collect all playlist IDs from all media items
        foreach ($mediaItems as $media) {
            $playlistIds = $media->playlists()->pluck('playlists.id')->toArray();
            $allPlaylistIds = array_merge($allPlaylistIds, $playlistIds);
        }

        $allPlaylistIds = array_unique($allPlaylistIds);

        if (empty($allPlaylistIds)) {
            return [];
        }

        $tenantId = session('current_tenant_id');

        // Get all players using these playlists via their layouts
        $players = Player::query()
            ->where('tenant_id', $tenantId)
            ->whereHas('regionPlaylists', function ($q) use ($allPlaylistIds) {
                $q->whereIn('playlist_id', $allPlaylistIds);
            })
            ->pluck('id')
            ->toArray();

        return $players;
    }

    /**
     * Replace a media file while keeping the same record.
     * All playlist references are preserved.
     */
    public function replace(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $media = Media::findOrFail($id);

        $validated = $request->validate([
            'file' => ['required', 'file', 'max:512000', 'mimes:mp4,webm,mov,avi,jpg,jpeg,png,gif,webp'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $file = $request->file('file');
        $newType = str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image';
        $typeChanged = $newType !== $media->type;

        // Replace the media file
        $media = $this->mediaService->replaceMedia(
            $media,
            $file,
            $validated['title'] ?? null
        );

        // Dispatch job for video processing (metadata + thumbnail via FFmpeg)
        if ($media->isVideo()) {
            $tenant = auth()->user()->currentTenant();
            $shouldTranscode = $tenant?->shouldAutoOptimizeVideos() ?? true;
            ProcessVideoMedia::dispatch($media, $shouldTranscode);
        }

        // Notify players using playlists that contain this media
        $this->notifyPlayersForMedia($media);

        // Return JSON for AJAX requests
        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'media' => [
                    'id' => $media->id,
                    'title' => $media->title,
                    'type' => $media->type,
                    'thumbnail_url' => $media->getThumbnailUrl(),
                    'type_changed' => $typeChanged,
                ],
                'message' => __('media.replaced'),
            ]);
        }

        return redirect()->route('media.show', $media)
            ->with('success', 'Media replaced successfully.');
    }

    /**
     * Notify all players that use playlists containing this media.
     */
    protected function notifyPlayersForMedia(Media $media): void
    {
        $webSocketService = app(WebSocketService::class);

        // Get all playlists containing this media
        $playlistIds = $media->playlists()->pluck('playlists.id')->toArray();

        if (empty($playlistIds)) {
            return;
        }

        // Get all players using these playlists via their layouts
        $players = Player::query()
            ->where('tenant_id', $media->tenant_id)
            ->whereHas('regionPlaylists', function ($q) use ($playlistIds) {
                $q->whereIn('playlist_id', $playlistIds);
            })
            ->get();

        if ($players->isNotEmpty()) {
            $webSocketService->sendCommandToMany($players, 'refresh_player');
        }
    }
}
