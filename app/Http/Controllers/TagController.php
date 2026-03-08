<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('tags/index', [
            'filters' => $request->only(['search']),
        ]);
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'media_count', 'players_count', 'playlists_count', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        // Handle virtual column sorting (usage_count)
        $sortByUsageCount = $sortField === 'usage_count';
        if ($sortByUsageCount) {
            $sortField = 'name'; // Will be overridden by raw query
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        $query = Tag::query()
            ->withCount(['media', 'players', 'playlists'])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'ilike', "%{$search}%"));

        if ($sortByUsageCount) {
            $query->orderByRaw("(SELECT COUNT(*) FROM media_tag WHERE media_tag.tag_id = tags.id) + (SELECT COUNT(*) FROM player_tag WHERE player_tag.tag_id = tags.id) + (SELECT COUNT(*) FROM playlist_tag WHERE playlist_tag.tag_id = tags.id) {$sortDirection}");
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $tags = $query->paginate($perPage);

        return response()->json([
            'data' => $tags->through(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'color' => $tag->color,
                'media_count' => $tag->media_count,
                'players_count' => $tag->players_count,
                'playlists_count' => $tag->playlists_count,
                'usage_count' => $tag->media_count + $tag->players_count + $tag->playlists_count,
                'created_at' => $tag->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $tags->currentPage(),
                'last_page' => $tags->lastPage(),
                'per_page' => $tags->perPage(),
                'total' => $tags->total(),
                'from' => $tags->firstItem(),
                'to' => $tags->lastItem(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $slug = Str::slug($validated['name']);

        // Check if tag with same slug already exists
        $exists = Tag::where('slug', $slug)->exists();
        if ($exists) {
            return back()->withErrors(['name' => 'A tag with this name already exists.']);
        }

        Tag::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'color' => $validated['color'] ?? '#6b7280',
        ]);

        return back()->with('success', 'Tag created successfully.');
    }

    public function update(Request $request, Tag $tag): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $slug = Str::slug($validated['name']);

        // Check if another tag with same slug already exists
        $exists = Tag::where('slug', $slug)
            ->where('id', '!=', $tag->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'A tag with this name already exists.']);
        }

        $tag->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'color' => $validated['color'] ?? $tag->color,
        ]);

        return back()->with('success', 'Tag updated successfully.');
    }

    public function destroy(Tag $tag): RedirectResponse
    {
        $tag->delete();

        return back()->with('success', 'Tag deleted successfully.');
    }

    /**
     * API endpoint to list all tags for autocomplete
     */
    public function list(Request $request): \Illuminate\Http\JsonResponse
    {
        $tags = Tag::query()
            ->when($request->search, fn ($q, $search) => $q->where('name', 'ilike', "%{$search}%"))
            ->orderBy('name')
            ->limit(50)
            ->get(['id', 'name', 'slug', 'color']);

        return response()->json($tags);
    }

    /**
     * API endpoint to create a new tag (returns JSON)
     */
    public function storeApi(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $slug = Str::slug($validated['name']);

        // Check if tag with same slug already exists
        $existingTag = Tag::where('slug', $slug)->first();
        if ($existingTag) {
            // Return existing tag instead of error
            return response()->json([
                'id' => $existingTag->id,
                'name' => $existingTag->name,
                'slug' => $existingTag->slug,
                'color' => $existingTag->color,
            ]);
        }

        $tag = Tag::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'color' => $validated['color'] ?? $this->generateRandomColor(),
        ]);

        return response()->json([
            'id' => $tag->id,
            'name' => $tag->name,
            'slug' => $tag->slug,
            'color' => $tag->color,
        ], 201);
    }

    /**
     * Generate a random color for new tags
     */
    private function generateRandomColor(): string
    {
        $colors = [
            '#6b7280', '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
            '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
            '#d946ef', '#ec4899', '#f43f5e',
        ];

        return $colors[array_rand($colors)];
    }
}
