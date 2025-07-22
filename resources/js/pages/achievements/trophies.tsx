import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, CheckCircle, Crown, Gem, Lock, Medal, Sparkles, Star, Target, Trophy } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

interface TrophyAchievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'master' | 'champion' | 'legend' | 'milestone' | 'seasonal';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    points: number;
    requirement_description: string;
    is_unlocked: boolean;
    progress?: number;
    max_progress?: number;
    unlocked_at?: string;
    unlock_rate: number; // Percentage of players who have unlocked this
    reward_description?: string;
}

interface TrophyCategory {
    name: string;
    description: string;
    icon: any;
    color: string;
    trophies: TrophyAchievement[];
}

interface Props {
    trophyCategories: TrophyCategory[];
    userStats: {
        total_trophies: number;
        total_points: number;
        completion_rate: number;
        tier_counts: Record<string, number>;
        latest_trophy?: TrophyAchievement;
    };
    featuredTrophy?: TrophyAchievement;
}

export default function AchievementsTrophies({ trophyCategories, userStats, featuredTrophy }: Props) {
    const [activeCategory, setActiveCategory] = useState(0);

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'bronze':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'silver':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'gold':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'platinum':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'diamond':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'bronze':
                return <Medal className="h-4 w-4" />;
            case 'silver':
                return <Medal className="h-4 w-4" />;
            case 'gold':
                return <Trophy className="h-4 w-4" />;
            case 'platinum':
                return <Crown className="h-4 w-4" />;
            case 'diamond':
                return <Gem className="h-4 w-4" />;
            default:
                return <Medal className="h-4 w-4" />;
        }
    };

    const getDifficultyColor = (unlockRate: number) => {
        if (unlockRate < 5) return 'text-red-600'; // Très rare
        if (unlockRate < 15) return 'text-orange-600'; // Rare
        if (unlockRate < 40) return 'text-yellow-600'; // Peu commun
        return 'text-green-600'; // Commun
    };

    const getDifficultyLabel = (unlockRate: number) => {
        if (unlockRate < 5) return 'Très rare';
        if (unlockRate < 15) return 'Rare';
        if (unlockRate < 40) return 'Peu commun';
        return 'Commun';
    };

    return (
        <AppLayout>
            <Head title="Trophées - Succès" />

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
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                                <Trophy className="h-5 w-5 text-white" />
                            </div>
                            Collection de Trophées
                        </h1>
                        <p className="text-muted-foreground">Les plus grandes récompenses pour les joueurs d'exception</p>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Trophy className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                                <div className="text-2xl font-bold text-yellow-600">{userStats.total_trophies}</div>
                                <div className="text-sm text-muted-foreground">Trophées débloqués</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Star className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                                <div className="text-2xl font-bold text-blue-600">{userStats.total_points}</div>
                                <div className="text-sm text-muted-foreground">Points de trophées</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Target className="mx-auto mb-2 h-8 w-8 text-green-500" />
                                <div className="text-2xl font-bold text-green-600">{userStats.completion_rate}%</div>
                                <div className="text-sm text-muted-foreground">Collection</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Crown className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                                <div className="text-2xl font-bold text-purple-600">{userStats.tier_counts.platinum || 0}</div>
                                <div className="text-sm text-muted-foreground">Platine</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Gem className="mx-auto mb-2 h-8 w-8 text-indigo-500" />
                                <div className="text-2xl font-bold text-indigo-600">{userStats.tier_counts.diamond || 0}</div>
                                <div className="text-sm text-muted-foreground">Diamant</div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Featured Trophy */}
                {featuredTrophy && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-yellow-600" />
                                    Trophée à la une
                                </CardTitle>
                                <CardDescription>Un défi exceptionnel qui attend les plus ambitieux</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6 rounded-lg bg-white/50 p-6">
                                    <div className="text-center">
                                        <div className="mb-2 text-6xl">{featuredTrophy.icon}</div>
                                        <Badge className={getTierColor(featuredTrophy.tier)}>
                                            {getTierIcon(featuredTrophy.tier)}
                                            <span className="ml-1 capitalize">{featuredTrophy.tier}</span>
                                        </Badge>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h3 className="mb-1 text-2xl font-bold">{featuredTrophy.name}</h3>
                                            <p className="text-muted-foreground">{featuredTrophy.description}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <div className="font-medium">Récompense</div>
                                                <div className="font-semibold text-yellow-600">
                                                    <Star className="mr-1 inline h-4 w-4" />
                                                    {featuredTrophy.points} points
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Difficulté</div>
                                                <div className={getDifficultyColor(featuredTrophy.unlock_rate)}>
                                                    {getDifficultyLabel(featuredTrophy.unlock_rate)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Possesseurs</div>
                                                <div className="text-muted-foreground">{featuredTrophy.unlock_rate}% des joueurs</div>
                                            </div>
                                        </div>
                                        <div className="rounded bg-muted/50 p-3">
                                            <div className="mb-1 text-sm font-medium">Condition</div>
                                            <div className="text-sm text-muted-foreground">{featuredTrophy.requirement_description}</div>
                                        </div>
                                        {!featuredTrophy.is_unlocked && featuredTrophy.progress !== undefined && featuredTrophy.max_progress && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Votre progression</span>
                                                    <span>
                                                        {featuredTrophy.progress}/{featuredTrophy.max_progress}
                                                    </span>
                                                </div>
                                                <Progress value={(featuredTrophy.progress / featuredTrophy.max_progress) * 100} className="h-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Latest Trophy */}
                {userStats.latest_trophy && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Dernier trophée débloqué
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 rounded-lg bg-white/50 p-4">
                                    <div className="text-center">
                                        <div className="mb-2 text-4xl">{userStats.latest_trophy.icon}</div>
                                        <Badge className={getTierColor(userStats.latest_trophy.tier)}>
                                            {getTierIcon(userStats.latest_trophy.tier)}
                                            <span className="ml-1 capitalize">{userStats.latest_trophy.tier}</span>
                                        </Badge>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-1 text-lg font-bold">{userStats.latest_trophy.name}</h3>
                                        <p className="mb-2 text-sm text-muted-foreground">{userStats.latest_trophy.description}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                {userStats.latest_trophy.points} points
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(userStats.latest_trophy.unlocked_at!).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className={getDifficultyColor(userStats.latest_trophy.unlock_rate)}>
                                                {getDifficultyLabel(userStats.latest_trophy.unlock_rate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Tier Distribution */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Medal className="h-5 w-5" />
                                Répartition par niveau
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-4">
                                {[
                                    { key: 'bronze', label: 'Bronze', color: 'text-amber-600' },
                                    { key: 'silver', label: 'Argent', color: 'text-gray-600' },
                                    { key: 'gold', label: 'Or', color: 'text-yellow-600' },
                                    { key: 'platinum', label: 'Platine', color: 'text-blue-600' },
                                    { key: 'diamond', label: 'Diamant', color: 'text-purple-600' },
                                ].map((tier) => (
                                    <div key={tier.key} className="space-y-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {getTierIcon(tier.key)}
                                            <span className="text-sm font-medium">{tier.label}</span>
                                        </div>
                                        <div className={`text-2xl font-bold ${tier.color}`}>{userStats.tier_counts[tier.key] || 0}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Category Navigation */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {trophyCategories.map((category, index) => (
                                    <Button
                                        key={index}
                                        variant={activeCategory === index ? 'default' : 'outline'}
                                        onClick={() => setActiveCategory(index)}
                                        className="flex items-center gap-2"
                                    >
                                        <category.icon className="h-4 w-4" />
                                        {category.name}
                                        <Badge variant="secondary" className="ml-1">
                                            {category.trophies.filter((t) => t.is_unlocked).length}/{category.trophies.length}
                                        </Badge>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Category */}
                {trophyCategories[activeCategory] && (
                    <motion.div key={activeCategory} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${trophyCategories[activeCategory].color}`}
                                    >
                                        {React.createElement(trophyCategories[activeCategory].icon, { className: 'w-5 h-5 text-white' })}
                                    </div>
                                    <div>
                                        <CardTitle>{trophyCategories[activeCategory].name}</CardTitle>
                                        <CardDescription>{trophyCategories[activeCategory].description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {trophyCategories[activeCategory].trophies.map((trophy, index) => (
                                        <motion.div
                                            key={trophy.id}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card
                                                className={`h-full transition-all duration-300 ${
                                                    trophy.is_unlocked
                                                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg'
                                                        : 'opacity-85 hover:shadow-md'
                                                }`}
                                            >
                                                <CardContent className="space-y-4 p-6">
                                                    {/* Trophy Header */}
                                                    <div className="flex items-center justify-between">
                                                        <Badge className={getTierColor(trophy.tier)}>
                                                            {getTierIcon(trophy.tier)}
                                                            <span className="ml-1 capitalize">{trophy.tier}</span>
                                                        </Badge>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`text-sm ${getDifficultyColor(trophy.unlock_rate)}`}>
                                                                {getDifficultyLabel(trophy.unlock_rate)}
                                                            </div>
                                                            {trophy.is_unlocked ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <Lock className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Trophy Icon & Info */}
                                                    <div className="space-y-3 text-center">
                                                        <div className={`text-5xl ${!trophy.is_unlocked ? 'grayscale' : ''}`}>{trophy.icon}</div>
                                                        <div>
                                                            <h3 className="mb-2 text-xl font-bold">{trophy.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{trophy.description}</p>
                                                        </div>
                                                    </div>

                                                    {/* Requirement */}
                                                    <div className="rounded-lg bg-muted/50 p-3">
                                                        <div className="mb-1 text-sm font-medium">Condition à remplir</div>
                                                        <div className="text-sm text-muted-foreground">{trophy.requirement_description}</div>
                                                    </div>

                                                    {/* Progress */}
                                                    {!trophy.is_unlocked && trophy.progress !== undefined && trophy.max_progress && (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span>Progression</span>
                                                                <span>
                                                                    {trophy.progress}/{trophy.max_progress}
                                                                </span>
                                                            </div>
                                                            <Progress value={(trophy.progress / trophy.max_progress) * 100} className="h-3" />
                                                        </div>
                                                    )}

                                                    {/* Reward & Stats */}
                                                    <div className="space-y-2 border-t pt-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Star className="h-4 w-4 text-yellow-500" />
                                                                <span className="font-semibold">{trophy.points} points</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">{trophy.unlock_rate}% des joueurs</div>
                                                        </div>

                                                        {trophy.reward_description && (
                                                            <div className="text-xs font-medium text-green-600">🎁 {trophy.reward_description}</div>
                                                        )}

                                                        {trophy.is_unlocked && trophy.unlocked_at && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Débloqué le {new Date(trophy.unlocked_at).toLocaleDateString('fr-FR')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
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
                        <Link href="/achievements/leaderboard">
                            <Crown className="mr-2 h-4 w-4" />
                            Classement
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
