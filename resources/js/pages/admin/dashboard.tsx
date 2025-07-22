import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    BookOpen,
    CheckCircle,
    Clock,
    Database,
    Download,
    Play,
    RefreshCw,
    Server,
    Shield,
    Star,
    Target,
    TrendingDown,
    TrendingUp,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardStats {
    overview: {
        total_users: number;
        total_quizzes: number;
        total_sessions: number;
        total_participants: number;
        growth_rate: {
            users: number;
            quizzes: number;
            sessions: number;
            participants: number;
        };
    };
    users: {
        active_users: number;
        new_users_today: number;
        suspended_users: number;
        admin_count: number;
        presenter_count: number;
        user_count: number;
        guest_count: number;
    };
    quizzes: {
        published_quizzes: number;
        draft_quizzes: number;
        archived_quizzes: number;
        avg_questions_per_quiz: number;
        most_popular_category: string;
        total_tags: number;
    };
    sessions: {
        live_sessions: number;
        completed_sessions: number;
        battle_royale_sessions: number;
        tournament_sessions: number;
        avg_participants_per_session: number;
        avg_duration_minutes: number;
    };
    system: {
        database_size: string;
        storage_used: string;
        cache_hit_rate: number;
        avg_response_time: number;
        uptime_percentage: number;
        last_backup: string;
    };
}

