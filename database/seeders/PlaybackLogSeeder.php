<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\PlaybackLog;
use App\Models\Player;
use Illuminate\Database\Seeder;

class PlaybackLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $player = Player::first();
        $media = Media::first();

        if (! $player || ! $media) {
            $this->command->error('Player ou Media não encontrados!');

            return;
        }

        $tenantId = $player->tenant_id;

        // Criar 5 logs de exemplo com diferentes datas e status
        $logs = [
            [
                'tenant_id' => $tenantId,
                'player_id' => $player->id,
                'media_id' => $media->id,
                'started_at' => now()->subHours(2),
                'ended_at' => now()->subHours(2)->addSeconds(30),
                'duration_played_seconds' => 30,
                'completed' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'player_id' => $player->id,
                'media_id' => $media->id,
                'started_at' => now()->subHours(5),
                'ended_at' => now()->subHours(5)->addSeconds(15),
                'duration_played_seconds' => 15,
                'completed' => false,
            ],
            [
                'tenant_id' => $tenantId,
                'player_id' => $player->id,
                'media_id' => $media->id,
                'started_at' => now()->subDays(1),
                'ended_at' => now()->subDays(1)->addSeconds(30),
                'duration_played_seconds' => 30,
                'completed' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'player_id' => $player->id,
                'media_id' => $media->id,
                'started_at' => now()->subDays(2)->subHours(3),
                'ended_at' => now()->subDays(2)->subHours(3)->addSeconds(25),
                'duration_played_seconds' => 25,
                'completed' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'player_id' => $player->id,
                'media_id' => $media->id,
                'started_at' => now()->subDays(3),
                'ended_at' => null,
                'duration_played_seconds' => 10,
                'completed' => false,
            ],
        ];

        foreach ($logs as $log) {
            PlaybackLog::create($log);
        }

        $this->command->info('Criados '.count($logs).' logs de exemplo!');
    }
}
