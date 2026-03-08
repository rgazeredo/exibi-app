<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\PlaybackLog;
use App\Models\Player;
use App\Models\Playlist;
use App\Models\Tag;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $stats = [
            'players' => [
                'total' => Player::count(),
                'online' => Player::online()->count(),
                'offline' => Player::offline()->count(),
            ],
            'media' => [
                'total' => Media::count(),
                'videos' => Media::videos()->count(),
                'images' => Media::images()->count(),
                'total_storage' => Media::formatBytes(Media::getTotalStorageBytes()),
                'total_storage_bytes' => Media::getTotalStorageBytes(),
            ],
            'playlists' => [
                'total' => Playlist::count(),
                'active' => Playlist::active()->count(),
            ],
            'tags' => [
                'total' => Tag::count(),
            ],
        ];

        $recentPlayers = Player::with(['layout'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($player) => [
                'id' => $player->id,
                'name' => $player->name,
                'is_online' => $player->isOnline(),
                'last_seen_at' => $player->last_seen_at?->diffForHumans(),
                'layout' => $player->layout?->name,
            ]);

        $recentMedia = Media::latest()
            ->take(5)
            ->get()
            ->map(fn ($media) => [
                'id' => $media->id,
                'title' => $media->title,
                'type' => $media->type,
                'formatted_size' => $media->getFormattedSize(),
                'created_at' => $media->created_at->diffForHumans(),
            ]);

        // Chart data: Activity over the last 7 days (heartbeats per day)
        $activityData = $this->getActivityChartData();

        // Chart data: Storage by media type
        $storageData = $this->getStorageChartData();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentPlayers' => $recentPlayers,
            'recentMedia' => $recentMedia,
            'charts' => [
                'activity' => $activityData,
                'storage' => $storageData,
            ],
        ]);
    }

    /**
     * Get playback data for the last 7 days.
     */
    protected function getActivityChartData(): array
    {
        $tenantId = session('current_tenant_id');
        $days = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $days[] = [
                'date' => $date->format('Y-m-d'),
                'label' => ucfirst($date->locale('pt_BR')->isoFormat('ddd')),
                'playbacks' => 0,
            ];
        }

        // Get playbacks grouped by day
        $playbacks = PlaybackLog::query()
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::today()->subDays(6)->startOfDay())
            ->select(DB::raw('DATE(started_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        foreach ($days as &$day) {
            if (isset($playbacks[$day['date']])) {
                $day['playbacks'] = $playbacks[$day['date']]->count;
            }
        }

        return $days;
    }

    /**
     * Get storage data by media type.
     */
    protected function getStorageChartData(): array
    {
        $videoBytes = Media::videos()->sum('size_bytes') ?? 0;
        $imageBytes = Media::images()->sum('size_bytes') ?? 0;

        return [
            [
                'name' => 'Vídeos',
                'value' => $videoBytes,
                'formatted' => Media::formatBytes($videoBytes),
            ],
            [
                'name' => 'Imagens',
                'value' => $imageBytes,
                'formatted' => Media::formatBytes($imageBytes),
            ],
        ];
    }
}
