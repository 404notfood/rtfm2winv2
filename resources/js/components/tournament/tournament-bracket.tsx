import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Play, Trophy, User } from 'lucide-react';

interface BracketBracketParticipant {
    id: number;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    eliminated_at?: string;
}

interface BracketMatch {
    id: number;
    round: number;
    match_order: number;
    participant1?: BracketBracketParticipant;
    participant2?: BracketBracketParticipant;
    winner?: BracketBracketParticipant;
    score1?: number;
    score2?: number;
    status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;
}

interface BracketTournament {
    id: number;
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
    status: 'upcoming' | 'active' | 'completed';
    current_round: number;
}

interface Props {
    tournament: BracketTournament;
    brackets: Record<string, BracketMatch[]>;
    onMatchSelect?: (match: BracketMatch) => void;
    onStartMatch?: (matchId: number) => void;
    canManage: boolean;
}

export function TournamentBracket({ tournament, brackets, onMatchSelect, onStartMatch, canManage }: Props) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getMatchStatusColor = (match: BracketMatch) => {
        switch (match.status) {
            case 'completed':
                return 'border-green-500 bg-green-50';
            case 'in_progress':
                return 'border-blue-500 bg-blue-50';
            case 'scheduled':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-gray-300 bg-white';
        }
    };

    const MatchCard = ({ match }: { match: BracketMatch }) => (
        <div
            className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${getMatchStatusColor(match)}`}
            onClick={() => onMatchSelect?.(match)}
        >
            <div className="space-y-3">
                {/* Match Header */}
                <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">
                        R{match.round} - M{match.match_order}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                            {match.status}
                        </Badge>
                        {canManage && match.status === 'pending' && onStartMatch && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartMatch(match.id);
                                }}
                                className="h-6 px-2"
                            >
                                <Play className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* BracketParticipants */}
                <div className="space-y-2">
                    {/* BracketParticipant 1 */}
                    <div
                        className={`flex items-center gap-2 rounded p-2 ${
                            match.winner?.id === match.participant1?.id ? 'border border-green-300 bg-green-100' : 'bg-gray-50'
                        }`}
                    >
                        {match.participant1 ? (
                            <>
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={match.participant1.user.avatar} />
                                    <AvatarFallback className="text-xs">{getInitials(match.participant1.user.name)}</AvatarFallback>
                                </Avatar>
                                <span className="flex-1 truncate text-sm font-medium">{match.participant1.user.name}</span>
                                {match.score1 !== undefined && <span className="text-sm font-bold">{match.score1}</span>}
                                {match.winner?.id === match.participant1.id && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-6 w-6" />
                                <span className="text-sm">En attente...</span>
                            </div>
                        )}
                    </div>

                    {/* VS */}
                    <div className="text-center text-xs text-muted-foreground">VS</div>

                    {/* BracketParticipant 2 */}
                    <div
                        className={`flex items-center gap-2 rounded p-2 ${
                            match.winner?.id === match.participant2?.id ? 'border border-green-300 bg-green-100' : 'bg-gray-50'
                        }`}
                    >
                        {match.participant2 ? (
                            <>
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={match.participant2.user.avatar} />
                                    <AvatarFallback className="text-xs">{getInitials(match.participant2.user.name)}</AvatarFallback>
                                </Avatar>
                                <span className="flex-1 truncate text-sm font-medium">{match.participant2.user.name}</span>
                                {match.score2 !== undefined && <span className="text-sm font-bold">{match.score2}</span>}
                                {match.winner?.id === match.participant2.id && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-6 w-6" />
                                <span className="text-sm">En attente...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Timing */}
                {match.scheduled_at && (
                    <div className="text-center text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(match.scheduled_at).toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );

    // Round Robin Layout
    if (tournament.type === 'round_robin') {
        const allMatches = Object.values(brackets).flat();

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold">Round Robin</h3>
                    <p className="text-sm text-muted-foreground">Tous les participants s'affrontent</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {allMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            </div>
        );
    }

    // Elimination Bracket Layout
    const rounds = Object.keys(brackets).sort((a, b) => {
        const roundA = parseInt(a.replace('Round ', ''));
        const roundB = parseInt(b.replace('Round ', ''));
        return roundA - roundB;
    });

    const getRoundTitle = (roundKey: string, totalRounds: number, isWinnersBracket = true) => {
        const roundNum = parseInt(roundKey.replace('Round ', ''));
        const remainingRounds = totalRounds - roundNum + 1;

        if (tournament.type === 'single_elimination') {
            if (remainingRounds === 1) return 'Finale';
            if (remainingRounds === 2) return 'Demi-finale';
            if (remainingRounds === 3) return 'Quart de finale';
            return `Round ${roundNum}`;
        }

        // Double elimination
        if (isWinnersBracket) {
            if (remainingRounds === 1) return 'Finale Winners';
            if (remainingRounds === 2) return 'Demi Winners';
            return `Winners R${roundNum}`;
        } else {
            return `Losers R${roundNum}`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Single/Double Elimination Bracket */}
            <div className="overflow-x-auto">
                <div className="min-w-max space-y-8">
                    {/* Winners Bracket */}
                    <div>
                        <h3 className="mb-4 text-center text-lg font-semibold">
                            {tournament.type === 'double_elimination' ? 'Winners Bracket' : 'BracketTournament Bracket'}
                        </h3>

                        <div className="flex items-start gap-8">
                            {rounds.map((roundKey) => {
                                const matches = brackets[roundKey] || [];

                                return (
                                    <div key={roundKey} className="min-w-[200px] space-y-4">
                                        <h4 className="text-center text-sm font-medium text-muted-foreground">
                                            {getRoundTitle(roundKey, rounds.length)}
                                        </h4>

                                        <div className="space-y-4">
                                            {matches.map((match) => (
                                                <MatchCard key={match.id} match={match} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Losers Bracket (Double Elimination only) */}
                    {tournament.type === 'double_elimination' && (
                        <div className="border-t pt-8">
                            <h3 className="mb-4 text-center text-lg font-semibold">Losers Bracket</h3>

                            <div className="flex items-start gap-8">
                                {/* Placeholder for losers bracket - would need separate data structure */}
                                <div className="text-center text-muted-foreground">Losers bracket matches would be displayed here</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* BracketTournament Status */}
            <div className="rounded-lg bg-muted p-4 text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">
                        {tournament.status === 'completed' ? 'Tournoi terminé' : `Round ${tournament.current_round} en cours`}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">
                    {tournament.status === 'completed'
                        ? 'Félicitations au vainqueur !'
                        : 'Les matches peuvent être sélectionnés pour plus de détails'}
                </p>
            </div>
        </div>
    );
}
