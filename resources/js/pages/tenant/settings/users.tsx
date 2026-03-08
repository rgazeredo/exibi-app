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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import TenantSettingsLayout from '@/layouts/tenant-settings/layout';
import { type BreadcrumbItem } from '@/types';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Shield,
    ShieldCheck,
    Trash2,
    User,
    UserCog,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TenantUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    is_super_admin: boolean;
    created_at: string | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface UsersIndexProps {
    filters: {
        search?: string;
    };
    canManageUsers: boolean;
}

export default function UsersIndex({ filters, canManageUsers }: UsersIndexProps) {
    const { t } = useT();
    const [data, setData] = useState<TenantUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
    });
    const [deleteDialog, setDeleteDialog] = useState<TenantUser | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('settings.title'), href: '/tenant/settings' },
        { title: t('users.title'), href: '/tenant/settings/users' },
    ];

    const roleConfig = {
        admin: { label: t('users.roles.admin'), variant: 'default' as const, icon: ShieldCheck },
        editor: { label: t('users.roles.editor'), variant: 'secondary' as const, icon: UserCog },
        viewer: { label: t('users.roles.viewer'), variant: 'outline' as const, icon: User },
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data from API
    const fetchData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set('search', debouncedSearch);
            params.set('page', page.toString());
            params.set('per_page', '10');

            if (sorting.length > 0) {
                params.set('sort', sorting[0].id);
                params.set('direction', sorting[0].desc ? 'desc' : 'asc');
            }

            const response = await fetch(`/api/users/search?${params.toString()}`, {
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
    }, [debouncedSearch, sorting]);

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearch, sorting]);

    const handleDelete = () => {
        if (deleteDialog) {
            router.delete(`/tenant/settings/users/${deleteDialog.id}`, {
                onSuccess: () => {
                    setDeleteDialog(null);
                    fetchData(pagination.current_page);
                },
            });
        }
    };

    // Column definitions
    const columns: ColumnDef<TenantUser>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="justify-start"
                >
                    {t('common.name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name}</span>
                                {user.is_super_admin && (
                                    <Badge variant="destructive" className="text-xs">
                                        <Shield className="mr-1 h-3 w-3" />
                                        {t('users.superAdmin')}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 justify-start"
                >
                    {t('common.email')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.email}</span>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'role',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 justify-start"
                >
                    {t('users.role')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const role = roleConfig[row.original.role];
                const RoleIcon = role.icon;
                return (
                    <Badge variant={role.variant}>
                        <RoleIcon className="mr-1 h-3 w-3" />
                        {role.label}
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
                    className="-ml-4 justify-start"
                >
                    {t('common.created')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.created_at
                        ? format(new Date(row.original.created_at), 'dd/MM/yyyy HH:mm')
                        : '-'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const user = row.original;
                if (!canManageUsers || user.is_super_admin) {
                    return null;
                }
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/tenant/settings/users/${user.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('users.changeRole')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setDeleteDialog(user)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('users.removeFromOrg')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
        },
    ], [canManageUsers, pagination.current_page, t]);

    // Filter out email column from visible columns (it's shown in the name cell)
    const visibleColumns = useMemo(() =>
        columns.filter(col => !('accessorKey' in col && col.accessorKey === 'email')),
        [columns]
    );

    const table = useReactTable({
        data,
        columns: visibleColumns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        pageCount: pagination.last_page,
    });

    const goToPage = (page: number) => {
        fetchData(page);
    };

    const hasFilters = !!search;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('users.title')} />

            <TenantSettingsLayout>
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">{t('users.title')}</h2>
                                <p className="text-sm text-muted-foreground">{t('users.subtitle')}</p>
                            </div>
                        </div>
                        {canManageUsers && (
                            <Button asChild>
                                <Link href="/tenant/settings/users/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('users.addUser')}
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t('users.searchUsers')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
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
                                        <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Users className="h-10 w-10 text-muted-foreground" />
                                                <h3 className="mt-4 text-lg font-semibold">{t('users.noUsersFound')}</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {hasFilters
                                                        ? t('users.tryDifferentSearch')
                                                        : t('users.getStarted')}
                                                </p>
                                                {canManageUsers && !hasFilters && (
                                                    <Button asChild className="mt-4">
                                                        <Link href="/tenant/settings/users/create">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            {t('users.addUser')}
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
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                                {t('common.showing')} {pagination.from} {t('common.to')} {pagination.to} {t('common.of')} {pagination.total} {t('common.results')}
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
                                    {t('common.pageOf', { current: pagination.current_page, total: pagination.last_page })}
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
            </TenantSettingsLayout>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('users.removeUser')}</DialogTitle>
                        <DialogDescription>
                            {t('users.removeConfirm', { name: deleteDialog?.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            {t('users.removeUser')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
