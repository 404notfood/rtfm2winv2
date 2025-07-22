import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Award, BookOpen, BookOpenCheck, Folder, LayoutGrid, Trophy, Users, Zap } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Quiz',
        href: '/quiz',
        icon: BookOpenCheck,
        items: [
            {
                title: 'Mes Quiz',
                href: '/quiz',
            },
            {
                title: 'Créer un Quiz',
                href: '/quiz/create',
            },
            {
                title: 'Rejoindre',
                href: '/join',
            },
        ],
    },
    {
        title: 'Battle Royale',
        href: '/battle-royale',
        icon: Zap,
        items: [
            {
                title: 'Batailles',
                href: '/battle-royale',
            },
            {
                title: 'Créer une Bataille',
                href: '/battle-royale/create',
            },
        ],
    },
    {
        title: 'Tournois',
        href: '/tournaments',
        icon: Trophy,
        items: [
            {
                title: 'Tournois',
                href: '/tournaments',
            },
            {
                title: 'Créer un Tournoi',
                href: '/tournaments/create',
            },
        ],
    },
    {
        title: 'Succès & Trophées',
        href: '/achievements',
        icon: Award,
        items: [
            {
                title: 'Mes Succès',
                href: '/achievements',
            },
            {
                title: 'Badges',
                href: '/achievements/badges',
            },
            {
                title: 'Trophées',
                href: '/achievements/trophies',
            },
            {
                title: 'Classement',
                href: '/achievements/leaderboard',
            },
        ],
    },
    {
        title: 'Social',
        href: '/friends',
        icon: Users,
        items: [
            {
                title: 'Amis',
                href: '/friends',
            },
            {
                title: 'Notifications',
                href: '/notifications',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
