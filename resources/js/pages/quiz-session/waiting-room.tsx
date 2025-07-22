import { ChatBox } from '@/components/quiz/chat-box';
import { QRCodeDisplay } from '@/components/quiz/qr-code-display';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Clock, Copy, Play, QrCode, RefreshCw, Settings, Share2, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Participant {
    id: number;
    nickname: string;
    avatar?: string;
    joined_at: string;
    is_ready: boolean;
}

interface QuizSession {
    id: number;
    code: string;
    status: 'waiting' | 'active' | 'completed';
    session_type: string;
    max_participants: number;
    join_url: string;
    qr_code_path?: string;
    quiz: {
        id: number;
        title: string;
        description: string;
        total_questions: number;
    };
}

interface CurrentParticipant {
    id: number;
    nickname: string;
    avatar?: string;
}

interface Stats {
    participants_count: number;
    max_participants: number;
    questions_count: number;
}

interface Props {
    session: QuizSession;
    participants: Participant[];
    currentParticipant?: CurrentParticipant;
    isPresenter: boolean;
    canStart: boolean;
    stats: Stats;
}

export default function WaitingRoom({ session, participants: initialParticipants, currentParticipant, isPresenter, canStart, stats }: Props) {
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const [participants, setParticipants] = useState(initialParticipants);

    const { post, processing } = useForm();

    // Setup real-time updates
    useEffect(() => {
        const channel = window.Echo?.join(`quiz-session.${session.id}`);

        channel?.listen('ParticipantJoined', (e: { participant: Participant }) => {
            setParticipants((prev) => [...prev, e.participant]);
        });

        channel?.listen('ParticipantLeft', (e: { participant_id: number }) => {
            setParticipants((prev) => prev.filter((p) => p.id !== e.participant_id));
        });

        channel?.listen('SessionStarted', () => {
            window.location.href = `/quiz/session/${session.code}/play`;
        });

        return () => {
            window.Echo?.leaveChannel(`quiz-session.${session.id}`);
        };
    }, [session.id, session.code]);

    const handleStartSession = () => {
        if (canStart) {
            post(`/quiz/session/${session.code}/start`);
        }
    };

    const copyJoinLink = () => {
        navigator.clipboard.writeText(session.join_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareSession = () => {
        if (navigator.share) {
            navigator.share({
                title: session.quiz.title,
                text: `Rejoignez le quiz "${session.quiz.title}"`,
                url: session.join_url,
            });
        } else {
            copyJoinLink();
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <AppLayout>
            <Head title={`Salle d'attente - ${session.quiz.title}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{session.quiz.title}</CardTitle>
                                <p className="mt-1 text-muted-foreground">{session.quiz.description}</p>
                                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {session.quiz.total_questions} questions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {participants.length}/{session.max_participants} participants
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowQR(!showQR)}>
                                    <QrCode className="mr-2 h-4 w-4" />
                                    QR Code
                                </Button>
                                <Button variant="outline" onClick={shareSession}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Partager
                                </Button>
                                {isPresenter && (
                                    <Button
                                        onClick={handleStartSession}
                                        disabled={!canStart || processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        {processing ? 'Démarrage...' : 'Démarrer le quiz'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    {showQR && (
                        <CardContent>
                            <Separator className="mb-4" />
                            <QRCodeDisplay url={session.join_url} code={session.code} title={session.quiz.title} />
                        </CardContent>
                    )}
                </Card>

                {/* Join Link */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-muted-foreground">Lien de participation</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Input value={session.join_url} readOnly className="font-mono text-sm" />
                                    <Button variant="outline" size="sm" onClick={copyJoinLink} className={copied ? 'text-green-600' : ''}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        {copied ? 'Copié !' : 'Copier'}
                                    </Button>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="rounded bg-muted px-4 py-2 text-2xl font-bold tracking-wider">{session.code}</div>
                                <div className="mt-1 text-xs text-muted-foreground">Code de session</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Participants */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Participants ({participants.length})
                                    </CardTitle>
                                    <Button variant="ghost" size="sm">
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {participants.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <UserPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 font-semibold">En attente de participants</h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Partagez le lien ou le QR code pour inviter des participants
                                        </p>
                                        <Button variant="outline" onClick={() => setShowQR(true)}>
                                            <QrCode className="mr-2 h-4 w-4" />
                                            Afficher le QR Code
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {participants.map((participant) => (
                                            <div key={participant.id} className="flex items-center gap-3 rounded-lg border p-3">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={participant.avatar} />
                                                        <AvatarFallback>{getInitials(participant.nickname)}</AvatarFallback>
                                                    </Avatar>
                                                    <div
                                                        className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-background ${
                                                            participant.is_ready ? 'bg-green-500' : 'bg-yellow-400'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{participant.nickname}</span>
                                                        {currentParticipant && participant.id === currentParticipant.id && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Vous
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Rejoint {new Date(participant.joined_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`rounded-full px-2 py-1 text-xs ${
                                                        participant.is_ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {participant.is_ready ? 'Prêt' : 'En attente'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat & Info */}
                    <div className="space-y-6">
                        {/* Quiz Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations du quiz</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Questions</span>
                                    <span className="font-medium">{session.quiz.total_questions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Type de session</span>
                                    <span className="font-medium capitalize">{session.session_type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Participants max</span>
                                    <span className="font-medium">{session.max_participants}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Statut</span>
                                    <Badge variant="outline" className="capitalize">
                                        {session.status === 'waiting' ? 'En attente' : session.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chat */}
                        <ChatBox sessionId={session.id} currentParticipant={currentParticipant} />

                        {/* Presenter Controls */}
                        {isPresenter && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Contrôles du présentateur
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="mb-4 text-sm text-muted-foreground">
                                        {canStart ? 'Vous pouvez démarrer le quiz' : 'Au moins 1 participant requis pour démarrer'}
                                    </div>
                                    <Button
                                        onClick={handleStartSession}
                                        disabled={!canStart || processing}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        {processing ? 'Démarrage...' : 'Démarrer le quiz'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
