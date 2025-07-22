import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, BookOpen, Calendar, Edit, Eye, Hash, Play, Search, Star, Tag, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    is_featured: boolean;
    is_active: boolean;
    quiz_count?: number;
    usage_count?: number;
    created_at: string;
    updated_at: string;
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    creator: {
        id: number;
        name: string;
    };
    questions_count: number;
    sessions_count: number;
    created_at: string;
    updated_at: string;
    tags: Array<{
        id: number;
        name: string;
        color?: string;
    }>;
}

interface Props {
    tag: Tag;
    quizzes: {
        data: Quiz[];
        links: any[];
        meta: any;
    };
    relatedTags: Array<{
        id: number;
        name: string;
        color?: string;
        description?: string;
        quizzes_count: number;
    }>;
    can_manage?: boolean;
}

export default function TagShow({ tag, quizzes, relatedTags = [], can_manage = false }: Props) {
    const [search, setSearch] = useState('');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getTagColor = (tagColor?: string) => {
        return tagColor || '#6B7280';
    };

    const filteredQuizzes = quizzes.data.filter(
        (quiz) =>
            search === '' ||
            quiz.title.toLowerCase().includes(search.toLowerCase()) ||
            quiz.description?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            <Head title={`Tag: ${tag.name}`} />

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

                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: getTagColor(tag.color) }} />
                            <div>
                                <h1 className="flex items-center gap-3 text-3xl font-bold">
                                    {tag.name}
                                    {tag.is_featured && (
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                            <Star className="mr-1 h-3 w-3" />
                                            Vedette
                                        </Badge>
                                    )}
                                    {!tag.is_active && <Badge variant="destructive">Inactif</Badge>}
                                </h1>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Hash className="h-3 w-3" />
                                    <span>#{tag.slug}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {can_manage && (
                        <Button asChild>
                            <Link href={`/tags/${tag.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Description */}
                {tag.description && (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-lg leading-relaxed text-muted-foreground">{tag.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{tag.quiz_count || 0}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <BookOpen className="mr-1 h-3 w-3" />
                                Quiz utilisant ce tag
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{tag.usage_count || 0}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                Utilisations totales
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{quizzes.data.reduce((sum, quiz) => sum + (quiz.sessions_count || 0), 0)}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="mr-1 h-3 w-3" />
                                Sessions totales
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Créé le</div>
                            <div className="font-medium">{formatDate(tag.created_at)}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Quiz List */}
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Quiz utilisant ce tag ({quizzes.data.length})
                                        </CardTitle>
                                        <CardDescription>Explorez tous les quiz associés à ce tag</CardDescription>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher dans les quiz..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {filteredQuizzes.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                        <h3 className="mb-2 text-lg font-semibold">{search ? 'Aucun quiz trouvé' : 'Aucun quiz avec ce tag'}</h3>
                                        <p className="mb-4">
                                            {search
                                                ? 'Aucun quiz ne correspond à votre recherche.'
                                                : "Ce tag n'est utilisé par aucun quiz pour le moment."}
                                        </p>
                                        {can_manage && (
                                            <Button asChild>
                                                <Link href="/quiz/create">Créer un quiz avec ce tag</Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredQuizzes.map((quiz) => (
                                            <Card key={quiz.id} className="transition-shadow hover:shadow-md">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-lg font-semibold">{quiz.title}</h3>
                                                            </div>

                                                            {quiz.description && (
                                                                <p className="line-clamp-2 text-muted-foreground">{quiz.description}</p>
                                                            )}

                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="h-3 w-3" />
                                                                    {quiz.creator.name}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    {quiz.questions_count} questions
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Play className="h-3 w-3" />
                                                                    {quiz.sessions_count} sessions
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {formatDate(quiz.created_at)}
                                                                </span>
                                                            </div>

                                                            {/* Other Tags */}
                                                            {quiz.tags.length > 1 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {quiz.tags
                                                                        .filter((t) => t.id !== tag.id)
                                                                        .map((otherTag) => (
                                                                            <Link
                                                                                key={otherTag.id}
                                                                                href={`/tags/${otherTag.id}`}
                                                                                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs transition-colors hover:bg-muted/80"
                                                                            >
                                                                                <div
                                                                                    className="h-2 w-2 rounded-full"
                                                                                    style={{ backgroundColor: getTagColor(otherTag.color) }}
                                                                                />
                                                                                {otherTag.name}
                                                                            </Link>
                                                                        ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="ml-4 flex items-center gap-2">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/quiz/${quiz.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/quiz/${quiz.id}/play`}>
                                                                    <Play className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Related Tags */}
                        {relatedTags.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5" />
                                        Tags associés
                                    </CardTitle>
                                    <CardDescription>Tags souvent utilisés ensemble</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {relatedTags.map((relatedTag) => (
                                        <Link
                                            key={relatedTag.id}
                                            href={`/tags/${relatedTag.id}`}
                                            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getTagColor(relatedTag.color) }} />
                                                <span className="font-medium">{relatedTag.name}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {relatedTag.quizzes_count}
                                            </Badge>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        {can_manage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Actions rapides
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                        <Link href={`/tags/${tag.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Modifier ce tag
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                        <Link href={`/tags/${tag.id}/analytics`}>
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            Voir les analytiques
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                        <Link href="/quiz/create">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Créer un quiz
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
