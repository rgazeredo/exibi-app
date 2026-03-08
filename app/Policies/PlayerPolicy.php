<?php

namespace App\Policies;

use App\Models\Player;
use App\Models\User;

class PlayerPolicy
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

    public function view(User $user, Player $player): bool
    {
        return $this->belongsToCurrentTenant($player);
    }

    public function create(User $user): bool
    {
        return $user->canEditInTenant();
    }

    public function update(User $user, Player $player): bool
    {
        return $this->belongsToCurrentTenant($player) && $user->canEditInTenant();
    }

    public function delete(User $user, Player $player): bool
    {
        return $this->belongsToCurrentTenant($player) && $user->isAdminInTenant();
    }

    public function regenerateToken(User $user, Player $player): bool
    {
        return $this->belongsToCurrentTenant($player) && $user->isAdminInTenant();
    }

    protected function belongsToCurrentTenant(Player $player): bool
    {
        return $player->tenant_id === session('current_tenant_id');
    }
}
