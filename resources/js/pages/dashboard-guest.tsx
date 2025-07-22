import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Gift,
    Hash,
    Play,
    QrCode,
    Search,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    UserPlus,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description?: string;
    creator: string;
    questions_count: number;
    category: string;
    difficulty: 'Facile' | 'Moyen' | 'Difficile';
    participants_count: number;
    avg_score: number;
    duration_minutes?: number;
    tags: string[];
    is_featured: boolean;
    created_at: string;
}

interface LiveSession {
    id: number;
    quiz_title: string;
    quiz_id: number;
    creator: string;
    participants_count: number;
    max_participants?: number;
    status: 'waiting' | 'active' | 'ending';
    join_code: string;
    started_at: string;
    estimated_duration: number;
}

interface RecentActivity {
    id: number;
    type: 'quiz_completed' | 'session_joined' | 'achievement_earned' | 'leaderboard_update';
    description: string;
    quiz_title?: string;
    points_earned?: number;
    timestamp: string;
    icon: string;
}

interface Props {
    popular_quizzes: Quiz[];
    live_sessions: LiveSession[];
    recent_activity: RecentActivity[];
    trending_topics: Array<{
        name: string;
        quiz_count: number;
        growth_rate: number;
    }>;
    guest_stats: {
        sessions_joined: number;
        points_earned: number;
        quizzes_completed: number;
        favorite_category: string;
    };
    featured_quiz?: Quiz;
}

