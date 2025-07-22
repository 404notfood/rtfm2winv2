import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Download, RefreshCw, Share2, Skull, Trophy, Users } from 'lucide-react';

interface Participant {
    id: number;
    pseudo: string;
    avatar?: string;
    final_position: number;
    elimination_round?: number;
    survival_time: number;
    correct_answers: number;
    total_answers: number;
    score: number;
    prize_earned?: number;
}

interface BattleRoyaleSession {
    id: number;
    code: string;
    title: string;
    total_rounds: number;
    total_participants: number;
    quiz: {
        title: string;
        questions_count: number;
    };
    ended_at: string;
    duration: number;
}

interface Props {
    session: BattleRoyaleSession;
    participants: Participant[];
    currentUser?: { participant_id: number };
    winner: Participant;
}

export default function BattleRoyaleResults({ session, participants, currentUser, winner }: Props) {
    const currentParticipant = currentUser ? participants.find((p) => p.id === currentUser.participant_id) : null;

    const topThree = participants.slice(0, 3);
    const eliminated = participants.slice(3);

    const getRankIcon = (position: number) => {
        switch (position) {
            case 1:
                return <Crown className="h-8 w-8 text-yellow-500" />;
            case 2:
                return <Trophy className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Trophy className="h-6 w-6 text-amber-600" />;
            default:
                return <Skull className="h-5 w-5 text-red-500" />;
        }
    };

    return (
        <AppLayout>
            <Head title={`Résultats Battle Royale - ${session.title}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/battle-royale">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux batailles
                        </Link>
                    </Button>

                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-2">
                        <h1 className="text-4xl font-bold">Bataille Terminée</h1>
                        <p className="text-muted-foreground">
                            {session.title} • {session.total_participants} guerriers • {session.total_rounds} rounds
                        </p>
                    </motion.div>
                </div>

                {/* Winner Spotlight */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                        <CardHeader className="text-center">
                            <div className="mb-4 flex items-center justify-center gap-3">
                                <Crown className="h-12 w-12 text-yellow-500" />
                                <div>
                                    <CardTitle className="text-3xl">Champion!</CardTitle>
                                    <CardDescription className="text-lg">{winner.pseudo} a survécu à la bataille</CardDescription>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Avatar className="mx-auto h-24 w-24">
                                    <AvatarImage src={winner.avatar} />
                                    <AvatarFallback className="text-2xl">{winner.pseudo.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <div className="mx-auto grid max-w-md grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{winner.score}</div>
                                        <div className="text-sm text-muted-foreground">Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{Math.round(winner.survival_time / 60)}m</div>
                                        <div className="text-sm text-muted-foreground">Survie</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{winner.correct_answers}</div>
                                        <div className="text-sm text-muted-foreground">Bonnes rép.</div>
                                    </div>
                                </div>

                                {winner.prize_earned && (
                                    <Badge className="bg-yellow-100 px-4 py-2 text-lg text-yellow-800">
                                        🏆 {winner.prize_earned.toLocaleString()} points gagnés
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Podium */}
                {topThree.length >= 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Podium des Survivants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-center gap-8">
                                {/* 2nd Place */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-center"
                                >
                                    <div className="relative flex h-32 flex-col justify-end rounded-lg bg-gray-100 p-4">
                                        <Trophy className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                        <Badge className="absolute top-2 right-2 bg-gray-100 text-gray-800">2ème</Badge>
                                    </div>
                                    <div className="mt-4">
                                        <div className="font-bold">{topThree[1]?.pseudo}</div>
                                        <div className="text-sm text-muted-foreground">{topThree[1]?.score} pts</div>
                                    </div>
                                </motion.div>

                                {/* 1st Place */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center"
                                >
                                    <div className="relative flex h-40 flex-col justify-end rounded-lg bg-yellow-100 p-4">
                                        <Crown className="mx-auto mb-2 h-10 w-10 text-yellow-500" />
                                        <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">1er</Badge>
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-lg font-bold">{topThree[0]?.pseudo}</div>
                                        <div className="font-semibold text-primary">{topThree[0]?.score} pts</div>
                                    </div>
                                </motion.div>

                                {/* 3rd Place */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-center"
                                >
                                    <div className="relative flex h-28 flex-col justify-end rounded-lg bg-amber-100 p-4">
                                        <Trophy className="mx-auto mb-2 h-7 w-7 text-amber-600" />
                                        <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-800">3ème</Badge>
                                    </div>
                                    <div className="mt-4">
                                        <div className="font-bold">{topThree[2]?.pseudo}</div>
                                        <div className="text-sm text-muted-foreground">{topThree[2]?.score} pts</div>
                                    </div>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Your Performance */}
                {currentParticipant && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Votre Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                                <div className="flex items-center gap-3">
                                    {getRankIcon(currentParticipant.final_position)}
                                    <div>
                                        <div className="font-medium">{currentParticipant.pseudo}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Position #{currentParticipant.final_position} sur {session.total_participants}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">{currentParticipant.score} pts</div>
                                    <div className="text-sm text-muted-foreground">
                                        {currentParticipant.elimination_round ? `Éliminé round ${currentParticipant.elimination_round}` : 'Survivant'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Full Results */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Classement Complet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {participants.map((participant, index) => (
                                <motion.div
                                    key={participant.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between rounded-lg border p-3 ${
                                        currentParticipant?.id === participant.id ? 'border-primary/20 bg-primary/10' : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {getRankIcon(participant.final_position)}

                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={participant.avatar} />
                                            <AvatarFallback>{participant.pseudo.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{participant.pseudo}</span>
                                                {currentParticipant?.id === participant.id && <Badge variant="secondary">Vous</Badge>}
                                                {participant.final_position <= 3 && (
                                                    <Badge className="bg-yellow-100 text-yellow-800">Survivant</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {participant.correct_answers}/{participant.total_answers} bonnes réponses
                                                {participant.elimination_round && <span> • Éliminé round {participant.elimination_round}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold">{participant.score}</div>
                                        <div className="text-sm text-muted-foreground">{Math.round(participant.survival_time / 60)}m survie</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager
                    </Button>

                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter PDF
                    </Button>

                    <Button asChild>
                        <Link href="/battle-royale/create">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Nouvelle bataille
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
