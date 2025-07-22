import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    Edit, 
    Eye, 
    Play, 
    Settings, 
    Target, 
    Trophy, 
    Users, 
    Zap,
    Star,
    DollarSign,
    MapPin,
    CheckCircle,
    XCircle,
    Crown
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    avatar?: string;
}

interface Participant {
    id: number;
    user: User;
    joined_at: string;
    wins?: number;
    total_matches?: number;
    win_rate?: number;
}

interface TournamentMatch {
    id: number;
    round: number;
    match_order: number;
    participant1?: Participant;
    participant2?: Participant;
    winner?: Participant;
    score1?: number;
    score2?: number;
    duration?: number;
    started_at?: string;
    completed_at?: string;
}

interface Tournament {
    id: number;
    title: string;
    description?: string;
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
    status: 'upcoming' | 'active' | 'completed';
    max_participants: number;
    current_round: number;
    registration_start: string;
    registration_end: string;
    tournament_start: string;
    started_at?: string;
    ended_at?: string;
    is_public: boolean;
    entry_fee?: number;
    prize_pool?: string;
    rules?: string;
    creator: User;
    quiz: {
        id: number;
        title: string;
        description?: string;
        question_count?: number;
    };
    participants: Participant[];
    matches: TournamentMatch[];
}

interface TournamentStats {
    total_matches: number;
    completed_matches: number;
    remaining_matches: number;
    average_match_duration?: number;
    total_points_scored?: number;
}

interface Props {
    tournament: Tournament;
    userParticipation?: Participant;
    brackets: Record<string, TournamentMatch[]>;
    tournamentStats: TournamentStats;
    canJoin: boolean;
    canStart: boolean;
    canEdit?: boolean;
}

