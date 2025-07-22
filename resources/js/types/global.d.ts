declare global {
    interface Window {
        Echo?: {
            join: (channel: string) => {
                listen: (event: string, callback: (e: any) => void) => void;
                listenForWhisper: (event: string, callback: (e: any) => void) => void;
                whisper: (event: string, data: any) => void;
                stopListening: (event: string) => void;
            };
            leaveChannel: (channel: string) => void;
            leave: (channel: string) => void;
            private: (channel: string) => any;
            presence: (channel: string) => any;
        };
        Pusher?: any;
        axios?: any;
    }

    function route(name: string, parameters?: any, absolute?: boolean): string;

    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
        }
    }
}

export {};
