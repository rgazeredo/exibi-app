import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Save } from 'lucide-react';

interface Props {
    tenant: {
        id: string;
        name: string;
    };
}

export default function TenantUserForm({ tenant }: Props) {
    const { t } = useT();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('nav.organizations'), href: '/admin/tenants' },
        { title: tenant.name, href: `/admin/tenants/${tenant.id}/users` },
        { title: t('users.addUser'), href: `/admin/tenants/${tenant.id}/users/create` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'editor',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/tenants/${tenant.id}/users`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Add User to ${tenant.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/tenants/${tenant.id}/users`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Add User</h1>
                        <p className="text-muted-foreground">
                            Add a user to <strong>{tenant.name}</strong>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>
                                Enter the user details. If the email already exists, the user will be added to this organization.
                                Otherwise, a new user will be created and an invitation email will be sent.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <Mail className="h-4 w-4" />
                                <AlertDescription>
                                    New users will receive an email invitation to set up their password.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter full name"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) => setData('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {data.role === 'admin' && 'Full access to manage the organization'}
                                    {data.role === 'editor' && 'Can create and edit content'}
                                    {data.role === 'viewer' && 'Read-only access'}
                                </p>
                                {errors.role && (
                                    <p className="text-sm text-destructive">{errors.role}</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6 border-t">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Adding...' : 'Add User'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={`/admin/tenants/${tenant.id}/users`}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
