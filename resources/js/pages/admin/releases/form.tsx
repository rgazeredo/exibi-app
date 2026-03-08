import InputError from '@/components/input-error';
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
import { FileUp, Info, Package, Settings } from 'lucide-react';
import { useRef, useState } from 'react';

interface ReleaseData {
    id: string;
    version_name: string;
    version_code: number;
    apk_size: string;
    apk_url: string;
    release_notes: string | null;
    force_update: boolean;
    min_version_code: number;
    is_active: boolean;
}

interface ReleaseFormProps {
    release?: ReleaseData;
    suggestedVersionCode?: number;
}

export default function ReleaseForm({ release, suggestedVersionCode }: ReleaseFormProps) {
    const { t } = useT();
    const isEditing = !!release?.id;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, put, processing, errors, progress } = useForm({
        version_name: release?.version_name || '',
        version_code: release?.version_code?.toString() || suggestedVersionCode?.toString() || '1',
        apk_file: null as File | null,
        release_notes: release?.release_notes || '',
        force_update: release?.force_update || false,
        min_version_code: release?.min_version_code?.toString() || '1',
        activate: false,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('admin.releases.title'), href: '/admin/releases' },
        { title: isEditing ? t('admin.releases.editRelease', { version: release.version_name }) : t('admin.releases.newRelease'), href: '#' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('apk_file', file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/releases/${release.id}`);
        } else {
            post('/admin/releases', {
                forceFormData: true,
            });
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? t('admin.releases.editRelease', { version: release.version_name }) : t('admin.releases.newRelease')} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? t('admin.releases.editRelease', { version: release.version_name }) : t('admin.releases.newRelease')}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? t('admin.releases.editReleaseDesc')
                            : t('admin.releases.newReleaseDesc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    {/* Version Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                {t('admin.releases.versionInfo')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.releases.versionInfoDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="version_name">{t('admin.releases.versionName')} *</Label>
                                    <Input
                                        id="version_name"
                                        value={data.version_name}
                                        onChange={(e) => setData('version_name', e.target.value)}
                                        placeholder={t('admin.releases.versionNamePlaceholder')}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.releases.versionNameHelp')}
                                    </p>
                                    <InputError message={errors.version_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="version_code">{t('admin.releases.versionCode')} *</Label>
                                    <Input
                                        id="version_code"
                                        type="number"
                                        min="1"
                                        value={data.version_code}
                                        onChange={(e) => setData('version_code', e.target.value)}
                                        placeholder="1"
                                        disabled={isEditing}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.releases.versionCodeHelp')}
                                    </p>
                                    <InputError message={errors.version_code} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="release_notes">{t('admin.releases.releaseNotes')}</Label>
                                <Textarea
                                    id="release_notes"
                                    value={data.release_notes}
                                    onChange={(e) => setData('release_notes', e.target.value)}
                                    placeholder={t('admin.releases.releaseNotesPlaceholder')}
                                    rows={4}
                                />
                                <InputError message={errors.release_notes} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* APK Upload */}
                    {!isEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileUp className="h-5 w-5" />
                                    {t('admin.releases.apkFile')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin.releases.apkFileDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                                        selectedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                                    }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".apk"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {selectedFile ? (
                                        <>
                                            <Package className="h-10 w-10 text-primary" />
                                            <p className="mt-2 font-medium">{selectedFile.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(selectedFile.size)}
                                            </p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {t('admin.releases.clickToChange')}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <FileUp className="h-10 w-10 text-muted-foreground" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {t('admin.releases.clickToUpload')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {t('admin.releases.maxSize')}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {progress && (
                                    <div className="space-y-1">
                                        <div className="h-2 rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            {t('admin.releases.uploading', { percentage: progress.percentage })}
                                        </p>
                                    </div>
                                )}
                                <InputError message={errors.apk_file} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Existing APK Info (Edit mode) */}
                    {isEditing && release && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    {t('admin.releases.apkFile')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">exibi-v{release.version_name}.apk</p>
                                        <p className="text-sm text-muted-foreground">{release.apk_size}</p>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {t('admin.releases.apkCannotChange')}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Update Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                {t('admin.releases.updateSettings')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.releases.updateSettingsDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="min_version_code">{t('admin.releases.minVersionCode')} *</Label>
                                <Input
                                    id="min_version_code"
                                    type="number"
                                    min="1"
                                    value={data.min_version_code}
                                    onChange={(e) => setData('min_version_code', e.target.value)}
                                    placeholder="1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.releases.minVersionCodeHelp')}
                                </p>
                                <InputError message={errors.min_version_code} />
                            </div>

                            <div className="flex items-start space-x-3 rounded-lg border p-4">
                                <Checkbox
                                    id="force_update"
                                    checked={data.force_update}
                                    onCheckedChange={(checked) => setData('force_update', checked === true)}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="force_update" className="cursor-pointer">
                                        {t('admin.releases.forceUpdateLabel')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.releases.forceUpdateHelp')}
                                    </p>
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="flex items-start space-x-3 rounded-lg border border-primary/50 bg-primary/5 p-4">
                                    <Checkbox
                                        id="activate"
                                        checked={data.activate}
                                        onCheckedChange={(checked) => setData('activate', checked === true)}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="activate" className="cursor-pointer">
                                            {t('admin.releases.activateImmediately')}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t('admin.releases.activateImmediatelyHelp')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="border-blue-500/50 bg-blue-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base text-blue-600">
                                <Info className="h-5 w-5" />
                                {t('admin.releases.howItWorks')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-blue-600">
                            <ul className="list-disc list-inside space-y-1 [&_code]:rounded [&_code]:bg-blue-500/20 [&_code]:px-1">
                                <li dangerouslySetInnerHTML={{ __html: t('admin.releases.howItWorksItem1') }} />
                                <li>{t('admin.releases.howItWorksItem2')}</li>
                                <li>{t('admin.releases.howItWorksItem3')}</li>
                                <li>{t('admin.releases.howItWorksItem4')}</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/admin/releases')}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing || (!isEditing && !selectedFile)}>
                            {processing && <Spinner className="mr-2" />}
                            {isEditing ? t('admin.releases.updateRelease') : t('admin.releases.uploadRelease')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
