import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Filter, Save, Search, Star, StarOff, Tag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    is_featured: boolean;
    is_active: boolean;
    quiz_count: number;
    usage_count: number;
    created_at: string;
}

interface Props {
    tags: Tag[];
    filters?: {
        search?: string;
        status?: string;
        featured?: string;
    };
}

export default function TagsBulkEdit({ tags = [], filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [featuredFilter, setFeaturedFilter] = useState(filters.featured || 'all');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        action: '',
        tag_ids: [] as number[],
    });

    const filteredTags = tags.filter((tag) => {
        if (search && !tag.name.toLowerCase().includes(search.toLowerCase()) && !tag.description?.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        if (statusFilter === 'active' && !tag.is_active) return false;
        if (statusFilter === 'inactive' && tag.is_active) return false;
        if (featuredFilter === 'featured' && !tag.is_featured) return false;
        if (featuredFilter === 'not_featured' && tag.is_featured) return false;
        return true;
    });

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedTags(filteredTags.map((tag) => tag.id));
        } else {
            setSelectedTags([]);
        }
    };

    const handleSelectTag = (tagId: number, checked: boolean) => {
        if (checked) {
            setSelectedTags([...selectedTags, tagId]);
        } else {
            setSelectedTags(selectedTags.filter((id) => id !== tagId));
            setSelectAll(false);
        }
    };

    const handleBulkAction = (action: string) => {
        if (selectedTags.length === 0) {
            alert('Veuillez sélectionner au moins un tag.');
            return;
        }

        let confirmMessage = '';
        switch (action) {
            case 'activate':
                confirmMessage = `Activer ${selectedTags.length} tag(s) sélectionné(s) ?`;
                break;
            case 'deactivate':
                confirmMessage = `Désactiver ${selectedTags.length} tag(s) sélectionné(s) ?`;
                break;
            case 'feature':
                confirmMessage = `Mettre en vedette ${selectedTags.length} tag(s) sélectionné(s) ?`;
                break;
            case 'unfeature':
                confirmMessage = `Retirer de la vedette ${selectedTags.length} tag(s) sélectionné(s) ?`;
                break;
            case 'delete':
                const tagsWithQuizzes = selectedTags.filter((id) => {
                    const tag = tags.find((t) => t.id === id);
                    return tag && tag.quiz_count > 0;
                }).length;

                if (tagsWithQuizzes > 0) {
                    alert(`Impossible de supprimer ${tagsWithQuizzes} tag(s) car ils sont utilisés par des quiz.`);
                    return;
                }

                confirmMessage = `Supprimer définitivement ${selectedTags.length} tag(s) sélectionné(s) ? Cette action est irréversible.`;
                break;
        }

        if (confirm(confirmMessage)) {
            post('/tags/bulk-action', {
                data: {
                    action,
                    tag_ids: selectedTags,
                },
                onSuccess: () => {
                    setSelectedTags([]);
                    setSelectAll(false);
                },
            });
        }
    };

    useEffect(() => {
        if (filteredTags.length > 0 && selectedTags.length === filteredTags.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedTags, filteredTags]);

    const getTagColor = (tag: Tag) => {
        return tag.color || '#6B7280';
    };

    return (
        <AppLayout>
            <Head title="Édition en lot des Tags" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/tags">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux tags
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Édition en lot</h1>
                        <p className="text-muted-foreground">Gérez plusieurs tags simultanément</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtres et recherche
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher des tags..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="active">Actifs uniquement</SelectItem>
                                    <SelectItem value="inactive">Inactifs uniquement</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vedette" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    <SelectItem value="featured">En vedette</SelectItem>
                                    <SelectItem value="not_featured">Pas en vedette</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center text-sm text-muted-foreground">{filteredTags.length} tag(s) affiché(s)</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedTags.length > 0 && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium">{selectedTags.length} tag(s) sélectionné(s)</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedTags([]);
                                            setSelectAll(false);
                                        }}
                                    >
                                        Désélectionner tout
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')} disabled={processing}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Activer
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')} disabled={processing}>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        Désactiver
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('feature')} disabled={processing}>
                                        <Star className="mr-2 h-4 w-4" />
                                        Vedette
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('unfeature')} disabled={processing}>
                                        <StarOff className="mr-2 h-4 w-4" />
                                        Retirer vedette
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')} disabled={processing}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tags List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Liste des tags
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
                                <label
                                    htmlFor="select-all"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Sélectionner tout ({filteredTags.length})
                                </label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredTags.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Tag className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <h3 className="mb-2 text-lg font-semibold">Aucun tag trouvé</h3>
                                <p>Aucun tag ne correspond à vos critères de filtrage.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        className={`flex items-center space-x-4 rounded-lg border p-4 transition-colors ${
                                            selectedTags.includes(tag.id) ? 'border-primary/20 bg-primary/5' : 'hover:bg-muted/30'
                                        }`}
                                    >
                                        <Checkbox
                                            checked={selectedTags.includes(tag.id)}
                                            onCheckedChange={(checked) => handleSelectTag(tag.id, checked as boolean)}
                                        />

                                        <div className="h-4 w-4 flex-shrink-0 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate font-medium">{tag.name}</h3>
                                                {tag.is_featured && (
                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                        <Star className="mr-1 h-3 w-3" />
                                                        Vedette
                                                    </Badge>
                                                )}
                                                {!tag.is_active && <Badge variant="destructive">Inactif</Badge>}
                                            </div>
                                            {tag.description && <p className="truncate text-sm text-muted-foreground">{tag.description}</p>}
                                            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>#{tag.slug}</span>
                                                <span>{tag.quiz_count} quiz</span>
                                                <span>{tag.usage_count} utilisations</span>
                                                <span>{new Date(tag.created_at).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/tags/${tag.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/tags/${tag.id}/edit`}>
                                                    <Save className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Selection Summary */}
                {selectedTags.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center text-sm text-muted-foreground">
                                <strong>{selectedTags.length}</strong> tag(s) sélectionné(s) sur <strong>{filteredTags.length}</strong> affiché(s)
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
