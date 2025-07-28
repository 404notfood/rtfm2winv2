import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Crown, Gem, Lock, Medal, Search, Sparkles, Star, Target, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'quiz' | 'battle' | 'social' | 'special';
    type: 'bronze' | 'silver' | 'gold' | 'platinum';
    points: number;
    requirement_value: number;
    is_unlocked: boolean;
    progress?: number;
    unlocked_at?: string;
}

interface UserStats {
    total_achievements: number;
    total_points: number;
    completion_rate: number;
    latest_achievement?: Achievement;
    streak_days: number;
    rank: string;
}

interface Props {
    achievements: Achievement[];
    userStats: UserStats;
    filters?: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function AchievementsIndex({ achievements, userStats, filters = {} }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const { get } = useForm();

    const handleFilter = () => {
        get('/achievements', {
            search,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            preserveState: true,
            preserveScroll: true,
        } as any);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bronze':
                return <Medal className="h-5 w-5 text-amber-600" />;
            case 'silver':
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 'gold':
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 'platinum':
                return <Gem className="h-5 w-5 text-purple-500" />;
            default:
                return <Award className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'bronze':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'silver':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'gold':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'platinum':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'quiz':
                return <Target className="h-4 w-4" />;
            case 'battle':
                return <Zap className="h-4 w-4" />;
            case 'social':
                return <Users className="h-4 w-4" />;
            case 'special':
                return <Sparkles className="h-4 w-4" />;
            default:
                return <Award className="h-4 w-4" />;
        }
    };

    const categories = [
        { value: 'all', label: 'Tous', icon: Award },
        { value: 'quiz', label: 'Quiz', icon: Target },
        { value: 'battle', label: 'Battle Royale', icon: Zap },
        { value: 'social', label: 'Social', icon: Users },
        { value: 'special', label: 'Spéciaux', icon: Sparkles },
    ];

    const statuses = [
        { value: 'all', label: 'Tous' },
        { value: 'unlocked', label: 'Débloqués' },
        { value: 'locked', label: 'Verrouillés' },
        { value: 'in_progress', label: 'En cours' },
    ];

    const filteredAchievements = achievements.filter((achievement) => {
        if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
        if (selectedStatus !== 'all') {
            if (selectedStatus === 'unlocked' && !achievement.is_unlocked) return false;
            if (selectedStatus === 'locked' && achievement.is_unlocked) return false;
            if (selectedStatus === 'in_progress' && (achievement.is_unlocked || !achievement.progress || achievement.progress === 0)) return false;
        }
        if (
            search &&
            !achievement.name.toLowerCase().includes(search.toLowerCase()) &&
            !achievement.description.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    return (
        <AppLayout>
            <Head title="Succès et Trophées" />

            <div className="space-y-6">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                            <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
                            Succès & Trophées
                        </h1>
                    </div>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        Débloquez des succès, gagnez des points et montrez vos accomplissements !
                    </p>
                </motion.div>

                {/* User Stats */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Trophy className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                                <div className="text-2xl font-bold text-yellow-600">{userStats.total_achievements}</div>
                                <div className="text-sm text-muted-foreground">Succès débloqués</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Star className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                                <div className="text-2xl font-bold text-blue-600">{userStats.total_points}</div>
                                <div className="text-sm text-muted-foreground">Points de succès</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Target className="mx-auto mb-2 h-8 w-8 text-green-500" />
                                <div className="text-2xl font-bold text-green-600">{userStats.completion_rate}%</div>
                                <div className="text-sm text-muted-foreground">Taux de complétion</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Crown className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                                <div className="text-2xl font-bold text-purple-600">{userStats.rank}</div>
                                <div className="text-sm text-muted-foreground">Rang actuel</div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Latest Achievement */}
                {userStats.latest_achievement && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-yellow-600" />
                                    Dernier succès débloqué
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 rounded-lg bg-white/50 p-4">
                                    <div className="text-3xl">{userStats.latest_achievement.icon}</div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-bold">{userStats.latest_achievement.name}</h3>
                                            <Badge className={getTypeColor(userStats.latest_achievement.type)}>
                                                {userStats.latest_achievement.type}
                                            </Badge>
                                        </div>
                                        <p className="mb-2 text-sm text-muted-foreground">{userStats.latest_achievement.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>+{userStats.latest_achievement.points} points</span>
                                            <span>{new Date(userStats.latest_achievement.unlocked_at!).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/achievements/badges">
                            <Award className="mr-2 h-4 w-4" />
                            Badges
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/achievements/trophies">
                            <Trophy className="mr-2 h-4 w-4" />
                            Trophées
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/achievements/leaderboard">
                            <Crown className="mr-2 h-4 w-4" />
                            Classement
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Input placeholder="Rechercher un succès..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                >
                                    {statuses.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleFilter}>
                                <Search className="mr-2 h-4 w-4" />
                                Filtrer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAchievements.map((achievement, index) => (
                        <motion.div
                            key={achievement.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className={`group transition-all duration-300 ${
                                    achievement.is_unlocked
                                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg'
                                        : 'opacity-75 hover:shadow-md'
                                }`}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getCategoryIcon(achievement.category)}
                                            <Badge variant="outline" className="text-xs">
                                                {achievement.category}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {getTypeIcon(achievement.type)}
                                            {achievement.is_unlocked ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Lock className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Achievement Icon & Info */}
                                    <div className="space-y-2 text-center">
                                        <div className={`text-4xl ${!achievement.is_unlocked ? 'grayscale' : ''}`}>{achievement.icon}</div>
                                        <div>
                                            <h3 className="font-bold transition-colors group-hover:text-primary">{achievement.name}</h3>
                                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    {!achievement.is_unlocked && achievement.progress !== undefined && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Progression</span>
                                                <span>
                                                    {achievement.progress}/{achievement.requirement_value}
                                                </span>
                                            </div>
                                            <Progress value={(achievement.progress / achievement.requirement_value) * 100} className="h-2" />
                                        </div>
                                    )}

                                    {/* Points & Type */}
                                    <div className="flex items-center justify-between border-t pt-2">
                                        <Badge className={getTypeColor(achievement.type)}>{achievement.type}</Badge>
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            {achievement.points} pts
                                        </div>
                                    </div>

                                    {/* Unlock Date */}
                                    {achievement.is_unlocked && achievement.unlocked_at && (
                                        <div className="text-center text-xs text-muted-foreground">
                                            Débloqué le {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredAchievements.length === 0 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Award className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">Aucun succès trouvé</h3>
                                <p className="text-muted-foreground">Essayez de modifier vos filtres pour voir plus de succès.</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Progress Summary */}
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            Votre progression
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span>Progression globale</span>
                                    <span>{userStats.completion_rate}%</span>
                                </div>
                                <Progress value={userStats.completion_rate} className="h-3" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                                {categories.slice(1).map((cat) => {
                                    const categoryAchievements = achievements.filter((a) => a.category === cat.value);
                                    const unlockedCount = categoryAchievements.filter((a) => a.is_unlocked).length;
                                    const percentage =
                                        categoryAchievements.length > 0 ? Math.round((unlockedCount / categoryAchievements.length) * 100) : 0;

                                    return (
                                        <div key={cat.value} className="space-y-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <cat.icon className="h-4 w-4" />
                                                <span className="text-sm font-medium">{cat.label}</span>
                                            </div>
                                            <div className="text-2xl font-bold">{percentage}%</div>
                                            <div className="text-xs text-muted-foreground">
                                                {unlockedCount}/{categoryAchievements.length}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
