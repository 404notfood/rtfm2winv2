import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Clock, Target, Timer, Trophy, Users, XCircle, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Answer {
    id: number;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    text: string;
    type: 'single' | 'multiple';
    time_limit: number;
    points: number;
    answers: Answer[];
    order: number;
}

interface QuizSession {
    id: number;
    code: string;
    status: 'waiting' | 'active' | 'completed';
    quiz: {
        id: number;
        title: string;
        questions_count: number;
    };
    current_question_index: number;
    current_question?: Question;
    participants_count: number;
}

interface Participant {
    id: number;
    pseudo: string;
    score: number;
    is_current_user: boolean;
}

interface Props {
    session: QuizSession;
    participant: Participant;
    leaderboard: Participant[];
    question_start_time?: string;
}

export default function QuizPlay({ session, participant, leaderboard, question_start_time }: Props) {
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [answerResult, setAnswerResult] = useState<{
        correct_answers: number;
        points_earned: number;
        rank: number;
    } | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(session.current_question);
    const [questionIndex, setQuestionIndex] = useState(session.current_question_index);

    const { post, processing } = useForm();

    const submitAnswer = useCallback(() => {
        if (hasAnswered || !currentQuestion) return;

        setHasAnswered(true);

        post(`/quiz/session/${session.code}/answer`, {
            question_id: currentQuestion.id,
            answer_ids: selectedAnswers,
            response_time: currentQuestion.time_limit - timeLeft,
        });
    }, [hasAnswered, currentQuestion, session.code, selectedAnswers, timeLeft, post]);

    // Timer management
    useEffect(() => {
        if (!currentQuestion || hasAnswered || showResults) return;

        const startTime = question_start_time ? new Date(question_start_time) : new Date();
        const endTime = new Date(startTime.getTime() + currentQuestion.time_limit * 1000);

        const updateTimer = () => {
            const now = new Date();
            const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0 && !hasAnswered) {
                submitAnswer(); // Auto-submit when time runs out
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);

        return () => clearInterval(interval);
    }, [currentQuestion, hasAnswered, showResults, question_start_time, submitAnswer]);

    // Real-time updates
    useEffect(() => {
        const channel = window.Echo?.join(`quiz-session.${session.id}`);

        channel?.listen('NextQuestion', (e: { question: Question; question_index: number }) => {
            setCurrentQuestion(e.question);
            setQuestionIndex(e.question_index);
            setSelectedAnswers([]);
            setHasAnswered(false);
            setShowResults(false);
            setAnswerResult(null);
        });

        channel?.listen('QuestionResults', (e: { results: typeof answerResult }) => {
            setShowResults(true);
            setAnswerResult(e.results);
        });

        channel?.listen('SessionEnded', () => {
            window.location.href = `/quiz/session/${session.code}/results`;
        });

        return () => {
            window.Echo?.leaveChannel(`quiz-session.${session.id}`);
        };
    }, [session.id, session.code]);

    const handleAnswerSelect = (answerId: number) => {
        if (hasAnswered || showResults) return;

        if (currentQuestion?.type === 'single') {
            setSelectedAnswers([answerId]);
        } else {
            setSelectedAnswers((prev) => (prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId]));
        }
    };

    const getTimerColor = () => {
        const percentage = (timeLeft / (currentQuestion?.time_limit || 1)) * 100;
        if (percentage > 50) return 'bg-green-500';
        if (percentage > 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getAnswerClass = (answer: Answer) => {
        const isSelected = selectedAnswers.includes(answer.id);

        if (showResults) {
            if (answer.is_correct) {
                return 'border-green-500 bg-green-50 text-green-800';
            } else if (isSelected) {
                return 'border-red-500 bg-red-50 text-red-800';
            }
            return 'border-gray-200 bg-gray-50 text-gray-600';
        }

        if (isSelected) {
            return 'border-blue-500 bg-blue-50 text-blue-800';
        }

        return 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
    };

    if (!currentQuestion) {
        return (
            <AppLayout>
                <Head title="Quiz en cours" />
                <div className="flex min-h-screen items-center justify-center">
                    <Card className="text-center">
                        <CardContent className="p-8">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <Clock className="h-8 w-8 text-blue-600" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold">En attente de la prochaine question...</h2>
                            <p className="text-muted-foreground">Le présentateur va bientôt lancer la prochaine question.</p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Quiz: ${session.quiz.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header with Timer */}
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{session.quiz.title}</h1>
                                <p className="text-muted-foreground">
                                    Question {questionIndex + 1} sur {session.quiz.questions_count}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="mb-2 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm">{session.participants_count} participants</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    <span className="font-semibold">{participant.score} points</span>
                                </div>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Temps restant</span>
                                <div className="flex items-center gap-2">
                                    <Timer className="h-4 w-4" />
                                    <span className="font-mono text-lg font-bold">
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                            <div className="h-3 w-full rounded-full bg-gray-200">
                                <div
                                    className={`h-3 rounded-full transition-all duration-1000 ${getTimerColor()}`}
                                    style={{
                                        width: `${(timeLeft / (currentQuestion.time_limit || 1)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Question */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-xl leading-relaxed">{currentQuestion.text}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {currentQuestion.points} pts
                                </Badge>
                                {currentQuestion.type === 'multiple' && <Badge variant="secondary">Choix multiple</Badge>}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {currentQuestion.answers.map((answer) => (
                            <button
                                key={answer.id}
                                onClick={() => handleAnswerSelect(answer.id)}
                                disabled={hasAnswered || showResults}
                                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${getAnswerClass(answer)} ${
                                    hasAnswered || showResults ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                            selectedAnswers.includes(answer.id) ? 'border-current' : 'border-gray-300'
                                        }`}
                                    >
                                        {selectedAnswers.includes(answer.id) && <div className="h-3 w-3 rounded-full bg-current" />}
                                    </div>
                                    <span className="flex-1">{answer.text}</span>
                                    {showResults && answer.is_correct && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    {showResults && !answer.is_correct && selectedAnswers.includes(answer.id) && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Submit Button */}
                {!hasAnswered && !showResults && (
                    <div className="flex justify-center">
                        <Button
                            onClick={submitAnswer}
                            disabled={selectedAnswers.length === 0 || processing}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            {processing ? 'Envoi...' : 'Valider ma réponse'}
                        </Button>
                    </div>
                )}

                {/* Answer Status */}
                {hasAnswered && !showResults && (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <CheckCircle className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">Réponse envoyée !</h3>
                            <p className="text-muted-foreground">En attente des autres participants...</p>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {showResults && answerResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Résultats de la question
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{answerResult.correct_answers}</div>
                                    <div className="text-sm text-muted-foreground">Bonnes réponses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{answerResult.points_earned}</div>
                                    <div className="text-sm text-muted-foreground">Points gagnés</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">#{answerResult.rank}</div>
                                    <div className="text-sm text-muted-foreground">Classement actuel</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Live Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Classement en direct
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {leaderboard.slice(0, 5).map((p, index) => (
                                <div
                                    key={p.id}
                                    className={`flex items-center gap-3 rounded-lg p-3 ${
                                        p.is_current_user ? 'border border-blue-200 bg-blue-50' : 'bg-gray-50'
                                    }`}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                                            index === 0
                                                ? 'bg-yellow-500 text-white'
                                                : index === 1
                                                  ? 'bg-gray-400 text-white'
                                                  : index === 2
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{p.pseudo}</div>
                                        {p.is_current_user && <div className="text-xs text-blue-600">C'est vous !</div>}
                                    </div>
                                    <div className="text-lg font-bold">{p.score}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
