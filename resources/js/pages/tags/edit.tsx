import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, Hash, Palette, Save, Sparkles, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    is_featured: boolean;
    is_active: boolean;
    quiz_count?: number;
    usage_count?: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    tag: Tag;
    predefined_colors?: string[];
}

export default function TagEdit({
    tag,
    predefined_colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'],
}: Props) {
    const [slugPreview, setSlugPreview] = useState(tag.slug);
    const {
        data,
        setData,
        put,
        delete: destroy,
        processing,
        errors,
    } = useForm({
        name: tag.name || '',
        description: tag.description || '',
        color: tag.color || '#3B82F6',
        icon: tag.icon || '',
        is_featured: tag.is_featured || false,
        is_active: tag.is_active !== undefined ? tag.is_active : true,
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        setData('name', name);
        setSlugPreview(generateSlug(name));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/tags/${tag.id}`);
    };

    const handleDelete = () => {
        if (tag.quiz_count && tag.quiz_count > 0) {
            alert(`Impossible de supprimer ce tag car il est utilisé par ${tag.quiz_count} quiz.`);
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer ce tag définitivement ? Cette action est irréversible.')) {
            destroy(`/tags/${tag.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title={`Modifier le tag "${tag.name}"`} />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tags/${tag.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour au tag
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">Modifier le tag</h1>
                        <p className="text-muted-foreground">Modifiez les propriétés de "{tag.name}"</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Informations de base
                            </CardTitle>
                            <CardDescription>Modifiez les caractéristiques principales de votre tag</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom du tag *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className={errors.name ? 'border-destructive' : ''}
                                    placeholder="ex: Science, Histoire, Culture générale..."
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}

                                {/* Slug Preview */}
                                {slugPreview && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Hash className="h-3 w-3" />
                                        <span>Identifiant généré : {slugPreview}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optionnel)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-destructive' : ''}
                                    placeholder="Décrivez brièvement ce tag et son utilisation..."
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Apparence
                            </CardTitle>
                            <CardDescription>Personnalisez l'apparence visuelle de votre tag</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Color */}
                            <div className="space-y-2">
                                <Label>Couleur du tag</Label>
                                <div className="flex flex-wrap gap-2">
                                    {predefined_colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`h-8 w-8 rounded-full border-2 transition-all ${
                                                data.color === color ? 'scale-110 border-gray-900' : 'border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setData('color', color)}
                                        />
                                    ))}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <Input
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="h-8 w-12 border-0 p-0"
                                    />
                                    <Input
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="#3B82F6"
                                        className="font-mono"
                                    />
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icône (optionnel)</Label>
                                <Input
                                    id="icon"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    placeholder="Nom de l'icône Lucide (ex: BookOpen, Beaker, Globe...)"
                                    className={errors.icon ? 'border-destructive' : ''}
                                />
                                {errors.icon && <p className="text-sm text-destructive">{errors.icon}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Consultez{' '}
                                    <a href="https://lucide.dev" target="_blank" rel="noopener" className="underline">
                                        lucide.dev
                                    </a>{' '}
                                    pour la liste complète des icônes disponibles
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Paramètres
                            </CardTitle>
                            <CardDescription>Configurez la visibilité et les options de votre tag</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Featured */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Tag en vedette</Label>
                                    <p className="text-sm text-muted-foreground">Les tags en vedette apparaissent en priorité dans les suggestions</p>
                                </div>
                                <Switch checked={data.is_featured} onCheckedChange={(checked) => setData('is_featured', checked as boolean)} />
                            </div>

                            {/* Active */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Tag actif</Label>
                                    <p className="text-sm text-muted-foreground">Seuls les tags actifs peuvent être utilisés dans les quiz</p>
                                </div>
                                <Switch checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked as boolean)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Statistiques d'utilisation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="rounded bg-muted p-4">
                                    <div className="text-2xl font-bold">{tag.quiz_count || 0}</div>
                                    <div className="text-sm text-muted-foreground">Quiz utilisant ce tag</div>
                                </div>
                                <div className="rounded bg-muted p-4">
                                    <div className="text-2xl font-bold">{tag.usage_count || 0}</div>
                                    <div className="text-sm text-muted-foreground">Utilisations totales</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    {data.name && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Aperçu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                                    <span className="font-medium">{data.name}</span>
                                    {data.is_featured && <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Vedette</span>}
                                </div>
                                {data.description && <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>}
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer le tag
                        </Button>

                        <div className="flex gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/tags/${tag.id}`}>Annuler</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
