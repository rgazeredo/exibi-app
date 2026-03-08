import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally (required by Echo)
window.Pusher = Pusher;

// Get configuration from meta tags or use defaults
const getMetaContent = (name: string, defaultValue: string): string => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta?.getAttribute('content') || defaultValue;
};

// Get configuration
const wsHost = getMetaContent('pusher-host', window.location.hostname);
const wsPort = parseInt(getMetaContent('pusher-port', '6001'));
const scheme = getMetaContent('pusher-scheme', 'http');

// Debug log for WebSocket configuration
console.log('[Echo] WebSocket config:', { wsHost, wsPort, scheme, forceTLS: scheme === 'https' });

// Initialize Echo with Pusher/Soketi
const echo = new Echo({
    broadcaster: 'pusher',
    key: getMetaContent('pusher-key', 'exibi-key'),
    cluster: getMetaContent('pusher-cluster', 'mt1'),
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});

// Add to window for global access
declare global {
    interface Window {
        Echo: typeof echo;
        Pusher: typeof Pusher;
    }
}

window.Echo = echo;

export default echo;
