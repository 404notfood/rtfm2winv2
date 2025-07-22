import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Crown, 
    Medal, 
    Trophy, 
    Target, 
    TrendingUp, 
    Users,
    Award,
    Star,
    Zap
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    avatar?: string;
}

interface Participant {
    id: number;
    user: User;
    joined_at: string;
    wins: number;
    total_matches: number;
    win_rate: number;
}

interface Tournament {
    id: number;
    title: string;
    description?: string;
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
    status: 'upcoming' | 'active' | 'completed';
    max_participants: number;
    current_round: number;
    started_at?: string;
    ended_at?: string;
    creator: User;
    quiz: {
        id: number;
        title: string;
    };
}

interface Props {
    tournament: Tournament;
    participants: Participant[];
}

export default function TournamentLeaderboard({ tournament, participants }: Props) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getRankIcon = (position: number) => {
        switch (position) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="text-muted-foreground font-bold">#{position}</span>;
        }
    };

    const getRankBadge = (position: number) => {
        switch (position) {
            case 1:
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">1er</Badge>;
            case 2:
                return <Badge className="bg-gray-400 hover:bg-gray-500">2ème</Badge>;
            case 3:
                return <Badge className="bg-amber-600 hover:bg-amber-700">3ème</Badge>;
            default:
                return <Badge variant="outline">#{position}</Badge>;
        }
    };

    const getStatusBadge = () => {
        switch (tournament.status) {
            case 'upcoming':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700">À venir</Badge>;
            case 'active':
                return <Badge className="bg-green-100 text-green-800">En cours</Badge>;
            case 'completed':
                return <Badge variant="secondary">Terminé</Badge>;
        }
    };

    const getWinRateColor = (winRate: number) => {
        if (winRate >= 80) return 'text-green-600';
        if (winRate >= 60) return 'text-blue-600';
        if (winRate >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const topThree = participants.slice(0, 3);
    const others = participants.slice(3);

    return (
        <AppLayout>
            <Head title={`Classement - ${tournament.title}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/tournaments/${tournament.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">Classement</h1>
                            {getStatusBadge()}
                        </div>
                        <p className="text-muted-foreground">
                            Tournoi: {tournament.title} • {participants.length} participants
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/tournaments/${tournament.id}/bracket`}>
                                <Target className="h-4 w-4 mr-2" />
                                Voir le bracket
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tournament Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Participants</p>
                                    <p className="text-2xl font-bold">{participants.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="text-lg font-semibold">
                                        {tournament.type === 'single_elimination' && 'Élimination simple'}
                                        {tournament.type === 'double_elimination' && 'Élimination double'}
                                        {tournament.type === 'round_robin' && 'Round Robin'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {tournament.status === 'active' && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Round actuel</p>
                                        <p className="text-2xl font-bold">{tournament.current_round}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Quiz</p>
                                    <p className="text-lg font-semibold line-clamp-1">{tournament.quiz.title}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top 3 Podium */}
                {topThree.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                Podium
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* 2nd Place */}
                                {topThree[1] && (
                                    <div className="order-1 md:order-1">
                                        <Card className="border-2 border-gray-300 bg-gray-50">
                                            <CardContent className="p-6 text-center">
                                                <div className="flex justify-center mb-3">
                                                    <Medal className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <Avatar className="h-16 w-16 mx-auto mb-3">
                                                    <AvatarImage src={topThree[1].user.avatar} />
                                                    <AvatarFallback className="text-lg">
                                                        {getInitials(topThree[1].user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h3 className="font-bold text-lg mb-2">{topThree[1].user.name}</h3>
                                                <Badge className="bg-gray-400 hover:bg-gray-500 mb-2">2ème place</Badge>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Victoires:</span>
                                                        <span className="font-semibold">{topThree[1].wins}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Matches:</span>
                                                        <span className="font-semibold">{topThree[1].total_matches}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Taux de réussite:</span>
                                                        <span className={`font-bold ${getWinRateColor(topThree[1].win_rate)}`}>
                                                            {topThree[1].win_rate}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* 1st Place */}
                                {topThree[0] && (
                                    <div className="order-2 md:order-2">
                                        <Card className="border-4 border-yellow-400 bg-yellow-50 transform md:scale-105">
                                            <CardContent className="p-6 text-center">
                                                <div className="flex justify-center mb-3">
                                                    <Crown className="h-10 w-10 text-yellow-500" />
                                                </div>
                                                <Avatar className="h-20 w-20 mx-auto mb-3">
                                                    <AvatarImage src={topThree[0].user.avatar} />
                                                    <AvatarFallback className="text-xl">
                                                        {getInitials(topThree[0].user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h3 className="font-bold text-xl mb-2">{topThree[0].user.name}</h3>
                                                <Badge className="bg-yellow-500 hover:bg-yellow-600 mb-3">1ère place 🏆</Badge>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Victoires:</span>
                                                        <span className="font-semibold">{topThree[0].wins}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Matches:</span>
                                                        <span className="font-semibold">{topThree[0].total_matches}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Taux de réussite:</span>
                                                        <span className={`font-bold ${getWinRateColor(topThree[0].win_rate)}`}>
                                                            {topThree[0].win_rate}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* 3rd Place */}
                                {topThree[2] && (
                                    <div className="order-3 md:order-3">
                                        <Card className="border-2 border-amber-400 bg-amber-50">
                                            <CardContent className="p-6 text-center">
                                                <div className="flex justify-center mb-3">
                                                    <Award className="h-8 w-8 text-amber-600" />
                                                </div>
                                                <Avatar className="h-16 w-16 mx-auto mb-3">
                                                    <AvatarImage src={topThree[2].user.avatar} />
                                                    <AvatarFallback className="text-lg">
                                                        {getInitials(topThree[2].user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h3 className="font-bold text-lg mb-2">{topThree[2].user.name}</h3>
                                                <Badge className="bg-amber-600 hover:bg-amber-700 mb-2">3ème place</Badge>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Victoires:</span>
                                                        <span className="font-semibold">{topThree[2].wins}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Matches:</span>
                                                        <span className="font-semibold">{topThree[2].total_matches}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Taux de réussite:</span>
                                                        <span className={`font-bold ${getWinRateColor(topThree[2].win_rate)}`}>
                                                            {topThree[2].win_rate}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Full Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Classement complet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">Rang</TableHead>
                                    <TableHead>Participant</TableHead>
                                    <TableHead className="text-center">Victoires</TableHead>
                                    <TableHead className="text-center">Matches joués</TableHead>
                                    <TableHead className="text-center">Taux de réussite</TableHead>
                                    <TableHead className="text-center">Inscription</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {participants.map((participant, index) => {
                                    const position = index + 1;
                                    return (
                                        <TableRow 
                                            key={participant.id}
                                            className={position <= 3 ? 'bg-muted/50' : ''}
                                        >
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    {position <= 3 ? getRankIcon(position) : getRankBadge(position)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={participant.user.avatar} />
                                                        <AvatarFallback>
                                                            {getInitials(participant.user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{participant.user.name}</p>
                                                        {position <= 3 && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3 w-3 text-yellow-500" />
                                                                <span className="text-xs text-muted-foreground">Top 3</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-bold text-lg">{participant.wins}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold">{participant.total_matches}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-bold ${getWinRateColor(participant.win_rate)}`}>
                                                    {participant.win_rate}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {new Date(participant.joined_at).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {participants.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Aucun participant pour le moment</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tournament Info Footer */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Organisé par {tournament.creator.name}</span>
                            <span>
                                {tournament.status === 'completed' && tournament.ended_at
                                    ? `Terminé le ${new Date(tournament.ended_at).toLocaleDateString('fr-FR')}`
                                    : tournament.status === 'active' && tournament.started_at
                                    ? `Commencé le ${new Date(tournament.started_at).toLocaleDateString('fr-FR')}`
                                    : 'Tournoi à venir'
                                }
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}