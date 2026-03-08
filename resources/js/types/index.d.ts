import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    role: 'admin' | 'editor' | 'viewer' | 'super_admin';
    role_name?: string;
    permissions: string[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    tenant: Tenant | null;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    is_super_admin?: boolean;
    language: 'pt' | 'en';
    appearance: 'light' | 'dark' | 'system';
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface LayoutRegion {
    id: string;
    layout_id: string;
    name: string;
    position: number;
    x_percent: number;
    y_percent: number;
    width_percent: number;
    height_percent: number;
    is_main: boolean;
    created_at: string;
    updated_at: string;
}

export interface Layout {
    id: string;
    tenant_id: string | null;
    name: string;
    description: string | null;
    orientation: 'landscape' | 'portrait';
    is_system: boolean;
    is_active: boolean;
    regions: LayoutRegion[];
    created_at: string;
    updated_at: string;
}
