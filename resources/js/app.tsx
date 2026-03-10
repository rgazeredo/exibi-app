import '../css/app.css';
import './echo'; // Initialize Laravel Echo for WebSocket
import './i18n';

import { createInertiaApp } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// Configure axios to include CSRF token from meta tag
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Handle 419 CSRF token mismatch by reloading the page
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            // Session expired or CSRF token mismatch - reload to get fresh token
            window.location.reload();
            return new Promise(() => {}); // Prevent error propagation during reload
        }
        return Promise.reject(error);
    },
);

const appName = import.meta.env.VITE_APP_NAME || 'Exibi';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
