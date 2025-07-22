import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, BookOpen, Calendar, Download, Eye, Play, RefreshCw, Tag, Target, TrendingUp, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

interface AnalyticsData {
    overview: {
        total_pageviews: number;
        unique_visitors: number;
        avg_session_duration: number;
        bounce_rate: number;
        conversion_rate: number;
        retention_rate: number;
    };
    user_analytics: {
        registration_trends: Array<{
            date: string;
            registrations: number;
            active_users: number;
        }>;
        user_demographics: {
            by_role: Array<{ role: string; count: number; percentage: number }>;
            by_activity: Array<{ level: string; count: number; percentage: number }>;
            by_region: Array<{ region: string; count: number; percentage: number }>;
        };
        engagement_metrics: {
            daily_active_users: number;
            weekly_active_users: number;
            monthly_active_users: number;
            avg_sessions_per_user: number;
            avg_time_on_platform: number;
        };
    };
    content_analytics: {
        quiz_performance: Array<{
            id: number;
            title: string;
            creator: string;
            views: number;
            participants: number;
            completion_rate: number;
            avg_score: number;
            engagement_score: number;
        }>;
        category_performance: Array<{
            category: string;
            quiz_count: number;
            total_participants: number;
            avg_completion_rate: number;
            avg_score: number;
        }>;
        content_trends: Array<{
            period: string;
            quizzes_created: number;
            questions_added: number;
            tags_used: number;
        }>;
    };
    session_analytics: {
        session_trends: Array<{
            date: string;
            total_sessions: number;
            live_sessions: number;
            completed_sessions: number;
            avg_participants: number;
        }>;
        session_types: Array<{
            type: string;
            count: number;
            percentage: number;
            avg_duration: number;
            avg_participants: number;
        }>;
        performance_metrics: {
            avg_load_time: number;
            success_rate: number;
            error_rate: number;
            peak_concurrent_sessions: number;
        };
    };
    geographic_data: Array<{
        country: string;
        users: number;
        sessions: number;
        percentage: number;
    }>;
}

interface Props {
    analytics: AnalyticsData;
    filters?: {
        period?: string;
        category?: string;
        region?: string;
    };
}

