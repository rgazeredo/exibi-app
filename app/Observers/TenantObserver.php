<?php

namespace App\Observers;

use App\Models\Tenant;

class TenantObserver
{
    /**
     * Handle the Tenant "created" event.
     *
     * Creates a default playlist for the new tenant.
     */
    public function created(Tenant $tenant): void
    {
        $tenant->playlists()->create([
            'name' => 'Playlist Padrão',
            'description' => 'Playlist padrão para os players',
            'is_default' => true,
            'is_active' => true,
        ]);
    }
}
