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
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    KeyRound,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Shield,
    Trash2,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TenantRole {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    is_deletable: boolean;
    users_count: number;
    permissions_count: number;
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

interface RolesIndexProps {
    filters: {
        search?: string;
    };
}

export default function RolesIndex({ filters }: RolesIndexProps) {
    const { t } = useT();
    const [data, setData] = useState<TenantRole[]>([]);
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
    const [deleteDialog, setDeleteDialog] = useState<TenantRole | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('settings.title'), href: '/tenant/settings' },
        { title: t('roles.title'), href: '/tenant/settings/roles' },
    ];

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

            const response = await fetch(`/api/roles/search?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const result = await response.json();
            setData(result.data.data || result.data);
            setPagination(result.meta);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
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
            router.delete(`/tenant/settings/roles/${deleteDialog.id}`, {
                onSuccess: () => {
                    setDeleteDialog(null);
                    fetchData(pagination.current_page);
                },
            });
        }
    };

    // Column definitions
    const columns: ColumnDef<TenantRole>[] = useMemo(() => [
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
                const role = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{role.name}</span>
                                {role.is_system && (
                                    <Badge variant="secondary" className="text-xs">
                                        {t('roles.system')}
                                    </Badge>
                                )}
                            </div>
                            {role.description && (
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'users_count',
            header: t('roles.usersCount'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.users_count}</span>
                </div>
            ),
        },
        {
            accessorKey: 'permissions_count',
            header: t('roles.permissionsCount'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.permissions_count}</span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/tenant/settings/roles/${role.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('roles.editPermissions')}
                                </Link>
                            </DropdownMenuItem>
                            {role.is_deletable && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setDeleteDialog(role)}
                                        className="text-destructive focus:text-destructive"
                                        disabled={role.users_count > 0}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('common.delete')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
        },
    ], [pagination.current_page, t]);

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

    const goToPage = (page: number) => {
        fetchData(page);
    };

    const hasFilters = !!search;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('roles.title')} />

            <TenantSettingsLayout>
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">{t('roles.title')}</h2>
                                <p className="text-sm text-muted-foreground">{t('roles.subtitle')}</p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/tenant/settings/roles/create">
                                <Plus className="mr-2 h-4 w-4" />
                                {t('roles.createRole')}
                            </Link>
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t('roles.searchRoles')}
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
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Shield className="h-10 w-10 text-muted-foreground" />
                                                <h3 className="mt-4 text-lg font-semibold">{t('roles.noRolesFound')}</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {hasFilters
                                                        ? t('roles.tryDifferentSearch')
                                                        : t('roles.getStarted')}
                                                </p>
                                                {!hasFilters && (
                                                    <Button asChild className="mt-4">
                                                        <Link href="/tenant/settings/roles/create">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            {t('roles.createRole')}
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
                        <DialogTitle>{t('roles.deleteRole')}</DialogTitle>
                        <DialogDescription>
                            {t('roles.deleteConfirm', { name: deleteDialog?.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            {t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
