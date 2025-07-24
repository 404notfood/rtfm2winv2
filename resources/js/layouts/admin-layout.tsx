import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { props } = usePage<any>();

    return (
        <SidebarProvider>
            <AdminSidebar user={props.auth.user} />
            <SidebarInset>
                <div className="flex flex-1 flex-col">
                    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="mx-auto w-full max-w-screen-2xl">
                            {children}
                        </div>
                    </main>
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}