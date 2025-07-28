import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

interface Quiz {
    id: number;
    title: string;
    description?: string;
    questions_count: number;
    sessions_count: number;
    participants_count: number;
}

interface Analytics {
    total_participants: number;
    total_sessions: number;
    average_participants_per_session: number;
    question_stats: Array<{
        id: number;
        text: string;
        order_index: number;
        correct_answers: number;
        total_answers: number;
        accuracy: number;
    }>;
    recent_sessions: Array<{
        id: number;
        code: string;
        status: string;
        participants_count: number;
        created_at: string;
    }>;
}

interface Props {
    quiz: Quiz;
    analytics: Analytics;
}

export default function QuizAnalytics({ quiz, analytics }: Props) {
    return (
        <AppLayout>
            <Head title={`Analytics - ${quiz.title}`} />
            
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href={`/quiz/${quiz.id}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour au quiz
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                    <h2 className="text-xl text-muted-foreground mb-4">{quiz.title}</h2>
                    {quiz.description && (
                        <p className="text-muted-foreground">{quiz.description}</p>
                    )}
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Participants
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.total_participants}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Sessions Créées
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.total_sessions}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Moyenne/Session
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.average_participants_per_session}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Questions
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{quiz.questions_count}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Question Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance par Question</CardTitle>
                            <CardDescription>
                                Statistiques de réussite pour chaque question
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {analytics.question_stats.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.question_stats.map((question, index) => (
                                        <div key={question.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">Question {index + 1}</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {question.text}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    {question.accuracy}% réussite
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span>{question.correct_answers} bonnes réponses</span>
                                                <span>{question.total_answers} total</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Aucune question trouvée</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Sessions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sessions Récentes</CardTitle>
                            <CardDescription>
                                Dernières sessions de quiz créées
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {analytics.recent_sessions.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.recent_sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between border rounded-lg p-4">
                                            <div>
                                                <div className="font-medium">#{session.code}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(session.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge 
                                                    variant={session.status === 'completed' ? 'default' : 'secondary'}
                                                >
                                                    {session.status}
                                                </Badge>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {session.participants_count} participants
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Aucune session créée</p>
                                    <p className="text-sm">Créez votre première session pour voir les statistiques</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}