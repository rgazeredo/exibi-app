import { useT } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import type { Layout, LayoutRegion } from '@/types';
import { Check, ChevronsUpDown, ListVideo } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LayoutPreview } from './layout-preview';
import { Button } from './ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Playlist {
    id: string;
    name: string;
}

export interface RegionAssignment {
    playlist_id: string | null;
    scale_type: 'aspect' | 'stretched';
}

interface RegionPlaylistAssignerProps {
    layout: Layout;
    playlists: Playlist[];
    assignments: Record<string, RegionAssignment>;
    onChange: (regionId: string, assignment: RegionAssignment) => void;
    className?: string;
}

export function RegionPlaylistAssigner({
    layout,
    playlists,
    assignments,
    onChange,
    className,
}: RegionPlaylistAssignerProps) {
    const { t } = useT();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(
        layout.regions[0]?.id ?? null,
    );

    const regionContent = useMemo(() => {
        const getPlaylistName = (playlistId: string | null) => {
            if (!playlistId) return null;
            return playlists.find((p) => p.id === playlistId)?.name;
        };

        const content: Record<string, React.ReactNode> = {};
        for (const region of layout.regions) {
            const assignment = assignments[region.id];
            const playlistName = getPlaylistName(assignment?.playlist_id ?? null);
            content[region.id] = (
                <div className="flex flex-col items-center gap-1 p-1 text-center">
                    <span className="text-xs font-medium text-muted-foreground">
                        {formatRegionName(region.name)}
                    </span>
                    {playlistName ? (
                        <span className="line-clamp-2 text-[10px] text-foreground">
                            {playlistName}
                        </span>
                    ) : (
                        <span className="text-[10px] italic text-destructive">
                            {t('layouts.playlistRequired') || 'Obrigatório'}
                        </span>
                    )}
                </div>
            );
        }
        return content;
    }, [layout.regions, assignments, playlists, t]);

    return (
        <div className={cn('grid gap-6 md:grid-cols-2', className)}>
            <div className="space-y-3">
                <Label>{t('layouts.previewLabel')}</Label>
                <LayoutPreview
                    layout={layout}
                    selectedRegionId={selectedRegionId}
                    regionContent={regionContent}
                    onRegionClick={(region) => setSelectedRegionId(region.id)}
                    className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                    {t('layouts.clickToSelect')}
                </p>
            </div>

            <div className="space-y-4">
                <Label>{t('layouts.regionPlaylists')}</Label>
                <div className="space-y-3">
                    {layout.regions.map((region) => (
                        <RegionPlaylistSelect
                            key={region.id}
                            region={region}
                            playlists={playlists}
                            assignment={assignments[region.id] ?? { playlist_id: null, scale_type: 'aspect' }}
                            onChange={(assignment) => onChange(region.id, assignment)}
                            isSelected={selectedRegionId === region.id}
                            onFocus={() => setSelectedRegionId(region.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface RegionPlaylistSelectProps {
    region: LayoutRegion;
    playlists: Playlist[];
    assignment: RegionAssignment;
    onChange: (assignment: RegionAssignment) => void;
    isSelected: boolean;
    onFocus: () => void;
}

function RegionPlaylistSelect({
    region,
    playlists,
    assignment,
    onChange,
    isSelected,
    onFocus,
}: RegionPlaylistSelectProps) {
    const { t } = useT();
    const [open, setOpen] = useState(false);

    const selectedPlaylist = playlists.find((p) => p.id === assignment.playlist_id);

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                isSelected && 'border-primary bg-primary/5',
            )}
            onFocus={onFocus}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-medium">
                    {formatRegionName(region.name)}
                </span>
                <span className="text-xs text-muted-foreground">
                    {Math.round(region.width_percent)}% x {Math.round(region.height_percent)}%
                </span>
            </div>

            {/* Playlist Selector */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            'w-[180px] justify-between',
                            !selectedPlaylist && 'border-destructive',
                        )}
                        onFocus={onFocus}
                    >
                        {selectedPlaylist ? (
                            <span className="flex items-center gap-2 truncate">
                                <ListVideo className="h-4 w-4 shrink-0" />
                                <span className="truncate">{selectedPlaylist.name}</span>
                            </span>
                        ) : (
                            <span className="text-destructive">
                                {t('layouts.selectPlaylist')}
                            </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="end">
                    <Command>
                        <CommandInput placeholder={t('layouts.searchPlaylists')} />
                        <CommandList>
                            <CommandEmpty>{t('layouts.noPlaylistsFound')}</CommandEmpty>
                            <CommandGroup>
                                {playlists.map((playlist) => (
                                    <CommandItem
                                        key={playlist.id}
                                        value={playlist.name}
                                        onSelect={() => {
                                            onChange({ ...assignment, playlist_id: playlist.id });
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                assignment.playlist_id === playlist.id ? 'opacity-100' : 'opacity-0',
                                            )}
                                        />
                                        {playlist.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Scale Type Selector */}
            <Select
                value={assignment.scale_type}
                onValueChange={(value: 'aspect' | 'stretched') =>
                    onChange({ ...assignment, scale_type: value })
                }
            >
                <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="aspect">
                        {t('layouts.scaleAspect') || 'Manter Proporção'}
                    </SelectItem>
                    <SelectItem value="stretched">
                        {t('layouts.scaleStretched') || 'Esticado'}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

function formatRegionName(name: string): string {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
