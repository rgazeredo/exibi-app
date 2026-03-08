import InputError from '@/components/input-error';
import { TagInput } from '@/components/tag-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

export default function PlaylistForm() {
    const { t } = useT();
    const [tags, setTags] = useState<Tag[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('playlists.title'), href: '/playlists' },
        { title: t('playlists.newPlaylist'), href: '#' },
    ];

    const { data, setData, post, processing, errors, transform } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    // Transform data before submission to include tags
    transform((formData) => ({
        ...formData,
        tags: tags.map((t) => t.id),
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/playlists');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('playlists.newPlaylist')} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('playlists.newPlaylist')}</h1>
                    <p className="text-muted-foreground">
                        {t('playlists.createDesc') || 'Create a new playlist. You can add media items after creating the playlist.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('playlists.basicInfo') || 'Basic Information'}</CardTitle>
                            <CardDescription>{t('playlists.basicInfoDesc') || 'Playlist name and description'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('common.name')} *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Welcome Screen"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">{t('common.description')}</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="e.g., Content for the welcome screen in the lobby"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2">
                                <Label>{t('tags.title')}</Label>
                                <TagInput
                                    value={tags}
                                    onChange={setTags}
                                    placeholder={t('tags.selectTags') || 'Select tags...'}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <Label htmlFor="is_active">{t('common.active') || 'Active'}</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/playlists')}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            {t('playlists.createPlaylist') || 'Create Playlist'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
