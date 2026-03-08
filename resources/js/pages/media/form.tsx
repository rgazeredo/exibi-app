import InputError from '@/components/input-error';
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
import { Spinner } from '@/components/ui/spinner';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Film, Image } from 'lucide-react';

interface MediaItem {
    id: string;
    title: string;
    type: 'video' | 'image';
}

interface MediaFormProps {
    media: MediaItem;
}

export default function MediaForm({ media }: MediaFormProps) {
    const { t } = useT();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('media.title'), href: '/media' },
        { title: media.title, href: `/media/${media.id}` },
        { title: t('common.edit'), href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        title: media.title,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/media/${media.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('common.edit')} ${media.title}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
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
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('media.editMedia') || 'Edit Media'}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('media.editMediaDesc') ||
                                'Update media information'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('common.details') || 'Details'}
                            </CardTitle>
                            <CardDescription>
                                {t('media.updateTitleDesc') ||
                                    'Update the title of this media'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">
                                    {t('common.title') || 'Title'}
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder={
                                        t('media.enterTitle') ||
                                        'Enter a title for this media'
                                    }
                                />
                                <InputError message={errors.title} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get(`/media/${media.id}`)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            {t('common.saveChanges') || 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
