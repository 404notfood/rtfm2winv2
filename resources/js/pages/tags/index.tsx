import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, Edit, Palette, Plus, Search, Tag, Trash2, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
    description?: string;
    quiz_count: number;
    usage_count: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    tags?: Tag[];
    stats?: {
        total_tags: number;
        featured_tags: number;
        most_used_tag: Tag | null;
        total_usage: number;
    };
    filters?: {
        search?: string;
        featured?: boolean;
    };
    can_manage?: boolean;
}

export default function TagsIndex({
    tags = [],
    stats = {
        total_tags: 0,
        featured_tags: 0,
        most_used_tag: null,
        total_usage: 0,
    },
    filters = {},
    can_manage = false,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFeatured, setShowFeatured] = useState(filters.featured || false);
    const { get, post, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/tags', {
            search: search || undefined,
            featured: showFeatured || undefined,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const deleteTag = (tagId: number) => {
        if (confirm('Supprimer définitivement ce tag ? Cette action est irréversible.')) {
            post(`/tags/${tagId}`, { _method:   'delete' });
        }
    };

    const toggleFeatured = (tagId: number) => {
        post(`/tags/${tagId}/toggle-featured`);
    };

    const getTagColor = (tag: Tag) => {
        if (tag.color) {
            return { backgroundColor: tag.color };
        }
        return { backgroundColor: '#6B7280' };
    };

    const getUsageLevel = (count: number) => {
        if (count > 50) return { label: 'Très populaire', color: 'text-green-600' };
        if (count > 20) return { label: 'Populaire', color: 'text-blue-600' };
        if (count > 5) return { label: 'Modéré', color: 'text-yellow-600' };
        return { label: 'Nouveau', color: 'text-gray-600' };
    };

    const filteredTags = tags.filter((tag) => {
        if (showFeatured && !tag.is_featured) return false;
        if (search && !tag.name.toLowerCase().includes(search.toLowerCase()) && !tag.description?.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    });

    return (
        <AppLayout>
            <Head title="Gestion des Tags" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des Tags</h1>
                        <p className="text-muted-foreground">Organisez et catégorisez vos quiz avec des tags intelligents</p>
                    </div>
                    {can_manage && (
                        <Button asChild>
                            <Link href="/tags/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Nouveau tag
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.total_tags}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Tag className="mr-1 h-3 w-3" />
                                Tags au total
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{stats.featured_tags}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                Tags en vedette
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.total_usage}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <BookOpen className="mr-1 h-3 w-3" />
                                Utilisations totales
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="truncate text-lg font-bold">{stats.most_used_tag?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">Tag le plus populaire</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher des tags..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit">Rechercher</Button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="flex cursor-pointer items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={showFeatured}
                                        onChange={(e) => setShowFeatured(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Afficher uniquement les tags en vedette</span>
                                </label>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tags Grid */}
                {filteredTags.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Tag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">{search || showFeatured ? 'Aucun tag trouvé' : 'Aucun tag créé'}</h3>
                            <p className="mb-4 text-muted-foreground">
                                {search || showFeatured
                                    ? 'Aucun tag ne correspond à vos critères de recherche.'
                                    : 'Commencez par créer votre premier tag pour organiser vos quiz !'}
                            </p>
                            {!search && !showFeatured && can_manage && (
                                <Button asChild>
                                    <Link href="/tags/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer mon premier tag
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredTags.map((tag) => {
                            const usage = getUsageLevel(tag.usage_count);

                            return (
                                <Card key={tag.id} className="transition-shadow hover:shadow-md">
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {/* Tag Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-1 items-center gap-2">
                                                    <div className="h-4 w-4 flex-shrink-0 rounded-full" style={getTagColor(tag)} />
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate font-medium">{tag.name}</h3>
                                                        <p className="text-xs text-muted-foreground">#{tag.slug}</p>
                                                    </div>
                                                </div>
                                                {tag.is_featured && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Vedette
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {tag.description && <p className="line-clamp-2 text-sm text-muted-foreground">{tag.description}</p>}

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="rounded bg-muted p-2 text-center">
                                                    <div className="font-medium">{tag.quiz_count}</div>
                                                    <div className="text-muted-foreground">Quiz</div>
                                                </div>
                                                <div className="rounded bg-muted p-2 text-center">
                                                    <div className="font-medium">{tag.usage_count}</div>
                                                    <div className="text-muted-foreground">Utilisations</div>
                                                </div>
                                            </div>

                                            {/* Usage Level */}
                                            <div className="text-center">
                                                <span className={cn('text-xs font-medium', usage.color)}>{usage.label}</span>
                                            </div>

                                            {/* Actions */}
                                            {can_manage && (
                                                <div className="flex gap-2 border-t pt-2">
                                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                                        <Link href={`/tags/${tag.id}/edit`}>
                                                            <Edit className="mr-1 h-3 w-3" />
                                                            Modifier
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleFeatured(tag.id)}
                                                        disabled={processing}
                                                        className={tag.is_featured ? 'border-yellow-200 bg-yellow-50' : ''}
                                                    >
                                                        <TrendingUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteTag(tag.id)}
                                                        disabled={processing}
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Quick Actions */}
                {can_manage && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Palette className="h-5 w-5" />
                                Actions rapides
                            </CardTitle>
                            <CardDescription>Gérez efficacement vos tags avec ces raccourcis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Button variant="outline" asChild>
                                    <Link href="/tags/bulk-edit">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Édition en lot
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/tags/analytics">
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Analytiques
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/tags/export">
                                        <Users className="mr-2 h-4 w-4" />
                                        Exporter
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
