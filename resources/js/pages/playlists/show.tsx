import {
    ContentEditor,
    type AvailablePlaylist,
    type AvailableWidget,
    type ContentItem,
    type PlaybackMode,
} from '@/components/content-editor';
import { type ScheduleSlot } from '@/components/schedule-editor';
import { TagBadges, TagInput } from '@/components/tag-input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    Copy,
    Edit,
    Film,
    ListVideo,
    Loader2,
    Play,
    Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface PlaylistItemMedia {
    id: string;
    type: 'video' | 'image';
    title: string;
    thumbnail_url: string | null;
    duration_seconds: number | null;
}

interface PlaylistItemPlaylist {
    id: string;
    name: string;
    media_count: number;
    total_duration: number;
    items?: any[] | null;
}

interface PlaylistItemWidget {
    id: string;
    widget_type: 'weather' | 'lottery' | 'news';
    name: string;
    status: string;
    duration_seconds: number;
    thumbnail_url: string | null;
}

interface PlaylistItem {
    id: string;
    item_type: 'media' | 'playlist' | 'widget';
    item_id: string;
    position: number;
    duration_override: number | null;
    is_active: boolean;
    schedule_type?: string;
    schedule_mode?: string;
    priority_order?: number | null;
    starts_at: string | null;
    ends_at: string | null;
    day_schedules?: ScheduleSlot[] | null;
    media?: PlaylistItemMedia;
    playlist?: PlaylistItemPlaylist;
    widget?: PlaylistItemWidget;
}

interface Playlist {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    playback_mode: 'sequential' | 'interleaved' | 'auto' | 'random';
    total_duration: number;
    total_media_count: number;
    can_contain_subplaylists: boolean;
    created_at: string;
    tags: Tag[];
    items: PlaylistItem[];
}

interface PlaylistShowProps {
    playlist: Playlist;
    availablePlaylists: AvailablePlaylist[];
    availableWidgets: AvailableWidget[];
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function PlaylistShow({
    playlist,
    availablePlaylists,
    availableWidgets,
}: PlaylistShowProps) {
    const { t } = useT();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [duplicating, setDuplicating] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Edit form state
    const [name, setName] = useState(playlist.name);
    const [description, setDescription] = useState(playlist.description || '');
    const [tags, setTags] = useState<Tag[]>(playlist.tags || []);
    const [isActive, setIsActive] = useState(playlist.is_active);
    const [saving, setSaving] = useState(false);

    // ContentEditor state
    const [items, setItems] = useState<ContentItem[]>(() =>
        (playlist.items || []).map((item) => ({
            id: item.id,
            content_type: item.item_type,
            content_id: item.item_id,
            position: item.position,
            is_active: item.is_active,
            duration_override: item.duration_override,
            schedule_type: (item.schedule_type ||
                'always') as ContentItem['schedule_type'],
            schedule_mode: item.schedule_mode as ContentItem['schedule_mode'],
            priority_order: item.priority_order,
            starts_at: item.starts_at,
            ends_at: item.ends_at,
            day_schedules: item.day_schedules || null,
            media: item.media
                ? {
                      id: item.media.id,
                      title: item.media.title,
                      type: item.media.type,
                      thumbnail_url: item.media.thumbnail_url,
                      duration_seconds: item.media.duration_seconds,
                  }
                : undefined,
            playlist: item.playlist
                ? {
                      id: item.playlist.id,
                      name: item.playlist.name,
                      media_count: item.playlist.media_count,
                      total_duration: item.playlist.total_duration,
                      items: item.playlist.items || null,
                  }
                : undefined,
            widget: item.widget
                ? {
                      id: item.widget.id,
                      name: item.widget.name,
                      widget_type: item.widget.widget_type,
                      status: item.widget.status,
                      duration_seconds: item.widget.duration_seconds,
                      thumbnail_url: item.widget.thumbnail_url,
                  }
                : undefined,
        })),
    );
    const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(
        playlist.playback_mode,
    );
    const [editorSaving, setEditorSaving] = useState(false);
    const [editorSaved, setEditorSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Calculate total duration from current items
    const calculatedTotalDuration = useMemo(() => {
        return items.reduce((total, item) => {
            // Use duration_override if set
            if (item.duration_override) {
                return total + item.duration_override;
            }
            // Otherwise use original duration based on item type
            if (item.media?.duration_seconds) {
                return total + item.media.duration_seconds;
            }
            if (item.playlist?.total_duration) {
                return total + item.playlist.total_duration;
            }
            if (item.widget?.duration_seconds) {
                return total + item.widget.duration_seconds;
            }
            // Default 10 seconds for images without duration
            return total + 10;
        }, 0);
    }, [items]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('playlists.title'), href: '/playlists' },
        { title: playlist.name, href: `/playlists/${playlist.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/playlists/${playlist.id}`);
    };

    const confirmDuplicate = () => {
        setDuplicating(true);
        router.post(
            `/playlists/${playlist.id}/duplicate`,
            {},
            {
                onSuccess: () => {
                    setDuplicateDialogOpen(false);
                    setDuplicating(false);
                },
                onError: () => {
                    setDuplicating(false);
                },
            },
        );
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.put(
            `/playlists/${playlist.id}`,
            {
                name,
                description: description || null,
                is_active: isActive,
                tags: tags.map((t) => t.id),
            },
            {
                onSuccess: () => {
                    setEditDialogOpen(false);
                    setSaving(false);
                },
                onError: () => {
                    setSaving(false);
                },
            },
        );
    };

    // Reset form when dialog opens
    const handleEditDialogChange = (open: boolean) => {
        if (open) {
            setName(playlist.name);
            setDescription(playlist.description || '');
            setTags(playlist.tags || []);
            setIsActive(playlist.is_active);
        }
        setEditDialogOpen(open);
    };

    const hasItems = items.length > 0;

    // ContentEditor handlers
    const handleItemsChange = useCallback((newItems: ContentItem[]) => {
        setItems(newItems);
        setHasChanges(true);
    }, []);

    const handlePlaybackModeChange = useCallback((mode: PlaybackMode) => {
        setPlaybackMode(mode);
        setHasChanges(true);
    }, []);

    const handleEditorSave = useCallback(() => {
        setEditorSaving(true);
        setEditorSaved(false);

        router.put(
            `/playlists/${playlist.id}/items`,
            {
                playback_mode: playbackMode,
                items: items.map((item) => ({
                    item_type: item.content_type,
                    item_id: item.content_id,
                    duration_override: item.duration_override,
                    schedule_type: item.schedule_type || 'always',
                    schedule_mode: item.schedule_mode || 'always',
                    priority_order: item.priority_order || null,
                    starts_at: item.starts_at || null,
                    ends_at: item.ends_at || null,
                    day_schedules: item.day_schedules || null,
                })),
            } as any,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setEditorSaving(false);
                    setEditorSaved(true);
                    setHasChanges(false);
                    setTimeout(() => setEditorSaved(false), 2000);
                },
                onError: () => {
                    setEditorSaving(false);
                },
            },
        );
    }, [playlist.id, playbackMode, items]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={playlist.name} />

