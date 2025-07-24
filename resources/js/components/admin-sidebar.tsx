import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type User } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart3, FileText, LayoutGrid, Settings, Shield, Users, Database, Activity, Folder } from 'lucide-react';
import AppLogo from './app-logo';

interface AdminSidebarProps {
    user: User;
}

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Utilisateurs',
        href: '/admin/users',
        icon: Users,
        items: [
            {
                title: 'Liste des utilisateurs',
                href: '/admin/users',
            },
            {
                title: 'Utilisateurs suspendus',
                href: '/admin/users?status=suspended',
            },
            {
                title: 'Créer un utilisateur',
                href: '/admin/users/create',
            },
        ],
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        items: [
            {
                title: 'Vue d\'ensemble',
                href: '/admin/analytics',
            },
            {
                title: 'Quiz populaires',
                href: '/admin/analytics/popular-quizzes',
            },
            {
                title: 'Activité utilisateurs',
                href: '/admin/analytics/user-activity',
            },
        ],
    },
    {
        title: 'Rapports',
        href: '/admin/reports',
        icon: FileText,
        items: [
            {
                title: 'Générer rapport',
                href: '/admin/reports',
            },
            {
                title: 'Rapports planifiés',
                href: '/admin/reports/scheduled',
            },
            {
                title: 'Historique',
                href: '/admin/reports/history',
            },
        ],
    },
    {
        title: 'Contenu',
        href: '/admin/content',
        icon: Folder,
        items: [
            {
                title: 'Quiz',
                href: '/admin/content/quizzes',
            },
            {
                title: 'Tournois',
                href: '/admin/content/tournaments',
            },
            {
                title: 'Tags & Catégories',
                href: '/admin/content/tags',
            },
            {
                title: 'Thèmes',
                href: '/admin/content/themes',
            },
        ],
    },
    {
        title: 'Système',
        href: '/admin/system',
        icon: Database,
        items: [
            {
                title: 'Logs d\'audit',
                href: '/admin/audit-logs',
            },
            {
                title: 'Performance',
                href: '/admin/system/performance',
            },
            {
                title: 'Maintenance',
                href: '/admin/system/maintenance',
            },
        ],
    },
    {
        title: 'Paramètres',
        href: '/admin/settings',
        icon: Settings,
        items: [
            {
                title: 'Configuration',
                href: '/admin/settings',
            },
            {
                title: 'Permissions',
                href: '/admin/settings/permissions',
            },
            {
                title: 'Sécurité',
                href: '/admin/settings/security',
            },
        ],
    },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Shield className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">RTFM2WIN</span>
                                    <span className="truncate text-xs text-muted-foreground">Administration</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={adminNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} isAdmin={true} />
            </SidebarFooter>
        </Sidebar>
    );
}