export default function TournamentShow({ 
    tournament, 
    userParticipation, 
    brackets, 
    tournamentStats, 
    canJoin, 
    canStart,
    canEdit = false 
}: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const { post, delete: destroy, processing } = useForm();

    const handleJoinTournament = () => {
        if (confirm('Rejoindre ce tournoi ?')) {
            post(`/tournaments/${tournament.id}/join`);
        }
    };

    const handleLeaveTournament = () => {
        if (confirm('Quitter ce tournoi ? Cette action est irréversible.')) {
            post(`/tournaments/${tournament.id}/leave`);
        }
    };

    const handleStartTournament = () => {
        if (confirm('Démarrer le tournoi maintenant ?')) {
            post(`/tournaments/${tournament.id}/start`);
        }
    };

    const handleDeleteTournament = () => {
        if (confirm('Supprimer ce tournoi ? Cette action est irréversible.')) {
            destroy(`/tournaments/${tournament.id}`);
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

    const getTypeBadge = () => {
        switch (tournament.type) {
            case 'single_elimination':
                return <Badge variant="outline">Élimination simple</Badge>;
            case 'double_elimination':
                return <Badge variant="outline">Élimination double</Badge>;
            case 'round_robin':
                return <Badge variant="outline">Round Robin</Badge>;
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const progressPercentage = tournamentStats.total_matches > 0 
        ? (tournamentStats.completed_matches / tournamentStats.total_matches) * 100 
        : 0;

    return (
        <AppLayout>
            <Head title={tournament.title} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{tournament.title}</h1>
                            {getStatusBadge()}
                            {getTypeBadge()}
                        </div>
                        {tournament.description && (
                            <p className="text-muted-foreground text-lg">{tournament.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Organisé par {tournament.creator.name}</span>
                            <span>•</span>
                            <span>Quiz: {tournament.quiz.title}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {canEdit && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/tournaments/${tournament.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                    </Link>
                                </Button>
                                {canStart && (
                                    <Button 
                                        onClick={handleStartTournament}
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Démarrer
                                    </Button>
                                )}
                                {tournament.status === 'upcoming' && (
                                    <Button 
                                        variant="destructive"
                                        onClick={handleDeleteTournament}
                                        disabled={processing}
                                    >
                                        Supprimer
                                    </Button>
                                )}
                            </>
                        )}
                        
                        {canJoin && (
                            <Button 
                                onClick={handleJoinTournament}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Rejoindre
                            </Button>
                        )}
                        
                        {userParticipation && tournament.status === 'upcoming' && (
                            <Button 
                                variant="outline"
                                onClick={handleLeaveTournament}
                                disabled={processing}
                            >
                                Quitter
                            </Button>
                        )}
                        
                        <Button variant="outline" asChild>
                            <Link href={`/tournaments/${tournament.id}/bracket`}>
                                <Target className="h-4 w-4 mr-2" />
                                Bracket
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tournament Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Participants</p>
                                    <p className="text-2xl font-bold">
                                        {tournament.participants.length}/{tournament.max_participants}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Début</p>
                                    <p className="text-lg font-semibold">
                                        {new Date(tournament.tournament_start).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {tournament.status === 'active' && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Round actuel</p>
                                        <p className="text-2xl font-bold">{tournament.current_round}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {tournament.entry_fee && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Entrée</p>
                                        <p className="text-2xl font-bold">{tournament.entry_fee}€</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Tournament Progress */}
                {tournament.status === 'active' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Progression du tournoi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Matches terminés</span>
                                    <span>{tournamentStats.completed_matches}/{tournamentStats.total_matches}</span>
                                </div>
                                <Progress value={progressPercentage} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {Math.round(progressPercentage)}% terminé
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                        <TabsTrigger value="participants">Participants</TabsTrigger>
                        <TabsTrigger value="matches">Matches</TabsTrigger>
                        <TabsTrigger value="leaderboard">Classement</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tournament Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Détails du tournoi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Type</p>
                                            <p className="font-semibold">
                                                {tournament.type === 'single_elimination' && 'Élimination simple'}
                                                {tournament.type === 'double_elimination' && 'Élimination double'}
                                                {tournament.type === 'round_robin' && 'Round Robin'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Visibilité</p>
                                            <p className="font-semibold">
                                                {tournament.is_public ? 'Public' : 'Privé'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Inscription jusqu'au</p>
                                            <p className="font-semibold">
                                                {formatDate(tournament.registration_end)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Début du tournoi</p>
                                            <p className="font-semibold">
                                                {formatDate(tournament.tournament_start)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {tournament.prize_pool && (
                                        <div>
                                            <p className="text-muted-foreground mb-1">Prix</p>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-green-800 font-semibold">{tournament.prize_pool}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {tournament.rules && (
                                        <div>
                                            <p className="text-muted-foreground mb-1">Règles</p>
                                            <div className="bg-muted rounded-lg p-3">
                                                <p className="text-sm whitespace-pre-wrap">{tournament.rules}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Quiz Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quiz du tournoi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 rounded-lg p-3">
                                            <Trophy className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{tournament.quiz.title}</h3>
                                            {tournament.quiz.description && (
                                                <p className="text-muted-foreground mb-3">{tournament.quiz.description}</p>
                                            )}
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/quiz/${tournament.quiz.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Voir le quiz
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="participants">
                        <Card>
                            <CardHeader>
                                <CardTitle>Participants ({tournament.participants.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tournament.participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <Avatar>
                                                <AvatarImage src={participant.user.avatar} />
                                                <AvatarFallback>{getInitials(participant.user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{participant.user.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Inscrit le {new Date(participant.joined_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {tournament.participants.length === 0 && (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Aucun participant pour le moment</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="matches">
                        <div className="space-y-6">
                            {Object.entries(brackets).map(([roundName, matches]) => (
                                <Card key={roundName}>
                                    <CardHeader>
                                        <CardTitle>{roundName}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {matches.map((match) => (
                                                <div key={match.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="text-center">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={match.participant1?.user.avatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {match.participant1 ? getInitials(match.participant1.user.name) : '?'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-medium">
                                                                        {match.participant1?.user.name || 'En attente'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-center font-bold text-lg">
                                                                {match.score1 !== undefined && match.score2 !== undefined 
                                                                    ? `${match.score1} - ${match.score2}`
                                                                    : 'VS'
                                                                }
                                                            </div>
                                                            
                                                            <div className="text-center">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={match.participant2?.user.avatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {match.participant2 ? getInitials(match.participant2.user.name) : '?'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-medium">
                                                                        {match.participant2?.user.name || 'En attente'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            {match.winner ? (
                                                                <div className="flex items-center gap-1 text-green-600">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    <span className="text-sm">Terminé</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span className="text-sm">En attente</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {match.winner && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                                <Crown className="h-4 w-4" />
                                                                <span>Vainqueur: {match.winner.user.name}</span>
                                                                {match.duration && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>Durée: {Math.round(match.duration / 60)}min</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {Object.keys(brackets).length === 0 && (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Aucun match généré pour le moment</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="leaderboard">
                        <Card>
                            <CardHeader>
                                <CardTitle>Classement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={`/tournaments/${tournament.id}/leaderboard`}>
                                        <Trophy className="h-4 w-4 mr-2" />
                                        Voir le classement détaillé
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}