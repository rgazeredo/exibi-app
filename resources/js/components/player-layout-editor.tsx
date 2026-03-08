import { LayoutPreview } from '@/components/layout-preview';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useT } from '@/hooks/use-translations';
import type { LayoutRegion } from '@/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LayoutOption {
    id: string;
    name: string;
    orientation: string;
    regions: LayoutRegion[];
}

interface PlaylistOption {
    id: string;
    name: string;
}

interface RegionPlaylist {
    region_id: string;
    playlist_id: string;
}

interface Props {
    layouts: LayoutOption[];
    playlists: PlaylistOption[];
    selectedLayoutId: string | null;
    regionPlaylists: RegionPlaylist[];
    onLayoutChange: (layoutId: string) => void;
    onRegionPlaylistChange: (regionId: string, playlistId: string) => void;
    loading?: boolean;
}

export function PlayerLayoutEditor({
    layouts,
    playlists,
    selectedLayoutId,
    regionPlaylists,
    onLayoutChange,
    onRegionPlaylistChange,
    loading = false,
}: Props) {
    const { t } = useT();
    const [showPreview, setShowPreview] = useState(true);

    const selectedLayout = layouts.find((l) => l.id === selectedLayoutId);

    const getPlaylistForRegion = (regionId: string): string => {
        const rp = regionPlaylists.find((r) => r.region_id === regionId);
        return rp?.playlist_id || '__none__';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('players.layout')}</CardTitle>
                <CardDescription>
                    {t('players.layoutDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {t('players.selectLayout')}
                    </label>
                    <Select
                        value={selectedLayoutId || ''}
                        onValueChange={(value) => onLayoutChange(value)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={t('players.selectLayout')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {layouts.map((layout) => (
                                <SelectItem key={layout.id} value={layout.id}>
                                    {layout.name} ({layout.orientation})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedLayout &&
                    selectedLayout.regions &&
                    selectedLayout.regions.length > 0 && (
                        <>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    {showPreview
                                        ? t('common.hide')
                                        : t('common.show')}{' '}
                                    {t('players.preview')}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Preview */}
                                {showPreview && (
                                    <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
                                        <LayoutPreview
                                            layout={selectedLayout as any}
                                            className="max-w-[280px]"
                                        />
                                    </div>
                                )}

                                {/* Regions */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">
                                        {t('players.regions')}
                                    </label>
                                    {selectedLayout.regions.map((region) => (
                                        <div
                                            key={region.id}
                                            className="flex items-center gap-3 rounded-lg border p-3"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {region.name}
                                                    {region.is_main && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            (
                                                            {t(
                                                                'players.mainRegion',
                                                            )}
                                                            )
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {region.width_percent}% x{' '}
                                                    {region.height_percent}%
                                                </p>
                                            </div>
                                            <div className="w-44">
                                                <Select
                                                    value={getPlaylistForRegion(
                                                        region.id,
                                                    )}
                                                    onValueChange={(value) =>
                                                        onRegionPlaylistChange(
                                                            region.id,
                                                            value === '__none__'
                                                                ? ''
                                                                : value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={t(
                                                                'players.selectPlaylist',
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="__none__">
                                                            {t(
                                                                'players.noPlaylist',
                                                            )}
                                                        </SelectItem>
                                                        {playlists.map(
                                                            (playlist) => (
                                                                <SelectItem
                                                                    key={
                                                                        playlist.id
                                                                    }
                                                                    value={
                                                                        playlist.id
                                                                    }
                                                                >
                                                                    {
                                                                        playlist.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
