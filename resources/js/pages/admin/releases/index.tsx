import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { useT } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Download,
    MoreHorizontal,
    Pencil,
    Play,
    Plus,
    Smartphone,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Release {
    id: string;
    version_name: string;
    version_code: number;
    apk_size: string;
    release_notes: string | null;
    force_update: boolean;
    min_version_code: number;
    is_active: boolean;
    published_at: string | null;
    created_at: string;
}

interface CurrentRelease {
    id: string;
    version_name: string;
    version_code: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ReleasesIndexProps {
    releases: PaginatedData<Release>;
    currentRelease: CurrentRelease | null;
}

export default function ReleasesIndex({ releases, currentRelease }: ReleasesIndexProps) {
    const { t } = useT();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('admin.releases.title'), href: '/admin/releases' },
    ];
    const [deleteDialog, setDeleteDialog] = useState<Release | null>(null);
    const [activateDialog, setActivateDialog] = useState<Release | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDelete = () => {
        if (deleteDialog) {
            setIsProcessing(true);
            router.delete(`/admin/releases/${deleteDialog.id}`, {
                onSuccess: () => setDeleteDialog(null),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleActivate = () => {
        if (activateDialog) {
            setIsProcessing(true);
            router.post(`/admin/releases/${activateDialog.id}/activate`, {}, {
                onSuccess: () => setActivateDialog(null),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.releases.title')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('admin.releases.title')}</h1>
                        <p className="text-muted-foreground">
                            {t('admin.releases.subtitle')}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/releases/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin.releases.newRelease')}
                        </Link>
                    </Button>
                </div>

                {/* Current Release Info */}
                {currentRelease && (
                    <Card className="border-green-500/50 bg-green-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                {t('admin.releases.currentActive')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold text-green-600">
                                v{currentRelease.version_name} (code: {currentRelease.version_code})
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('admin.releases.currentActiveDesc')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* API Endpoint Info */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('admin.releases.apiEndpoint')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <code className="rounded bg-muted px-2 py-1 text-sm">
                            GET /api/v1/player/app-version
                        </code>
                        <p
                            className="mt-2 text-xs text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1"
                            dangerouslySetInnerHTML={{ __html: t('admin.releases.apiEndpointDesc') }}
                        />
                    </CardContent>
                </Card>

                {/* Releases List */}
                {releases.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Smartphone className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">{t('admin.releases.noReleases')}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('admin.releases.noReleasesDesc')}
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/releases/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin.releases.newRelease')}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {releases.data.map((release) => (
                                    <div
                                        key={release.id}
                                        className="flex items-center justify-between p-4 hover:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${release.is_active ? 'bg-green-500/20' : 'bg-muted'}`}>
                                                <Smartphone className={`h-5 w-5 ${release.is_active ? 'text-green-600' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">v{release.version_name}</span>
                                                    <Badge variant="outline">code: {release.version_code}</Badge>
                                                    {release.is_active && (
                                                        <Badge variant="default" className="bg-green-600">
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            {t('common.active')}
                                                        </Badge>
                                                    )}
                                                    {release.force_update && (
                                                        <Badge variant="destructive">{t('admin.releases.forceUpdate')}</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span>{release.apk_size}</span>
                                                    <span>·</span>
                                                    <span>{t('admin.releases.minVersion', { version: release.min_version_code })}</span>
                                                    {release.published_at && (
                                                        <>
                                                            <span>·</span>
                                                            <span>{t('admin.releases.published', { date: release.published_at })}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {release.release_notes && (
                                                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                                        {release.release_notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!release.is_active && (
                                                    <DropdownMenuItem onClick={() => setActivateDialog(release)}>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        {t('admin.releases.activate')}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/releases/${release.id}/edit`}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        {t('common.edit')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {!release.is_active && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setDeleteDialog(release)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {t('common.delete')}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {releases.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {releases.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.releases.deleteRelease')}</DialogTitle>
                        <DialogDescription
                            dangerouslySetInnerHTML={{
                                __html: t('admin.releases.deleteConfirm', { version: deleteDialog?.version_name || '' })
                            }}
                        />
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            {isProcessing ? t('common.deleting') : t('admin.releases.deleteRelease')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activate Confirmation Dialog */}
            <Dialog open={!!activateDialog} onOpenChange={() => setActivateDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.releases.activateRelease')}</DialogTitle>
                        <DialogDescription
                            dangerouslySetInnerHTML={{
                                __html: t('admin.releases.activateConfirm', { version: activateDialog?.version_name || '' })
                            }}
                        />
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActivateDialog(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleActivate}
                            disabled={isProcessing}
                        >
                            {isProcessing ? t('admin.releases.activating') : t('admin.releases.activateRelease')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
