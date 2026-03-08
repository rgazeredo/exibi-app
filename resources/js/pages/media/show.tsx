import { ReplaceMediaDialog } from '@/components/replace-media-dialog';
import { TagBadges, TagInput } from '@/components/tag-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    Film,
    Image,
    Loader2,
    Monitor,
    RefreshCw,
    Smartphone,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface TranscodedVersion {
    quality: string;
    width: number;
    height: number;
    size_bytes: number;
    url: string;
}

interface MediaItem {
    id: string;
    title: string;
    type: 'video' | 'image';
    filename: string;
    mime_type: string;
    formatted_size: string;
    formatted_duration: string | null;
    resolution: string | null;
    orientation: 'portrait' | 'landscape';
    width: number | null;
    height: number | null;
    url: string | null;
    optimized_url: string | null;
    thumbnail_url: string | null;
    transcoding_status: string | null;
    transcoded_versions: TranscodedVersion[];
    metadata: Record<string, unknown> | null;
    tags: Tag[];
    created_at: string;
}

interface MediaShowProps {
    media: MediaItem;
}

function formatBytes(bytes: number): string {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' bytes';
}

export default function MediaShow({ media }: MediaShowProps) {
    const { t } = useT();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
    const [title, setTitle] = useState(media.title);
    const [tags, setTags] = useState<Tag[]>(media.tags || []);
    const [saving, setSaving] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('media.title'), href: '/media' },
        { title: media.title, href: `/media/${media.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/media/${media.id}`);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.put(
            `/media/${media.id}`,
            {
                title,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={media.title} />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/media">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div
                            className={`flex h-14 w-14 items-center justify-center rounded-xl ${media.type === 'video' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'}`}
                        >
                            {media.type === 'video' ? (
                                <Film className="h-7 w-7 text-blue-600" />
                            ) : (
                                <Image className="h-7 w-7 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {media.title}
                                </h1>
                                <Badge
                                    variant={
                                        media.type === 'video'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {media.type === 'video'
                                        ? t('media.type.video')
                                        : t('media.type.image')}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {media.filename}
                            </p>
                            {media.tags && media.tags.length > 0 && (
                                <div className="mt-2">
                                    <TagBadges tags={media.tags} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {media.url && (
                            <Button variant="outline" asChild>
                                <a
                                    href={media.url}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {t('media.download')}
                                </a>
                            </Button>
                        )}
                        <Dialog
                            open={editDialogOpen}
                            onOpenChange={setEditDialogOpen}
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
                                            {t('media.editMedia') ||
                                                'Edit Media'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t('media.editMediaDesc') ||
                                                'Update the details of this media file.'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label htmlFor="title">
                                                {t('common.title') || 'Title'}
                                            </Label>
                                            <Input
                                                id="title"
                                                value={title}
                                                onChange={(e) =>
                                                    setTitle(e.target.value)
                                                }
                                                className="mt-2"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <Label>{t('tags.title')}</Label>
                                            <div className="mt-2">
                                                <TagInput
                                                    value={tags}
                                                    onChange={setTags}
                                                    placeholder={
                                                        t('tags.selectTags') ||
                                                        'Select tags...'
                                                    }
                                                />
                                            </div>
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
                                            disabled={saving || !title.trim()}
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
                        <Button
                            variant="outline"
                            onClick={() => setReplaceDialogOpen(true)}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t('media.replace') || 'Substituir'}
                        </Button>
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
                                        {t('media.deleteMedia')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('media.deleteConfirm', {
                                            name: media.title,
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

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('media.preview')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`flex items-center justify-center overflow-hidden rounded-lg bg-muted ${media.orientation === 'portrait' ? 'mx-auto aspect-[9/16] max-w-[300px]' : 'aspect-video'}`}
                            >
                                {media.type === 'video' && media.url ? (
                                    <video
                                        src={media.optimized_url || media.url}
                                        controls
                                        className="h-full w-full object-contain"
                                    />
                                ) : media.type === 'image' && media.url ? (
                                    <img
                                        src={media.url}
                                        alt={media.title}
                                        className="h-full w-full object-contain"
                                    />
                                ) : media.thumbnail_url ? (
                                    <img
                                        src={media.thumbnail_url}
                                        alt={media.title}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        {media.type === 'video' ? (
                                            <Film className="h-16 w-16" />
                                        ) : (
                                            <Image className="h-16 w-16" />
                                        )}
                                        <p className="mt-2">
                                            {t('media.previewNotAvailable') ||
                                                'Preview not available'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('common.details') || 'Details'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {t('common.type') || 'Type'}
                                    </dt>
                                    <dd className="text-sm font-medium capitalize">
                                        {media.type}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {t('media.mimeType') || 'MIME Type'}
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {media.mime_type}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {t('media.originalSize') ||
                                            'Original Size'}
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {media.formatted_size}
                                    </dd>
                                </div>
                                {media.resolution && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-muted-foreground">
                                            {t('media.resolution')}
                                        </dt>
                                        <dd className="flex items-center gap-2 text-sm font-medium">
                                            {media.resolution}
                                            {media.orientation ===
                                            'portrait' ? (
                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </dd>
                                    </div>
                                )}
                                {media.formatted_duration && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-muted-foreground">
                                            {t('media.duration')}
                                        </dt>
                                        <dd className="text-sm font-medium">
                                            {media.formatted_duration}
                                        </dd>
                                    </div>
                                )}
                                {media.created_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-muted-foreground">
                                            {t('media.uploaded') || 'Uploaded'}
                                        </dt>
                                        <dd className="text-sm font-medium">
                                            {format(
                                                new Date(media.created_at),
                                                'dd/MM/yyyy HH:mm',
                                            )}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                {/* Transcoding Status - only for videos */}
                {media.type === 'video' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {t('media.optimizedVersions') ||
                                    'Optimized Versions'}
                                {media.transcoding_status === 'processing' && (
                                    <Badge variant="secondary" className="ml-2">
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        {t('common.processing') || 'Processing'}
                                    </Badge>
                                )}
                                {media.transcoding_status === 'pending' && (
                                    <Badge variant="secondary" className="ml-2">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {t('common.queued') || 'Queued'}
                                    </Badge>
                                )}
                                {media.transcoding_status === 'completed' && (
                                    <Badge
                                        variant="default"
                                        className="ml-2 bg-green-600"
                                    >
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        {t('common.ready') || 'Ready'}
                                    </Badge>
                                )}
                                {media.transcoding_status === 'failed' && (
                                    <Badge
                                        variant="destructive"
                                        className="ml-2"
                                    >
                                        <XCircle className="mr-1 h-3 w-3" />
                                        {t('common.failed') || 'Failed'}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {media.transcoded_versions.length > 0 ? (
                                <div className="space-y-3">
                                    {media.transcoded_versions.map(
                                        (version) => (
                                            <div
                                                key={version.quality}
                                                className="flex items-center justify-between rounded-lg bg-muted p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline">
                                                        {version.quality}
                                                    </Badge>
                                                    <span className="text-sm">
                                                        {version.width}×
                                                        {version.height}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatBytes(
                                                            version.size_bytes,
                                                        )}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a
                                                        href={version.url}
                                                        download
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : media.transcoding_status === 'processing' ||
                              media.transcoding_status === 'pending' ? (
                                <p className="text-sm text-muted-foreground">
                                    {t('media.optimizingVideo') ||
                                        'Video is being optimized for playback. This may take a few minutes for large files.'}
                                </p>
                            ) : media.transcoding_status === 'skipped' ? (
                                <p className="text-sm text-muted-foreground">
                                    {t('media.alreadyOptimized') ||
                                        "Video is already in an optimal format and doesn't need transcoding."}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t('media.noOptimizedVersions') ||
                                        'No optimized versions available yet.'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Replace Media Dialog */}
            <ReplaceMediaDialog
                open={replaceDialogOpen}
                onOpenChange={setReplaceDialogOpen}
                media={{
                    id: media.id,
                    title: media.title,
                    type: media.type,
                    thumbnail_url: media.thumbnail_url,
                }}
                onReplaceComplete={() => router.reload()}
            />
        </AppLayout>
    );
}
