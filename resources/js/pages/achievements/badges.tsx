import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, CheckCircle, Crown, Lock, Medal, Shield, Sparkles, Star, Target, Trophy } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

interface BadgeAchievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'quiz' | 'speed' | 'accuracy' | 'participation' | 'special';
    points: number;
    requirement_type: 'count' | 'percentage' | 'streak' | 'time';
    requirement_value: number;
    is_unlocked: boolean;
    progress?: number;
    unlocked_at?: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface BadgeCategory {
    name: string;
    description: string;
    icon: any;
    color: string;
    badges: BadgeAchievement[];
}

interface Props {
    badgeCategories: BadgeCategory[];
    userStats: {
        total_badges: number;
        total_points: number;
        completion_rate: number;
        rarity_counts: Record<string, number>;
    };
}

export default function AchievementsBadges({ badgeCategories, userStats }: Props) {
    const [activeCategory, setActiveCategory] = useState(0);

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'uncommon':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rare':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'epic':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'legendary':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRarityIcon = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return <Medal className="h-4 w-4" />;
            case 'uncommon':
                return <Award className="h-4 w-4" />;
            case 'rare':
                return <Shield className="h-4 w-4" />;
            case 'epic':
                return <Crown className="h-4 w-4" />;
            case 'legendary':
                return <Sparkles className="h-4 w-4" />;
            default:
                return <Medal className="h-4 w-4" />;
        }
    };

    const getRequirementText = (badge: BadgeAchievement) => {
        switch (badge.requirement_type) {
            case 'count':
                return `${badge.requirement_value} fois`;
            case 'percentage':
                return `${badge.requirement_value}% de réussite`;
            case 'streak':
                return `${badge.requirement_value} jours consécutifs`;
            case 'time':
                return `en ${badge.requirement_value} secondes`;
            default:
                return badge.requirement_value.toString();
        }
    };

    return (
        <AppLayout>
            <Head title="Badges - Succès" />

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
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                            Collection de Badges
                        </h1>
                        <p className="text-muted-foreground">Débloquez des badges en accomplissant des défis spécifiques</p>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Award className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                                <div className="text-2xl font-bold text-blue-600">{userStats.total_badges}</div>
                                <div className="text-sm text-muted-foreground">Badges débloqués</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Star className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                                <div className="text-2xl font-bold text-yellow-600">{userStats.total_points}</div>
                                <div className="text-sm text-muted-foreground">Points de badges</div>
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
                                <div className="text-2xl font-bold text-purple-600">{userStats.rarity_counts.epic || 0}</div>
                                <div className="text-sm text-muted-foreground">Badges épiques</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Sparkles className="mx-auto mb-2 h-8 w-8 text-orange-500" />
                                <div className="text-2xl font-bold text-orange-600">{userStats.rarity_counts.legendary || 0}</div>
                                <div className="text-sm text-muted-foreground">Badges légendaires</div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Rarity Distribution */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Medal className="h-5 w-5" />
                                Répartition par rareté
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-4">
                                {[
                                    { key: 'common', label: 'Commun', color: 'text-gray-600' },
                                    { key: 'uncommon', label: 'Peu commun', color: 'text-green-600' },
                                    { key: 'rare', label: 'Rare', color: 'text-blue-600' },
                                    { key: 'epic', label: 'Épique', color: 'text-purple-600' },
                                    { key: 'legendary', label: 'Légendaire', color: 'text-orange-600' },
                                ].map((rarity) => (
                                    <div key={rarity.key} className="space-y-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {getRarityIcon(rarity.key)}
                                            <span className="text-sm font-medium">{rarity.label}</span>
                                        </div>
                                        <div className={`text-2xl font-bold ${rarity.color}`}>{userStats.rarity_counts[rarity.key] || 0}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Category Navigation */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {badgeCategories.map((category, index) => (
                                    <Button
                                        key={index}
                                        variant={activeCategory === index ? 'default' : 'outline'}
                                        onClick={() => setActiveCategory(index)}
                                        className="flex items-center gap-2"
                                    >
                                        <category.icon className="h-4 w-4" />
                                        {category.name}
                                        <Badge variant="secondary" className="ml-1">
                                            {category.badges.filter((b) => b.is_unlocked).length}/{category.badges.length}
                                        </Badge>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Category */}
                {badgeCategories[activeCategory] && (
                    <motion.div key={activeCategory} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${badgeCategories[activeCategory].color}`}>
                                        {React.createElement(badgeCategories[activeCategory].icon, { className: 'w-5 h-5 text-white' })}
                                    </div>
                                    <div>
                                        <CardTitle>{badgeCategories[activeCategory].name}</CardTitle>
                                        <CardDescription>{badgeCategories[activeCategory].description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {badgeCategories[activeCategory].badges.map((badge, index) => (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card
                                                className={`transition-all duration-300 ${
                                                    badge.is_unlocked
                                                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg'
                                                        : 'opacity-75 hover:shadow-md'
                                                }`}
                                            >
                                                <CardContent className="space-y-3 p-4">
                                                    {/* Badge Header */}
                                                    <div className="flex items-center justify-between">
                                                        <Badge className={getRarityColor(badge.rarity)}>
                                                            {getRarityIcon(badge.rarity)}
                                                            <span className="ml-1 capitalize">{badge.rarity}</span>
                                                        </Badge>
                                                        {badge.is_unlocked ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    {/* Badge Icon & Info */}
                                                    <div className="space-y-2 text-center">
                                                        <div className={`text-3xl ${!badge.is_unlocked ? 'grayscale' : ''}`}>{badge.icon}</div>
                                                        <div>
                                                            <h4 className="font-semibold">{badge.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{badge.description}</p>
                                                        </div>
                                                    </div>

                                                    {/* Requirement */}
                                                    <div className="rounded bg-muted/50 p-2 text-center">
                                                        <div className="text-xs text-muted-foreground">Objectif</div>
                                                        <div className="text-sm font-medium">{getRequirementText(badge)}</div>
                                                    </div>

                                                    {/* Progress */}
                                                    {!badge.is_unlocked && badge.progress !== undefined && (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span>Progression</span>
                                                                <span>
                                                                    {badge.progress}/{badge.requirement_value}
                                                                </span>
                                                            </div>
                                                            <Progress value={(badge.progress / badge.requirement_value) * 100} className="h-2" />
                                                        </div>
                                                    )}

                                                    {/* Points & Date */}
                                                    <div className="flex items-center justify-between border-t pt-2">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Star className="h-4 w-4 text-yellow-500" />
                                                            {badge.points} pts
                                                        </div>
                                                        {badge.is_unlocked && badge.unlocked_at && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {new Date(badge.unlocked_at).toLocaleDateString('fr-FR')}
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
                        <Link href="/achievements/trophies">
                            <Trophy className="mr-2 h-4 w-4" />
                            Voir les trophées
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
