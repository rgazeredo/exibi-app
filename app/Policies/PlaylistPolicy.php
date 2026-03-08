<?php

namespace App\Policies;

use App\Models\Playlist;
use App\Models\User;

class PlaylistPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->currentTenant() !== null;
    }

    public function view(User $user, Playlist $playlist): bool
    {
        return $this->belongsToCurrentTenant($playlist);
    }

    public function create(User $user): bool
    {
        return $user->canEditInTenant();
    }

    public function update(User $user, Playlist $playlist): bool
    {
        return $this->belongsToCurrentTenant($playlist) && $user->canEditInTenant();
    }

    public function delete(User $user, Playlist $playlist): bool
    {
        return $this->belongsToCurrentTenant($playlist) && $user->isAdminInTenant();
    }

    public function manageMedia(User $user, Playlist $playlist): bool
    {
        return $this->belongsToCurrentTenant($playlist) && $user->canEditInTenant();
    }

    protected function belongsToCurrentTenant(Playlist $playlist): bool
    {
        return $playlist->tenant_id === session('current_tenant_id');
    }
}
