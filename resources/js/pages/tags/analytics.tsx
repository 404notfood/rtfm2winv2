import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, BookOpen, Calendar, Download, Eye, Filter, Star, Tag, TrendingDown, TrendingUp, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

interface TagStats {
    id: number;
    name: string;
    slug: string;
    color?: string;
    quiz_count: number;
    usage_count: number;
    total_participants: number;
    avg_score: number;
    last_used: string;
    growth_rate: number;
    is_featured: boolean;
    is_trending: boolean;
}

interface AnalyticsData {
    overview: {
        total_tags: number;
        active_tags: number;
        featured_tags: number;
        total_usage: number;
        avg_usage_per_tag: number;
        most_popular_tag: TagStats;
        trending_tags_count: number;
    };
    top_tags: TagStats[];
    trending_tags: TagStats[];
    usage_by_month: Array<{
        month: string;
        usage_count: number;
        tags_created: number;
    }>;
    categories: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
}

interface Props {
    analytics: AnalyticsData;
    filters?: {
        period?: string;
        category?: string;
    };
}

export default function TagsAnalytics({ analytics, filters = {} }: Props) {
    const [period, setPeriod] = useState(filters.period || '30d');
    const [category, setCategory] = useState(filters.category || 'all');

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatPercentage = (num: number) => {
        return num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
    };

    const getTagColor = (color?: string) => {
        return color || '#6B7280';
    };

    const getTrendIcon = (growth: number) => {
        if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <div className="h-4 w-4" />;
    };

    const getTrendColor = (growth: number) => {
        if (growth > 0) return 'text-green-600';
        if (growth < 0) return 'text-red-600';
        return 'text-muted-foreground';
    };

    return (
        <AppLayout>
            <Head title="Analytiques des Tags" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/tags">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux tags
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Analytiques des Tags</h1>
                            <p className="text-muted-foreground">Analysez l'utilisation et la performance de vos tags</p>
                        </div>
                    </div>

                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter le rapport
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filtres :</span>
                            </div>

                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">7 derniers jours</SelectItem>
                                    <SelectItem value="30d">30 derniers jours</SelectItem>
                                    <SelectItem value="90d">3 derniers mois</SelectItem>
                                    <SelectItem value="1y">12 derniers mois</SelectItem>
                                    <SelectItem value="all">Depuis le début</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les catégories</SelectItem>
                                    {analytics.categories.map((cat) => (
                                        <SelectItem key={cat.category} value={cat.category}>
                                            {cat.category} ({cat.count})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">{analytics.overview.total_tags}</div>
                                    <div className="text-sm text-muted-foreground">Tags au total</div>
                                </div>
                                <Tag className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{analytics.overview.active_tags}</div>
                                    <div className="text-sm text-muted-foreground">Tags actifs</div>
                                </div>
                                <Eye className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{analytics.overview.featured_tags}</div>
                                    <div className="text-sm text-muted-foreground">Tags en vedette</div>
                                </div>
                                <Star className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{formatNumber(analytics.overview.total_usage)}</div>
                                    <div className="text-sm text-muted-foreground">Utilisations totales</div>
                                </div>
                                <BarChart3 className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Tags les plus populaires
                            </CardTitle>
                            <CardDescription>Classement par nombre d'utilisations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analytics.top_tags.slice(0, 10).map((tag, index) => (
                                <div key={tag.id} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                        {index + 1}
                                    </div>

                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getTagColor(tag.color) }} />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/tags/${tag.id}`} className="truncate font-medium hover:underline">
                                                {tag.name}
                                            </Link>
                                            {tag.is_featured && (
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                    <Star className="h-3 w-3" />
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {tag.quiz_count} quiz • {formatNumber(tag.total_participants)} participants
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-medium">{formatNumber(tag.usage_count)}</div>
                                        <div className={`flex items-center gap-1 text-sm ${getTrendColor(tag.growth_rate)}`}>
                                            {getTrendIcon(tag.growth_rate)}
                                            {formatPercentage(tag.growth_rate)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Trending Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Tags tendances
                            </CardTitle>
                            <CardDescription>Tags avec la plus forte croissance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analytics.trending_tags.slice(0, 10).map((tag, index) => (
                                <div key={tag.id} className="flex items-center gap-3">
                                    <TrendingUp className="h-4 w-4 text-green-600" />

                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getTagColor(tag.color) }} />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/tags/${tag.id}`} className="truncate font-medium hover:underline">
                                                {tag.name}
                                            </Link>
                                            {tag.is_trending && <Badge className="bg-green-100 text-green-800">Trending</Badge>}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {tag.quiz_count} quiz • Utilisé il y a {tag.last_used}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-medium text-green-600">{formatPercentage(tag.growth_rate)}</div>
                                        <div className="text-sm text-muted-foreground">{formatNumber(tag.usage_count)} utilisations</div>
                                    </div>
                                </div>
                            ))}

                            {analytics.trending_tags.length === 0 && (
                                <div className="py-4 text-center text-muted-foreground">
                                    <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p className="text-sm">Aucun tag en tendance pour le moment</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Usage Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Évolution de l'utilisation
                        </CardTitle>
                        <CardDescription>Utilisation des tags et création par mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.usage_by_month.map((month, index) => (
                                <div key={month.month} className="flex items-center justify-between rounded bg-muted/30 p-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{month.month}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span>{formatNumber(month.usage_count)} utilisations</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Tag className="h-4 w-4 text-green-600" />
                                            <span>{month.tags_created} créés</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Répartition par catégories
                        </CardTitle>
                        <CardDescription>Distribution des tags par catégorie de contenu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {analytics.categories.map((cat) => (
                                <div key={cat.category} className="rounded-lg bg-muted/30 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="font-medium">{cat.category}</span>
                                        <Badge variant="outline">{cat.count}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 rounded-full bg-muted">
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${cat.percentage}%` }} />
                                        </div>
                                        <span className="text-sm text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Insights clés
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                            <div className="flex items-start gap-2">
                                <BarChart3 className="mt-0.5 h-4 w-4 text-blue-600" />
                                <div>
                                    <div className="font-medium text-blue-900 dark:text-blue-100">Utilisation moyenne par tag</div>
                                    <div className="text-sm text-blue-700 dark:text-blue-300">
                                        Chaque tag est utilisé en moyenne {analytics.overview.avg_usage_per_tag.toFixed(1)} fois
                                    </div>
                                </div>
                            </div>
                        </div>

                        {analytics.overview.most_popular_tag && (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                <div className="flex items-start gap-2">
                                    <Star className="mt-0.5 h-4 w-4 text-yellow-600" />
                                    <div>
                                        <div className="font-medium text-yellow-900 dark:text-yellow-100">Tag le plus populaire</div>
                                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                            "{analytics.overview.most_popular_tag.name}" avec{' '}
                                            {formatNumber(analytics.overview.most_popular_tag.usage_count)} utilisations
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                            <div className="flex items-start gap-2">
                                <TrendingUp className="mt-0.5 h-4 w-4 text-green-600" />
                                <div>
                                    <div className="font-medium text-green-900 dark:text-green-100">Tags tendances</div>
                                    <div className="text-sm text-green-700 dark:text-green-300">
                                        {analytics.overview.trending_tags_count} tags connaissent une forte croissance cette période
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
