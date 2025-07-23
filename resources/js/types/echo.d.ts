import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

interface EchoEventData {
    quiz?: { title: string };
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