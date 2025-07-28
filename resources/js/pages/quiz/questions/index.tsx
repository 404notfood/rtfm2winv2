import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowUp, CheckCircle, Clock, Copy, Edit, MoreHorizontal, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Answer {
    id: number;
    text: string;
    is_correct: boolean;
    explanation?: string;
}

interface Question {
    id: number;
    text: string;
    type: 'single' | 'multiple';
    time_limit: number;
    points: number;
    order_index: number;
    answers: Answer[];
    created_at: string;
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    questions_count: number;
}

interface Props {
    quiz: Quiz;
    questions: {
        data: Question[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        type?: string;
    };
    can_edit: boolean;
}

export default function QuestionIndex({ quiz, questions, filters = {}, can_edit }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const { get, post, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(`/quiz/${quiz.id}/questions`, {
            search,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleQuickAction = (action: string, questionId: number) => {
        switch (action) {
            case 'edit':
                get(`/quiz/${quiz.id}/questions/${questionId}/edit`);
                break;
            case 'duplicate':
                post(`/quiz/${quiz.id}/questions/${questionId}/duplicate`);
                break;
            case 'delete':
                if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
                    post(`/quiz/${quiz.id}/questions/${questionId}`, { _method:   'delete' });
                }
                break;
            case 'move-up':
                // TODO: Implement reorder
                break;
            case 'move-down':
                // TODO: Implement reorder
                break;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'single':
                return 'Choix unique';
            case 'multiple':
                return 'Choix multiple';
            default:
                return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'single':
                return 'bg-blue-100 text-blue-800';
            case 'multiple':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title={`Questions - ${quiz.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/quiz/${quiz.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour au quiz
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">Questions</h1>
                        <p className="text-muted-foreground">Gérez les questions de "{quiz.title}"</p>
                    </div>
                    {can_edit && (
                        <Button asChild>
                            <Link href={`/quiz/${quiz.id}/questions/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une question
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Quiz Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{quiz.title}</span>
                            <Badge variant="secondary">{questions.total} questions</Badge>
                        </CardTitle>
                        {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                    </CardHeader>
                </Card>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Rechercher des questions..."
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

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.data.map((question) => (
                        <Card key={question.id} className="transition-shadow hover:shadow-md">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground">Question {question.order_index}</span>
                                            <Badge className={getTypeColor(question.type)}>{getTypeLabel(question.type)}</Badge>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {question.time_limit}s
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <span className="font-medium">{question.points} pts</span>
                                            </div>
                                        </div>
                                        <h3 className="mb-3 text-lg font-medium">{question.text}</h3>

                                        {/* Answers Preview */}
                                        <div className="space-y-2">
                                            {question.answers.slice(0, 3).map((answer) => (
                                                <div
                                                    key={answer.id}
                                                    className={`flex items-center gap-2 rounded p-2 text-sm ${
                                                        answer.is_correct
                                                            ? 'border border-green-200 bg-green-50 text-green-800'
                                                            : 'bg-gray-50 text-gray-700'
                                                    }`}
                                                >
                                                    {answer.is_correct ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-gray-400" />
                                                    )}
                                                    <span className="truncate">{answer.text}</span>
                                                </div>
                                            ))}
                                            {question.answers.length > 3 && (
                                                <div className="text-xs text-muted-foreground">+{question.answers.length - 3} autres réponses</div>
                                            )}
                                        </div>
                                    </div>

                                    {can_edit && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleQuickAction('edit', question.id)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleQuickAction('duplicate', question.id)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Dupliquer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleQuickAction('move-up', question.id)}>
                                                    <ArrowUp className="mr-2 h-4 w-4" />
                                                    Monter
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleQuickAction('move-down', question.id)}>
                                                    <ArrowDown className="mr-2 h-4 w-4" />
                                                    Descendre
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleQuickAction('delete', question.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {questions.data.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">Aucune question trouvée</h3>
                            <p className="mb-4 text-muted-foreground">
                                {search ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter votre première question.'}
                            </p>
                            {can_edit && !search && (
                                <Button asChild>
                                    <Link href={`/quiz/${quiz.id}/questions/create`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter une question
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {questions.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: questions.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === questions.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => get(`/quiz/${quiz.id}/questions?page=${page}`)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
