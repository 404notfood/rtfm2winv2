import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BarChart3, Eye, RefreshCw, Skull, Target, Trophy, Users, Zap } from 'lucide-react';

interface Participant {
    id: number;
    pseudo: string;
    avatar?: string;
    final_position: number;
    elimination_round: number;
    survival_time: number;
    correct_answers: number;
    total_answers: number;
    score: number;
}

interface BattleRoyaleSession {
    id: number;
    code: string;
    title: string;
    total_rounds: number;
    current_round: number;
    total_participants: number;
    remaining_participants: number;
    quiz: {
        title: string;
        questions_count: number;
    };
    is_completed: boolean;
}

interface Props {
    session: BattleRoyaleSession;
    participant: Participant;
    eliminatedWith: Participant[];
    topSurvivors: Participant[];
}

export default function BattleRoyaleEliminated({ session, participant, eliminatedWith, topSurvivors }: Props) {
    const accuracyRate = participant.total_answers > 0 ? Math.round((participant.correct_answers / participant.total_answers) * 100) : 0;

    const survivalTimeMinutes = Math.round(participant.survival_time / 60);

    const getPerformanceMessage = () => {
        if (participant.final_position <= 3) return 'Performance exceptionnelle !';
        if (participant.final_position <= 10) return 'Très belle performance !';
        if (participant.final_position <= 20) return 'Bonne performance !';
        if (accuracyRate >= 70) return 'Bon taux de réussite !';
        return 'Continuez à vous entraîner !';
    };

    const getPositionColor = () => {
        if (participant.final_position <= 3) return 'text-yellow-600';
        if (participant.final_position <= 10) return 'text-green-600';
        if (participant.final_position <= 20) return 'text-blue-600';
        return 'text-gray-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-orange-50">
            <Head title={`Éliminé - ${session.title}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-gray-500">
                            <Skull className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-red-600">Éliminé !</h1>
                            <p className="text-muted-foreground">
                                {session.title} • Round {participant.elimination_round}/{session.total_rounds}
                            </p>
                        </div>
                    </div>

                    <Badge variant="destructive" className="px-4 py-2 text-lg">
                        Position #{participant.final_position} sur {session.total_participants}
                    </Badge>
                </motion.div>

                {/* Elimination Summary */}
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Target className="h-6 w-6 text-red-500" />
                                Votre Performance
                            </CardTitle>
                            <CardDescription className="text-lg font-medium text-red-700">{getPerformanceMessage()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Player Info */}
                                <div className="flex items-center justify-center gap-4 rounded-lg bg-white/50 p-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={participant.avatar} />
                                        <AvatarFallback className="text-2xl">{participant.pseudo.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <div className="text-xl font-bold">{participant.pseudo}</div>
                                        <div className={`text-lg font-semibold ${getPositionColor()}`}>
                                            #{participant.final_position} / {session.total_participants}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="rounded-lg bg-white/50 p-3 text-center">
                                        <div className="text-2xl font-bold text-red-600">{participant.score}</div>
                                        <div className="text-sm text-muted-foreground">Score final</div>
                                    </div>
                                    <div className="rounded-lg bg-white/50 p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{accuracyRate}%</div>
                                        <div className="text-sm text-muted-foreground">Précision</div>
                                    </div>
                                    <div className="rounded-lg bg-white/50 p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{survivalTimeMinutes}m</div>
                                        <div className="text-sm text-muted-foreground">Survie</div>
                                    </div>
                                    <div className="rounded-lg bg-white/50 p-3 text-center">
                                        <div className="text-2xl font-bold text-purple-600">{participant.correct_answers}</div>
                                        <div className="text-sm text-muted-foreground">Bonnes rép.</div>
                                    </div>
                                </div>

                                {/* Detailed Stats */}
                                <div className="space-y-2 rounded-lg bg-white/50 p-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Éliminé au round</span>
                                        <span className="font-medium">
                                            {participant.elimination_round}/{session.total_rounds}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Réponses correctes</span>
                                        <span className="font-medium">
                                            {participant.correct_answers}/{participant.total_answers}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Temps de survie</span>
                                        <span className="font-medium">
                                            {Math.floor(participant.survival_time / 60)}m {participant.survival_time % 60}s
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Eliminated With */}
                    {eliminatedWith.length > 0 && (
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Éliminés avec vous (Round {participant.elimination_round})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {eliminatedWith.map((p, index) => (
                                            <div key={p.id} className="flex items-center justify-between rounded bg-muted/50 p-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={p.avatar} />
                                                        <AvatarFallback className="text-xs">{p.pseudo.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-medium">{p.pseudo}</div>
                                                        <div className="text-xs text-muted-foreground">#{p.final_position}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">{p.score} pts</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {Math.round((p.correct_answers / p.total_answers) * 100)}% précision
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Top Survivors */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    {session.is_completed ? 'Podium final' : 'Top survivants'}
                                </CardTitle>
                                <CardDescription>
                                    {session.is_completed
                                        ? "Les guerriers qui ont survécu jusqu'à la fin"
                                        : `${session.remaining_participants} guerriers encore en vie`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topSurvivors.slice(0, 5).map((survivor, index) => (
                                        <div key={survivor.id} className="flex items-center justify-between rounded bg-muted/50 p-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center">
                                                    {index === 0 && session.is_completed && <Trophy className="h-5 w-5 text-yellow-500" />}
                                                    {index === 1 && session.is_completed && <Trophy className="h-4 w-4 text-gray-400" />}
                                                    {index === 2 && session.is_completed && <Trophy className="h-4 w-4 text-amber-600" />}
                                                    {(index > 2 || !session.is_completed) && (
                                                        <span className="text-sm font-bold">#{survivor.final_position}</span>
                                                    )}
                                                </div>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={survivor.avatar} />
                                                    <AvatarFallback className="text-xs">{survivor.pseudo.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium">{survivor.pseudo}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {session.is_completed ? 'Survivant' : `Round ${session.current_round}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{survivor.score} pts</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {survivor.correct_answers}/{survivor.total_answers} correct
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Battle Status */}
                {!session.is_completed && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                    La bataille continue !
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{session.current_round}</div>
                                        <div className="text-sm text-muted-foreground">Round actuel</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{session.remaining_participants}</div>
                                        <div className="text-sm text-muted-foreground">Survivants</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">{session.total_rounds - session.current_round}</div>
                                        <div className="text-sm text-muted-foreground">Rounds restants</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <Button variant="outline" asChild>
                        <Link href="/battle-royale">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux batailles
                        </Link>
                    </Button>

                    {!session.is_completed && (
                        <Button variant="outline" asChild>
                            <Link href={`/battle-royale/${session.code}/arena`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Suivre la bataille
                            </Link>
                        </Button>
                    )}

                    {session.is_completed && (
                        <Button variant="outline" asChild>
                            <Link href={`/battle-royale/${session.code}/results`}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Résultats complets
                            </Link>
                        </Button>
                    )}

                    <Button asChild>
                        <Link href="/battle-royale/create">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Nouvelle bataille
                        </Link>
                    </Button>
                </motion.div>

                {/* Motivation Message */}
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7 }}>
                    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                        <CardContent className="py-6 text-center">
                            <Award className="mx-auto mb-3 h-12 w-12 text-yellow-600" />
                            <h3 className="mb-2 text-lg font-bold">Bien joué, guerrier !</h3>
                            <p className="mb-4 text-muted-foreground">
                                Vous avez survécu {participant.elimination_round - 1} rounds et terminé à la position #{participant.final_position}.
                                {accuracyRate >= 70
                                    ? ' Votre précision est excellente !'
                                    : ' Continuez à vous entraîner pour améliorer votre précision !'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Chaque bataille vous rend plus fort. Revenez bientôt pour une nouvelle aventure !
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
