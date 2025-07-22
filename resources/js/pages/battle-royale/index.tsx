import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Crown, Play, Plus, Search, Shield, Skull, Sword, Target, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface BattleRoyaleSession {
    id: number;
    code: string;
    title: string;
    quiz_title: string;
    status: 'waiting' | 'active' | 'completed';
    max_participants: number;
    current_participants: number;
    elimination_rate: number;
    rounds_completed: number;
    total_rounds: number;
    prize_pool?: number;
    created_at: string;
    started_at?: string;
    creator: {
        id: number;
        name: string;
    };
}

interface Props {
    sessions: {
        data: BattleRoyaleSession[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    can_create: boolean;
    user_stats: {
        battles_played: number;
        victories: number;
        eliminations: number;
        survival_rate: number;
    };
}

export default function BattleRoyaleIndex({ sessions, filters, can_create, user_stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { get, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/battle-royale', {
            search,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'En attente';
            case 'active':
                return 'En cours';
            case 'completed':
                return 'Terminé';
            default:
                return status;
        }
    };

    const getParticipationColor = (current: number, max: number) => {
        const ratio = current / max;
        if (ratio >= 0.8) return 'text-red-600';
        if (ratio >= 0.6) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <AppLayout>
            <Head title="Battle Royale" />

            <div className="space-y-6">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                            <Sword className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
                            Battle Royale
                        </h1>
                    </div>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        Affrontez d'autres joueurs dans des batailles épiques ! Seul le dernier survivant remporte la victoire.
                    </p>
                </motion.div>

                {/* User Stats */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{user_stats.battles_played}</div>
                                <div className="text-sm text-muted-foreground">Batailles</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{user_stats.victories}</div>
                                <div className="text-sm text-muted-foreground">Victoires</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-red-600">{user_stats.eliminations}</div>
                                <div className="text-sm text-muted-foreground">Éliminations</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{user_stats.survival_rate}%</div>
                                <div className="text-sm text-muted-foreground">Taux de survie</div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Batailles disponibles</h2>
                        <p className="text-muted-foreground">Rejoignez une bataille ou créez la vôtre</p>
                    </div>
                    {can_create && (
                        <Button asChild size="lg">
                            <Link href="/battle-royale/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Créer une bataille
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Rechercher des batailles..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Search className="mr-2 h-4 w-4" />
                                Rechercher
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Battle Sessions Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.data.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="group border-2 transition-all duration-300 hover:border-red-200 hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sword className="h-5 w-5 text-red-500" />
                                            <Badge className={getStatusColor(session.status)}>{getStatusLabel(session.status)}</Badge>
                                        </div>
                                        <div className="font-mono text-xs text-muted-foreground">#{session.code}</div>
                                    </div>

                                    <CardTitle className="line-clamp-2 transition-colors group-hover:text-red-600">{session.title}</CardTitle>

                                    <CardDescription className="line-clamp-1">Quiz : {session.quiz_title}</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Battle Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>Participants</span>
                                            </div>
                                            <span className={getParticipationColor(session.current_participants, session.max_participants)}>
                                                {session.current_participants}/{session.max_participants}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <Target className="h-4 w-4" />
                                                <span>Élimination</span>
                                            </div>
                                            <span>{session.elimination_rate}% par round</span>
                                        </div>

                                        {session.status === 'active' && (
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Zap className="h-4 w-4" />
                                                    <span>Progression</span>
                                                </div>
                                                <span>
                                                    {session.rounds_completed}/{session.total_rounds} rounds
                                                </span>
                                            </div>
                                        )}

                                        {session.prize_pool && (
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Trophy className="h-4 w-4" />
                                                    <span>Prix</span>
                                                </div>
                                                <span className="font-semibold text-yellow-600">{session.prize_pool.toLocaleString()} pts</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Creator Info */}
                                    <div className="border-t pt-2 text-xs text-muted-foreground">
                                        Par {session.creator.name} • {new Date(session.created_at).toLocaleDateString('fr-FR')}
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2">
                                        {session.status === 'waiting' && session.current_participants < session.max_participants && (
                                            <Button
                                                asChild
                                                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                            >
                                                <Link href={`/battle-royale/join/${session.code}`}>
                                                    <Sword className="mr-2 h-4 w-4" />
                                                    Rejoindre la bataille
                                                </Link>
                                            </Button>
                                        )}

                                        {session.status === 'waiting' && session.current_participants >= session.max_participants && (
                                            <Button disabled className="w-full">
                                                <Users className="mr-2 h-4 w-4" />
                                                Bataille complète
                                            </Button>
                                        )}

                                        {session.status === 'active' && (
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={`/battle-royale/${session.code}/arena`}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Voir la bataille
                                                </Link>
                                            </Button>
                                        )}

                                        {session.status === 'completed' && (
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={`/battle-royale/${session.code}/results`}>
                                                    <Crown className="mr-2 h-4 w-4" />
                                                    Voir les résultats
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {sessions.data.length === 0 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <Skull className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">Aucune bataille trouvée</h3>
                                <p className="mb-4 text-muted-foreground">
                                    {search ? 'Essayez de modifier vos critères de recherche.' : 'Soyez le premier à créer une bataille !'}
                                </p>
                                {can_create && !search && (
                                    <Button asChild>
                                        <Link href="/battle-royale/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Créer une bataille
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Pagination */}
                {sessions.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: sessions.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === sessions.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => get(`/battle-royale?page=${page}`)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}

                {/* How it works */}
                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            Comment ça marche ?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <Users className="h-6 w-6 text-red-600" />
                                </div>
                                <h4 className="mb-1 font-semibold">1. Rejoignez</h4>
                                <p className="text-muted-foreground">Entrez dans une bataille avec d'autres joueurs</p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                    <Target className="h-6 w-6 text-orange-600" />
                                </div>
                                <h4 className="mb-1 font-semibold">2. Survivez</h4>
                                <p className="text-muted-foreground">Répondez correctement pour éviter l'élimination</p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                    <Crown className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h4 className="mb-1 font-semibold">3. Gagnez</h4>
                                <p className="text-muted-foreground">Soyez le dernier survivant pour remporter la victoire</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
