import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, Crown, Filter, Medal, Star, Target, TrendingUp, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

interface LeaderboardEntry {
    id: number;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    rank: number;
    total_points: number;
    total_achievements: number;
    badges_count: number;
    trophies_count: number;
    completion_rate: number;
    level: number;
    title: string;
    recent_achievement?: {
        name: string;
        icon: string;
        points: number;
    };
    is_current_user: boolean;
}

interface TimeframeStat {
    period: string;
    label: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    value: number;
    achievement_type: string;
}

interface Props {
    leaderboard: LeaderboardEntry[];
    currentUserRank: LeaderboardEntry | null;
    timeframeStats: TimeframeStat[];
    filters: {
        timeframe: 'all' | 'month' | 'week';
        type: 'points' | 'achievements' | 'completion';
    };
    topAchievers: {
        most_points: LeaderboardEntry;
        most_achievements: LeaderboardEntry;
        highest_completion: LeaderboardEntry;
        recent_climber: LeaderboardEntry;
    };
}

export default function AchievementsLeaderboard({ leaderboard, currentUserRank, timeframeStats, filters, topAchievers }: Props) {
    const [selectedTimeframe, setSelectedTimeframe] = useState(filters.timeframe);
    const [selectedType, setSelectedType] = useState(filters.type);
    const { get } = useForm();

    const handleFilterChange = () => {
        get('/achievements/leaderboard', {
            timeframe: selectedTimeframe,
            type: selectedType,
            preserveState: true,
        } as any);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Trophy className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return <div className="flex h-6 w-6 items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</div>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200';
            case 2:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
            case 3:
                return 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200';
            default:
                return 'hover:bg-muted/50';
        }
    };

    const getLevelColor = (level: number) => {
        if (level >= 50) return 'text-purple-600';
        if (level >= 30) return 'text-blue-600';
        if (level >= 15) return 'text-green-600';
        return 'text-gray-600';
    };

    const timeframes = [
        { value: 'all', label: 'Tout temps' },
        { value: 'month', label: 'Ce mois' },
        { value: 'week', label: 'Cette semaine' },
    ];

    const types = [
        { value: 'points', label: 'Points de succès' },
        { value: 'achievements', label: 'Nombre de succès' },
        { value: 'completion', label: 'Taux de complétion' },
    ];

    return (
        <AppLayout>
            <Head title="Classement - Succès" />

            <div className="space-y-6">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/achievements">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux succès
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                                <Crown className="h-5 w-5 text-white" />
                            </div>
                            Classement des Champions
                        </h1>
                        <p className="text-muted-foreground">Découvrez les meilleurs collectionneurs de succès</p>
                    </div>
                </motion.div>

                {/* Top Achievers Spotlight */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                            <CardContent className="p-4 text-center">
                                <Crown className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                                <div className="mb-1 text-sm text-muted-foreground">Champion des points</div>
                                <div className="font-bold">{topAchievers.most_points.user.name}</div>
                                <div className="font-semibold text-yellow-600">{topAchievers.most_points.total_points} pts</div>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                            <CardContent className="p-4 text-center">
                                <Trophy className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                                <div className="mb-1 text-sm text-muted-foreground">Collectionneur</div>
                                <div className="font-bold">{topAchievers.most_achievements.user.name}</div>
                                <div className="font-semibold text-blue-600">{topAchievers.most_achievements.total_achievements} succès</div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                            <CardContent className="p-4 text-center">
                                <Target className="mx-auto mb-2 h-8 w-8 text-green-500" />
                                <div className="mb-1 text-sm text-muted-foreground">Perfectionniste</div>
                                <div className="font-bold">{topAchievers.highest_completion.user.name}</div>
                                <div className="font-semibold text-green-600">{topAchievers.highest_completion.completion_rate}%</div>
                            </CardContent>
                        </Card>
                        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                            <CardContent className="p-4 text-center">
                                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-red-500" />
                                <div className="mb-1 text-sm text-muted-foreground">Étoile montante</div>
                                <div className="font-bold">{topAchievers.recent_climber.user.name}</div>
                                <div className="font-semibold text-red-600">+{topAchievers.recent_climber.rank} places</div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Current User Position */}
                {currentUserRank && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-purple-600" />
                                    Votre position
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between rounded-lg bg-white/50 p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">{getRankIcon(currentUserRank.rank)}</div>
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={currentUserRank.user.avatar} />
                                            <AvatarFallback>{currentUserRank.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold">{currentUserRank.user.name}</div>
                                            <div className="text-sm text-muted-foreground">{currentUserRank.title}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-2xl font-bold text-purple-600">{currentUserRank.total_points}</div>
                                        <div className="text-sm text-muted-foreground">points</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Filters */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Filter className="h-5 w-5 text-muted-foreground" />
                                <div className="flex gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Période</label>
                                        <select
                                            value={selectedTimeframe}
                                            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                                            className="ml-2 rounded border border-input bg-background px-3 py-1"
                                        >
                                            {timeframes.map((tf) => (
                                                <option key={tf.value} value={tf.value}>
                                                    {tf.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Critère</label>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value as any)}
                                            className="ml-2 rounded border border-input bg-background px-3 py-1"
                                        >
                                            {types.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button onClick={handleFilterChange}>Appliquer</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Podium */}
                {leaderboard.length >= 3 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Podium des Champions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 flex items-end justify-center gap-8">
                                    {/* 2nd Place */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-center"
                                    >
                                        <div className="relative mb-4 flex h-32 flex-col justify-end rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-6">
                                            <Trophy className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                            <Badge className="absolute top-2 right-2 bg-gray-100 text-gray-800">2ème</Badge>
                                        </div>
                                        <Avatar className="mx-auto mb-3 h-16 w-16">
                                            <AvatarImage src={leaderboard[1]?.user.avatar} />
                                            <AvatarFallback>{leaderboard[1]?.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-bold">{leaderboard[1]?.user.name}</div>
                                        <div className="text-sm text-muted-foreground">{leaderboard[1]?.total_points} pts</div>
                                    </motion.div>

                                    {/* 1st Place */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-center"
                                    >
                                        <div className="relative mb-4 flex h-40 flex-col justify-end rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 p-6">
                                            <Crown className="mx-auto mb-2 h-10 w-10 text-yellow-500" />
                                            <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">1er</Badge>
                                        </div>
                                        <Avatar className="mx-auto mb-3 h-20 w-20 ring-4 ring-yellow-200">
                                            <AvatarImage src={leaderboard[0]?.user.avatar} />
                                            <AvatarFallback>{leaderboard[0]?.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-lg font-bold">{leaderboard[0]?.user.name}</div>
                                        <div className="font-semibold text-primary">{leaderboard[0]?.total_points} pts</div>
                                    </motion.div>

                                    {/* 3rd Place */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-center"
                                    >
                                        <div className="relative mb-4 flex h-28 flex-col justify-end rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 p-6">
                                            <Medal className="mx-auto mb-2 h-7 w-7 text-amber-600" />
                                            <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-800">3ème</Badge>
                                        </div>
                                        <Avatar className="mx-auto mb-3 h-14 w-14">
                                            <AvatarImage src={leaderboard[2]?.user.avatar} />
                                            <AvatarFallback>{leaderboard[2]?.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-bold">{leaderboard[2]?.user.name}</div>
                                        <div className="text-sm text-muted-foreground">{leaderboard[2]?.total_points} pts</div>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Full Leaderboard */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Classement complet
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                                            entry.is_current_user
                                                ? 'border-primary/20 bg-primary/10 ring-2 ring-primary/20'
                                                : getRankColor(entry.rank)
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex min-w-[40px] items-center gap-2">{getRankIcon(entry.rank)}</div>

                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={entry.user.avatar} />
                                                <AvatarFallback>{entry.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{entry.user.name}</span>
                                                    {entry.is_current_user && <Badge variant="secondary">Vous</Badge>}
                                                    <Badge variant="outline" className={getLevelColor(entry.level)}>
                                                        Niveau {entry.level}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{entry.title}</div>
                                                {entry.recent_achievement && (
                                                    <div className="mt-1 text-xs text-green-600">
                                                        Récent: {entry.recent_achievement.icon} {entry.recent_achievement.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-right">
                                            <div className="text-lg font-bold">{entry.total_points}</div>
                                            <div className="text-sm text-muted-foreground">points</div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{entry.total_achievements} succès</span>
                                                <span>{entry.completion_rate}% complet</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Timeframe Statistics */}
                {timeframeStats.length > 0 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Performances récentes
                                </CardTitle>
                                <CardDescription>Les meilleurs accomplissements de la période sélectionnée</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {timeframeStats.map((stat, index) => (
                                        <div key={index} className="rounded-lg bg-muted/50 p-4 text-center">
                                            <div className="mb-1 text-sm text-muted-foreground">{stat.label}</div>
                                            <Avatar className="mx-auto mb-2 h-12 w-12">
                                                <AvatarImage src={stat.user.avatar} />
                                                <AvatarFallback>{stat.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-bold">{stat.user.name}</div>
                                            <div className="text-sm font-semibold text-primary">
                                                {stat.value} {stat.achievement_type}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/achievements/badges">
                            <Award className="mr-2 h-4 w-4" />
                            Voir les badges
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/achievements/trophies">
                            <Trophy className="mr-2 h-4 w-4" />
                            Voir les trophées
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
