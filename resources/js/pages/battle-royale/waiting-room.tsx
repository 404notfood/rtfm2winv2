import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Copy, Crown, Play, QrCode, Shield, Sword, Target, Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Participant {
    id: number;
    pseudo: string;
    avatar?: string;
    is_presenter: boolean;
    joined_at: string;
    user_id?: number;
}

interface BattleRoyaleSession {
    id: number;
    code: string;
    title: string;
    status: 'waiting' | 'active' | 'completed';
    max_participants: number;
    elimination_rate: number;
    time_per_question: number;
    prize_pool?: number;
    quiz: {
        id: number;
        title: string;
        questions_count: number;
    };
    creator: {
        id: number;
        name: string;
    };
}

interface Props {
    session: BattleRoyaleSession;
    participants: Participant[];
    currentUser?: {
        participant_id: number;
        is_presenter: boolean;
    };
    joinUrl: string;
}

export default function BattleRoyaleWaitingRoom({ session, participants, currentUser, joinUrl }: Props) {
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const { post, processing } = useForm();

    const participationRate = (participants.length / session.max_participants) * 100;
    const canStart = participants.length >= 4 && currentUser?.is_presenter;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (countdown !== null && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => (prev ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [countdown]);

    const startBattle = () => {
        setCountdown(5);
        setTimeout(() => {
            post(`/battle-royale/${session.code}/start`);
        }, 5000);
    };

    const copyJoinUrl = () => {
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getBattleDifficulty = () => {
        if (session.elimination_rate >= 40) return { label: 'Extrême', color: 'text-red-600' };
        if (session.elimination_rate >= 30) return { label: 'Difficile', color: 'text-orange-600' };
        if (session.elimination_rate >= 20) return { label: 'Normale', color: 'text-yellow-600' };
        return { label: 'Facile', color: 'text-green-600' };
    };

    const difficulty = getBattleDifficulty();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
            <Head title={`Salle d'attente - ${session.title}`} />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                            <Sword className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">{session.title}</h1>
                            <p className="text-muted-foreground">
                                Battle Royale • Code: <span className="font-mono font-bold">{session.code}</span>
                            </p>
                        </div>
                    </div>

                    <Badge variant="outline" className="px-4 py-2 text-lg">
                        <Clock className="mr-2 h-4 w-4" />
                        En attente de participants
                    </Badge>
                </motion.div>

                {/* Countdown */}
                <AnimatePresence>
                    {countdown !== null && countdown > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        >
                            <Card className="text-center">
                                <CardContent className="p-8">
                                    <div className="mb-4 text-6xl font-bold text-red-600">{countdown}</div>
                                    <p className="text-xl">La bataille commence dans...</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Participants */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Guerriers ({participants.length}/{session.max_participants})
                                    </CardTitle>
                                    <Badge className={participationRate >= 75 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                        {Math.round(participationRate)}% plein
                                    </Badge>
                                </div>
                                <Progress value={participationRate} className="h-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                    {participants.map((participant, index) => (
                                        <motion.div
                                            key={participant.id}
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`relative rounded-lg border p-3 transition-all ${
                                                currentUser?.participant_id === participant.id
                                                    ? 'border-red-200 bg-red-50'
                                                    : 'bg-muted/50 hover:bg-muted'
                                            }`}
                                        >
                                            <div className="space-y-2 text-center">
                                                <Avatar className="mx-auto h-12 w-12">
                                                    <AvatarImage src={participant.avatar} />
                                                    <AvatarFallback>{participant.pseudo.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>

                                                <div>
                                                    <div className="truncate text-sm font-medium">{participant.pseudo}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(participant.joined_at).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {participant.is_presenter && <Crown className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />}

                                            {currentUser?.participant_id === participant.id && (
                                                <div className="absolute -top-1 -left-1 h-3 w-3 animate-pulse rounded-full bg-red-500" />
                                            )}
                                        </motion.div>
                                    ))}

                                    {/* Empty slots */}
                                    {Array.from({ length: session.max_participants - participants.length }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-3"
                                        >
                                            <div className="text-center text-muted-foreground">
                                                <Users className="mx-auto mb-1 h-8 w-8 opacity-50" />
                                                <div className="text-xs">En attente</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Battle Info & Controls */}
                    <div className="space-y-6">
                        {/* Battle Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Détails de la bataille
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Quiz</span>
                                        <span className="text-sm font-medium">{session.quiz.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Questions</span>
                                        <span className="text-sm font-medium">{session.quiz.questions_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Temps/question</span>
                                        <span className="text-sm font-medium">{session.time_per_question}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Élimination</span>
                                        <span className="text-sm font-medium">{session.elimination_rate}%/round</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Difficulté</span>
                                        <span className={`text-sm font-medium ${difficulty.color}`}>{difficulty.label}</span>
                                    </div>
                                    {session.prize_pool && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Prix total</span>
                                            <span className="text-sm font-medium text-yellow-600">{session.prize_pool.toLocaleString()} pts</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Share */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Inviter des joueurs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <input type="text" value={joinUrl} readOnly className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm" />
                                    <Button onClick={copyJoinUrl} size="sm" className={copied ? 'bg-green-600' : ''}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Partagez ce lien pour que d'autres joueurs rejoignent la bataille</p>
                            </CardContent>
                        </Card>

                        {/* Battle Rules */}
                        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <Shield className="h-5 w-5" />
                                    Règles de survie
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-orange-500" />
                                    <span>Répondez rapidement et correctement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-red-500" />
                                    <span>{session.elimination_rate}% des joueurs éliminés par round</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <span>Le dernier survivant remporte tout</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Start Button */}
                        {currentUser?.is_presenter && (
                            <Card>
                                <CardContent className="p-4">
                                    <Button
                                        onClick={startBattle}
                                        disabled={!canStart || processing || countdown !== null}
                                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                        size="lg"
                                    >
                                        {!canStart ? (
                                            <>
                                                <Users className="mr-2 h-5 w-5" />
                                                Minimum 4 joueurs requis
                                            </>
                                        ) : countdown !== null ? (
                                            <>
                                                <Clock className="mr-2 h-5 w-5" />
                                                Démarrage...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-5 w-5" />
                                                Commencer la bataille !
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
