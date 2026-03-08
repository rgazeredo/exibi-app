import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { useT } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowLeft,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    MoreHorizontal,
    Plus,
    Search,
    Shield,
    Trash2,
    User,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TenantUser {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    created_at_human: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Props {
    tenant: {
        id: string;
        name: string;
    };
}

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
};

const roleVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    editor: 'secondary',
    viewer: 'outline',
};

export default function TenantUsers({ tenant }: Props) {
    const { t } = useT();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('nav.organizations'), href: '/admin/tenants' },
        { title: tenant.name, href: `/admin/tenants/${tenant.id}/edit` },
        { title: t('nav.users'), href: `/admin/tenants/${tenant.id}/users` },
    ];

    const [data, setData] = useState<TenantUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [role, setRole] = useState('all');
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
    });
    const [deleteDialog, setDeleteDialog] = useState<TenantUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (role && role !== 'all') params.set('role', role);
            params.set('page', page.toString());
            params.set('per_page', '10');

            if (sorting.length > 0) {
                params.set('sort', sorting[0].id);
                params.set('direction', sorting[0].desc ? 'desc' : 'asc');
            }

            const response = await fetch(`/admin/api/tenants/${tenant.id}/users/search?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const result = await response.json();
            setData(result.data.data || result.data);
            setPagination(result.meta);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [tenant.id, debouncedSearch, role, sorting]);

    // Fetch on filter/sort change
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearch, role, sorting]);

    // Initial fetch
    useEffect(() => {
        fetchData(1);
    }, []);

    const handleDelete = () => {
        if (deleteDialog) {
            setIsDeleting(true);
            router.delete(`/admin/tenants/${tenant.id}/users/${deleteDialog.id}`, {
                onSuccess: () => {
                    setDeleteDialog(null);
                    fetchData(pagination.current_page);
                },
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const goToPage = (page: number) => {
        fetchData(page);
    };

    const columns: ColumnDef<TenantUser>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('users.user')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'role',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('users.role')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const userRole = row.original.role;
                return (
                    <Badge variant={roleVariants[userRole] || 'outline'}>
                        {userRole === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                        {roleLabels[userRole] || userRole}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('users.added')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.original.created_at_human}</span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteDialog(user)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('common.remove') || 'Remove'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
        },
    ], [t]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        pageCount: pagination.last_page,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('nav.users')} - ${tenant.name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/tenants">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{t('nav.users')}</h1>
                            <p className="text-muted-foreground">
                                {t('admin.tenants.manageUsersFor') || 'Manage users for'} <strong>{tenant.name}</strong>
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/admin/tenants/${tenant.id}/users/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('users.addUser') || 'Add User'}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('users.searchUsers') || 'Search users...'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('users.filterByRole') || 'Filter by role'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('users.allRoles') || 'All Roles'}</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users className="h-10 w-10 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-semibold">
                                                {t('users.noUsersFound') || 'No users found'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {search || role !== 'all'
                                                    ? t('common.tryDifferentFilters') || 'Try adjusting your search or filters'
                                                    : t('users.addUsersToStart') || 'Add users to this organization to get started'}
                                            </p>
                                            {!search && role === 'all' && (
                                                <Button asChild className="mt-4">
                                                    <Link href={`/admin/tenants/${tenant.id}/users/create`}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        {t('users.addUser') || 'Add User'}
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t('common.showingResults', { from: pagination.from, to: pagination.to, total: pagination.total }) ||
                                `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} results`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(1)}
                                disabled={pagination.current_page === 1 || loading}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1 || loading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm px-2">
                                {t('common.pageOf', { current: pagination.current_page, total: pagination.last_page }) ||
                                    `Page ${pagination.current_page} of ${pagination.last_page}`}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page || loading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.last_page)}
                                disabled={pagination.current_page === pagination.last_page || loading}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('users.removeUser') || 'Remove User'}</DialogTitle>
                        <DialogDescription>
                            {t('users.removeUserConfirm', { name: deleteDialog?.name, tenant: tenant.name }) ||
                                `Are you sure you want to remove ${deleteDialog?.name} from ${tenant.name}? They will lose access to this organization.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('common.removing') || 'Removing...' : t('users.removeUser') || 'Remove User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
