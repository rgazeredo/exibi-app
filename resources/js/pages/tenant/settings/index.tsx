import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import TenantSettingsLayout from '@/layouts/tenant-settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    Clock,
    Globe,
    ImageIcon,
    Keyboard,
    Loader2,
    Trash2,
    Upload,
    Zap,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    icon_url: string | null;
    splash_url: string | null;
    optimization_quality: 'hd' | 'fullhd';
    timezone: string;
}

// Brazilian timezones
const TIMEZONES = [
    { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' },
    { value: 'America/Sao_Paulo', label: 'Horário de Brasília (GMT-3)' },
    { value: 'America/Manaus', label: 'Horário do Amazonas (GMT-4)' },
    { value: 'America/Rio_Branco', label: 'Horário do Acre (GMT-5)' },
];

interface TenantSettingsProps {
    tenantSettings: TenantData;
}

function ShortcutRow({
    keys,
    description,
    note,
}: {
    keys: string[];
    description: string;
    note?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5">
            <div className="flex flex-shrink-0 items-center gap-1">
                {keys.map((key, index) => (
                    <span key={index}>
                        {key === '+' ||
                        key === '×5' ||
                        key === '×3' ||
                        key === '×7' ? (
                            <span className="px-1 text-xs text-muted-foreground">
                                {key}
                            </span>
                        ) : (
                            <kbd className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border bg-muted px-2 text-xs font-medium shadow-sm">
                                {key}
                            </kbd>
                        )}
                    </span>
                ))}
            </div>
            <div className="text-right text-sm">
                <span>{description}</span>
                {note && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {note}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function TenantSettings({
    tenantSettings,
}: TenantSettingsProps) {
    const { t } = useT();
    const [splashUrl, setSplashUrl] = useState<string | null>(
        tenantSettings.splash_url,
    );
    const [uploadingSplash, setUploadingSplash] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
    const splashInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('settings.title'), href: '/tenant/settings' },
    ];

    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            name: tenantSettings.name,
            domain: tenantSettings.domain || '',
            optimization_quality: tenantSettings.optimization_quality,
            timezone: tenantSettings.timezone,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tenant/settings');
    };

    const handleSplashUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingSplash(true);
        const formData = new FormData();
        formData.append('splash', file);

        try {
            const { data } = await axios.post(
                '/tenant/settings/splash',
                formData,
            );
            if (data.success) {
                setSplashUrl(data.splash_url);
            }
        } catch (error) {
            console.error('Failed to upload splash:', error);
        } finally {
            setUploadingSplash(false);
            if (splashInputRef.current) {
                splashInputRef.current.value = '';
            }
        }
    };

    const handleDeleteSplash = async () => {
        try {
            const { data } = await axios.delete('/tenant/settings/splash');
            if (data.success) {
                setSplashUrl(null);
            }
        } catch (error) {
            console.error('Failed to delete splash:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('tenant.orgSettings') || 'Organization Settings'} />

            <TenantSettingsLayout>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                {t('tenant.general') || 'General'}
                            </CardTitle>
                            <CardDescription>
                                {t('tenant.generalDesc') ||
                                    'Basic organization information'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('tenant.orgName') || 'Organization Name'}
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="timezone"
                                    className="flex items-center gap-2"
                                >
                                    <Clock className="h-4 w-4" />
                                    {t('tenant.timezone') || 'Timezone'}
                                </Label>
                                <Select
                                    value={data.timezone}
                                    onValueChange={(value) =>
                                        setData('timezone', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                t('tenant.selectTimezone') ||
                                                'Select timezone'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIMEZONES.map((tz) => (
                                            <SelectItem
                                                key={tz.value}
                                                value={tz.value}
                                            >
                                                {tz.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {t('tenant.timezoneDesc') ||
                                        'Used for scheduling content on player devices.'}
                                </p>
                                <InputError message={errors.timezone} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branding */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                {t('tenant.branding') || 'Branding'}
                            </CardTitle>
                            <CardDescription>
                                {t('tenant.brandingDesc') ||
                                    "Customize your organization's visual identity"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Splash */}
                            <div className="space-y-3">
                                <Label>
                                    {t('tenant.splashScreen') ||
                                        'Splash Screen'}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {t('tenant.splashDesc') ||
                                        'Displayed when player devices start up. Recommended: 1920x1080px, PNG or JPG.'}
                                </p>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-28 w-48 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                        {splashUrl ? (
                                            <img
                                                src={splashUrl}
                                                alt="Splash"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            ref={splashInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg"
                                            onChange={handleSplashUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                splashInputRef.current?.click()
                                            }
                                            disabled={uploadingSplash}
                                        >
                                            {uploadingSplash ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="mr-2 h-4 w-4" />
                                            )}
                                            {t('common.upload') || 'Upload'}
                                        </Button>
                                        {splashUrl && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {t('common.remove') ||
                                                            'Remove'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            {t(
                                                                'tenant.removeSplashTitle',
                                                            ) ||
                                                                'Remove Splash Screen'}
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t(
                                                                'tenant.removeSplashDesc',
                                                            ) ||
                                                                'Are you sure you want to remove the splash screen? Player devices will display the default AZSign splash until a new image is uploaded.'}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            {t(
                                                                'common.cancel',
                                                            ) || 'Cancel'}
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={
                                                                handleDeleteSplash
                                                            }
                                                            className="bg-destructive text-white hover:bg-destructive/90"
                                                        >
                                                            {t(
                                                                'common.remove',
                                                            ) || 'Remove'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Processing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                {t('tenant.videoProcessing') ||
                                    'Video Processing'}
                            </CardTitle>
                            <CardDescription>
                                {t('tenant.videoProcessingDesc') ||
                                    'Configure how uploaded videos are processed'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                {t('tenant.videoProcessingInfo') ||
                                    'All videos are automatically transcoded for optimal compatibility with TV box devices.'}
                            </p>

                            <div className="space-y-3">
                                <Label>
                                    {t('tenant.optimizationQuality') ||
                                        'Optimization Quality'}
                                </Label>
                                <RadioGroup
                                    value={data.optimization_quality}
                                    onValueChange={(value: 'hd' | 'fullhd') =>
                                        setData('optimization_quality', value)
                                    }
                                    className="flex flex-col space-y-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="hd" id="hd" />
                                        <Label
                                            htmlFor="hd"
                                            className="cursor-pointer font-normal"
                                        >
                                            HD (720p) -{' '}
                                            {t('tenant.recommended') ||
                                                'Recommended'}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="fullhd"
                                            id="fullhd"
                                        />
                                        <Label
                                            htmlFor="fullhd"
                                            className="cursor-pointer font-normal"
                                        >
                                            Full HD (1080p) -{' '}
                                            {t('tenant.higherQuality') ||
                                                'Higher quality'}
                                        </Label>
                                    </div>
                                </RadioGroup>
                                <p className="text-xs text-muted-foreground">
                                    {t('tenant.optimizationQualityDesc') ||
                                        'Select the maximum resolution for optimized videos. HD uses less storage space.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('common.saveChanges') || 'Save Changes'}
                        </Button>
                        {recentlySuccessful && (
                            <p className="text-sm text-green-600">
                                {t('common.saved') || 'Saved.'}
                            </p>
                        )}
                    </div>
                </form>

                {/* Remote Shortcuts Dialog */}
                <Dialog
                    open={shortcutsDialogOpen}
                    onOpenChange={setShortcutsDialogOpen}
                >
                    <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Keyboard className="h-5 w-5" />
                                {t('players.remoteShortcuts') ||
                                    'Atalhos do Controle'}
                            </DialogTitle>
                            <DialogDescription>
                                {t('players.remoteShortcutsDesc') ||
                                    'Atalhos disponíveis no controle remoto da TV'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Modo Kiosk */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    Modo Kiosk / Sistema
                                </h3>
                                <div className="space-y-2">
                                    <ShortcutRow
                                        keys={['BACK', '×3']}
                                        description="Sair do modo kiosk"
                                    />
                                    <ShortcutRow
                                        keys={['◀', '×3', '+', 'OK']}
                                        description="Resetar dispositivo"
                                        note="Remove ativação e configurações locais"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={() => setShortcutsDialogOpen(false)}
                            >
                                {t('common.close') || 'Fechar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </TenantSettingsLayout>
        </AppLayout>
    );
}
