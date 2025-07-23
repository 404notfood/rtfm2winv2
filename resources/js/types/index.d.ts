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
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
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
    role: 'admin' | 'presenter' | 'user' | 'guest';
    can_be_presenter?: boolean;
    is_suspended?: boolean;
    current_theme_id?: number;
    preferences?: Record<string, unknown>;
    last_login_at?: string;
    avatar_url?: string;
}

export interface Quiz {
    id: number;
    title: string;
    code: string;
    description?: string;
    creator_id?: number;
    category?: string;
    time_per_question: number;
    multiple_answers: boolean;
    status: 'draft' | 'published' | 'archived';
    join_code?: string;
    unique_link?: string;
    qr_code_path?: string;
    allow_anonymous?: boolean;
    created_at: string;
    updated_at: string;
    creator?: User;
    questions?: Question[];
    questions_count?: number;
    sessions_count?: number;
    participants_count?: number;
    tags?: Tag[];
    join_url?: string;
    qr_code_url?: string;
}

export interface Answer {
    id: string | number;
    text: string;
    is_correct: boolean;
    explanation?: string;
    question_id?: number;
    order_index?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Question {
    id: number;
    text: string;
    type: 'single' | 'multiple';
    quiz_id: number;
    time_limit?: number;
    points: number;
    order_index: number;
    explanation?: string;
    image_path?: string;
    answers: Answer[];
    created_at: string;
    updated_at: string;
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
    quiz_session_id: number;
    user_id?: number;
    nickname: string;
    pseudo: string;
    avatar?: string;
    is_anonymous: boolean;
    score: number;
    position?: number;
    is_eliminated?: boolean;
    joined_at: string;
    last_activity_at?: string;
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
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    current_round?: number;
    total_rounds?: number;
    created_at: string;
    updated_at: string;
    creator?: User;
    participants?: Participant[];
    matches?: Match[];
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    is_featured?: boolean;
    usage_count?: number;
    created_at: string;
    updated_at: string;
}

export interface QuizSession {
    id: number;
    quiz_id: number;
    presenter_id?: number;
    code: string;
    status: 'waiting' | 'active' | 'completed' | 'cancelled';
    current_question_index?: number;
    started_at?: string;
    ended_at?: string;
    settings?: Record<string, unknown>;
    quiz?: Quiz;
    presenter?: User;
    participants?: Participant[];
    participants_count?: number;
}

export interface CurrentParticipant {
    id: number;
    nickname: string;
    pseudo: string; // Required to match Participant interface
    score: number;
    is_eliminated?: boolean;
}

export interface FormOptions {
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: Record<string, unknown>;
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
    only?: string[];
    except?: string[];
    onStart?: () => void;
    onProgress?: (progress: { percentage: number }) => void;
    onFinish?: () => void;
    onError?: (errors: Record<string, string>) => void;
    onSuccess?: () => void;
    onCancel?: () => void;
    // Additional Inertia properties commonly used
    _method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    search?: string;
    tags?: string[];
    max_participants?: number;
    theme_id?: number;
    question_id?: number;
    role?: string;
    action?: string;
    avatar?: string;
    data?: Record<string, unknown>;
    participant_id?: number;
    [key: string]: unknown; // Allow additional properties
}
