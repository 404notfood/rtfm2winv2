import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

// ShadcnUI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Icons
import { BarChart3, BookOpen, Clock, Eye, Play, Plus, Search, Target, TrendingUp, Trophy, Users, Zap } from 'lucide-react';

// Interfaces
interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    trophies_count?: number;
    achievement_points?: number;
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    created_at: string;
    questions_count: number;
    category?: string;
    status: string;
    participants_count?: number;
}

interface Trophy {
    id: number;
    name: string;
    description: string;
    icon?: string;
    awarded_at?: string;
}

interface DashboardStats {
    quizzes_created: number;
    total_participants: number;
    total_views: number;
    avg_score: number;
}

interface DashboardProps {
    stats: DashboardStats;
    recentQuizzes: Quiz[];
    recentTrophies: Trophy[];
    recentActivity: Array<{
        type: string;
        description: string;
        time: string;
        icon: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, recentQuizzes, recentTrophies, recentActivity }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Actif</Badge>;
            case 'draft':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Brouillon</Badge>;
            case 'archived':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Archivé</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - RTFM2Win" />

            <div className="space-y-8 p-6">
                {/* En-tête de bienvenue */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Bienvenue, {auth.user?.name} ! 👋</h1>
                        <p className="mt-1 text-muted-foreground">Voici un aperçu de votre activité sur RTFM2Win</p>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => router.visit('/quiz/create')}
                            className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:from-primary/90 hover:to-secondary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Créer un Quiz
                        </Button>
                        <Button variant="outline" onClick={() => router.visit('/quiz')}>
                            <Search className="mr-2 h-4 w-4" />
                            Explorer
                        </Button>
                    </div>
                </motion.div>

                {/* Statistiques principales */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quiz Créés</CardTitle>
                            <BookOpen className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{stats.quizzes_created || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 inline h-3 w-3" />
                                +2 ce mois-ci
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Participants</CardTitle>
                            <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.total_participants || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 inline h-3 w-3" />
                                +23 cette semaine
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
                            <Eye className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{(stats.total_views || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 inline h-3 w-3" />
                                +12% vs mois dernier
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
                            <Target className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.avg_score || 0}%</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 inline h-3 w-3" />
                                +5% d'amélioration
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Quiz récents (2/3) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                            Mes Quiz Récents
                                        </CardTitle>
                                        <CardDescription>Gérez et suivez vos quiz créés</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => router.visit('/quiz/history')}>
                                        Voir tout
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(recentQuizzes || []).length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                        <p className="mb-2 text-lg font-medium">Aucun quiz créé</p>
                                        <p className="mb-4">Commencez par créer votre premier quiz !</p>
                                        <Button onClick={() => router.visit('/quiz/create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Créer mon premier quiz
                                        </Button>
                                    </div>
                                ) : (
                                    (recentQuizzes || []).map((quiz, index) => (
                                        <motion.div
                                            key={quiz.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-3">
                                                    <h3 className="font-medium text-foreground">{quiz.title}</h3>
                                                    {getStatusBadge(quiz.status)}
                                                </div>
                                                <p className="mb-2 text-sm text-muted-foreground">{quiz.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(quiz.created_at)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" />
                                                        {quiz.questions_count} questions
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {quiz.participants_count} participants
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => router.visit(`/quiz/${quiz.id}`)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => router.visit(`/quiz/${quiz.id}/play`)}>
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sidebar droite (1/3) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Trophées récents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Trophées Récents
                                </CardTitle>
                                <CardDescription>Vos derniers succès</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(recentTrophies || []).length === 0 ? (
                                    <div className="py-4 text-center text-muted-foreground">
                                        <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                        <p className="text-sm">Aucun trophée encore</p>
                                    </div>
                                ) : (
                                    (recentTrophies || []).map((trophy) => (
                                        <div key={trophy.id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                                <Trophy className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium">{trophy.name}</h4>
                                                <p className="text-xs text-muted-foreground">{trophy.description}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <Button variant="outline" size="sm" className="w-full" onClick={() => router.visit('/profile/achievements')}>
                                    Voir tous les trophées
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Activité récente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-500" />
                                    Activité Récente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(recentActivity || []).map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="text-lg">{activity.icon}</div>
                                        <div className="flex-1">
                                            <p className="text-sm text-foreground">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
