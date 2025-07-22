import { TournamentBracket as BracketComponent } from '@/components/tournament/tournament-bracket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Crown, Play, Target, Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TournamentParticipant {
    id: number;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    joined_at: string;
    eliminated_at?: string;
    final_position?: number;
}

interface TournamentMatch {
    id: number;
    round: number;
    match_order: number;
    participant1?: TournamentParticipant;
    participant2?: TournamentParticipant;
    winner?: TournamentParticipant;
    score1?: number;
    score2?: number;
    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;
    status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
}

interface TournamentData {
    id: number;
    title: string;
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
    status: 'upcoming' | 'active' | 'completed';
    max_participants: number;
    current_round: number;
    started_at?: string;
    ended_at?: string;
    creator: {
        id: number;
        name: string;
    };
    quiz: {
        id: number;
        title: string;
    };
    participants: TournamentParticipant[];
    matches: TournamentMatch[];
    winner?: TournamentParticipant;
}

interface Props {
    tournament: TournamentData;
    can_manage: boolean;
    brackets: Record<string, TournamentMatch[]>;
}

export default function TournamentBracket({ tournament, can_manage, brackets }: Props) {
    const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
    const { post, processing } = useForm();

    // Real-time updates
    useEffect(() => {
        const channel = window.Echo?.join(`tournament.${tournament.id}`);

        channel?.listen('MatchStarted', () => {
            // Update match status
            window.location.reload();
        });

        channel?.listen('MatchCompleted', () => {
            // Update match results
            window.location.reload();
        });

        channel?.listen('TournamentCompleted', () => {
            // Update tournament status
            window.location.reload();
        });

        return () => {
            window.Echo?.leaveChannel(`tournament.${tournament.id}`);
        };
    }, [tournament.id]);

    const handleStartMatch = (matchId: number) => {
        if (confirm('Démarrer ce match ?')) {
            post(`/tournaments/${tournament.id}/matches/${matchId}/start`);
        }
    };

    const getParticipantStats = (participant: TournamentParticipant) => {
        const wins = tournament.matches.filter((m) => m.winner?.id === participant.id).length;

        const losses = tournament.matches.filter(
            (m) =>
                (m.participant1?.id === participant.id || m.participant2?.id === participant.id) && m.winner?.id !== participant.id && m.completed_at,
        ).length;

        return { wins, losses };
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getStatusBadge = () => {
        switch (tournament.status) {
            case 'upcoming':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        À venir
                    </Badge>
                );
            case 'active':
                return <Badge className="bg-green-100 text-green-800">En cours</Badge>;
            case 'completed':
                return <Badge variant="secondary">Terminé</Badge>;
        }
    };

    const getTypeName = () => {
        switch (tournament.type) {
            case 'single_elimination':
                return 'Élimination simple';
            case 'double_elimination':
                return 'Élimination double';
            case 'round_robin':
                return 'Round Robin';
        }
    };

    return (
        <AppLayout>
            <Head title={`Bracket - ${tournament.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{tournament.title}</h1>
                        <p className="text-muted-foreground">
                            Bracket {getTypeName()} - {tournament.quiz.title}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge()}
                        {tournament.status === 'active' && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Round {tournament.current_round}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Tournament Info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{tournament.participants.length}</div>
                            <div className="text-sm text-muted-foreground">Participants</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{tournament.matches.filter((m) => m.completed_at).length}</div>
                            <div className="text-sm text-muted-foreground">Matches terminés</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{tournament.current_round}</div>
                            <div className="text-sm text-muted-foreground">Round actuel</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{tournament.participants.filter((p) => !p.eliminated_at).length}</div>
                            <div className="text-sm text-muted-foreground">Encore en course</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Winner */}
                {tournament.winner && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center gap-4">
                                <Crown className="h-8 w-8 text-yellow-600" />
                                <div className="text-center">
                                    <h2 className="mb-2 text-2xl font-bold text-yellow-800">Vainqueur du tournoi !</h2>
                                    <div className="flex items-center justify-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-yellow-400">
                                            <AvatarImage src={tournament.winner.user.avatar} />
                                            <AvatarFallback className="bg-yellow-100 font-bold text-yellow-800">
                                                {getInitials(tournament.winner.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-xl font-semibold text-yellow-800">{tournament.winner.user.name}</div>
                                            <div className="text-sm text-yellow-600">Champion du tournoi</div>
                                        </div>
                                    </div>
                                </div>
                                <Trophy className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                    {/* Bracket */}
                    <div className="xl:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Bracket du tournoi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BracketComponent
                                    tournament={tournament}
                                    brackets={brackets}
                                    onMatchSelect={(match) => setSelectedMatch(match as any)}
                                    onStartMatch={can_manage ? handleStartMatch : undefined}
                                    canManage={can_manage}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Current Match */}
                        {selectedMatch && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Match sélectionné</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="mb-2 text-sm text-muted-foreground">
                                                Round {selectedMatch.round} - Match {selectedMatch.match_order}
                                            </div>
                                            <Badge variant="outline" className="capitalize">
                                                {selectedMatch.status}
                                            </Badge>
                                        </div>

                                        {/* Participants */}
                                        <div className="space-y-3">
                                            {selectedMatch.participant1 && (
                                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={selectedMatch.participant1.user.avatar} />
                                                        <AvatarFallback>{getInitials(selectedMatch.participant1.user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{selectedMatch.participant1.user.name}</div>
                                                        {selectedMatch.score1 !== undefined && (
                                                            <div className="text-sm text-muted-foreground">Score: {selectedMatch.score1}</div>
                                                        )}
                                                    </div>
                                                    {selectedMatch.winner?.id === selectedMatch.participant1.id && (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    )}
                                                </div>
                                            )}

                                            <div className="text-center text-sm text-muted-foreground">VS</div>

                                            {selectedMatch.participant2 && (
                                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={selectedMatch.participant2.user.avatar} />
                                                        <AvatarFallback>{getInitials(selectedMatch.participant2.user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{selectedMatch.participant2.user.name}</div>
                                                        {selectedMatch.score2 !== undefined && (
                                                            <div className="text-sm text-muted-foreground">Score: {selectedMatch.score2}</div>
                                                        )}
                                                    </div>
                                                    {selectedMatch.winner?.id === selectedMatch.participant2.id && (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Match Actions */}
                                        {can_manage && selectedMatch.status === 'pending' && (
                                            <Button onClick={() => handleStartMatch(selectedMatch.id)} className="w-full" disabled={processing}>
                                                <Play className="mr-2 h-4 w-4" />
                                                Démarrer le match
                                            </Button>
                                        )}

                                        {/* Timing */}
                                        {selectedMatch.scheduled_at && (
                                            <div className="text-center text-xs text-muted-foreground">
                                                <Clock className="mr-1 inline h-3 w-3" />
                                                Programmé: {new Date(selectedMatch.scheduled_at).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Participants List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Participants ({tournament.participants.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-96 space-y-2 overflow-y-auto">
                                    {tournament.participants
                                        .sort((a, b) => {
                                            if (a.eliminated_at && !b.eliminated_at) return 1;
                                            if (!a.eliminated_at && b.eliminated_at) return -1;
                                            if (a.final_position && b.final_position) {
                                                return a.final_position - b.final_position;
                                            }
                                            return 0;
                                        })
                                        .map((participant, index) => {
                                            const stats = getParticipantStats(participant);

                                            return (
                                                <div
                                                    key={participant.id}
                                                    className={`flex items-center gap-3 rounded-lg p-2 ${
                                                        participant.eliminated_at ? 'opacity-60' : ''
                                                    }`}
                                                >
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                        {participant.final_position || index + 1}
                                                    </div>
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={participant.user.avatar} />
                                                        <AvatarFallback>{getInitials(participant.user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate font-medium">{participant.user.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {stats.wins}V - {stats.losses}D
                                                        </div>
                                                    </div>
                                                    {participant.eliminated_at ? (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Éliminé
                                                        </Badge>
                                                    ) : tournament.winner?.id === participant.id ? (
                                                        <Crown className="h-4 w-4 text-yellow-500" />
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">
                                                            Actif
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
