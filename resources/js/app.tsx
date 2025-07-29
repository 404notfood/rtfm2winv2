import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import axios from 'axios';
import Echo from 'laravel-echo';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Pusher from 'pusher-js';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from './components/ui/toaster';

// Configure Axios pour CSRF token
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Setup CSRF token from meta tag
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    const csrfToken = token.getAttribute('content');
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    
    // Set default headers for all request types
    if (csrfToken) {
        window.axios.defaults.headers.post['X-CSRF-TOKEN'] = csrfToken;
        window.axios.defaults.headers.put['X-CSRF-TOKEN'] = csrfToken;
        window.axios.defaults.headers.patch['X-CSRF-TOKEN'] = csrfToken;
        window.axios.defaults.headers.delete['X-CSRF-TOKEN'] = csrfToken;
    }
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Configure Laravel Echo for WebSocket broadcasting
window.Pusher = Pusher;

// Configuration Echo simplifiée
if (import.meta.env.VITE_REVERB_APP_KEY) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    }) as any; // Cast pour éviter le conflit de types avec CustomEcho
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize theme before rendering
        initializeTheme();

        root.render(
            <>
                <App {...props} />
                <Toaster />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});