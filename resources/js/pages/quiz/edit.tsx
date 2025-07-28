import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, Plus, Save, Settings, X } from 'lucide-react';
import { useState } from 'react';

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    category?: string;
    status: 'draft' | 'active' | 'archived';
    allow_anonymous: boolean;
    time_per_question: number;
    base_points: number;
    multiple_answers: boolean;
    questions_count: number;
    tags?: Tag[];
    created_at: string;
    updated_at: string;
}

interface Props {
    quiz: Quiz;
    tags: Tag[];
}

export default function QuizEdit({ quiz, tags }: Props) {
    const [selectedTags, setSelectedTags] = useState<number[]>(quiz.tags?.map((tag) => tag.id) || []);
    const [newTag, setNewTag] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        title: quiz.title,
        description: quiz.description || '',
        category: quiz.category || '',
        status: quiz.status,
        allow_anonymous: quiz.allow_anonymous,
        time_per_question: quiz.time_per_question,
        base_points: quiz.base_points,
        multiple_answers: quiz.multiple_answers,
        tags: selectedTags,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/quiz/${quiz.id}`, {
            ...data,
            tags: selectedTags,
        });
    };

    const addTag = (tagId: number) => {
        if (!selectedTags.includes(tagId)) {
            const newSelectedTags = [...selectedTags, tagId];
            setSelectedTags(newSelectedTags);
            setData('tags', newSelectedTags);
        }
    };

    const removeTag = (tagId: number) => {
        const newSelectedTags = selectedTags.filter((id) => id !== tagId);
        setSelectedTags(newSelectedTags);
        setData('tags', newSelectedTags);
    };

    const getSelectedTagObjects = () => {
        return tags.filter((tag) => selectedTags.includes(tag.id));
    };

    const createNewTag = () => {
        if (newTag.trim()) {
            // This would typically make an API call to create the tag
            // For now, we'll just add it to selected tags
            const tempTag = { id: Date.now(), name: newTag.trim(), color: '#3B82F6' };
            addTag(tempTag.id);
            setNewTag('');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Actif';
            case 'draft':
                return 'Brouillon';
            case 'archived':
                return 'Archivé';
            default:
                return status;
        }
    };

    return (
        <AppLayout>
            <Head title={`Modifier - ${quiz.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/quiz/${quiz.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au quiz
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Modifier le quiz</h1>
                            <p className="text-muted-foreground">Modifiez les paramètres et le contenu de votre quiz</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(quiz.status)}>{getStatusLabel(quiz.status)}</Badge>
                        <Button variant="outline" asChild>
                            <Link href={`/quiz/${quiz.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Prévisualiser
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Quiz Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations du quiz</CardTitle>
                        <CardDescription>
                            {quiz.questions_count} questions • Créé le {new Date(quiz.created_at).toLocaleDateString('fr-FR')}• Modifié le{' '}
                            {new Date(quiz.updated_at).toLocaleDateString('fr-FR')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" asChild>
                                <Link href={`/quiz/${quiz.id}/questions`}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Gérer les questions ({quiz.questions_count})
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={`/quiz/${quiz.id}/questions/create`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une question
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

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

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez une catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">Général</SelectItem>
                                            <SelectItem value="science">Sciences</SelectItem>
                                            <SelectItem value="history">Histoire</SelectItem>
                                            <SelectItem value="geography">Géographie</SelectItem>
                                            <SelectItem value="sports">Sports</SelectItem>
                                            <SelectItem value="entertainment">Divertissement</SelectItem>
                                            <SelectItem value="technology">Technologie</SelectItem>
                                            <SelectItem value="art">Art et Culture</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="status">Statut</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Brouillon</SelectItem>
                                            <SelectItem value="active">Actif</SelectItem>
                                            <SelectItem value="archived">Archivé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                    <Label htmlFor="base_points">Points de base</Label>
                                    <Input
                                        id="base_points"
                                        type="number"
                                        min="100"
                                        max="5000"
                                        step="100"
                                        value={data.base_points}
                                        onChange={(e) => setData('base_points', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="allow_anonymous"
                                        checked={data.allow_anonymous}
                                        onCheckedChange={(checked) => setData('allow_anonymous', !!checked)}
                                    />
                                    <Label htmlFor="allow_anonymous">Autoriser la participation anonyme</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="multiple_answers"
                                        checked={data.multiple_answers}
                                        onCheckedChange={(checked) => setData('multiple_answers', !!checked)}
                                    />
                                    <Label htmlFor="multiple_answers">Réponses multiples autorisées</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/quiz/${quiz.id}`}>Annuler</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
