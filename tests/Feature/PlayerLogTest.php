<?php

use App\Models\Media;
use App\Models\Player;
use App\Models\PlayerGroup;
use App\Models\Playlist;
use App\Models\Tenant;
use App\Models\User;

beforeEach(function () {
    // Create tenant
    $this->tenant = Tenant::create([
        'name' => 'Test Tenant',
        'slug' => 'test-tenant-'.uniqid(),
        'is_active' => true,
    ]);

    // Create user with tenant access
    $this->user = User::factory()->create();
    $this->user->tenants()->attach($this->tenant->id, ['role' => 'admin']);

    // Create a player group (required for players)
    $this->playerGroup = PlayerGroup::create([
        'tenant_id' => $this->tenant->id,
        'name' => 'Test Group',
    ]);

    // Create a player with API token
    $this->player = Player::create([
        'tenant_id' => $this->tenant->id,
        'player_group_id' => $this->playerGroup->id,
        'name' => 'Test Player',
        'api_token' => 'test-token-'.uniqid(),
        'is_active' => true,
    ]);

    // Create a playlist
    $this->playlist = Playlist::create([
        'tenant_id' => $this->tenant->id,
        'name' => 'Test Playlist',
        'is_active' => true,
    ]);

    // Create a media item
    $this->media = Media::create([
        'tenant_id' => $this->tenant->id,
        'type' => 'video',
        'title' => 'Test Video',
        'filename' => 'test.mp4',
        'path' => 'videos/test.mp4',
        'url' => 'https://example.com/test.mp4',
        'mime_type' => 'video/mp4',
        'size_bytes' => 1000,
    ]);
});

afterEach(function () {
    // Clean up
    $this->player->playbackLogs()->delete();
    Media::query()->delete();
    Playlist::query()->delete();
    Player::query()->delete();
    PlayerGroup::query()->delete();
    $this->user->tenants()->detach();
    $this->tenant->delete();
    $this->user->delete();
});

it('accepts logs with playlist_id', function () {
    $response = $this->postJson('/api/v1/player/log', [
        'logs' => [
            [
                'media_id' => $this->media->id,
                'playlist_id' => $this->playlist->id,
                'started_at' => now()->subMinutes(5)->toIso8601String(),
                'ended_at' => now()->toIso8601String(),
                'duration_seconds' => 300,
                'completed' => true,
            ],
        ],
    ], [
        'Authorization' => 'Bearer '.$this->player->api_token,
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true, 'logged' => 1]);

    // Verify the log was saved with playlist_id
    $log = $this->player->playbackLogs()->first();
    expect($log)->not->toBeNull();
    expect($log->media_id)->toBe($this->media->id);
    expect($log->playlist_id)->toBe($this->playlist->id);
    expect($log->completed)->toBeTrue();
});

it('accepts logs without playlist_id for backwards compatibility', function () {
    $response = $this->postJson('/api/v1/player/log', [
        'logs' => [
            [
                'media_id' => $this->media->id,
                'started_at' => now()->subMinutes(5)->toIso8601String(),
                'ended_at' => now()->toIso8601String(),
                'duration_seconds' => 300,
                'completed' => true,
            ],
        ],
    ], [
        'Authorization' => 'Bearer '.$this->player->api_token,
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true, 'logged' => 1]);

    // Verify the log was saved without playlist_id
    $log = $this->player->playbackLogs()->first();
    expect($log)->not->toBeNull();
    expect($log->media_id)->toBe($this->media->id);
    expect($log->playlist_id)->toBeNull();
});

it('accepts multiple logs in a batch', function () {
    $response = $this->postJson('/api/v1/player/log', [
        'logs' => [
            [
                'media_id' => $this->media->id,
                'playlist_id' => $this->playlist->id,
                'started_at' => now()->subMinutes(10)->toIso8601String(),
                'ended_at' => now()->subMinutes(5)->toIso8601String(),
                'duration_seconds' => 300,
                'completed' => true,
            ],
            [
                'media_id' => $this->media->id,
                'playlist_id' => $this->playlist->id,
                'started_at' => now()->subMinutes(5)->toIso8601String(),
                'ended_at' => now()->toIso8601String(),
                'duration_seconds' => 300,
                'completed' => false,
            ],
        ],
    ], [
        'Authorization' => 'Bearer '.$this->player->api_token,
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true, 'logged' => 2]);

    expect($this->player->playbackLogs()->count())->toBe(2);
});

it('rejects logs without authentication', function () {
    $response = $this->postJson('/api/v1/player/log', [
        'logs' => [
            [
                'media_id' => $this->media->id,
                'started_at' => now()->subMinutes(5)->toIso8601String(),
                'completed' => true,
            ],
        ],
    ]);

    $response->assertStatus(401);
});
