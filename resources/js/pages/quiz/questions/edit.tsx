import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Answer {
    id: number | string;
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
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
}

interface Props {
    quiz: Quiz;
    question: Question;
}

export default function QuestionEdit({ quiz, question }: Props) {
    const [answers, setAnswers] = useState<Answer[]>(question.answers);

    const { data, setData, put, processing, errors } = useForm({
        text: question.text,
        type: question.type,
        time_limit: question.time_limit,
        points: question.points,
        explanation: question.explanation || '',
        answers: answers as any,
    });

    useEffect(() => {
        setData('answers', answers as any);
    }, [answers]);

    const addAnswer = () => {
        const newAnswer: Answer = {
            id: Date.now().toString(),
            text: '',
            is_correct: false,
            explanation: '',
        };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
    };

    const removeAnswer = (id: number | string) => {
        if (answers.length <= 2) return; // Minimum 2 answers
        const newAnswers = answers.filter((answer) => answer.id !== id);
        setAnswers(newAnswers);
    };

    const updateAnswer = (id: number | string, field: keyof Answer, value: string | boolean) => {
        const newAnswers = answers.map((answer) => (answer.id === id ? { ...answer, [field]: value } : answer));

        // For single choice, ensure only one correct answer
        if (field === 'is_correct' && value === true && data.type === 'single') {
            newAnswers.forEach((answer) => {
                if (answer.id !== id) {
                    answer.is_correct = false;
                }
            });
        }

        setAnswers(newAnswers);
    };

    const handleTypeChange = (type: 'single' | 'multiple') => {
        setData('type', type);

        // If switching to single choice, ensure only one correct answer
        if (type === 'single') {
            const firstCorrectIndex = answers.findIndex((answer) => answer.is_correct);
            const newAnswers = answers.map((answer, index) => ({
                ...answer,
                is_correct: index === firstCorrectIndex && firstCorrectIndex !== -1,
            }));
            setAnswers(newAnswers);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/quiz/${quiz.id}/questions/${question.id}`);
    };

    const hasCorrectAnswer = answers.some((answer) => answer.is_correct);
    const allAnswersFilled = answers.every((answer) => answer.text.trim() !== '');

    return (
        <AppLayout>
            <Head title={`Modifier question ${question.order_index} - ${quiz.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/quiz/${quiz.id}/questions/${question.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à la question
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Modifier la question {question.order_index}</h1>
                        <p className="text-muted-foreground">Quiz : "{quiz.title}"</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Question Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Détails de la question</CardTitle>
                            <CardDescription>Modifiez le contenu et les paramètres de votre question</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="text">Texte de la question</Label>
                                <Textarea
                                    id="text"
                                    value={data.text?.toString() || ''}
                                    onChange={(e) => setData('text', e.target.value)}
                                    placeholder="Entrez votre question..."
                                    rows={3}
                                    className={errors.text ? 'border-destructive' : ''}
                                />
                                {errors.text && <p className="mt-1 text-sm text-destructive">{errors.text}</p>}
                            </div>

                            <div>
                                <Label htmlFor="explanation">Explication (optionnel)</Label>
                                <Textarea
                                    id="explanation"
                                    value={data.explanation?.toString() || ''}
                                    onChange={(e) => setData('explanation', e.target.value)}
                                    placeholder="Ajoutez une explication qui sera affichée après la réponse..."
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Paramètres</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="type">Type de question</Label>
                                    <Select value={data.type?.toString() || ''} onValueChange={handleTypeChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Choix unique</SelectItem>
                                            <SelectItem value="multiple">Choix multiple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="time_limit">Temps limite (secondes)</Label>
                                    <Input
                                        id="time_limit"
                                        type="number"
                                        min="5"
                                        max="300"
                                        value={data.time_limit?.toString() || ''}
                                        onChange={(e) => setData('time_limit', parseInt(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="points">Points</Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        min="100"
                                        max="5000"
                                        step="100"
                                        value={data.points?.toString() || ''}
                                        onChange={(e) => setData('points', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answers */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Réponses</CardTitle>
                                    <CardDescription>
                                        {data.type === 'single'
                                            ? 'Modifiez les réponses possibles et sélectionnez la bonne réponse'
                                            : 'Modifiez les réponses possibles et sélectionnez toutes les bonnes réponses'}
                                    </CardDescription>
                                </div>
                                <Button type="button" variant="outline" onClick={addAnswer}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une réponse
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!hasCorrectAnswer && (
                                <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm text-yellow-800">Vous devez sélectionner au moins une bonne réponse</span>
                                </div>
                            )}

                            {answers.map((answer, index) => (
                                <div key={answer.id} className="space-y-3 rounded-lg border p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox
                                                checked={answer.is_correct}
                                                onCheckedChange={(checked) => updateAnswer(answer.id, 'is_correct', !!checked)}
                                            />
                                            <Label className="text-sm font-medium">
                                                Réponse {index + 1}
                                                {answer.is_correct && <span className="ml-1 text-green-600">✓</span>}
                                            </Label>
                                        </div>

                                        <div className="flex-1">
                                            <Input
                                                value={answer.text}
                                                onChange={(e) => updateAnswer(answer.id, 'text', e.target.value)}
                                                placeholder={`Réponse ${index + 1}`}
                                                className={!answer.text.trim() ? 'border-yellow-300' : ''}
                                            />
                                        </div>

                                        {answers.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAnswer(answer.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground">Explication de cette réponse (optionnel)</Label>
                                        <Input
                                            value={answer.explanation || ''}
                                            onChange={(e) => updateAnswer(answer.id, 'explanation', e.target.value)}
                                            placeholder="Pourquoi cette réponse est-elle correcte/incorrecte ?"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/quiz/${quiz.id}/questions/${question.id}`}>Annuler</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !hasCorrectAnswer || !allAnswersFilled || !data.text || String(data.text).trim() === ''}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
