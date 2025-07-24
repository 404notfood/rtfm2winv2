import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { BarChart3, Copy, Download, Edit, Play, Plus, QrCode, Share2, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description?: string;
    category?: string;
    status: 'draft' | 'published' | 'archived';
    time_per_question: number;
    questions_count: number;
    unique_link: string;
    qr_code?: string;
    creator: {
        id: number;
        name: string;
    };
    questions: Array<{
        id: number;
        text: string;
        type: 'single' | 'multiple';
        time_limit: number;
        points: number;
        answers: Array<{
            id: number;
            text: string;
            is_correct: boolean;
        }>;
    }>;
    sessions: Array<{
        id: number;
        code: string;
        status: string;
        participants_count: number;
    }>;
}

interface Props {
    quiz: Quiz;
    canEdit: boolean;
    canCreateSession: boolean;
    statistics: {
        total_sessions: number;
        total_participants: number;
        average_score: number;
    };
}

export default function QuizShow({ quiz, canEdit, canCreateSession, statistics }: Props) {
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const { post, delete: destroy, processing } = useForm();

    const createSession = () => {
        post(`/quiz/${quiz.id}/sessions`);
    };

    const duplicateQuiz = () => {
        post(`/quiz/${quiz.id}/duplicate`);
    };

    const deleteQuiz = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le quiz "${quiz.title}" ?`)) {
            destroy(`/quiz/${quiz.id}`);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(quiz.unique_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareQuiz = () => {
        if (navigator.share) {
            navigator.share({
                title: quiz.title,
                text: quiz.description || `Rejoignez le quiz "${quiz.title}"`,
                url: quiz.unique_link,
            });
        } else {
            copyLink();
        }
    };

    const getStatusBadge = () => {
        switch (quiz.status) {
            case 'published':
                return <Badge className="bg-green-100 text-green-800">Publié</Badge>;
            case 'draft':
                return <Badge variant="outline">Brouillon</Badge>;
            case 'archived':
                return <Badge variant="secondary">Archivé</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={quiz.title} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{quiz.title}</h1>
                        <p className="mt-1 text-muted-foreground">{quiz.description}</p>
                        <div className="mt-2 flex items-center gap-4">
                            {getStatusBadge()}
                            {quiz.category && <Badge variant="outline">{quiz.category}</Badge>}
                            <span className="text-sm text-muted-foreground">Par {quiz.creator.name}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={shareQuiz}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Partager
                        </Button>

                        {canEdit && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/quiz/${quiz.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Link>
                                </Button>

                                <Button variant="outline" onClick={duplicateQuiz} disabled={processing}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Dupliquer
                                </Button>

                                <Button variant="destructive" onClick={deleteQuiz} disabled={processing}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </Button>
                            </>
                        )}

                        {canCreateSession && (
                            <Button onClick={createSession} disabled={processing || quiz.status !== 'published'}>
                                <Play className="mr-2 h-4 w-4" />
                                Créer une session
                            </Button>
                        )}
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{quiz.questions_count}</div>
                            <div className="text-sm text-muted-foreground">Questions</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{statistics.total_sessions}</div>
                            <div className="text-sm text-muted-foreground">Sessions</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{statistics.total_participants}</div>
                            <div className="text-sm text-muted-foreground">Participants</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{Math.round(statistics.average_score)}</div>
                            <div className="text-sm text-muted-foreground">Score moyen</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Quiz Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Quiz Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations du quiz</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Temps par question</span>
                                        <span className="font-medium">{quiz.time_per_question}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Nombre de questions</span>
                                        <span className="font-medium">{quiz.questions_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Statut</span>
                                        {getStatusBadge()}
                                    </div>
                                    {quiz.category && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Catégorie</span>
                                            <span className="font-medium">{quiz.category}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Questions List */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Questions ({quiz.questions.length})</CardTitle>
                                    {canEdit && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => router.visit(`/quiz/${quiz.id}/questions/create`)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter une question
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {quiz.questions.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <p className="mb-4">Aucune question ajoutée pour l'instant.</p>
                                            {canEdit && (
                                                <Button 
                                                    onClick={() => router.visit(`/quiz/${quiz.id}/questions/create`)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Ajouter votre première question
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        quiz.questions.map((question, index) => (
                                        <div key={question.id} className="rounded-lg border p-4">
                                            <div className="mb-3 flex items-start justify-between">
                                                <h4 className="font-medium">
                                                    {index + 1}. {question.text}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {question.type === 'single' ? 'Choix unique' : 'Choix multiple'}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {question.points} pts
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {question.answers.map((answer) => (
                                                    <div
                                                        key={answer.id}
                                                        className={`rounded p-2 text-sm ${
                                                            answer.is_correct
                                                                ? 'border border-green-200 bg-green-50 text-green-800'
                                                                : 'bg-gray-50 text-gray-700'
                                                        }`}
                                                    >
                                                        {answer.text}
                                                        {answer.is_correct && <span className="ml-2 text-green-600">✓</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Share & QR Code */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Partage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Lien de participation</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <input type="text" value={quiz.unique_link} readOnly className="flex-1 rounded bg-muted px-3 py-2 text-sm" />
                                        <Button variant="outline" size="sm" onClick={copyLink} className={copied ? 'text-green-600' : ''}>
                                            {copied ? 'Copié !' : 'Copier'}
                                        </Button>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full" onClick={() => setShowQR(!showQR)}>
                                    <QrCode className="mr-2 h-4 w-4" />
                                    {showQR ? 'Masquer' : 'Afficher'} QR Code
                                </Button>

                                {showQR && quiz.qr_code && (
                                    <div className="text-center">
                                        <img src={quiz.qr_code} alt="QR Code" className="mx-auto rounded border" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Sessions */}
                        {quiz.sessions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Sessions récentes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {quiz.sessions.slice(0, 5).map((session) => (
                                            <div key={session.id} className="flex items-center justify-between rounded border p-2">
                                                <div>
                                                    <div className="text-sm font-medium">#{session.code}</div>
                                                    <div className="text-xs text-muted-foreground">{session.participants_count} participants</div>
                                                </div>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {session.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="outline" className="mt-4 w-full" asChild>
                                        <Link href={`/quiz/${quiz.id}/sessions`}>Voir toutes les sessions</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/quiz/${quiz.id}/analytics`}>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Voir les statistiques
                                    </Link>
                                </Button>

                                <Button variant="outline" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Exporter en PDF
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
