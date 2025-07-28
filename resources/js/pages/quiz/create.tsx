import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Question {
    text: string;
    type: 'single' | 'multiple';
    time_limit: number;
    points: number;
    answers: Answer[];
}

interface Answer {
    text: string;
    is_correct: boolean;
}

interface Props {
    tags?: Tag[];
}

export default function QuizCreate({ tags = [] }: Props) {
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [newTag, setNewTag] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        is_active: true,
        is_public: true,
        time_per_question: 30,
        points_per_question: 1000,
        show_correct_answer: true,
        randomize_questions: false,
        randomize_answers: false,
        allow_multiple_attempts: false,
        tags: [] as number[],
        questions: [] as Question[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('quiz.store'), {
            ...data,
            tags: selectedTags,
            questions: questions,
        });
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            text: '',
            type: 'single',
            time_limit: data.time_per_question,
            points: data.points_per_question,
            answers: [
                { text: '', is_correct: true },
                { text: '', is_correct: false },
            ],
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setQuestions(updatedQuestions);
    };

    const addAnswer = (questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].answers.push({ text: '', is_correct: false });
        setQuestions(updatedQuestions);
    };

    const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof Answer, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].answers[answerIndex] = {
            ...updatedQuestions[questionIndex].answers[answerIndex],
            [field]: value
        };
        setQuestions(updatedQuestions);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const removeAnswer = (questionIndex: number, answerIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].answers = updatedQuestions[questionIndex].answers.filter((_, i) => i !== answerIndex);
        setQuestions(updatedQuestions);
    };

    const addTag = (tagId: number) => {
        if (!selectedTags.includes(tagId)) {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    const removeTag = (tagId: number) => {
        setSelectedTags(selectedTags.filter((id) => id !== tagId));
    };

    const getSelectedTagObjects = () => {
        return tags.filter((tag) => selectedTags.includes(tag.id));
    };

    const createNewTag = () => {
        if (newTag.trim()) {
            // This would typically make an API call to create the tag
            // For now, we'll just add it to selected tags
            const tempTag = { id: Date.now(), name: newTag.trim(), color: '#3B82F6' };
            setSelectedTags([...selectedTags, tempTag.id]);
            setNewTag('');
        }
    };

    return (
        <AppLayout>
            <Head title="Créer un quiz" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Créer un quiz</h1>
                        <p className="text-muted-foreground">Configurez les paramètres de votre nouveau quiz</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Titre du quiz</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Entrez le titre de votre quiz"
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Décrivez votre quiz..."
                                    rows={3}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                            </div>

                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags et mots-clés</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Selected Tags */}
                            {getSelectedTagObjects().length > 0 && (
                                <div>
                                    <Label>Tags sélectionnés</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {getSelectedTagObjects().map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="secondary"
                                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                                className="cursor-pointer"
                                                onClick={() => removeTag(tag.id)}
                                            >
                                                {tag.name}
                                                <X className="ml-1 h-3 w-3" />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available Tags */}
                            <div>
                                <Label>Tags disponibles</Label>
                                <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                                    {tags
                                        .filter((tag) => !selectedTags.includes(tag.id))
                                        .slice(0, 20)
                                        .map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-secondary"
                                                onClick={() => addTag(tag.id)}
                                            >
                                                {tag.name}
                                                <Plus className="ml-1 h-3 w-3" />
                                            </Badge>
                                        ))}
                                </div>
                            </div>

                            {/* Create New Tag */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nouveau tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), createNewTag())}
                                />
                                <Button type="button" onClick={createNewTag} disabled={!newTag.trim()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quiz Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Paramètres du quiz</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="time_per_question">Temps par question (secondes)</Label>
                                    <Input
                                        id="time_per_question"
                                        type="number"
                                        min="5"
                                        max="300"
                                        value={data.time_per_question}
                                        onChange={(e) => setData('time_per_question', parseInt(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="points_per_question">Points par question</Label>
                                    <Input
                                        id="points_per_question"
                                        type="number"
                                        min="100"
                                        max="5000"
                                        step="100"
                                        value={data.points_per_question}
                                        onChange={(e) => setData('points_per_question', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active">Quiz actif</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_public"
                                        checked={data.is_public}
                                        onCheckedChange={(checked) => setData('is_public', checked as boolean)}
                                    />
                                    <Label htmlFor="is_public">Quiz public (visible par tous)</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="show_correct_answer"
                                        checked={data.show_correct_answer}
                                        onCheckedChange={(checked) => setData('show_correct_answer', checked as boolean)}
                                    />
                                    <Label htmlFor="show_correct_answer">Afficher les bonnes réponses</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="randomize_questions"
                                        checked={data.randomize_questions}
                                        onCheckedChange={(checked) => setData('randomize_questions', checked as boolean)}
                                    />
                                    <Label htmlFor="randomize_questions">Mélanger les questions</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="randomize_answers"
                                        checked={data.randomize_answers}
                                        onCheckedChange={(checked) => setData('randomize_answers', checked as boolean)}
                                    />
                                    <Label htmlFor="randomize_answers">Mélanger les réponses</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="allow_multiple_attempts"
                                        checked={data.allow_multiple_attempts}
                                        onCheckedChange={(checked) => setData('allow_multiple_attempts', checked as boolean)}
                                    />
                                    <Label htmlFor="allow_multiple_attempts">Autoriser plusieurs tentatives</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Questions</CardTitle>
                                <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une question
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {questions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.
                                </div>
                            ) : (
                                questions.map((question, questionIndex) => (
                                    <Card key={questionIndex} className="border-l-4 border-l-primary">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Question {questionIndex + 1}</h4>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeQuestion(questionIndex)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label>Texte de la question</Label>
                                                <Textarea
                                                    value={question.text}
                                                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                                                    placeholder="Saisissez votre question..."
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Type</Label>
                                                    <Select
                                                        value={question.type}
                                                        onValueChange={(value) => updateQuestion(questionIndex, 'type', value)}
                                                    >
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
                                                    <Label>Points</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="1000"
                                                        value={question.points}
                                                        onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value))}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Temps limite (s)</Label>
                                                    <Input
                                                        type="number"
                                                        min="5"
                                                        max="300"
                                                        value={question.time_limit}
                                                        onChange={(e) => updateQuestion(questionIndex, 'time_limit', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <Label>Réponses</Label>
                                                    <Button
                                                        type="button"
                                                        onClick={() => addAnswer(questionIndex)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Ajouter une réponse
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    {question.answers.map((answer, answerIndex) => (
                                                        <div key={answerIndex} className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={answer.is_correct}
                                                                onCheckedChange={(checked) => 
                                                                    updateAnswer(questionIndex, answerIndex, 'is_correct', checked as boolean)
                                                                }
                                                            />
                                                            <Input
                                                                value={answer.text}
                                                                onChange={(e) => updateAnswer(questionIndex, answerIndex, 'text', e.target.value)}
                                                                placeholder={`Réponse ${answerIndex + 1}`}
                                                                className="flex-1"
                                                            />
                                                            {question.answers.length > 2 && (
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => removeAnswer(questionIndex, answerIndex)}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Création...' : 'Créer le quiz'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
