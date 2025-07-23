import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

interface EchoEventData {
    quiz?: { title: string; total_questions: number; id?: number };
    participant?: { nickname: string; pseudo: string };
    leaderboard?: Array<{ nickname: string }>;
    achievement?: { name: string };
    badge?: { name: string };
    tournament?: { name: string };
    winner?: { name: string; pseudo: string };
    loser?: { name: string };
    eliminated?: Array<unknown>;
    remaining?: number;
    title?: string;
    message?: string;
    priority?: 'high' | 'medium' | 'low';
    // Quiz session events
    question?: import('./index.d').Question;
    question_index?: number;
    results?: { correct_answers: number; points_earned: number; rank: number } | null;
    participant_id?: number;
    round?: number;
    // Battle Royale events - Support full event data
    participant?: {
        id?: number;
        nickname: string;
        pseudo: string;
        score?: number;
        is_eliminated?: boolean;
        joined_at?: string;
        last_activity_at?: string;
    };
    // Message events
    message?: {
        id: number;
        content: string;
        participant_id: number;
        participant: {
            nickname: string;
            pseudo: string;
        };
        created_at: string;
    };
    [key: string]: unknown;
}

interface EchoChannel {
    listen: (event: string, callback: (data: EchoEventData) => void) => EchoChannel;
    join: (callback: () => void) => EchoChannel;
    leave: () => void;
}

interface CustomEcho {
    private: (channel: string) => EchoChannel;
    join: (channel: string) => EchoChannel;
    leaveChannel: (channel: string) => void;
}

declare global {
  interface Window {
    Echo: CustomEcho;
    Pusher: typeof Pusher;
    axios: typeof import('axios').default;
  }
}

export { EchoEventData, EchoChannel, CustomEcho };