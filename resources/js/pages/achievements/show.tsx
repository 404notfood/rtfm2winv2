import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, CheckCircle, Clock, Crown, Download, Gem, Medal, Share2, Sparkles, Star, Target, Trophy, Users, Zap } from 'lucide-react';

interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'quiz' | 'battle' | 'social' | 'special';
    type: 'badge' | 'trophy';
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    points: number;
    requirement_description: string;
    requirement_value: number;
    unlock_rate: number;
    is_unlocked: boolean;
    unlocked_at?: string;
    progress?: number;
    reward_description?: string;
    tips?: string[];
}

interface RecentUnlock {
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    unlocked_at: string;
}

interface SimilarAchievement {
    id: number;
    name: string;
    icon: string;
    points: number;
    is_unlocked: boolean;
}

interface Props {
    achievement: Achievement;
    recentUnlocks: RecentUnlock[];
    similarAchievements: SimilarAchievement[];
    userStats: {
        total_achievements: number;
        category_progress: Record<string, { unlocked: number; total: number }>;
    };
}

export default function AchievementShow({ achievement, recentUnlocks, similarAchievements, userStats }: Props) {
    const getTierColor = (tier?: string) => {
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

    const getRarityColor = (rarity?: string) => {
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

    const getTierIcon = (tier?: string) => {
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
                return <Award className="h-4 w-4" />;
        }
    };

    const getDifficultyColor = (unlockRate: number) => {
        if (unlockRate < 5) return 'text-red-600';
        if (unlockRate < 15) return 'text-orange-600';
        if (unlockRate < 40) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getDifficultyLabel = (unlockRate: number) => {
        if (unlockRate < 5) return 'Très rare';
        if (unlockRate < 15) return 'Rare';
        if (unlockRate < 40) return 'Peu commun';
        return 'Commun';
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

    const progressPercentage =
        achievement.progress && achievement.requirement_value ? Math.min((achievement.progress / achievement.requirement_value) * 100, 100) : 0;

    return (
        <AppLayout>
            <Head title={`${achievement.name} - Succès`} />

            <div className="mx-auto max-w-4xl space-y-6">
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
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    achievement.is_unlocked
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                }`}
                            >
                                {achievement.is_unlocked ? <CheckCircle className="h-5 w-5 text-white" /> : <Clock className="h-5 w-5 text-white" />}
                            </div>
                            {achievement.name}
                        </h1>
                        <p className="text-muted-foreground">
                            {achievement.type === 'trophy' ? 'Trophée' : 'Badge'} • Catégorie {achievement.category}
                        </p>
                    </div>
                </motion.div>

                {/* Achievement Details */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <Card
                        className={`${
                            achievement.is_unlocked
                                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
                        }`}
                    >
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                {/* Achievement Icon & Basic Info */}
                                <div className="space-y-4 text-center">
                                    <div className={`mx-auto text-8xl ${!achievement.is_unlocked ? 'grayscale' : ''}`}>{achievement.icon}</div>

                                    <div className="space-y-2">
                                        <div className="flex justify-center gap-2">
                                            <Badge className={achievement.tier ? getTierColor(achievement.tier) : getRarityColor(achievement.rarity)}>
                                                {achievement.tier ? getTierIcon(achievement.tier) : getCategoryIcon(achievement.category)}
                                                <span className="ml-1 capitalize">{achievement.tier || achievement.rarity}</span>
                                            </Badge>
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                {getCategoryIcon(achievement.category)}
                                                {achievement.category}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                <span className="font-semibold">{achievement.points} points</span>
                                            </div>
                                            <div className={getDifficultyColor(achievement.unlock_rate)}>
                                                {getDifficultyLabel(achievement.unlock_rate)}
                                            </div>
                                            <div className="text-muted-foreground">{achievement.unlock_rate}% ont débloqué</div>
                                        </div>
                                    </div>

                                    {achievement.is_unlocked && achievement.unlocked_at && (
                                        <div className="rounded-lg bg-green-100 p-3 text-green-800">
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4" />
                                                Débloqué le{' '}
                                                {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description & Requirements */}
                                <div className="space-y-6 lg:col-span-2">
                                    <div>
                                        <h3 className="mb-3 text-xl font-bold">Description</h3>
                                        <p className="leading-relaxed text-muted-foreground">{achievement.description}</p>
                                    </div>

                                    <div>
                                        <h3 className="mb-3 text-xl font-bold">Condition à remplir</h3>
                                        <div className="rounded-lg bg-muted/50 p-4">
                                            <p className="font-medium">{achievement.requirement_description}</p>
                                        </div>
                                    </div>

                                    {!achievement.is_unlocked && achievement.progress !== undefined && (
                                        <div>
                                            <h3 className="mb-3 text-xl font-bold">Votre progression</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span>Progression actuelle</span>
                                                    <span>
                                                        {achievement.progress}/{achievement.requirement_value}
                                                    </span>
                                                </div>
                                                <Progress value={progressPercentage} className="h-3" />
                                                <div className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% complété</div>
                                            </div>
                                        </div>
                                    )}

                                    {achievement.reward_description && (
                                        <div>
                                            <h3 className="mb-3 text-xl font-bold">Récompense</h3>
                                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                                <p className="text-yellow-800">{achievement.reward_description}</p>
                                            </div>
                                        </div>
                                    )}

                                    {achievement.tips && achievement.tips.length > 0 && (
                                        <div>
                                            <h3 className="mb-3 text-xl font-bold">Conseils pour débloquer</h3>
                                            <ul className="space-y-2">
                                                {achievement.tips.map((tip, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                        <span className="text-sm text-muted-foreground">{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Unlocks */}
                    {recentUnlocks.length > 0 && (
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Récemment débloqué par
                                    </CardTitle>
                                    <CardDescription>Les derniers joueurs à avoir obtenu ce succès</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentUnlocks.slice(0, 5).map((unlock, index) => (
                                            <div key={index} className="flex items-center justify-between rounded bg-muted/50 p-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={unlock.user.avatar} />
                                                        <AvatarFallback className="text-xs">
                                                            {unlock.user.name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{unlock.user.name}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(unlock.unlocked_at).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Similar Achievements */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Succès similaires
                                </CardTitle>
                                <CardDescription>D'autres succès qui pourraient vous intéresser</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {similarAchievements.map((similar) => (
                                        <Link
                                            key={similar.id}
                                            href={`/achievements/${similar.id}`}
                                            className="block rounded bg-muted/50 p-3 transition-colors hover:bg-muted"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`text-2xl ${!similar.is_unlocked ? 'grayscale' : ''}`}>{similar.icon}</div>
                                                    <div>
                                                        <div className="text-sm font-medium">{similar.name}</div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Star className="h-3 w-3 text-yellow-500" />
                                                                {similar.points} pts
                                                            </div>
                                                            {similar.is_unlocked && <CheckCircle className="h-3 w-3 text-green-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Category Progress */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Votre progression dans cette catégorie
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                                {Object.entries(userStats.category_progress).map(([category, progress]) => (
                                    <div key={category} className="space-y-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {getCategoryIcon(category)}
                                            <span className="text-sm font-medium capitalize">{category}</span>
                                        </div>
                                        <div className="text-2xl font-bold">{Math.round((progress.unlocked / progress.total) * 100)}%</div>
                                        <div className="text-xs text-muted-foreground">
                                            {progress.unlocked}/{progress.total}
                                        </div>
                                        <Progress value={(progress.unlocked / progress.total) * 100} className="h-2 w-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-4"
                >
                    <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager
                    </Button>

                    {achievement.is_unlocked && (
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger le certificat
                        </Button>
                    )}

                    <Button asChild>
                        <Link href="/achievements">
                            <Award className="mr-2 h-4 w-4" />
                            Voir tous les succès
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </AppLayout>
    );
}