export default function GuestDashboard({ popular_quizzes, live_sessions, recent_activity, trending_topics, guest_stats, featured_quiz }: Props) {
    const [joinCode, setJoinCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { post, processing } = useForm();

    const handleJoinWithCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.trim()) {
            router.visit(`/quiz/join/${joinCode.trim().toUpperCase()}`);
        }
    };

    const handleQuickSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/quiz?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const joinLiveSession = (sessionId: number) => {
        router.visit(`/quiz/session/${sessionId}/join`);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Facile':
                return 'bg-green-100 text-green-800';
            case 'Moyen':
                return 'bg-yellow-100 text-yellow-800';
            case 'Difficile':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-blue-100 text-blue-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'ending':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}j`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}min`;
        return "À l'instant";
    };

    return (
        <AppLayout>
            <Head title="Découvrir RTFM2Win - Quiz Interactifs" />

            <div className="space-y-8">
                {/* Welcome Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8"
                >
                    <div className="relative z-10">
                        <div className="mb-4 flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold">Bienvenue sur RTFM2Win !</h1>
                        </div>

                        <p className="mb-6 max-w-2xl text-xl text-muted-foreground">
                            Découvrez des milliers de quiz interactifs, rejoignez des sessions en temps réel et testez vos connaissances dans tous les
                            domaines.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg" asChild>
                                <Link href="/register">
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Créer un compte gratuit
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/quiz">
                                    <Search className="mr-2 h-5 w-5" />
                                    Explorer les quiz
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 h-20 w-20 rounded-full bg-primary/10 blur-xl"></div>
                    <div className="absolute right-12 bottom-4 h-16 w-16 rounded-full bg-secondary/10 blur-xl"></div>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Quick Join Section */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="border-2 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-6 w-6 text-primary" />
                                        Rejoindre un quiz rapidement
                                    </CardTitle>
                                    <CardDescription>Entrez le code d'un quiz pour participer instantanément</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleJoinWithCode} className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Hash className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Code du quiz (ex: ABC123)"
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                className="h-12 pl-9 font-mono text-lg tracking-wider"
                                                maxLength={6}
                                            />
                                        </div>
                                        <Button type="submit" size="lg" disabled={!joinCode.trim()}>
                                            <Play className="mr-2 h-5 w-5" />
                                            Rejoindre
                                        </Button>
                                    </form>

                                    <p className="mt-3 text-sm text-muted-foreground">💡 Vous pouvez aussi scanner un QR code si disponible</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Featured Quiz */}
                        {featured_quiz && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <Card className="border border-primary/20 bg-gradient-to-r from-accent/5 to-primary/5">
                                    <CardHeader>
                                        <div className="mb-2 flex items-center gap-2">
                                            <Star className="h-5 w-5 text-yellow-500" />
                                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Quiz en vedette</Badge>
                                        </div>
                                        <CardTitle className="text-xl">{featured_quiz.title}</CardTitle>
                                        <CardDescription className="text-base">{featured_quiz.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{featured_quiz.participants_count} participants</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{featured_quiz.questions_count} questions</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Target className="h-4 w-4" />
                                                <span>{featured_quiz.avg_score}% de réussite</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getDifficultyColor(featured_quiz.difficulty)}>{featured_quiz.difficulty}</Badge>
                                                <Badge variant="outline">{featured_quiz.category}</Badge>
                                            </div>

                                            <Button asChild className="bg-gradient-to-r from-primary to-secondary">
                                                <Link href={`/quiz/${featured_quiz.id}`}>
                                                    Commencer
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Quick Search */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        Recherche rapide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleQuickSearch} className="flex gap-3">
                                        <Input
                                            placeholder="Rechercher des quiz par sujet, créateur..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button type="submit">
                                            <Search className="mr-2 h-4 w-4" />
                                            Chercher
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Popular Quizzes */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-500" />
                                            Quiz populaires
                                        </CardTitle>
                                        <Button variant="outline" asChild>
                                            <Link href="/quiz">
                                                Voir tout
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                    <CardDescription>Les quiz les plus appréciés par la communauté</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {popular_quizzes.slice(0, 5).map((quiz, index) => (
                                            <div
                                                key={quiz.id}
                                                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                    {index + 1}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <h3 className="font-semibold">{quiz.title}</h3>
                                                        <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                                                    </div>

                                                    <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">{quiz.description}</p>

                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span>{quiz.creator}</span>
                                                        <span>{quiz.participants_count} participants</span>
                                                        <span>{quiz.questions_count} questions</span>
                                                        <span>{quiz.avg_score}% réussite</span>
                                                    </div>
                                                </div>

                                                <Button size="sm" asChild>
                                                    <Link href={`/quiz/${quiz.id}`}>
                                                        <Play className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Live Sessions */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-red-500" />
                                        Sessions en direct
                                    </CardTitle>
                                    <CardDescription>Rejoignez des quiz en cours</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {live_sessions.length === 0 ? (
                                        <div className="py-4 text-center">
                                            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">Aucune session active pour le moment</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {live_sessions.slice(0, 4).map((session) => (
                                                <div key={session.id} className="rounded-lg border p-3">
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="line-clamp-1 text-sm font-medium">{session.quiz_title}</h4>
                                                            <p className="text-xs text-muted-foreground">par {session.creator}</p>
                                                        </div>
                                                        <Badge className={getStatusColor(session.status)}>
                                                            {session.status === 'waiting'
                                                                ? 'En attente'
                                                                : session.status === 'active'
                                                                  ? 'En cours'
                                                                  : 'Se termine'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Users className="h-3 w-3" />
                                                            <span>{session.participants_count}</span>
                                                            {session.max_participants && <span>/ {session.max_participants}</span>}
                                                        </div>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => joinLiveSession(session.id)}
                                                            disabled={processing}
                                                        >
                                                            Rejoindre
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Guest Stats */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        Vos statistiques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded bg-muted/30 p-3 text-center">
                                            <div className="text-lg font-bold text-primary">{guest_stats.sessions_joined}</div>
                                            <div className="text-xs text-muted-foreground">Sessions rejointes</div>
                                        </div>
                                        <div className="rounded bg-muted/30 p-3 text-center">
                                            <div className="text-lg font-bold text-green-600">{guest_stats.points_earned}</div>
                                            <div className="text-xs text-muted-foreground">Points gagnés</div>
                                        </div>
                                    </div>

                                    <div className="rounded bg-muted/30 p-3 text-center">
                                        <div className="text-lg font-bold text-blue-600">{guest_stats.quizzes_completed}</div>
                                        <div className="text-xs text-muted-foreground">Quiz complétés</div>
                                    </div>

                                    {guest_stats.favorite_category && (
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Catégorie préférée</p>
                                            <Badge variant="outline" className="mt-1">
                                                {guest_stats.favorite_category}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Trending Topics */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                        Sujets tendances
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {trending_topics.slice(0, 5).map((topic, index) => (
                                            <div key={topic.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm font-medium">{topic.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">{topic.quiz_count}</span>
                                                    <div
                                                        className={`text-xs font-medium ${topic.growth_rate > 0 ? 'text-green-600' : 'text-gray-600'}`}
                                                    >
                                                        {topic.growth_rate > 0 && '+'}
                                                        {topic.growth_rate}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-500" />
                                        Activité récente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recent_activity.length === 0 ? (
                                        <p className="py-4 text-center text-sm text-muted-foreground">Aucune activité récente</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {recent_activity.slice(0, 5).map((activity) => (
                                                <div key={activity.id} className="flex items-start gap-3">
                                                    <div className="text-lg">{activity.icon}</div>
                                                    <div className="flex-1">
                                                        <p className="text-sm">{activity.description}</p>
                                                        <div className="mt-1 flex items-center justify-between">
                                                            <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                                                            {activity.points_earned && <Badge variant="outline">+{activity.points_earned} pts</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Call to Action */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
                            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
                                <CardContent className="p-6 text-center">
                                    <Gift className="mx-auto mb-4 h-12 w-12 text-primary" />
                                    <h3 className="mb-2 font-semibold">Débloquez plus de fonctionnalités</h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Créez un compte pour sauvegarder vos scores, créer des quiz et bien plus !
                                    </p>
                                    <Button className="w-full bg-gradient-to-r from-primary to-secondary" asChild>
                                        <Link href="/register">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            S'inscrire gratuitement
                                        </Link>
                                    </Button>

                                    <div className="mt-4 border-t pt-4">
                                        <p className="text-xs text-muted-foreground">
                                            Déjà un compte ?{' '}
                                            <Link href="/login" className="text-primary hover:underline">
                                                Se connecter
                                            </Link>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
