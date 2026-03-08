import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Mail, ShieldCheck, User, UserCog } from 'lucide-react';

interface RoleOption {
    value: string;
    slug: string;
    label: string;
    description: string;
    is_system: boolean;
}

interface UserData {
    id?: string;
    name: string;
    email: string;
    role: string;
    is_super_admin?: boolean;
}

interface UserFormProps {
    user?: UserData;
    roles: RoleOption[];
}

const roleIcons: Record<string, typeof User> = {
    admin: ShieldCheck,
    editor: UserCog,
    viewer: User,
};

const roleTranslationKeys: Record<string, { label: string; description: string }> = {
    admin: { label: 'users.roleAdmin', description: 'users.roleAdminDesc' },
    editor: { label: 'users.roleEditor', description: 'users.roleEditorDesc' },
    viewer: { label: 'users.roleViewer', description: 'users.roleViewerDesc' },
};

const getIconForRole = (slug: string) => {
    return roleIcons[slug] || User;
};

export default function UserForm({ user, roles }: UserFormProps) {
    const { t } = useT();
    const isEditing = !!user?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'viewer',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('users.title'), href: '/tenant/settings/users' },
        { title: isEditing ? t('users.editUser') : t('users.addUser'), href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/users/${user.id}`);
        } else {
            post('/tenant/settings/users');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? t('users.editUser') : t('users.addUser')} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? t('users.editUser') : t('users.addUser')}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? t('users.editUserDesc')
                            : t('users.addUserDesc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    {!isEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('users.userInfo')}</CardTitle>
                                <CardDescription>
                                    {t('users.userInfoDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t('common.name')} *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('users.namePlaceholder')}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">{t('common.email')} *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t('users.emailPlaceholder')}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <Alert>
                                    <Mail className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('users.inviteEmailDesc')}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {isEditing && user && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('users.user')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('users.role')}</CardTitle>
                            <CardDescription>
                                {t('users.roleDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={data.role}
                                onValueChange={(value) => setData('role', value)}
                                className="space-y-3"
                            >
                                {roles.map((role) => {
                                    const Icon = getIconForRole(role.slug);
                                    const translationKeys = role.is_system ? roleTranslationKeys[role.slug] : null;
                                    const label = translationKeys ? t(translationKeys.label) : role.label;
                                    const description = translationKeys ? t(translationKeys.description) : role.description;
                                    return (
                                        <div key={role.value} className="flex items-start space-x-3">
                                            <RadioGroupItem
                                                value={role.value}
                                                id={`role-${role.value}`}
                                                className="mt-1"
                                            />
                                            <Label
                                                htmlFor={`role-${role.value}`}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <span className="font-medium">{label}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-normal">
                                                    {description}
                                                </p>
                                            </Label>
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                            <InputError message={errors.role} className="mt-2" />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/tenant/settings/users')}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            {isEditing ? t('users.updateRole') : t('users.addUser')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
