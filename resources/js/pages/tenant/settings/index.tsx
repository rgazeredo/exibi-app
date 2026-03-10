import InputError from '@/components/input-error';
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
import { Switch } from '@/components/ui/switch';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import TenantSettingsLayout from '@/layouts/tenant-settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Clock, Globe, Keyboard, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    icon_url: string | null;
    auto_optimize_videos: boolean;
    optimization_quality: 'hd' | 'fullhd';
    timezone: string;
}

// Common timezones for selection
const TIMEZONES = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
    { value: 'America/Cuiaba', label: 'Cuiabá (GMT-4)' },
    { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
    { value: 'America/Recife', label: 'Recife (GMT-3)' },
    { value: 'America/Belem', label: 'Belém (GMT-3)' },
    { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
    { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
    { value: 'America/Chicago', label: 'Chicago (GMT-6/-5)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' },
    { value: 'Europe/Lisbon', label: 'Lisbon (GMT/+1)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+10/+11)' },
    { value: 'UTC', label: 'UTC' },
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
    const [showPassword, setShowPassword] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('settings.title'), href: '/tenant/settings' },
    ];

    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            name: tenantSettings.name,
            domain: tenantSettings.domain || '',
            auto_optimize_videos: tenantSettings.auto_optimize_videos,
            optimization_quality: tenantSettings.optimization_quality,
            timezone: tenantSettings.timezone,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tenant/settings');
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
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto_optimize">
                                        {t('tenant.autoOptimize') ||
                                            'Auto-optimize videos'}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {t('tenant.autoOptimizeDesc') ||
                                            'Automatically transcode uploaded videos for optimal playback performance. This reduces file size and ensures compatibility with all player devices.'}
                                    </p>
                                </div>
                                <Switch
                                    id="auto_optimize"
                                    checked={data.auto_optimize_videos}
                                    onCheckedChange={(checked: boolean) =>
                                        setData('auto_optimize_videos', checked)
                                    }
                                />
                            </div>

                            {data.auto_optimize_videos && (
                                <div className="space-y-3">
                                    <Label>
                                        {t('tenant.optimizationQuality') ||
                                            'Optimization Quality'}
                                    </Label>
                                    <RadioGroup
                                        value={data.optimization_quality}
                                        onValueChange={(
                                            value: 'hd' | 'fullhd',
                                        ) =>
                                            setData(
                                                'optimization_quality',
                                                value,
                                            )
                                        }
                                        className="flex flex-col space-y-2"
                                    >
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
                                                {t('tenant.recommended') ||
                                                    'Recommended'}
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="hd"
                                                id="hd"
                                            />
                                            <Label
                                                htmlFor="hd"
                                                className="cursor-pointer font-normal"
                                            >
                                                HD (720p) -{' '}
                                                {t('tenant.smallerFiles') ||
                                                    'Smaller files'}
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-xs text-muted-foreground">
                                        {t('tenant.optimizationQualityDesc') ||
                                            'Select the maximum resolution for optimized videos. HD uses less storage space.'}
                                    </p>
                                </div>
                            )}
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
                                        keys={['BACK', '×5']}
                                        description="Sair do modo kiosk"
                                        note="Requer senha de 6 dígitos"
                                    />
                                    <ShortcutRow
                                        keys={['◀', '×5', '+', 'OK']}
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
