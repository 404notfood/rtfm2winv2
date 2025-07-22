import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Award, Calendar, Crown, Medal, Star, TrendingUp, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

interface Player {
    id: number;
    name: string;
    avatar?: string;
    score: number;
    games_played: number;
    wins: number;
    win_rate: number;
    rank: number;
    rank_change?: number;
    level?: number;
    badges?: string[];
    last_active: string;
}

interface Props {
    global_leaderboard: Player[];
    weekly_leaderboard: Player[];
    monthly_leaderboard: Player[];
    friends_leaderboard: Player[];
    user_stats: {
        global_rank: number;
        weekly_rank: number;
        monthly_rank: number;
        friends_rank: number;
        total_score: number;
        total_games: number;
        total_wins: number;
    };
    timeframe: 'global' | 'weekly' | 'monthly' | 'friends';
}

export default function Leaderboard({
    global_leaderboard,
    weekly_leaderboard,
    monthly_leaderboard,
    friends_leaderboard,
    user_stats,
    timeframe,
}: Props) {
    const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
    const { get } = useForm();

    const handleTimeframeChange = (newTimeframe: string) => {
        setSelectedTimeframe(newTimeframe as typeof timeframe);
        get(`/leaderboard?timeframe=${newTimeframe}`);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="flex h-5 w-5 items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
            case 2:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
            case 3:
                return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300';
            default:
                return '';
        }
    };

    const getRankChange = (change?: number) => {
        if (!change || change === 0) return null;

        return (
            <div className={cn('flex items-center text-xs', change > 0 ? 'text-green-600' : 'text-red-600')}>
                <TrendingUp className={cn('mr-1 h-3 w-3', change < 0 && 'rotate-180')} />
                {Math.abs(change)}
            </div>
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getCurrentLeaderboard = () => {
        switch (selectedTimeframe) {
            case 'weekly':
                return weekly_leaderboard;
            case 'monthly':
                return monthly_leaderboard;
            case 'friends':
                return friends_leaderboard;
            default:
                return global_leaderboard;
        }
    };

    const getCurrentUserRank = () => {
        switch (selectedTimeframe) {
            case 'weekly':
                return user_stats.weekly_rank;
            case 'monthly':
                return user_stats.monthly_rank;
            case 'friends':
                return user_stats.friends_rank;
            default:
                return user_stats.global_rank;
        }
    };

    const getTimeframeLabel = (tf: string) => {
        switch (tf) {
            case 'weekly':
                return 'Cette semaine';
            case 'monthly':
                return 'Ce mois';
            case 'friends':
                return 'Entre amis';
            default:
                return 'Global';
        }
    };

    const PlayerRow = ({ player, index }: { player: Player; index: number }) => (
        <Card className={cn('transition-all hover:shadow-md', getRankColor(player.rank))}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">{getRankIcon(player.rank)}</div>

                    {/* Avatar & Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={player.avatar} />
                            <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="truncate font-medium">{player.name}</h4>
                                {player.level && (
                                    <Badge variant="outline" className="text-xs">
                                        Niveau {player.level}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{player.games_played} parties</span>
                                <span>{player.win_rate}% victoires</span>
                                {getRankChange(player.rank_change)}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                        <div className="text-xl font-bold">{player.score.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">points</div>
                    </div>

                    {/* Badges */}
                    {player.badges && player.badges.length > 0 && (
                        <div className="flex gap-1">
                            {player.badges.slice(0, 3).map((badge, idx) => (
                                <div key={idx} className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                                    <Award className="h-3 w-3 text-purple-600" />
                                </div>
                            ))}
                            {player.badges.length > 3 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                                    +{player.badges.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const currentLeaderboard = getCurrentLeaderboard();
    const userRank = getCurrentUserRank();

    return (
        <AppLayout>
            <Head title="Classement" />

            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="mb-2 text-3xl font-bold">Classement</h1>
                    <p className="text-muted-foreground">Découvrez les meilleurs joueurs de la communauté</p>
                </div>

                {/* User Stats */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">#{userRank}</div>
                                <div className="text-sm text-muted-foreground">Votre rang {getTimeframeLabel(selectedTimeframe).toLowerCase()}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{user_stats.total_score.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Points totaux</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{user_stats.total_games}</div>
                                <div className="text-sm text-muted-foreground">Parties jouées</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {user_stats.total_games > 0 ? Math.round((user_stats.total_wins / user_stats.total_games) * 100) : 0}%
                                </div>
                                <div className="text-sm text-muted-foreground">Taux de victoire</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeframe Tabs */}
                <Tabs value={selectedTimeframe} onValueChange={handleTimeframeChange} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="global" className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Global
                        </TabsTrigger>
                        <TabsTrigger value="weekly" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Semaine
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Mois
                        </TabsTrigger>
                        <TabsTrigger value="friends" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Amis
                        </TabsTrigger>
                    </TabsList>

                    {/* Leaderboard Content */}
                    <TabsContent value={selectedTimeframe} className="space-y-4">
                        {currentLeaderboard.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Pas encore de classement</h3>
                                    <p className="text-muted-foreground">
                                        {selectedTimeframe === 'friends'
                                            ? 'Ajoutez des amis pour voir leur classement !'
                                            : 'Soyez le premier à jouer et apparaître dans le classement !'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {/* Top 3 Podium */}
                                {currentLeaderboard.length >= 3 && (
                                    <Card className="mb-6 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-center gap-2 text-center">
                                                <Crown className="h-5 w-5 text-yellow-500" />
                                                Podium {getTimeframeLabel(selectedTimeframe)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                {/* 2nd Place */}
                                                {currentLeaderboard[1] && (
                                                    <div className="flex flex-col items-center">
                                                        <div className="relative mb-2">
                                                            <Avatar className="h-16 w-16">
                                                                <AvatarImage src={currentLeaderboard[1].avatar} />
                                                                <AvatarFallback>{getInitials(currentLeaderboard[1].name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                                                                <Medal className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        <h4 className="font-medium">{currentLeaderboard[1].name}</h4>
                                                        <p className="text-lg font-bold">{currentLeaderboard[1].score.toLocaleString()}</p>
                                                    </div>
                                                )}

                                                {/* 1st Place */}
                                                {currentLeaderboard[0] && (
                                                    <div className="flex scale-110 transform flex-col items-center">
                                                        <div className="relative mb-2">
                                                            <Avatar className="h-20 w-20">
                                                                <AvatarImage src={currentLeaderboard[0].avatar} />
                                                                <AvatarFallback>{getInitials(currentLeaderboard[0].name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                                                                <Crown className="h-8 w-8 text-yellow-500" />
                                                            </div>
                                                        </div>
                                                        <h4 className="text-lg font-bold">{currentLeaderboard[0].name}</h4>
                                                        <p className="text-xl font-bold text-yellow-600">
                                                            {currentLeaderboard[0].score.toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* 3rd Place */}
                                                {currentLeaderboard[2] && (
                                                    <div className="flex flex-col items-center">
                                                        <div className="relative mb-2">
                                                            <Avatar className="h-16 w-16">
                                                                <AvatarImage src={currentLeaderboard[2].avatar} />
                                                                <AvatarFallback>{getInitials(currentLeaderboard[2].name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                                                                <Medal className="h-6 w-6 text-amber-600" />
                                                            </div>
                                                        </div>
                                                        <h4 className="font-medium">{currentLeaderboard[2].name}</h4>
                                                        <p className="text-lg font-bold">{currentLeaderboard[2].score.toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Full Leaderboard */}
                                {currentLeaderboard.map((player, index) => (
                                    <PlayerRow key={player.id} player={player} index={index} />
                                ))}

                                {currentLeaderboard.length > 10 && (
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <p className="text-muted-foreground">Et {currentLeaderboard.length - 10} autres joueurs...</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
