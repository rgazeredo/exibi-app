import InputError from '@/components/input-error';
import { PlayerLayoutEditor } from '@/components/player-layout-editor';
import { TagInput } from '@/components/tag-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { MonitorPlay, Save, X } from 'lucide-react';
import { useState } from 'react';

interface Layout {
    id: string;
    name: string;
    orientation: string;
    regions: {
        id: string;
        name: string;
        x_percent: number;
        y_percent: number;
        width_percent: number;
        height_percent: number;
        is_main: boolean;
    }[];
}

interface Playlist {
    id: string;
    name: string;
}

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface Props {
    player?: {
        id: string;
        name: string;
        description: string | null;
        is_active: boolean;
        layout_id: string | null;
        config: {
            orientation?: string;
            volume?: number;
            update_interval_minutes?: number;
            password_caller_enabled?: boolean;
        };
        tags: Tag[];
        region_playlists: { region_id: string; playlist_id: string }[];
    };
    layouts: Layout[];
    playlists: Playlist[];
    breadcrumbs: BreadcrumbItem[];
}

export default function PlayerForm({
    player,
    layouts,
    playlists,
    breadcrumbs,
}: Props) {
    const { t } = useT();

    const ORIENTATIONS = [
        { value: 'landscape', label: t('players.landscape') },
        { value: 'landscape_inverted', label: t('players.landscape_inverted') },
        { value: 'portrait_left', label: t('players.portrait_left') },
        { value: 'portrait_right', label: t('players.portrait_right') },
    ];

    const [selectedTags, setSelectedTags] = useState<Tag[]>(player?.tags || []);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(
        player?.layout_id || null,
    );
    const [regionPlaylists, setRegionPlaylists] = useState<
        { region_id: string; playlist_id: string }[]
    >(player?.region_playlists || []);

    const { data, setData, post, put, processing, errors } = useForm({
        name: player?.name || '',
        description: player?.description || '',
        is_active: player?.is_active ?? true,
        layout_id: player?.layout_id || '',
        region_playlists: player?.region_playlists || [],
        config: {
            orientation: player?.config?.orientation || 'landscape',
            volume: player?.config?.volume ?? 100,
            update_interval_minutes:
                player?.config?.update_interval_minutes ?? 15,
            password_caller_enabled:
                player?.config?.password_caller_enabled ?? false,
        },
        tags: player?.tags?.map((t) => t.id) || [],
    });

    const handleLayoutChange = (layoutId: string) => {
        setSelectedLayoutId(layoutId);
        setData('layout_id', layoutId);

        const layout = layouts.find((l) => l.id === layoutId);
        if (layout) {
            const newRegionPlaylists = layout.regions.map((r) => ({
                region_id: r.id,
                playlist_id: '',
            }));
            setRegionPlaylists(newRegionPlaylists);
            setData('region_playlists', newRegionPlaylists);
        }
    };

    const handleRegionPlaylistChange = (
        regionId: string,
        playlistId: string,
    ) => {
        const updated = regionPlaylists.map((rp) =>
            rp.region_id === regionId ? { ...rp, playlist_id: playlistId } : rp,
        );
        setRegionPlaylists(updated);
        setData('region_playlists', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            ...data,
            layout_id: data.layout_id || null,
            tags: selectedTags.map((t) => t.id),
            onSuccess: () => {
                router.visit(`/players`);
            },
        };

        if (player) {
            put(`/players/${player.id}`, options);
        } else {
            post('/players', options);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={player ? t('players.edit') : t('players.create')} />

            <div className="container mx-auto space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                            <MonitorPlay className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {player
                                    ? t('players.edit')
                                    : t('players.create')}
                            </h1>
                            <p className="text-muted-foreground">
                                {player
                                    ? t('players.editDescription')
                                    : t('players.createDescription')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/players')}
                        >
                            <X className="mr-2 h-4 w-4" />
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? t('common.saving') : t('common.save')}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('players.basicInfo')}</CardTitle>
                                <CardDescription>
                                    {t('players.basicInfoDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        {t('players.name')} *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder={t(
                                            'players.namePlaceholder',
                                        )}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        {t('players.description')}
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'players.descriptionPlaceholder',
                                        )}
                                        rows={3}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded"
                                    />
                                    <Label htmlFor="is_active">
                                        {t('players.active')}
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('players.config')}</CardTitle>
                                <CardDescription>
                                    {t('players.configDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="orientation">
                                        {t('players.orientation')}
                                    </Label>
                                    <Select
                                        value={data.config.orientation}
                                        onValueChange={(value) =>
                                            setData('config', {
                                                ...data.config,
                                                orientation: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ORIENTATIONS.map((orientation) => (
                                                <SelectItem
                                                    key={orientation.value}
                                                    value={orientation.value}
                                                >
                                                    {orientation.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="volume">
                                        {t('players.volume')}
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                const newVolume =
                                                    data.config.volume === 0
                                                        ? 100
                                                        : 0;
                                                setData('config', {
                                                    ...data.config,
                                                    volume: newVolume,
                                                });
                                            }}
                                        >
                                            {data.config.volume === 0 ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <line
                                                        x1="23"
                                                        y1="9"
                                                        x2="17"
                                                        y2="15"
                                                    ></line>
                                                    <line
                                                        x1="17"
                                                        y1="9"
                                                        x2="23"
                                                        y2="15"
                                                    ></line>
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                                </svg>
                                            )}
                                        </Button>
                                        <div className="flex-1">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.config.volume}
                                                onChange={(e) =>
                                                    setData('config', {
                                                        ...data.config,
                                                        volume: parseInt(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
                                            />
                                        </div>
                                        <span className="w-10 text-right text-sm text-muted-foreground">
                                            {data.config.volume}%
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('players.updateInterval')}</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <PlayerLayoutEditor
                        layouts={layouts as any}
                        playlists={playlists}
                        selectedLayoutId={selectedLayoutId}
                        regionPlaylists={regionPlaylists}
                        onLayoutChange={handleLayoutChange}
                        onRegionPlaylistChange={handleRegionPlaylistChange}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('players.tags')}</CardTitle>
                            <CardDescription>
                                {t('players.tagsDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TagInput
                                value={selectedTags}
                                onChange={setSelectedTags}
                            />
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
