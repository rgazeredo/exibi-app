import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { useT } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Shield, User } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
}

interface AdminUserFormProps {
    user?: UserData;
}

export default function AdminUserForm({ user }: AdminUserFormProps) {
    const { t } = useT();
    const isEditing = !!user?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('admin.users.title'), href: '/admin/users' },
        { title: isEditing ? t('admin.users.editAdmin') : t('admin.users.newAdmin'), href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/users/${user.id}`);
        } else {
            post('/admin/users');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? t('admin.users.editAdmin') : t('admin.users.newAdmin')} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? t('admin.users.editAdmin') : t('admin.users.newAdmin')}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? t('admin.users.editAdminDesc')
                            : t('admin.users.createAdminDesc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    {/* Warning Card */}
                    <Card className="border-yellow-500/50 bg-yellow-500/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-yellow-600">
                                <Shield className="h-5 w-5" />
                                {t('admin.users.superAdminAccess')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-yellow-600">
                                {t('admin.users.superAdminWarning')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* User Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t('users.userInfo')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.users.basicInfoDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('admin.users.name')} *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('admin.users.namePlaceholder')}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('admin.users.email')} *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder={t('admin.users.emailPlaceholder')}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('admin.users.password')} {isEditing ? t('admin.users.passwordKeepCurrent') : '*'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={isEditing ? '••••••••' : t('admin.users.passwordPlaceholder')}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.users.passwordMinChars')}
                                </p>
                                <InputError message={errors.password} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/admin/users')}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            {isEditing ? t('admin.users.updateAdmin') : t('admin.users.createAdmin')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
