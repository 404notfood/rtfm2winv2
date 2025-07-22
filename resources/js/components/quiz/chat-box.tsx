import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
    id: number;
    participant_id: number;
    pseudo: string;
    avatar_url?: string;
    message: string;
    sent_at: string;
}

interface Participant {
    id: number;
    pseudo: string;
    avatar_url?: string;
}

interface Props {
    sessionId: number;
    currentParticipant?: Participant;
}

export function ChatBox({ sessionId, currentParticipant }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Setup real-time chat
    useEffect(() => {
        const channel = window.Echo?.join(`quiz-session.${sessionId}`);

        channel?.listen('MessageSent', (e: { message: Message }) => {
            setMessages((prev) => [...prev, e.message]);
        });

        return () => {
            window.Echo?.leaveChannel(`quiz-session.${sessionId}`);
        };
    }, [sessionId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !currentParticipant || sending) return;

        setSending(true);

        try {
            const response = await fetch(`/api/quiz-session/${sessionId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message: newMessage.trim(),
                }),
            });

            if (response.ok) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    if (!currentParticipant) {
        return null;
    }

    return (
        <Card className="flex h-96 flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-4 w-4" />
                    Chat de la session
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-0">
                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto px-4">
                    {messages.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Aucun message pour le moment.
                            <br />
                            Soyez le premier à dire bonjour !
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className="flex gap-2 text-sm">
                                <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarImage src={message.avatar_url} />
                                    <AvatarFallback className="text-xs">{getInitials(message.pseudo)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-medium">{message.pseudo}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(message.sent_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <p className="break-words">{message.message}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Tapez votre message..."
                            disabled={sending}
                            maxLength={200}
                            className="flex-1"
                        />
                        <Button type="submit" size="sm" disabled={!newMessage.trim() || sending}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                    <div className="mt-1 text-xs text-muted-foreground">{newMessage.length}/200 caractères</div>
                </div>
            </CardContent>
        </Card>
    );
}
