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
import { Info, Monitor, MonitorPlay, Save, Smartphone, X } from 'lucide-react';
import { useState } from 'react';

interface Layout {
    id: string;
    name: string;
    orientation: string;
    is_system: boolean;
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
        {
            value: 'landscape',
            label: t('players.landscape'),
            icon: <Monitor className="h-4 w-4" />,
        },
        {
            value: 'landscape_inverted',
            label: t('players.landscape_inverted'),
            icon: <Monitor className="h-4 w-4 rotate-180" />,
        },
        {
            value: 'portrait_left',
            label: t('players.portrait_left'),
            icon: <Smartphone className="h-4 w-4 -rotate-90" />,
        },
        {
            value: 'portrait_right',
            label: t('players.portrait_right'),
            icon: <Smartphone className="h-4 w-4 rotate-90" />,
        },
    ];

    const defaultLayout = !player
        ? (layouts.find((l) => l.name === 'Tela Cheia') ??
          layouts.find((l) => l.is_system) ??
          layouts[0] ??
          null)
        : null;
    const defaultLayoutId = player?.layout_id ?? defaultLayout?.id ?? null;
    const defaultRegionPlaylists =
        player?.region_playlists ??
        (defaultLayout
            ? defaultLayout.regions.map((r) => ({
                  region_id: r.id,
                  playlist_id: '',
              }))
            : []);

    const [selectedTags, setSelectedTags] = useState<Tag[]>(player?.tags || []);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(
        defaultLayoutId,
    );
    const [regionPlaylists, setRegionPlaylists] = useState<
        { region_id: string; playlist_id: string }[]
    >(defaultRegionPlaylists);

    const [regionError, setRegionError] = useState<string | null>(null);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    const { data, setData, post, put, processing, errors } = useForm({
        name: player?.name || '',
        description: player?.description || '',
        activation_code: '',

        layout_id: defaultLayoutId ?? '',
        region_playlists: defaultRegionPlaylists,
        config: {
            orientation: player?.config?.orientation || 'landscape',
            volume: player?.config?.volume ?? 100,
            update_interval_minutes:
                player?.config?.update_interval_minutes ?? 30,
            password_caller_enabled:
                player?.config?.password_caller_enabled ?? false,
        },
        tags: player?.tags?.map((t) => t.id) || [],
    });

    const handleActivationCodeChange = (value: string) => {
        const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (cleaned.length <= 3) {
            setData('activation_code', cleaned);
        } else {
            setData(
                'activation_code',
                cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6),
            );
        }
    };

    const handleLayoutChange = (layoutId: string) => {
        setSelectedLayoutId(layoutId || null);
        setData('layout_id', layoutId || '');

        const layout = layouts.find((l) => l.id === layoutId);
        if (layout) {
            const newRegionPlaylists = layout.regions.map((r) => ({
                region_id: r.id,
                playlist_id: '',
            }));
            setRegionPlaylists(newRegionPlaylists);
            setData('region_playlists', newRegionPlaylists);
        } else {
            setRegionPlaylists([]);
            setData('region_playlists', []);
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
        if (playlistId) setRegionError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newClientErrors: Record<string, string> = {};

        if (!data.name.trim()) {
            newClientErrors.name = t('validation.required');
        }

        if (!player && !data.activation_code) {
            newClientErrors.activation_code = t('validation.required');
        }

        if (Object.keys(newClientErrors).length > 0) {
            setClientErrors(newClientErrors);
            return;
        }
        setClientErrors({});

        const missingPlaylist = regionPlaylists.some((rp) => !rp.playlist_id);
        if (regionPlaylists.length > 0 && missingPlaylist) {
            setRegionError(t('players.regionPlaylistRequired'));
            return;
        }
        setRegionError(null);

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

            <div className="space-y-6 p-6">
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
                                <div
                                    className={
                                        !player ? 'grid grid-cols-2 gap-3' : ''
                                    }
                                >
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
                                        <InputError
                                            message={
                                                errors.name || clientErrors.name
                                            }
                                        />
                                    </div>

                                    {!player && (
                                        <div className="space-y-2">
                                            <Label htmlFor="activation_code">
                                                {t('players.activationCode')}{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="activation_code"
                                                value={data.activation_code}
                                                onChange={(e) =>
                                                    handleActivationCodeChange(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="ABC-123"
                                                maxLength={7}
                                                required
                                                className="font-mono tracking-widest"
                                            />
                                            <InputError
                                                message={
                                                    errors.activation_code ||
                                                    clientErrors.activation_code
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t(
                                                    'players.activationCodeHelp',
                                                )}
                                            </p>
                                        </div>
                                    )}
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
                                <div className="grid grid-cols-2 gap-4">
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
                                                {ORIENTATIONS.map(
                                                    (orientation) => (
                                                        <SelectItem
                                                            key={
                                                                orientation.value
                                                            }
                                                            value={
                                                                orientation.value
                                                            }
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                {
                                                                    orientation.icon
                                                                }
                                                                {
                                                                    orientation.label
                                                                }
                                                            </span>
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="volume">
                                            {t('players.volume')}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0"
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
                                            <span className="w-8 shrink-0 text-right text-sm text-muted-foreground">
                                                {data.config.volume}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('players.tags')}</Label>
                                    <TagInput
                                        value={selectedTags}
                                        onChange={setSelectedTags}
                                    />
                                </div>

                                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                    <Info className="h-4 w-4 shrink-0" />
                                    {t('players.updateIntervalInfo')}
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
                        regionError={regionError}
                    />
                </form>
            </div>
        </AppLayout>
    );
}
