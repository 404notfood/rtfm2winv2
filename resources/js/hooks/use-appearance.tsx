import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'neon' | 'pastel' | 'fun' | 'elegant' | 'system';

export const availableThemes: Array<{ value: Theme; label: string; description: string }> = [
    { value: 'system', label: 'Système', description: 'Suit les préférences du système' },
    { value: 'light', label: 'Clair', description: 'Thème clair classique' },
    { value: 'dark', label: 'Sombre', description: 'Thème sombre moderne' },
    { value: 'neon', label: 'Néon', description: 'Thème vibrant aux couleurs vives' },
    { value: 'pastel', label: 'Pastel', description: 'Couleurs douces et apaisantes' },
    { value: 'fun', label: 'Ludique', description: 'Thème coloré et dynamique' },
    { value: 'elegant', label: 'Élégant', description: 'Thème sophistiqué et raffiné' },
];

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

const loadThemeCSS = async (theme: Theme) => {
    if (typeof document === 'undefined') return;

    // Remove existing theme links
    const existingLinks = document.querySelectorAll('link[data-theme]');
    existingLinks.forEach((link) => link.remove());

    if (theme === 'system') {
        theme = prefersDark() ? 'dark' : 'light';
    }

    // Load the CSS file for the selected theme
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/css/themes/${theme}.css`;
    link.setAttribute('data-theme', theme);

    // Add to head
    document.head.appendChild(link);

    // Also set a data attribute on body for theme-specific styling
    document.body.setAttribute('data-theme', theme);

    // Maintain dark class for compatibility
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

const applyTheme = (theme: Theme) => {
    loadThemeCSS(theme);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentTheme = localStorage.getItem('theme') as Theme;
    if (currentTheme === 'system') {
        applyTheme('system');
    }
};

export function initializeTheme() {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    applyTheme(savedTheme);

    // Add the event listener for system theme changes
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [theme, setTheme] = useState<Theme>('system');

    const updateTheme = useCallback((newTheme: Theme) => {
        setTheme(newTheme);

        // Store in localStorage for client-side persistence
        localStorage.setItem('theme', newTheme);

        // Store in cookie for SSR
        setCookie('theme', newTheme);

        applyTheme(newTheme);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const initialTheme = savedTheme || 'system';
        setTheme(initialTheme);
        applyTheme(initialTheme);

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return {
        theme,
        updateTheme,
        availableThemes,
        // Legacy compatibility
        appearance: theme,
        updateAppearance: updateTheme,
    } as const;
}
