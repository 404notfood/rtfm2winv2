import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BarChart3, Clock, Crown, Download, Medal, RefreshCw, Star, Target, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface Participant {
    position: number;
    id: number;
    nickname: string;
    avatar?: string;
    score: number;
    correct_answers: number;
    total_answers: number;
    accuracy: number;
    avg_response_time: number;
    is_active: boolean;
    joined_at: string;
}

interface QuizSession {
    id: number;
    code: string;
    status: 'waiting' | 'active' | 'completed';
    current_question_index: number;
    quiz: {
        title: string;
        total_questions: number;
    };
    progress: number;
}

interface Stats {
    total_participants: number;
    average_score: number;
    highest_score: number;
    active_participants: number;
}

interface Props {
    session: QuizSession;
    leaderboard: Participant[];
    stats: Stats;
}

export default function QuizLeaderboard({ session, leaderboard, stats }: Props) {
    const [filter, setFilter] = useState<'all' | 'top10'>('all');
    const [sortBy, setSortBy] = useState<'score' | 'accuracy' | 'speed'>('score');

    const getRankIcon = (position: number) => {
        switch (position) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Award className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="flex h-6 w-6 items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
        }
    };

    const getPerformanceColor = (accuracy: number) => {
        if (accuracy >= 90) return 'text-green-600';
        if (accuracy >= 80) return 'text-blue-600';
        if (accuracy >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceBadge = (participant: Participant) => {
        const badges = [];

        if (participant.position === 1) {
            badges.push(
                <Badge key="winner" className="bg-yellow-100 text-yellow-800">
                    <Crown className="mr-1 h-3 w-3" />
                    Champion
                </Badge>,
            );
        }

        if (participant.accuracy === 100) {
            badges.push(
                <Badge key="perfect" className="bg-green-100 text-green-800">
                    <Star className="mr-1 h-3 w-3" />
                    Parfait
                </Badge>,
            );
        }

        if (participant.avg_response_time <= 3) {
            badges.push(
                <Badge key="fastest" className="bg-blue-100 text-blue-800">
                    <Clock className="mr-1 h-3 w-3" />
                    Rapide
                </Badge>,
            );
        }

        return badges;
    };

    const sortedParticipants = [...leaderboard].sort((a, b) => {
        switch (sortBy) {
            case 'accuracy':
                return b.accuracy - a.accuracy;
            case 'speed':
                return a.avg_response_time - b.avg_response_time;
            default:
                return a.position - b.position;
        }
    });

    const filteredParticipants = sortedParticipants.filter((participant) => {
        switch (filter) {
            case 'top10':
                return participant.position <= 10;
            default:
                return true;
        }
    });

    const topThree = leaderboard.slice(0, 3);

    return (
        <AppLayout>
            <Head title={`Classement - ${session.quiz.title}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={currentUser?.is_presenter ? `/quiz/${session.quiz.id}` : '/dashboard'}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {currentUser?.is_presenter ? 'Retour au quiz' : 'Retour au dashboard'}
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">Classement {session.status === 'active' ? 'En Temps Réel' : 'Final'}</h1>
                        <p className="text-muted-foreground">
                            {session.quiz.title} • Session {session.code} • {stats.total_participants} participants
                        </p>
                        {session.status === 'active' && (
                            <p className="text-sm text-blue-600">
                                Progression: {session.current_question_index + 1}/{session.quiz.total_questions} questions ({session.progress}%)
                            </p>
                        )}
                    </div>
                </div>

                {/* Podium */}
                {topThree.length >= 3 && (
                    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Trophy className="h-6 w-6 text-yellow-500" />
                                Podium
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-center gap-8">
                                {/* 2nd Place */}
                                {topThree[1] && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-center"
                                    >
                                        <div className="relative flex h-32 flex-col justify-end rounded-lg bg-gray-100 p-4">
                                            <Medal className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                            <Badge className="absolute top-2 right-2 bg-gray-100 text-gray-800">2ème</Badge>
                                        </div>
                                        <div className="mt-4">
                                            <div className="font-bold">{topThree[1].nickname}</div>
                                            <div className="text-sm text-muted-foreground">{topThree[1].score.toLocaleString()} pts</div>
                                            <div className="text-xs text-muted-foreground">{topThree[1].accuracy}%</div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 1st Place */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-center"
                                >
                                    <div className="relative flex h-40 flex-col justify-end rounded-lg bg-yellow-100 p-4">
                                        <Trophy className="mx-auto mb-2 h-10 w-10 text-yellow-500" />
                                        <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">1er</Badge>
                                        <Crown className="absolute top-2 left-2 h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-lg font-bold">{topThree[0].nickname}</div>
                                        <div className="font-semibold text-primary">{topThree[0].score.toLocaleString()} pts</div>
                                        <div className="text-sm text-green-600">{topThree[0].accuracy}% de réussite</div>
                                    </div>
                                </motion.div>

                                {/* 3rd Place */}
                                {topThree[2] && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-center"
                                    >
                                        <div className="relative flex h-28 flex-col justify-end rounded-lg bg-amber-100 p-4">
                                            <Award className="mx-auto mb-2 h-7 w-7 text-amber-600" />
                                            <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-800">3ème</Badge>
                                        </div>
                                        <div className="mt-4">
                                            <div className="font-bold">{topThree[2].nickname}</div>
                                            <div className="text-sm text-muted-foreground">{topThree[2].score.toLocaleString()} pts</div>
                                            <div className="text-xs text-muted-foreground">{topThree[2].accuracy}%</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Statistics Overview */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_participants}</div>
                            <div className="text-sm text-muted-foreground">Participants</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{Math.round(stats.average_score)}</div>
                            <div className="text-sm text-muted-foreground">Score moyen</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.highest_score}</div>
                            <div className="text-sm text-muted-foreground">Score le plus élevé</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.active_participants}</div>
                            <div className="text-sm text-muted-foreground">Participants actifs</div>
                        </CardContent>
                    </Card>
                </div>


                {/* Filters and Sort */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
                            Tous ({leaderboard.length})
                        </Button>
                        <Button variant={filter === 'top10' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('top10')}>
                            Top 10
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant={sortBy === 'score' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('score')}>
                            <Target className="mr-1 h-4 w-4" />
                            Score
                        </Button>
                        <Button variant={sortBy === 'accuracy' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('accuracy')}>
                            <BarChart3 className="mr-1 h-4 w-4" />
                            Précision
                        </Button>
                        <Button variant={sortBy === 'speed' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('speed')}>
                            <Clock className="mr-1 h-4 w-4" />
                            Rapidité
                        </Button>
                    </div>
                </div>

                {/* Full Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Classement complet
                        </CardTitle>
                        <CardDescription>{filteredParticipants.length} participants affichés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {filteredParticipants.map((participant, index) => (
                                <motion.div
                                    key={participant.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-center gap-4">
                                        {getRankIcon(participant.position)}

                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={participant.avatar} />
                                            <AvatarFallback>{participant.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{participant.nickname}</span>
                                                {!participant.is_active && <Badge variant="secondary">Déconnecté</Badge>}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {participant.correct_answers}/{participant.total_answers} correctes •{' '}
                                                <span className={getPerformanceColor(participant.accuracy)}>{participant.accuracy}%</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1">{getPerformanceBadge(participant)}</div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-bold">{participant.score.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">{Math.round(participant.avg_response_time)}s moy.</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href={`/quiz/session/${session.code}/export-pdf`}>
                            <Download className="mr-2 h-4 w-4" />
                            Exporter le classement
                        </Link>
                    </Button>

                    {currentUser?.is_presenter && (
                        <Button asChild>
                            <Link href={`/quiz/${session.quiz.id}/sessions`}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Nouvelle session
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
