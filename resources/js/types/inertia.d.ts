// Type augmentations for Inertia.js

// Declare global augmentations
declare global {
    namespace Inertia {
        interface FormOptions {
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
    }
}

declare module '@inertiajs/react' {
    interface FormOptions {
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
}

export {};
