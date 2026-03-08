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
import { Progress } from '@/components/ui/progress';
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
    ArrowUpDown,
    Building2,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    HardDrive,
    Image,
    ListVideo,
    Loader2,
    LogIn,
    MonitorPlay,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    storage_limit_mb: number | null;
    players_limit: number | null;
    storage_usage_mb: number;
    storage_usage_percentage: number;
    players_count: number;
    players_usage_percentage: number;
    users_count: number;
    media_count: number;
    playlists_count: number;
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

export default function TenantsIndex() {
    const { t } = useT();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.adminArea'), href: '/admin/dashboard' },
        { title: t('nav.organizations'), href: '/admin/tenants' },
    ];

    function formatStorage(mb: number): string {
        if (mb >= 1024) {
            return `${(mb / 1024).toFixed(1)} GB`;
        }
        return `${mb} MB`;
    }

    const [data, setData] = useState<TenantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
    });
    const [deleteDialog, setDeleteDialog] = useState<TenantData | null>(null);
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
            if (status && status !== 'all') params.set('status', status);
            params.set('page', page.toString());
            params.set('per_page', '10');

            if (sorting.length > 0) {
                params.set('sort', sorting[0].id);
                params.set('direction', sorting[0].desc ? 'desc' : 'asc');
            }

            const response = await fetch(`/admin/api/tenants/search?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const result = await response.json();
            setData(result.data.data || result.data);
            setPagination(result.meta);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, status, sorting]);

    // Fetch on filter/sort change
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearch, status, sorting]);

    // Initial fetch
    useEffect(() => {
        fetchData(1);
    }, []);

    const handleToggleStatus = (tenant: TenantData) => {
        router.post(`/admin/tenants/${tenant.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => fetchData(pagination.current_page),
        });
    };

    const handleDelete = () => {
        if (deleteDialog) {
            setIsDeleting(true);
            router.delete(`/admin/tenants/${deleteDialog.id}`, {
                onSuccess: () => {
                    setDeleteDialog(null);
                    fetchData(pagination.current_page);
                },
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const handleAccessTenant = (tenantId: string) => {
        router.post('/tenant/switch', { tenant_id: tenantId });
    };

    const goToPage = (page: number) => {
        fetchData(page);
    };

    const columns: ColumnDef<TenantData>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('admin.tenants.organization')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <Link
                                href={`/admin/tenants/${tenant.id}/edit`}
                                className="font-medium hover:underline"
                            >
                                {tenant.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('common.status')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const isActive = row.original.is_active;
                return (
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? (
                            <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                {t('common.active')}
                            </>
                        ) : (
                            <>
                                <XCircle className="mr-1 h-3 w-3" />
                                {t('common.inactive')}
                            </>
                        )}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'users_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    <Users className="mr-2 h-4 w-4" />
                    {t('nav.users')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.users_count}</span>
            ),
        },
        {
            accessorKey: 'players_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    <MonitorPlay className="mr-2 h-4 w-4" />
                    {t('nav.players')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            {tenant.players_count}
                            {tenant.players_limit && (
                                <span className="text-xs"> / {tenant.players_limit}</span>
                            )}
                        </span>
                        {tenant.players_limit && (
                            <Progress
                                value={tenant.players_usage_percentage}
                                className={`h-1 w-20 ${tenant.players_usage_percentage >= 90 ? '[&>div]:bg-destructive' : ''}`}
                            />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'media_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    <Image className="mr-2 h-4 w-4" />
                    {t('nav.media')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.media_count}</span>
            ),
        },
        {
            id: 'storage',
            header: () => (
                <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    {t('admin.tenants.storage')}
                </div>
            ),
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <div className="space-y-1">
                        <span className="text-muted-foreground text-sm">
                            {formatStorage(tenant.storage_usage_mb)}
                            {tenant.storage_limit_mb && (
                                <span className="text-xs"> / {formatStorage(tenant.storage_limit_mb)}</span>
                            )}
                        </span>
                        {tenant.storage_limit_mb && (
                            <Progress
                                value={tenant.storage_usage_percentage}
                                className={`h-1 w-20 ${tenant.storage_usage_percentage >= 90 ? '[&>div]:bg-destructive' : ''}`}
                            />
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('common.created')}
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
                const tenant = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/tenants/${tenant.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/tenants/${tenant.id}/users`}>
                                    <Users className="mr-2 h-4 w-4" />
                                    {t('admin.tenants.manageUsers')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAccessTenant(tenant.id)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                {t('admin.tenants.accessAs')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(tenant)}>
                                {tenant.is_active ? (
                                    <>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        {t('admin.tenants.deactivate')}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {t('admin.tenants.activate')}
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteDialog(tenant)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('common.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
        },
    ], [pagination.current_page]);

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
            <Head title={t('nav.organizations')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('nav.organizations')}</h1>
                        <p className="text-muted-foreground">
                            {t('admin.tenants.subtitle')}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/tenants/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin.tenants.addOrg')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('admin.tenants.searchOrgs')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('admin.tenants.filterByStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('players.allStatus')}</SelectItem>
                            <SelectItem value="active">{t('common.active')}</SelectItem>
                            <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
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
                                            <Building2 className="h-10 w-10 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-semibold">{t('admin.tenants.noOrgs')}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {search || status !== 'all'
                                                    ? t('admin.tenants.tryAdjustingFilters')
                                                    : t('admin.tenants.getStarted')}
                                            </p>
                                            {!search && status === 'all' && (
                                                <Button asChild className="mt-4">
                                                    <Link href="/admin/tenants/create">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        {t('admin.tenants.addOrg')}
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
                            {t('common.showingResults', { from: pagination.from, to: pagination.to, total: pagination.total })}
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.tenants.deleteOrg')}</DialogTitle>
                        <DialogDescription
                            dangerouslySetInnerHTML={{
                                __html: t('admin.tenants.deleteConfirm', { name: deleteDialog?.name || '' })
                            }}
                        />
                    </DialogHeader>
                    {deleteDialog && (deleteDialog.players_count > 0 || deleteDialog.media_count > 0) && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {t('admin.tenants.hasExistingData', { players: deleteDialog.players_count, media: deleteDialog.media_count })}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('common.deleting') : t('admin.tenants.deleteOrg')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