            <div className="flex h-full min-h-0 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/playlists">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <ListVideo className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight">
                                    {playlist.name}
                                </h1>
                                <Badge
                                    variant={
                                        playlist.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {playlist.is_active
                                        ? t('common.active')
                                        : t('common.inactive')}
                                </Badge>
                            </div>
                            {playlist.description && (
                                <p className="text-sm text-muted-foreground">
                                    {playlist.description}
                                </p>
                            )}
                            {playlist.tags && playlist.tags.length > 0 && (
                                <div className="mt-2">
                                    <TagBadges tags={playlist.tags} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Stats Cards */}
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10">
                                <Film className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-lg leading-none font-semibold">
                                    {items.length}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t('common.items')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10">
                                <Clock className="h-4 w-4 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-lg leading-none font-semibold">
                                    {formatDuration(calculatedTotalDuration)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t('playlists.duration')}
                                </p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-border" />

                        {playlist.items?.length ? (
                            <Button variant="outline" asChild>
                                <Link
                                    href={`/playlists/${playlist.id}/preview`}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    {t('playlists.preview')}
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" disabled>
                                <Play className="mr-2 h-4 w-4" />
                                {t('playlists.preview')}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setDuplicateDialogOpen(true)}
                            disabled={!playlist.items?.length}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            {t('playlists.duplicate')}
                        </Button>
                        <Dialog
                            open={editDialogOpen}
                            onOpenChange={handleEditDialogChange}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleEdit}>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {t('playlists.editPlaylist')}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t('playlists.editPlaylistDesc')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label htmlFor="name">
                                                {t('common.name')} *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                className="mt-2"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">
                                                {t('common.description')}
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={description}
                                                onChange={(e) =>
                                                    setDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-2"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label>{t('tags.title')}</Label>
                                            <div className="mt-2">
                                                <TagInput
                                                    value={tags}
                                                    onChange={setTags}
                                                    placeholder={t(
                                                        'tags.selectTags',
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={isActive}
                                                onCheckedChange={(checked) =>
                                                    setIsActive(!!checked)
                                                }
                                            />
                                            <Label htmlFor="is_active">
                                                {t('common.active')}
                                            </Label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setEditDialogOpen(false)
                                            }
                                            disabled={saving}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={saving || !name.trim()}
                                        >
                                            {saving && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            {t('common.save')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Dialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('common.delete')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t('playlists.deletePlaylist')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('playlists.deletePlaylistDesc', {
                                            name: playlist.name,
                                        })}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setDeleteDialogOpen(false)
                                        }
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        {t('common.delete')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Playlist Editor */}
                <div className="flex min-h-0 flex-1">
                    <ContentEditor
                        items={items}
                        playlists={availablePlaylists}
                        widgets={availableWidgets}
                        tabs={{
                            media: true,
                            playlists: playlist.can_contain_subplaylists,
                            widgets: true,
                        }}
                        rightPanelTitle={t('playlists.playlistItems')}
                        showPlaybackMode={true}
                        playbackMode={playbackMode}
                        onPlaybackModeChange={handlePlaybackModeChange}
                        canContainSubplaylists={
                            playlist.can_contain_subplaylists
                        }
                        onItemsChange={handleItemsChange}
                        onSave={handleEditorSave}
                        saving={editorSaving}
                        saved={editorSaved}
                        hasChanges={hasChanges}
                        t={t}
                    />
                </div>
            </div>

            {/* Duplicate Confirmation Dialog */}
            <AlertDialog
                open={duplicateDialogOpen}
                onOpenChange={setDuplicateDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('playlists.duplicatePlaylist')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('playlists.duplicateConfirm', {
                                name: playlist.name,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={duplicating}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDuplicate}
                            disabled={duplicating}
                        >
                            {duplicating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('playlists.duplicate')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
