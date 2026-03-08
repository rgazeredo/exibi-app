import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (_appearance: Appearance) => {
    // Dark theme disabled - always use light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance =
        (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

const saveAppearanceToBackend = async (appearance: Appearance) => {
    try {
        await axios.patch('/settings/preferences', { appearance });
    } catch (error) {
        console.error('Failed to save appearance preference:', error);
    }
};

export function useAppearance() {
    const { auth } = usePage<SharedData>().props;
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = useCallback((mode: Appearance, saveToBackend = true) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);

        // Save to backend if user is authenticated
        if (saveToBackend && auth?.user) {
            saveAppearanceToBackend(mode);
        }
    }, [auth?.user]);

    useEffect(() => {
        // Prioritize user's database preference if authenticated
        const userAppearance = auth?.user?.appearance;
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        const initialAppearance = userAppearance || savedAppearance || 'system';

        // If user has a stored preference, sync it to localStorage
        if (userAppearance && userAppearance !== savedAppearance) {
            localStorage.setItem('appearance', userAppearance);
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateAppearance(initialAppearance, false);

        return () =>
            mediaQuery()?.removeEventListener(
                'change',
                handleSystemThemeChange,
            );
    }, [auth?.user?.appearance, updateAppearance]);

    return { appearance, updateAppearance } as const;
}