interface RecentActivity {
    id: number;
    type: 'user_registration' | 'quiz_created' | 'session_started' | 'user_suspended' | 'system_error';
    description: string;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
    timestamp: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

interface TopContent {
    most_popular_quizzes: Array<{
        id: number;
        title: string;
        creator: string;
        participants_count: number;
        sessions_count: number;
        avg_score: number;
    }>;
    top_users: Array<{
        id: number;
        name: string;
        role: string;
        quizzes_count: number;
        sessions_count: number;
        total_participants: number;
    }>;
    trending_tags: Array<{
        id: number;
        name: string;
        color?: string;
        usage_count: number;
        growth_rate: number;
    }>;
}

interface Props {
    stats: DashboardStats;
    recent_activity: RecentActivity[];
    top_content: TopContent;
    filters?: {
        period?: string;
        category?: string;
    };
}

export default function AdminDashboard({ stats, recent_activity, top_content, filters = {} }: Props) {
    const [period, setPeriod] = useState(filters.period || '30d');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        router.reload({ onFinish: () => setRefreshing(false) });
    };

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        router.get(
            '/admin/dashboard',
            { period: newPeriod },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatGrowthRate = (rate: number) => {
        const sign = rate >= 0 ? '+' : '';
        return `${sign}${rate.toFixed(1)}%`;
    };

    const getGrowthColor = (rate: number) => {
        if (rate > 0) return 'text-green-600';
        if (rate < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getGrowthIcon = (rate: number) => {
        if (rate > 0) return <TrendingUp className="h-3 w-3" />;
        if (rate < 0) return <TrendingDown className="h-3 w-3" />;
        return null;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_registration':
                return <Users className="h-4 w-4 text-blue-600" />;
            case 'quiz_created':
                return <BookOpen className="h-4 w-4 text-green-600" />;
            case 'session_started':
                return <Play className="h-4 w-4 text-purple-600" />;
            case 'user_suspended':
                return <Shield className="h-4 w-4 text-red-600" />;
            case 'system_error':
                return <AlertTriangle className="h-4 w-4 text-orange-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const colors = {
            info: 'bg-blue-100 text-blue-800',
            success: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[severity as keyof typeof colors] || colors.info}>{severity}</Badge>;
    };

    const getSystemHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
        if (value >= thresholds.good) return 'text-green-600';
        if (value >= thresholds.warning) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout>
            <Head title="Dashboard Administrateur" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
                        <p className="text-muted-foreground">Vue d'ensemble de l'activité et des performances de la plateforme</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">Dernières 24h</SelectItem>
                                <SelectItem value="7d">7 derniers jours</SelectItem>
                                <SelectItem value="30d">30 derniers jours</SelectItem>
                                <SelectItem value="90d">3 derniers mois</SelectItem>
                                <SelectItem value="1y">12 derniers mois</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/reports">
                                <Download className="mr-2 h-4 w-4" />
                                Rapports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Overview Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.overview.total_users)}</div>
                                    <div className="text-sm text-muted-foreground">Utilisateurs</div>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className={`mt-2 flex items-center gap-1 text-sm ${getGrowthColor(stats.overview.growth_rate.users)}`}>
                                {getGrowthIcon(stats.overview.growth_rate.users)}
                                {formatGrowthRate(stats.overview.growth_rate.users)} vs période précédente
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{formatNumber(stats.overview.total_quizzes)}</div>
                                    <div className="text-sm text-muted-foreground">Quiz</div>
                                </div>
                                <BookOpen className="h-8 w-8 text-green-500" />
                            </div>
                            <div className={`mt-2 flex items-center gap-1 text-sm ${getGrowthColor(stats.overview.growth_rate.quizzes)}`}>
                                {getGrowthIcon(stats.overview.growth_rate.quizzes)}
                                {formatGrowthRate(stats.overview.growth_rate.quizzes)} vs période précédente
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.overview.total_sessions)}</div>
                                    <div className="text-sm text-muted-foreground">Sessions</div>
                                </div>
                                <Play className="h-8 w-8 text-purple-500" />
                            </div>
                            <div className={`mt-2 flex items-center gap-1 text-sm ${getGrowthColor(stats.overview.growth_rate.sessions)}`}>
                                {getGrowthIcon(stats.overview.growth_rate.sessions)}
                                {formatGrowthRate(stats.overview.growth_rate.sessions)} vs période précédente
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.overview.total_participants)}</div>
                                    <div className="text-sm text-muted-foreground">Participants</div>
                                </div>
                                <Target className="h-8 w-8 text-orange-500" />
                            </div>
                            <div className={`mt-2 flex items-center gap-1 text-sm ${getGrowthColor(stats.overview.growth_rate.participants)}`}>
                                {getGrowthIcon(stats.overview.growth_rate.participants)}
                                {formatGrowthRate(stats.overview.growth_rate.participants)} vs période précédente
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Detailed Analytics */}
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                        <TabsTrigger value="content">Contenu</TabsTrigger>
                        <TabsTrigger value="activity">Activité</TabsTrigger>
                        <TabsTrigger value="system">Système</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-green-600">{stats.users.active_users}</div>
                                    <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-blue-600">{stats.users.new_users_today}</div>
                                    <div className="text-sm text-muted-foreground">Nouveaux aujourd'hui</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-red-600">{stats.users.suspended_users}</div>
                                    <div className="text-sm text-muted-foreground">Suspendus</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-purple-600">{stats.users.admin_count}</div>
                                    <div className="text-sm text-muted-foreground">Administrateurs</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Users */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Utilisateurs les plus actifs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {top_content.top_users.map((user, index) => (
                                        <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                                                        {user.name}
                                                    </Link>
                                                    <Badge variant="outline">{user.role}</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.quizzes_count} quiz • {user.sessions_count} sessions • {user.total_participants}{' '}
                                                    participants
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-green-600">{stats.quizzes.published_quizzes}</div>
                                    <div className="text-sm text-muted-foreground">Quiz publiés</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.quizzes.draft_quizzes}</div>
                                    <div className="text-sm text-muted-foreground">Brouillons</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-blue-600">{stats.quizzes.avg_questions_per_quiz}</div>
                                    <div className="text-sm text-muted-foreground">Questions/quiz moy.</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-purple-600">{stats.quizzes.total_tags}</div>
                                    <div className="text-sm text-muted-foreground">Tags créés</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Most Popular Quizzes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        Quiz les plus populaires
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {top_content.most_popular_quizzes.map((quiz, index) => (
                                            <div key={quiz.id} className="flex items-center gap-3 rounded-lg border p-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <Link href={`/quiz/${quiz.id}`} className="font-medium hover:underline">
                                                        {quiz.title}
                                                    </Link>
                                                    <div className="text-sm text-muted-foreground">
                                                        par {quiz.creator} • {quiz.participants_count} participants • Score moy. {quiz.avg_score}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trending Tags */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                        Tags tendances
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {top_content.trending_tags.map((tag) => (
                                            <div key={tag.id} className="flex items-center gap-3 rounded-lg border p-3">
                                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: tag.color || '#6B7280' }} />
                                                <div className="flex-1">
                                                    <Link href={`/tags/${tag.id}`} className="font-medium hover:underline">
                                                        {tag.name}
                                                    </Link>
                                                    <div className="text-sm text-muted-foreground">{tag.usage_count} utilisations</div>
                                                </div>
                                                <div className={`text-sm font-medium ${getGrowthColor(tag.growth_rate)}`}>
                                                    {formatGrowthRate(tag.growth_rate)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-green-600">{stats.sessions.live_sessions}</div>
                                    <div className="text-sm text-muted-foreground">Sessions en cours</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-blue-600">{stats.sessions.completed_sessions}</div>
                                    <div className="text-sm text-muted-foreground">Sessions terminées</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-purple-600">{stats.sessions.avg_participants_per_session}</div>
                                    <div className="text-sm text-muted-foreground">Participants/session moy.</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-orange-600">{stats.sessions.avg_duration_minutes}min</div>
                                    <div className="text-sm text-muted-foreground">Durée moyenne</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Activité récente
                                </CardTitle>
                                <CardDescription>Événements et actions récents sur la plateforme</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recent_activity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3">
                                            <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm">{activity.description}</p>
                                                        {activity.user && (
                                                            <p className="mt-1 text-xs text-muted-foreground">par {activity.user.name}</p>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 flex items-center gap-2">
                                                        {getSeverityBadge(activity.severity)}
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(activity.timestamp).toLocaleString('fr-FR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Uptime</div>
                                            <div
                                                className={`text-2xl font-bold ${getSystemHealthColor(stats.system.uptime_percentage, { good: 99, warning: 95 })}`}
                                            >
                                                {stats.system.uptime_percentage}%
                                            </div>
                                        </div>
                                        <Server className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Taux de cache</div>
                                            <div
                                                className={`text-2xl font-bold ${getSystemHealthColor(stats.system.cache_hit_rate, { good: 90, warning: 80 })}`}
                                            >
                                                {stats.system.cache_hit_rate}%
                                            </div>
                                        </div>
                                        <Zap className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Temps de réponse</div>
                                            <div
                                                className={`text-2xl font-bold ${getSystemHealthColor(1000 - stats.system.avg_response_time, { good: 800, warning: 500 })}`}
                                            >
                                                {stats.system.avg_response_time}ms
                                            </div>
                                        </div>
                                        <Clock className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        Stockage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Taille de la base de données</span>
                                        <span className="font-medium">{stats.system.database_size}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Stockage utilisé</span>
                                        <span className="font-medium">{stats.system.storage_used}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Dernière sauvegarde</span>
                                        <span className="font-medium">{new Date(stats.system.last_backup).toLocaleString('fr-FR')}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        État du système
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">API</span>
                                        <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Base de données</span>
                                        <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Cache Redis</span>
                                        <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Queue</span>
                                        <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Broadcasting</span>
                                        <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions rapides</CardTitle>
                        <CardDescription>Accès rapide aux fonctionnalités d'administration</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto justify-start p-4" asChild>
                                <Link href="/admin/users">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Gérer les utilisateurs</div>
                                            <div className="text-sm text-muted-foreground">Permissions, suspensions</div>
                                        </div>
                                    </div>
                                </Link>
                            </Button>

                            <Button variant="outline" className="h-auto justify-start p-4" asChild>
                                <Link href="/admin/content">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Modérer le contenu</div>
                                            <div className="text-sm text-muted-foreground">Quiz, questions, signalements</div>
                                        </div>
                                    </div>
                                </Link>
                            </Button>

                            <Button variant="outline" className="h-auto justify-start p-4" asChild>
                                <Link href="/admin/analytics">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Analytiques avancés</div>
                                            <div className="text-sm text-muted-foreground">Rapports détaillés</div>
                                        </div>
                                    </div>
                                </Link>
                            </Button>

                            <Button variant="outline" className="h-auto justify-start p-4" asChild>
                                <Link href="/admin/settings">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Paramètres système</div>
                                            <div className="text-sm text-muted-foreground">Configuration, sécurité</div>
                                        </div>
                                    </div>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
