import { usePage } from '@inertiajs/react';

interface PageProps {
    csrf_token: string;
    [key: string]: unknown;
}

/**
 * Hook to get the current CSRF token.
 * Uses Inertia shared props (always up-to-date) with meta tag fallback.
 */
export function useCsrfToken(): string {
    const { csrf_token } = usePage<PageProps>().props;

    // Prefer Inertia prop (updated on each navigation)
    if (csrf_token) {
        return csrf_token;
    }

    // Fallback to meta tag
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

/**
 * Get CSRF token without hooks (for use in event handlers).
 * Reads from meta tag which is updated by Inertia on navigation.
 */
export function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

/**
 * Check if a response indicates a CSRF token mismatch (status 419).
 */
export function isCsrfError(status: number): boolean {
    return status === 419;
}

/**
 * Helper to add CSRF token to fetch headers.
 */
export function csrfHeaders(): HeadersInit {
    return {
        'X-CSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
    };
}
