import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef } from 'react';

interface PageProps {
    csrf_token: string;
    [key: string]: unknown;
}

/**
 * Componente que sincroniza o CSRF token entre Inertia props, meta tag e axios.
 *
 * Problema: Navegações Inertia são client-side e não atualizam o meta tag.
 * Isso causa falhas em operações POST quando o token muda (ex: após logout).
 *
 * Solução: Este componente detecta mudanças no csrf_token das props do Inertia
 * e atualiza automaticamente o meta tag e axios.defaults.
 */
export function CsrfSync() {
    const { csrf_token } = usePage<PageProps>().props;
    const previousToken = useRef<string | null>(null);

    useEffect(() => {
        if (!csrf_token || csrf_token === previousToken.current) {
            return;
        }

        previousToken.current = csrf_token;

        // Atualiza meta tag no DOM
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) {
            meta.setAttribute('content', csrf_token);
        }

        // Atualiza axios defaults
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf_token;
    }, [csrf_token]);

    return null;
}
