<?php

namespace App\Observers;

use App\Models\Layout;
use App\Models\Tenant;

class TenantObserver
{
    /**
     * Handle the Tenant "created" event.
     *
     * Creates a default playlist and player group for the new tenant.
     */
    public function created(Tenant $tenant): void
    {
        // Create default playlist
        $defaultPlaylist = $tenant->playlists()->create([
            'name' => 'Playlist Padrão',
            'description' => 'Playlist padrão para os players',
            'is_default' => true,
            'is_active' => true,
        ]);

        // Create default player group
        $playerGroup = $tenant->playerGroups()->create([
            'name' => 'Grupo Padrão',
            'description' => 'Grupo padrão para os players',
            'is_default' => true,
            'is_active' => true,
        ]);

        // Get the fullscreen layout
        $fullscreenLayout = Layout::getFullscreenLayout();

        if ($fullscreenLayout) {
            // Create the default scheduled layout
            $scheduledLayout = $playerGroup->scheduledLayouts()->create([
                'layout_id' => $fullscreenLayout->id,
                'schedule_type' => 'always',
                'priority' => 0,
                'is_default' => true,
                'is_active' => true,
            ]);

            // Get the main region of the fullscreen layout
            $mainRegion = $fullscreenLayout->getMainRegion();

            if ($mainRegion) {
                // Assign the default playlist to the main region
                $scheduledLayout->regionPlaylists()->create([
                    'layout_region_id' => $mainRegion->id,
                    'playlist_id' => $defaultPlaylist->id,
                    'scale_type' => 'aspect',
                ]);
            }
        }
    }
}
