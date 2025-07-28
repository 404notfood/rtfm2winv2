import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Clock, Copy, Edit, MoreHorizontal, Play, Plus, QrCode, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description: string;
    questions_count: number;
    sessions_count: number;
    is_active: boolean;
    created_at: string;
    creator: {
        id: number;
        name: string;
    };
    tags: Array<{
        id: number;
        name: string;
        color: string;
    }>;
}

interface Props {
    quizzes: Quiz[];
    filters: {
        search?: string;
        tag?: string;
        status?: string;
    };
    can_create: boolean;
}

export default function QuizIndex({ quizzes, filters = {}, can_create }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { get, post, delete: delete_, processing } = useForm();
    const { props } = usePage();
    const user = (props as any).auth?.user;

    const canPresentQuiz = (quiz: Quiz) => {
        return user && (quiz.creator.id === user.id || user.role === 'admin');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/quiz', {
            search,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleQuickAction = (action: string, quiz: Quiz) => {
        switch (action) {
            case 'play':
                if (!canPresentQuiz(quiz)) {
                    alert('Seul le créateur du quiz peut lancer une présentation.');
                    return;
                }
                get(`/quiz/${quiz.id}/play`);
                break;
            case 'edit':
                get(`/quiz/${quiz.id}/edit`);
                break;
            case 'duplicate':
                post(`/quiz/${quiz.id}/duplicate`);
                break;
            case 'delete':
                if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
                    delete_(`/quiz/${quiz.id}`);
                }
                break;
        }
    };

    return (
        <AppLayout>
            <Head title="Quiz" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Quiz</h1>
                        <p className="text-muted-foreground">Découvrez et créez des quiz interactifs</p>
                    </div>
                    {can_create && (
                        <Button asChild>
                            <Link href="/quiz/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Créer un quiz
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Rechercher des quiz..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Search className="mr-2 h-4 w-4" />
                                Rechercher
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Quiz Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="group transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="mb-2 line-clamp-2">
                                            <Link href={`/quiz/${quiz.id}`} className="transition-colors hover:text-primary">
                                                {quiz.title}
                                            </Link>
                                        </CardTitle>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{quiz.description}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {canPresentQuiz(quiz) && (
                                                <DropdownMenuItem onClick={() => handleQuickAction('play', quiz)}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Présenter
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => handleQuickAction('edit', quiz)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleQuickAction('duplicate', quiz)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Dupliquer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleQuickAction('delete', quiz)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Tags */}
                                {quiz.tags.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-1">
                                        {quiz.tags.slice(0, 3).map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="secondary"
                                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                                className="text-xs"
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))}
                                        {quiz.tags.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{quiz.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {quiz.questions_count} questions
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {quiz.sessions_count} sessions
                                        </div>
                                    </div>
                                    <div
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            quiz.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {quiz.is_active ? 'Actif' : 'Inactif'}
                                    </div>
                                </div>

                                {/* Creator */}
                                <div className="mb-4 text-xs text-muted-foreground">Créé par {quiz.creator.name}</div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {canPresentQuiz(quiz) && (
                                        <Button size="sm" onClick={() => handleQuickAction('play', quiz)} className="flex-1 bg-green-600 hover:bg-green-700">
                                            <Play className="mr-2 h-4 w-4" />
                                            Présenter
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => handleQuickAction('edit', quiz)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <QrCode className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {quizzes.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">Aucun quiz trouvé</h3>
                            <p className="mb-4 text-muted-foreground">
                                {search ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre premier quiz.'}
                            </p>
                            {can_create && !search && (
                                <Button asChild>
                                    <Link href="/quiz/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer un quiz
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

            </div>
        </AppLayout>
    );
}
