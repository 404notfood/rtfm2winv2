import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
import { ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-1 pt-20">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}