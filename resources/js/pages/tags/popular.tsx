import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { TrendingUp, Hash, Users, BookOpen, Calendar } from 'lucide-react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color: string;
    quizzes_count: number;
    usage_count: number;
    created_at: string;
    growth_percentage: number;
    category: string;
}

interface PopularTagsProps {
    tags: Tag[];
    stats: {
        total_tags: number;
        trending_tags: number;
        total_usage: number;
        growth_rate: number;
    };
}

export default function PopularTags({ tags, stats }: PopularTagsProps) {
    const getTrendingIcon = (growth: number) => {
        if (growth > 50) return '🔥';
        if (growth > 20) return '📈';
        if (growth > 0) return '⬆️';
        return '➡️';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Éducation': 'bg-blue-100 text-blue-800',
            'Divertissement': 'bg-purple-100 text-purple-800',
            'Science': 'bg-green-100 text-green-800',
            'Technologie': 'bg-gray-100 text-gray-800',
            'Sport': 'bg-orange-100 text-orange-800',
            'Culture': 'bg-pink-100 text-pink-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Tags Populaires" />
            <AppLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Tags Populaires</h1>
                            <p className="text-muted-foreground mt-1">
                                Découvrez les sujets tendance et les plus utilisés
                            </p>
                        </div>
                        <Link href="/tags">
                            <Button variant="outline">
                                <Hash className="w-4 h-4 mr-2" />
                                Tous les tags
                            </Button>
                        </Link>
                    </div>

                    {/* Statistiques globales */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Tags
                                </CardTitle>
                                <Hash className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_tags}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tags Tendance
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.trending_tags}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Utilisations Totales
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_usage.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Taux de Croissance
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{stats.growth_rate}%</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Liste des tags populaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tags.map((tag) => (
                            <Card key={tag.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div 
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <CardTitle className="text-lg">
                                                {getTrendingIcon(tag.growth_percentage)} {tag.name}
                                            </CardTitle>
                                        </div>
                                        <Badge 
                                            className={getCategoryColor(tag.category)}
                                            variant="secondary"
                                        >
                                            {tag.category}
                                        </Badge>
                                    </div>
                                    {tag.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {tag.description}
                                        </p>
                                    )}
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <BookOpen className="w-4 h-4 mr-1" />
                                                {tag.quizzes_count} quiz{tag.quizzes_count > 1 ? 's' : ''}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Users className="w-4 h-4 mr-1" />
                                                {tag.usage_count} utilisations
                                            </div>
                                        </div>

                                        {tag.growth_percentage > 0 && (
                                            <div className="flex items-center text-sm text-green-600">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                +{tag.growth_percentage}% ce mois
                                            </div>
                                        )}

                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            Créé le {new Date(tag.created_at).toLocaleDateString('fr-FR')}
                                        </div>

                                        <div className="pt-2 border-t">
                                            <Link 
                                                href={`/tags/${tag.slug}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Voir les quiz avec ce tag →
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {tags.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Hash className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Aucun tag populaire trouvé
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Les tags populaires apparaîtront ici au fur et à mesure de leur utilisation.
                                </p>
                                <Link href="/tags/create">
                                    <Button>
                                        Créer le premier tag
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        </>
    );
}