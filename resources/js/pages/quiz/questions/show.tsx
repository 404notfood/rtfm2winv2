import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Copy, Edit, MessageCircle, Target, Trash2, XCircle } from 'lucide-react';

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
    explanation?: string;
    answers: Answer[];
    created_at: string;
    updated_at: string;
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    questions_count: number;
}

interface Props {
    quiz: Quiz;
    question: Question;
    canEdit: boolean;
    statistics?: {
        total_responses: number;
        correct_responses: number;
        average_time: number;
        difficulty_rating: number;
    };
}

export default function QuestionShow({ quiz, question, canEdit, statistics }: Props) {
    const { delete: destroy, post, processing } = useForm();

    const duplicateQuestion = () => {
        post(`/quiz/${quiz.id}/questions/${question.id}/duplicate`);
    };

    const deleteQuestion = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer cette question ?`)) {
            destroy(`/quiz/${quiz.id}/questions/${question.id}`);
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

    const correctAnswers = question.answers.filter((answer) => answer.is_correct);
    const incorrectAnswers = question.answers.filter((answer) => !answer.is_correct);

    return (
        <AppLayout>
            <Head title={`Question ${question.order_index} - ${quiz.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/quiz/${quiz.id}/questions`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux questions
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Question {question.order_index}</h1>
                            <p className="text-muted-foreground">Quiz : {quiz.title}</p>
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={`/quiz/${quiz.id}/questions/${question.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                </Link>
                            </Button>

                            <Button variant="outline" onClick={duplicateQuestion} disabled={processing}>
                                <Copy className="mr-2 h-4 w-4" />
                                Dupliquer
                            </Button>

                            <Button variant="destructive" onClick={deleteQuestion} disabled={processing}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </Button>
                        </div>
                    )}
                </div>

                {/* Question Details */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="mb-3 flex items-center gap-3">
                                    <Badge className={getTypeColor(question.type)}>{getTypeLabel(question.type)}</Badge>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {question.time_limit}s
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Target className="h-4 w-4" />
                                        {question.points} points
                                    </div>
                                </div>
                                <CardTitle className="mb-3 text-xl">{question.text}</CardTitle>
                                {question.explanation && (
                                    <CardDescription className="flex items-start gap-2">
                                        <MessageCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                                        <span>{question.explanation}</span>
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Statistics */}
                {statistics && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{statistics.total_responses}</div>
                                    <div className="text-sm text-muted-foreground">Réponses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{statistics.correct_responses}</div>
                                    <div className="text-sm text-muted-foreground">Correctes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{Math.round(statistics.average_time)}s</div>
                                    <div className="text-sm text-muted-foreground">Temps moyen</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{statistics.difficulty_rating}/5</div>
                                    <div className="text-sm text-muted-foreground">Difficulté</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Correct Answers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle className="h-5 w-5" />
                                Bonnes réponses ({correctAnswers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {correctAnswers.map((answer) => (
                                <div key={answer.id} className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <div className="mb-1 font-medium text-green-800">{answer.text}</div>
                                    {answer.explanation && <div className="text-sm text-green-600">💡 {answer.explanation}</div>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Incorrect Answers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <XCircle className="h-5 w-5" />
                                Mauvaises réponses ({incorrectAnswers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {incorrectAnswers.map((answer) => (
                                <div key={answer.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                                    <div className="mb-1 font-medium text-red-800">{answer.text}</div>
                                    {answer.explanation && <div className="text-sm text-red-600">💡 {answer.explanation}</div>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <span className="font-medium text-muted-foreground">Créée le :</span>
                                <div>{new Date(question.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Modifiée le :</span>
                                <div>{new Date(question.updated_at).toLocaleString('fr-FR')}</div>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Position :</span>
                                <div>
                                    {question.order_index} / {quiz.questions_count}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Total réponses :</span>
                                <div>{question.answers.length}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
