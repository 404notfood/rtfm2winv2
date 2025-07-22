import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Quiz {
    id: number;
    title: string;
    description?: string;
    is_active?: boolean;
    is_public?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Answer {
    id: string | number;
    text: string;
    is_correct: boolean;
    explanation?: string;
    [key: string]: unknown;
}

export interface Question {
    id: number;
    text: string;
    type: 'single' | 'multiple';
    time_limit?: number;
    points?: number;
    explanation?: string;
    answers?: Answer[];
    [key: string]: unknown;
}

export interface Theme {
    id?: number;
    name: string;
    description?: string;
    is_dark: boolean;
    font_family: string;
    border_radius: number;
    is_public?: boolean;
    base_theme?: string;
    css_variables: Record<string, string>;
    [key: string]: unknown;
}

export interface Participant {
    id: number;
    name: string;
    avatar?: string;
    score?: number;
    position?: number;
    joined_at: string;
    [key: string]: unknown;
}

export interface Match {
    id: number;
    participant1?: Participant;
    participant2?: Participant;
    winner_id?: number;
    round: number;
    position: number;
    [key: string]: unknown;
}

export interface Tournament {
    id: number;
    name: string;
    description?: string;
    max_participants: number;
    entry_fee?: number;
    prize_pool?: number;
    start_date?: string;
    end_date?: string;
    [key: string]: unknown;
}
