// Utility function to type-cast form options
export function formOptions<T extends Record<string, any>>(options: T): T {
    return options as T;
}

// Extended FormOptions type for internal use
export interface ExtendedFormOptions {
    search?: string;
    category?: string;
    status?: string;
    timeframe?: string;
    role?: string;
    action?: string;
    max_participants?: number;
    avatar?: string;
    theme_id?: number;
    question_id?: number;
    tags?: string[];
    data?: any;
    _method?: string;
    [key: string]: any;
}