export default function AdminAnalytics({ analytics, filters = {} }: Props) {
    const [period, setPeriod] = useState(filters.period || '30d');
    const [category, setCategory] = useState(filters.category || 'all');
    const [activeTab, setActiveTab] = useState('overview');

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`;
    };

    const formatDuration = (minutes: number) => {
        if (minutes >= 60) return `${(minutes / 60).toFixed(1)}h`;
        return `${minutes.toFixed(0)}min`;
    };

    const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }, reverse = false) => {
        if (reverse) {
            if (value <= thresholds.good) return 'text-green-600';
            if (value <= thresholds.warning) return 'text-yellow-600';
            return 'text-red-600';
        } else {
            if (value >= thresholds.good) return 'text-green-600';
            if (value >= thresholds.warning) return 'text-yellow-600';
            return 'text-red-600';
        }
    };

    const getEngagementLevel = (score: number) => {
        if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
        if (score >= 60) return { label: 'Bon', color: 'bg-blue-100 text-blue-800' };
        if (score >= 40) return { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'Faible', color: 'bg-red-100 text-red-800' };
    };

    return (
        <AppLayout>
            <Head title="Analytiques Avancées" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au dashboard
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Analytiques Avancées</h1>
                            <p className="text-muted-foreground">Analyses détaillées des performances et de l'engagement</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">7 derniers jours</SelectItem>
                                <SelectItem value="30d">30 derniers jours</SelectItem>
                                <SelectItem value="90d">3 derniers mois</SelectItem>
                                <SelectItem value="1y">12 derniers mois</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exporter
                        </Button>
                        <Button variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Actualiser
                        </Button>
                    </div>
                </div>

                {/* Overview Metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{formatNumber(analytics.overview.total_pageviews)}</div>
                            <div className="text-sm text-muted-foreground">Pages vues</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{formatNumber(analytics.overview.unique_visitors)}</div>
                            <div className="text-sm text-muted-foreground">Visiteurs uniques</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{formatDuration(analytics.overview.avg_session_duration)}</div>
                            <div className="text-sm text-muted-foreground">Durée moyenne</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div
                                className={`text-2xl font-bold ${getPerformanceColor(analytics.overview.bounce_rate, { good: 30, warning: 50 }, true)}`}
                            >
                                {formatPercentage(analytics.overview.bounce_rate)}
                            </div>
                            <div className="text-sm text-muted-foreground">Taux de rebond</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className={`text-2xl font-bold ${getPerformanceColor(analytics.overview.conversion_rate, { good: 5, warning: 2 })}`}>
                                {formatPercentage(analytics.overview.conversion_rate)}
                            </div>
                            <div className="text-sm text-muted-foreground">Taux de conversion</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div
                                className={`text-2xl font-bold ${getPerformanceColor(analytics.overview.retention_rate, { good: 70, warning: 50 })}`}
                            >
                                {formatPercentage(analytics.overview.retention_rate)}
                            </div>
                            <div className="text-sm text-muted-foreground">Taux de rétention</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Analytics */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                        <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                        <TabsTrigger value="content">Contenu</TabsTrigger>
                        <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* User Engagement */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Engagement utilisateurs
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded bg-muted/30 p-3 text-center">
                                            <div className="text-lg font-bold text-green-600">
                                                {formatNumber(analytics.user_analytics.engagement_metrics.daily_active_users)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">DAU</div>
                                        </div>
                                        <div className="rounded bg-muted/30 p-3 text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {formatNumber(analytics.user_analytics.engagement_metrics.weekly_active_users)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">WAU</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Sessions/utilisateur</span>
                                            <span className="font-medium">
                                                {analytics.user_analytics.engagement_metrics.avg_sessions_per_user.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Temps sur la plateforme</span>
                                            <span className="font-medium">
                                                {formatDuration(analytics.user_analytics.engagement_metrics.avg_time_on_platform)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Geographic Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Répartition géographique
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analytics.geographic_data.slice(0, 8).map((country) => (
                                            <div key={country.country} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-4 w-6 items-center justify-center rounded-sm bg-muted text-xs">
                                                        {country.country.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm">{country.country}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{formatNumber(country.users)}</span>
                                                    <span className="text-xs text-muted-foreground">({formatPercentage(country.percentage)})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Session Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Performance des sessions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div className="rounded bg-muted/30 p-4 text-center">
                                        <div
                                            className={`text-xl font-bold ${getPerformanceColor(analytics.session_analytics.performance_metrics.avg_load_time, { good: 2, warning: 5 }, true)}`}
                                        >
                                            {analytics.session_analytics.performance_metrics.avg_load_time.toFixed(1)}s
                                        </div>
                                        <div className="text-sm text-muted-foreground">Temps de chargement</div>
                                    </div>
                                    <div className="rounded bg-muted/30 p-4 text-center">
                                        <div
                                            className={`text-xl font-bold ${getPerformanceColor(analytics.session_analytics.performance_metrics.success_rate, { good: 95, warning: 90 })}`}
                                        >
                                            {formatPercentage(analytics.session_analytics.performance_metrics.success_rate)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Taux de succès</div>
                                    </div>
                                    <div className="rounded bg-muted/30 p-4 text-center">
                                        <div
                                            className={`text-xl font-bold ${getPerformanceColor(analytics.session_analytics.performance_metrics.error_rate, { good: 1, warning: 3 }, true)}`}
                                        >
                                            {formatPercentage(analytics.session_analytics.performance_metrics.error_rate)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Taux d'erreur</div>
                                    </div>
                                    <div className="rounded bg-muted/30 p-4 text-center">
                                        <div className="text-xl font-bold text-purple-600">
                                            {analytics.session_analytics.performance_metrics.peak_concurrent_sessions}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Sessions simultanées max</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* User Demographics by Role */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par rôle</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.user_analytics.user_demographics.by_role.map((role) => (
                                            <div key={role.role} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="capitalize">{role.role}</span>
                                                    <span className="font-medium">
                                                        {role.count} ({formatPercentage(role.percentage)})
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted">
                                                    <div className="h-2 rounded-full bg-primary" style={{ width: `${role.percentage}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Activity Levels */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Niveau d'activité</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.user_analytics.user_demographics.by_activity.map((activity) => (
                                            <div key={activity.level} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="capitalize">{activity.level}</span>
                                                    <span className="font-medium">
                                                        {activity.count} ({formatPercentage(activity.percentage)})
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted">
                                                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${activity.percentage}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Registration Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Tendances d'inscription
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.user_analytics.registration_trends.slice(-10).map((trend, index) => (
                                        <div key={index} className="flex items-center justify-between rounded border p-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{new Date(trend.date).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-green-600" />
                                                    <span>{trend.registrations} inscriptions</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                    <span>{trend.active_users} actifs</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-6">
                        {/* Top Performing Quizzes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Quiz les plus performants
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.content_analytics.quiz_performance.slice(0, 10).map((quiz, index) => (
                                        <div key={quiz.id} className="flex items-center gap-4 rounded-lg border p-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <Link href={`/quiz/${quiz.id}`} className="font-medium hover:underline">
                                                    {quiz.title}
                                                </Link>
                                                <div className="text-sm text-muted-foreground">par {quiz.creator}</div>
                                                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>{formatNumber(quiz.views)} vues</span>
                                                    <span>{quiz.participants} participants</span>
                                                    <span>{formatPercentage(quiz.completion_rate)} complété</span>
                                                    <span>Score: {formatPercentage(quiz.avg_score)}</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <Badge className={getEngagementLevel(quiz.engagement_score).color}>
                                                    {getEngagementLevel(quiz.engagement_score).label}
                                                </Badge>
                                                <div className="mt-1 text-xs text-muted-foreground">{quiz.engagement_score.toFixed(0)}/100</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Category Performance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5" />
                                        Performance par catégorie
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.content_analytics.category_performance.map((category) => (
                                            <div key={category.category} className="rounded border p-3">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="font-medium">{category.category}</span>
                                                    <Badge variant="outline">{category.quiz_count} quiz</Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div className="text-center">
                                                        <div className="font-medium">{formatNumber(category.total_participants)}</div>
                                                        <div className="text-muted-foreground">Participants</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium">{formatPercentage(category.avg_completion_rate)}</div>
                                                        <div className="text-muted-foreground">Complété</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium">{formatPercentage(category.avg_score)}</div>
                                                        <div className="text-muted-foreground">Score moy.</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Content Trends */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Tendances de création
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.content_analytics.content_trends.slice(-8).map((trend, index) => (
                                            <div key={index} className="flex items-center justify-between rounded border p-3">
                                                <span className="font-medium">{trend.period}</span>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="h-4 w-4 text-green-600" />
                                                        <span>{trend.quizzes_created}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Target className="h-4 w-4 text-blue-600" />
                                                        <span>{trend.questions_added}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Tag className="h-4 w-4 text-purple-600" />
                                                        <span>{trend.tags_used}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="sessions" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Session Types */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Play className="h-5 w-5" />
                                        Types de sessions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.session_analytics.session_types.map((type) => (
                                            <div key={type.type} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="capitalize">{type.type}</span>
                                                    <span className="font-medium">
                                                        {type.count} ({formatPercentage(type.percentage)})
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Durée moy: {formatDuration(type.avg_duration)} • {type.avg_participants.toFixed(1)} participants
                                                    moy.
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted">
                                                    <div className="h-2 rounded-full bg-purple-500" style={{ width: `${type.percentage}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Session Trends */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Tendances des sessions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.session_analytics.session_trends.slice(-10).map((trend, index) => (
                                            <div key={index} className="flex items-center justify-between rounded border p-3">
                                                <span className="font-medium">{new Date(trend.date).toLocaleDateString('fr-FR')}</span>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="text-center">
                                                        <div className="font-medium text-blue-600">{trend.total_sessions}</div>
                                                        <div className="text-xs text-muted-foreground">Total</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium text-green-600">{trend.live_sessions}</div>
                                                        <div className="text-xs text-muted-foreground">En cours</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium text-purple-600">{trend.avg_participants.toFixed(0)}</div>
                                                        <div className="text-xs text-muted-foreground">Moy/session</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
