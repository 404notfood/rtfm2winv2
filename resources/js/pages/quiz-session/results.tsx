import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BarChart3, CheckCircle, Download, Medal, RefreshCw, Share2, TrendingUp, Trophy, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Participant {
    id: number;
    user_id?: number;
    pseudo: string;
    score: number;
    final_position: number;
    accuracy: number;
    average_time: number;
    correct_answers: number;
    total_answers: number;
    avatar?: string;
    is_presenter: boolean;
}

interface QuestionResult {
    id: number;
    text: string;
    correct_answer: string;
    user_answer?: string;
    is_correct: boolean;
    points_earned: number;
    response_time: number;
}

interface QuizSession {
    id: number;
    code: string;
    status: 'waiting' | 'active' | 'completed';
    started_at: string;
    ended_at?: string;
    quiz: {
        id: number;
        title: string;
        description?: string;
        total_questions: number;
        total_points: number;
    };
    participants_count: number;
    average_score: number;
}

interface Props {
    session: QuizSession;
    participant: Participant;
    leaderboard: Participant[];
    questionResults: QuestionResult[];
    globalStats: {
        total_participants: number;
        completion_rate: number;
        average_time: number;
        top_score: number;
    };
    canRetry: boolean;
}

export default function QuizResults({ session, participant, leaderboard, questionResults, globalStats, canRetry }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'leaderboard'>('overview');

    const scorePercentage = (participant.score / session.quiz.total_points) * 100;
    const position = participant.final_position;
    const isTopThree = position <= 3;

    const getRankIcon = (pos: number) => {
        switch (pos) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Award className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="flex h-6 w-6 items-center justify-center text-lg font-bold">#{pos}</span>;
        }
    };

    const getPerformanceColor = (accuracy: number) => {
        if (accuracy >= 80) return 'text-green-600';
        if (accuracy >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceLabel = (accuracy: number) => {
        if (accuracy >= 90) return 'Excellent';
        if (accuracy >= 80) return 'Très bien';
        if (accuracy >= 70) return 'Bien';
        if (accuracy >= 60) return 'Correct';
        return 'À améliorer';
    };

    const shareResults = () => {
        if (navigator.share) {
            navigator.share({
                title: `Résultats Quiz - ${session.quiz.title}`,
                text: `J'ai terminé ${position}${position === 1 ? 'er' : 'ème'} avec ${participant.score} points ! (${participant.accuracy}% de bonnes réponses)`,
                url: window.location.href,
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Résultats - ${session.quiz.title}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au dashboard
                            </Link>
                        </Button>
                    </div>

                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-2">
                        <h1 className="text-4xl font-bold">{session.quiz.title}</h1>
                        <p className="text-muted-foreground">Session terminée • Code: {session.code}</p>
                    </motion.div>

                    {/* Main Result Card */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card className={`mx-auto max-w-2xl ${isTopThree ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' : ''}`}>
                            <CardHeader className="text-center">
                                <div className="mb-4 flex items-center justify-center gap-3">
                                    {getRankIcon(position)}
                                    <div>
                                        <CardTitle className="text-2xl">
                                            {position === 1 ? 'Félicitations !' : `${position}${position === 1 ? 'er' : 'ème'} place`}
                                        </CardTitle>
                                        <CardDescription>
                                            {participant.pseudo} • {participant.correct_answers}/{participant.total_answers} bonnes réponses
                                        </CardDescription>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-4xl font-bold text-primary">{participant.score.toLocaleString()} points</div>
                                    <Progress value={scorePercentage} className="h-3" />
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>0</span>
                                        <span className={getPerformanceColor(participant.accuracy)}>
                                            {participant.accuracy}% • {getPerformanceLabel(participant.accuracy)}
                                        </span>
                                        <span>{session.quiz.total_points.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{participant.correct_answers}</div>
                            <div className="text-sm text-muted-foreground">Bonnes réponses</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{Math.round(participant.average_time)}s</div>
                            <div className="text-sm text-muted-foreground">Temps moyen</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">#{position}</div>
                            <div className="text-sm text-muted-foreground">Position</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{globalStats.total_participants}</div>
                            <div className="text-sm text-muted-foreground">Participants</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center">
                    <div className="flex rounded-lg bg-muted p-1">
                        <Button variant={activeTab === 'overview' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('overview')}>
                            Vue d'ensemble
                        </Button>
                        <Button variant={activeTab === 'details' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('details')}>
                            Détails des questions
                        </Button>
                        <Button variant={activeTab === 'leaderboard' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('leaderboard')}>
                            Classement
                        </Button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Performance Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Analyse de performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Précision</span>
                                        <span className={getPerformanceColor(participant.accuracy)}>{participant.accuracy}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Temps de réponse moyen</span>
                                        <span>{Math.round(participant.average_time)}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Score par question</span>
                                        <span>{Math.round(participant.score / session.quiz.total_questions)} pts/q</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Classement</span>
                                        <span>
                                            {position}/{globalStats.total_participants}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Global Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Statistiques globales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Participants total</span>
                                        <span>{globalStats.total_participants}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taux de completion</span>
                                        <span>{globalStats.completion_rate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Temps moyen global</span>
                                        <span>{Math.round(globalStats.average_time)}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Meilleur score</span>
                                        <span>{globalStats.top_score} pts</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Détail des réponses</CardTitle>
                                <CardDescription>Revoyez vos réponses question par question</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {questionResults.map((result, index) => (
                                    <div key={result.id} className="rounded-lg border p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                                                    {result.is_correct ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <span className="text-sm text-muted-foreground">{result.response_time}s</span>
                                                </div>
                                                <h4 className="mb-2 font-medium">{result.text}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-primary">+{result.points_earned} pts</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div
                                                className={`rounded p-2 text-sm ${
                                                    result.is_correct
                                                        ? 'border border-green-200 bg-green-50 text-green-800'
                                                        : 'border border-red-200 bg-red-50 text-red-800'
                                                }`}
                                            >
                                                <strong>Votre réponse :</strong> {result.user_answer || 'Non répondu'}
                                            </div>
                                            {!result.is_correct && (
                                                <div className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800">
                                                    <strong>Bonne réponse :</strong> {result.correct_answer}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Classement final
                            </CardTitle>
                            <CardDescription>Top des participants de cette session</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {leaderboard.slice(0, 10).map((p) => (
                                    <div
                                        key={p.id}
                                        className={`flex items-center justify-between rounded-lg p-3 ${
                                            p.id === participant.id ? 'border border-primary/20 bg-primary/10' : 'bg-muted/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {getRankIcon(p.final_position)}
                                            <div>
                                                <div className="font-medium">
                                                    {p.pseudo}
                                                    {p.id === participant.id && (
                                                        <Badge variant="outline" className="ml-2">
                                                            Vous
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {p.accuracy}% de réussite • {p.correct_answers}/{p.total_answers}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{p.score.toLocaleString()} pts</div>
                                            <div className="text-sm text-muted-foreground">{Math.round(p.average_time)}s moy.</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={shareResults}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager les résultats
                    </Button>

                    <Button variant="outline" asChild>
                        <Link href={`/quiz/session/${session.code}/export-pdf`}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger PDF
                        </Link>
                    </Button>

                    {canRetry && (
                        <Button asChild>
                            <Link href={`/quiz/${session.quiz.id}`}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Rejouer
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
