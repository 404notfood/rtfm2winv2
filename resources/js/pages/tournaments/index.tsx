import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Calendar, Clock, Eye, MoreHorizontal, Play, Plus, Search, Target, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface Tournament {
    id: number;
    title: string;
    description?: string;
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
    status: 'upcoming' | 'active' | 'completed';
    max_participants: number;
    participants_count: number;
    current_round: number;
    registration_start: string;
    registration_end: string;
    tournament_start: string;
    started_at?: string;
    ended_at?: string;
    is_public: boolean;
    entry_fee?: number;
    prize_pool?: string;
    creator: {
        id: number;
        name: string;
    };
    quiz: {
        id: number;
        title: string;
    };
    winner?: {
        id: number;
        user: {
            name: string;
            avatar?: string;
        };
    };
}

interface Props {
    tournaments: {
        data: Tournament[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
        type?: string;
    };
    can_create: boolean;
    user_tournaments: Tournament[];
}

export default function TournamentsIndex({ tournaments, filters = {}, can_create, user_tournaments }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const { get, post, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/tournaments', {
            search,
            status: filters.status,
            type: filters.type,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilter = (key: string, value: string) => {
        get('/tournaments', {
            search,
            [key]: value,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleJoinTournament = (tournamentId: number) => {
        if (confirm('Rejoindre ce tournoi ?')) {
            post(`/tournaments/${tournamentId}/join`);
        }
    };

    const getStatusBadge = (tournament: Tournament) => {
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
            default:
                return null;
        }
    };

    const getTypeBadge = (type: Tournament['type']) => {
        switch (type) {
            case 'single_elimination':
                return <Badge variant="outline">Élimination simple</Badge>;
            case 'double_elimination':
                return <Badge variant="outline">Élimination double</Badge>;
            case 'round_robin':
                return <Badge variant="outline">Round Robin</Badge>;
        }
    };

    const canJoin = (tournament: Tournament) => {
        return (
            tournament.status === 'upcoming' &&
            tournament.participants_count < tournament.max_participants &&
            new Date(tournament.registration_end) > new Date()
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <AppLayout>
            <Head title="Tournois" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tournois</h1>
                        <p className="text-muted-foreground">Participez ou organisez des compétitions de quiz</p>
                    </div>
                    {can_create && (
                        <Button asChild>
                            <Link href="/tournaments/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Créer un tournoi
                            </Link>
                        </Button>
                    )}
                </div>

                {/* My Tournaments */}
                {user_tournaments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Mes tournois
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {user_tournaments.slice(0, 3).map((tournament) => (
                                    <Card key={tournament.id} className="border-l-4 border-l-blue-500">
                                        <CardContent className="p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <h4 className="line-clamp-1 font-semibold">{tournament.title}</h4>
                                                {getStatusBadge(tournament)}
                                            </div>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    {tournament.participants_count}/{tournament.max_participants} participants
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(tournament.tournament_start).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Button size="sm" className="mt-3 w-full" asChild>
                                                <Link href={`/tournaments/${tournament.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Voir
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {user_tournaments.length > 3 && (
                                <div className="mt-4 text-center">
                                    <Button variant="outline" size="sm">
                                        Voir tous mes tournois ({user_tournaments.length})
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input placeholder="Rechercher des tournois..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <Select value={filters.status || ''} onValueChange={(value) => handleFilter('status', value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous les statuts</SelectItem>
                                    <SelectItem value="upcoming">À venir</SelectItem>
                                    <SelectItem value="active">En cours</SelectItem>
                                    <SelectItem value="completed">Terminés</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.type || ''} onValueChange={(value) => handleFilter('type', value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous les types</SelectItem>
                                    <SelectItem value="single_elimination">Élimination simple</SelectItem>
                                    <SelectItem value="double_elimination">Élimination double</SelectItem>
                                    <SelectItem value="round_robin">Round Robin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" disabled={processing}>
                                <Search className="mr-2 h-4 w-4" />
                                Rechercher
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Tournaments Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tournaments.data.map((tournament) => (
                        <Card key={tournament.id} className="group transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="mb-2 line-clamp-2">
                                            <Link href={`/tournaments/${tournament.id}`} className="transition-colors hover:text-primary">
                                                {tournament.title}
                                            </Link>
                                        </CardTitle>
                                        {tournament.description && (
                                            <p className="line-clamp-2 text-sm text-muted-foreground">{tournament.description}</p>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/tournaments/${tournament.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Voir les détails
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/tournaments/${tournament.id}/bracket`}>
                                                    <Target className="mr-2 h-4 w-4" />
                                                    Voir le bracket
                                                </Link>
                                            </DropdownMenuItem>
                                            {canJoin(tournament) && (
                                                <DropdownMenuItem onClick={() => handleJoinTournament(tournament.id)}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Rejoindre
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Status and Type */}
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {getStatusBadge(tournament)}
                                    {getTypeBadge(tournament.type)}
                                    {tournament.is_public && (
                                        <Badge variant="outline" className="text-xs">
                                            Public
                                        </Badge>
                                    )}
                                </div>

                                {/* Tournament Info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {tournament.participants_count}/{tournament.max_participants} participants
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-muted-foreground" />
                                        <span>Quiz: {tournament.quiz.title}</span>
                                    </div>

                                    {tournament.status === 'active' && (
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-green-500" />
                                            <span>Round {tournament.current_round}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {tournament.status === 'upcoming'
                                                ? `Début: ${new Date(tournament.tournament_start).toLocaleDateString()}`
                                                : tournament.status === 'active'
                                                  ? `Commencé le ${new Date(tournament.started_at!).toLocaleDateString()}`
                                                  : `Terminé le ${new Date(tournament.ended_at!).toLocaleDateString()}`}
                                        </span>
                                    </div>

                                    {tournament.entry_fee && (
                                        <div className="flex items-center gap-2">
                                            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                                                Entrée: {tournament.entry_fee}€
                                            </span>
                                        </div>
                                    )}

                                    {tournament.prize_pool && (
                                        <div className="flex items-center gap-2">
                                            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                                                Prix: {tournament.prize_pool}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Creator */}
                                <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">Organisé par {tournament.creator.name}</div>

                                {/* Winner */}
                                {tournament.winner && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 p-2">
                                        <Trophy className="h-4 w-4 text-yellow-600" />
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={tournament.winner.user.avatar} />
                                            <AvatarFallback className="text-xs">{getInitials(tournament.winner.user.name)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-yellow-800">{tournament.winner.user.name}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    {canJoin(tournament) ? (
                                        <Button
                                            onClick={() => handleJoinTournament(tournament.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            disabled={processing}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Rejoindre
                                        </Button>
                                    ) : tournament.status === 'upcoming' ? (
                                        <Button variant="outline" className="flex-1" disabled>
                                            <Clock className="mr-2 h-4 w-4" />
                                            Complet
                                        </Button>
                                    ) : (
                                        <Button asChild className="flex-1">
                                            <Link href={`/tournaments/${tournament.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir
                                            </Link>
                                        </Button>
                                    )}

                                    <Button variant="outline" size="icon" asChild>
                                        <Link href={`/tournaments/${tournament.id}/bracket`}>
                                            <Target className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {tournaments.data.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Trophy className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">Aucun tournoi trouvé</h3>
                            <p className="mb-4 text-muted-foreground">
                                {search ? 'Essayez de modifier vos critères de recherche.' : 'Soyez le premier à créer un tournoi !'}
                            </p>
                            {can_create && !search && (
                                <Button asChild>
                                    <Link href="/tournaments/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer un tournoi
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {tournaments.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: tournaments.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === tournaments.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => get(`/tournaments?page=${page}`)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
