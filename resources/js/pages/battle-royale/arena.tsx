import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Clock, Crown, Flame, Shield, Skull, Target, TrendingUp, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface BRParticipant {
    id: number;
    user_id?: number;
    pseudo: string;
    score: number;
    is_eliminated: boolean;
    eliminated_at?: string;
    eliminated_round?: number;
    position: number;
    streak: number;
    is_current_user: boolean;
    avatar_url?: string;
}

interface Question {
    id: number;
    text: string;
    type: 'single' | 'multiple';
    time_limit: number;
    points: number;
    answers: Array<{
        id: number;
        text: string;
        is_correct: boolean;
    }>;
}

interface BattleRoyaleSession {
    id: number;
    name: string;
    status: 'waiting' | 'active' | 'completed';
    current_round: number;
    elimination_interval: number;
    max_players: number;
    participants: BRParticipant[];
    current_question?: Question;
    elimination_countdown: number;
    next_elimination_at?: string;
}

interface Props {
    session: BattleRoyaleSession;
    participant: BRParticipant;
    question_start_time?: string;
}

export default function BattleRoyaleArena({ session, participant, question_start_time }: Props) {
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [eliminationCountdown, setEliminationCountdown] = useState(session.elimination_countdown);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [participants, setParticipants] = useState(session.participants);
    const [currentQuestion, setCurrentQuestion] = useState(session.current_question);

    const { post, processing } = useForm();

    const submitAnswer = useCallback(() => {
        if (hasAnswered || !currentQuestion || participant.is_eliminated) return;

        setHasAnswered(true);

        post(`/battle-royale/${session.id}/answer`, {
            question_id: currentQuestion.id,
            answer_ids: selectedAnswers,
            response_time: currentQuestion.time_limit - timeLeft,
        });
    }, [hasAnswered, currentQuestion, participant.is_eliminated, session.id, selectedAnswers, timeLeft, post]);

    // Question timer
    useEffect(() => {
        if (!currentQuestion || hasAnswered || showResults) return;

        const startTime = question_start_time ? new Date(question_start_time) : new Date();
        const endTime = new Date(startTime.getTime() + currentQuestion.time_limit * 1000);

        const updateTimer = () => {
            const now = new Date();
            const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0 && !hasAnswered) {
                submitAnswer();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);
        return () => clearInterval(interval);
    }, [currentQuestion, hasAnswered, showResults, question_start_time, submitAnswer]);

    // Elimination countdown
    useEffect(() => {
        if (session.status !== 'active') return;

        const interval = setInterval(() => {
            setEliminationCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [session.status, session.elimination_interval]);

    // Real-time updates
    useEffect(() => {
        const channel = window.Echo?.join(`battle-royale.${session.id}`);

        channel?.listen('NextQuestion', (e: { question: Question }) => {
            setCurrentQuestion(e.question);
            setSelectedAnswers([]);
            setHasAnswered(false);
            setShowResults(false);
        });

        channel?.listen('ParticipantEliminated', (e: { participant: BRParticipant; round: number }) => {
            setParticipants((prev) => prev.map((p) => (p.id === e.participant.id ? { ...p, is_eliminated: true, eliminated_round: e.round } : p)));
        });

        channel?.listen('EliminationRound', () => {
            setEliminationCountdown(session.elimination_interval);
        });

        channel?.listen('SessionEnded', () => {
            window.location.href = `/battle-royale/${session.id}/results`;
        });

        return () => {
            window.Echo?.leaveChannel(`battle-royale.${session.id}`);
        };
    }, [session.id, session.elimination_interval]);

    const handleAnswerSelect = (answerId: number) => {
        if (hasAnswered || showResults || participant.is_eliminated) return;

        if (currentQuestion?.type === 'single') {
            setSelectedAnswers([answerId]);
        } else {
            setSelectedAnswers((prev) => (prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId]));
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getTimerColor = () => {
        const percentage = (timeLeft / (currentQuestion?.time_limit || 1)) * 100;
        if (percentage > 50) return 'bg-green-500';
        if (percentage > 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getEliminationColor = () => {
        const percentage = (eliminationCountdown / session.elimination_interval) * 100;
        if (percentage > 60) return 'bg-green-500';
        if (percentage > 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const activePlayers = participants.filter((p) => !p.is_eliminated);
    const eliminatedPlayers = participants.filter((p) => p.is_eliminated);

    // If participant is eliminated
    if (participant.is_eliminated) {
        return (
            <AppLayout>
                <Head title="Battle Royale - Éliminé" />

                <div className="mx-auto max-w-2xl">
                    <Card className="border-red-500 bg-red-50">
                        <CardContent className="p-8 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                                <Skull className="h-10 w-10 text-red-600" />
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-red-800">Vous êtes éliminé !</h1>
                            <p className="mb-4 text-red-600">
                                Round {participant.eliminated_round} - Position finale: #{participant.position}
                            </p>
                            <div className="mb-6 rounded-lg bg-white p-4">
                                <div className="mb-1 text-2xl font-bold text-gray-900">{participant.score} points</div>
                                <div className="text-sm text-muted-foreground">Score final</div>
                            </div>
                            <Button onClick={() => (window.location.href = `/battle-royale/${session.id}/results`)}>Voir les résultats finaux</Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (!currentQuestion) {
        return (
            <AppLayout>
                <Head title="Battle Royale" />
                <div className="flex min-h-screen items-center justify-center">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <Clock className="h-8 w-8 text-blue-600" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold">Prochaine question en cours...</h2>
                            <p className="text-muted-foreground">Préparez-vous pour la bataille !</p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Battle Royale - ${session.name}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Battle Status Header */}
                <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                                    <Flame className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-red-800">{session.name}</h1>
                                    <p className="text-red-600">Round {session.current_round} - Battle Royale</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{activePlayers.length}</div>
                                    <div className="text-sm text-muted-foreground">Survivants</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{eliminatedPlayers.length}</div>
                                    <div className="text-sm text-muted-foreground">Éliminés</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{participant.score}</div>
                                    <div className="text-sm text-muted-foreground">Vos points</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Elimination Warning */}
                <Card className="border-yellow-500 bg-yellow-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                <div>
                                    <div className="font-semibold text-yellow-800">Prochaine élimination dans</div>
                                    <div className="text-sm text-yellow-600">Les joueurs avec les scores les plus bas seront éliminés</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-3xl font-bold text-yellow-800">
                                    {Math.floor(eliminationCountdown / 60)}:{(eliminationCountdown % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="mt-2 h-2 w-32 rounded-full bg-yellow-200">
                                    <div
                                        className={`h-2 rounded-full transition-all ${getEliminationColor()}`}
                                        style={{
                                            width: `${(eliminationCountdown / session.elimination_interval) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Question Area */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Question Timer */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-medium">Temps de réponse</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-mono text-lg font-bold">
                                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-3 w-full rounded-full bg-gray-200">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-1000 ${getTimerColor()}`}
                                        style={{
                                            width: `${(timeLeft / (currentQuestion.time_limit || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Target className="h-3 w-3" />
                                            {currentQuestion.points} pts
                                        </Badge>
                                        {participant.streak > 0 && (
                                            <Badge className="flex items-center gap-1 bg-orange-100 text-orange-800">
                                                <TrendingUp className="h-3 w-3" />
                                                Série: {participant.streak}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {currentQuestion.answers.map((answer) => (
                                    <button
                                        key={answer.id}
                                        onClick={() => handleAnswerSelect(answer.id)}
                                        disabled={hasAnswered || showResults}
                                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                                            selectedAnswers.includes(answer.id)
                                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        } ${hasAnswered || showResults ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                                    selectedAnswers.includes(answer.id) ? 'border-current' : 'border-gray-300'
                                                }`}
                                            >
                                                {selectedAnswers.includes(answer.id) && <div className="h-3 w-3 rounded-full bg-current" />}
                                            </div>
                                            <span className="flex-1">{answer.text}</span>
                                        </div>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        {!hasAnswered && !showResults && (
                            <div className="flex justify-center">
                                <Button
                                    onClick={submitAnswer}
                                    disabled={selectedAnswers.length === 0 || processing}
                                    size="lg"
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    {processing ? 'Envoi...' : 'Valider'}
                                </Button>
                            </div>
                        )}

                        {/* Answer Status */}
                        {hasAnswered && !showResults && (
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                        <Shield className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">Réponse envoyée !</h3>
                                    <p className="text-muted-foreground">Vous survivez pour l'instant...</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Leaderboard */}
                    <div className="space-y-6">
                        {/* Top Survivors */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                    Top Survivants
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {activePlayers
                                        .sort((a, b) => b.score - a.score)
                                        .slice(0, 8)
                                        .map((p, index) => (
                                            <div
                                                key={p.id}
                                                className={`flex items-center gap-3 rounded-lg p-2 ${
                                                    p.is_current_user ? 'border border-blue-200 bg-blue-50' : 'bg-gray-50'
                                                }`}
                                            >
                                                <div
                                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                                        index === 0
                                                            ? 'bg-yellow-500 text-white'
                                                            : index === 1
                                                              ? 'bg-gray-400 text-white'
                                                              : index === 2
                                                                ? 'bg-amber-600 text-white'
                                                                : 'bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={p.avatar_url} />
                                                    <AvatarFallback className="text-xs">{getInitials(p.pseudo)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium">
                                                        {p.pseudo}
                                                        {p.is_current_user && <span className="ml-1 text-blue-600">(Vous)</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold">{p.score}</span>
                                                        {p.streak > 0 && (
                                                            <Badge variant="outline" className="px-1 py-0 text-xs">
                                                                🔥{p.streak}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        {activePlayers.length > 4 && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-800">
                                        <Skull className="h-5 w-5" />
                                        Zone de danger
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 text-sm text-red-600">Les joueurs suivants risquent l'élimination :</p>
                                    <div className="space-y-2">
                                        {activePlayers
                                            .sort((a, b) => a.score - b.score)
                                            .slice(0, Math.ceil(activePlayers.length * 0.25))
                                            .map((p) => (
                                                <div
                                                    key={p.id}
                                                    className={`flex items-center gap-2 rounded border p-2 ${
                                                        p.is_current_user ? 'border-red-400 bg-red-200' : 'border-red-200 bg-red-100'
                                                    }`}
                                                >
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={p.avatar_url} />
                                                        <AvatarFallback className="text-xs">{getInitials(p.pseudo)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-red-800">
                                                            {p.pseudo}
                                                            {p.is_current_user && ' (VOUS)'}
                                                        </div>
                                                        <div className="text-xs text-red-600">{p.score} points</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
