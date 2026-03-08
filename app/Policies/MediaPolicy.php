<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;

class MediaPolicy
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

    public function view(User $user, Media $media): bool
    {
        return $this->belongsToCurrentTenant($media);
    }

    public function create(User $user): bool
    {
        return $user->canEditInTenant();
    }

    public function update(User $user, Media $media): bool
    {
        return $this->belongsToCurrentTenant($media) && $user->canEditInTenant();
    }

    public function delete(User $user, Media $media): bool
    {
        return $this->belongsToCurrentTenant($media) && $user->canEditInTenant();
    }

    protected function belongsToCurrentTenant(Media $media): bool
    {
        return $media->tenant_id === session('current_tenant_id');
    }
}
