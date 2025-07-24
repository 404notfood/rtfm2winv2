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

interface Props {
    tags?: Tag[];
}

export default function QuizCreate({ tags = [] }: Props) {
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [newTag, setNewTag] = useState('');

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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/quiz', {
            ...data,
            tags: selectedTags,
        });
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
