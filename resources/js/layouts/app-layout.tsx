import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { useRealTimeToasts } from '@/hooks/use-real-time-toasts';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export const AppLayout = ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    // Initialize real-time toasts
    useRealTimeToasts();
    
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};

// Export par défaut pour la compatibilité
export default AppLayout;
