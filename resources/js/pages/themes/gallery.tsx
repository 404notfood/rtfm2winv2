import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Crown, Download, Edit, Eye, Filter, Heart, Palette, Plus, Search, Sparkles, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Theme {
    id: number;
    name: string;
    description?: string;
    is_dark: boolean;
    font_family: string;
    border_radius: number;
    css_variables: Record<string, string>;
    is_public: boolean;
    is_featured: boolean;
    created_by: {
        id: number;
        name: string;
        avatar?: string;
    };
    created_at: string;
    downloads_count: number;
    likes_count: number;
    is_liked?: boolean;
    is_owned?: boolean;
    preview_url?: string;
}

interface Props {
    themes: Theme[];
    featured_themes: Theme[];
    user_themes: Theme[];
    filters: {
        search?: string;
        category?: string;
        sort?: string;
        author?: string;
    };
    stats: {
        total_themes: number;
        featured_themes: number;
        user_themes: number;
        public_themes: number;
    };
    can_create: boolean;
}

export default function ThemeGallery({ themes, featured_themes, user_themes, filters, stats, can_create }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [sortBy, setSortBy] = useState(filters.sort || 'popular');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { post, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // You would navigate with filters here
    };

    const handleLike = (themeId: number) => {
        post(`/themes/${themeId}/like`);
    };

    const handleDownload = (themeId: number) => {
        post(`/themes/${themeId}/download`);
    };

    const handleDelete = (themeId: number) => {
        if (confirm('Supprimer ce thème ? Cette action est irréversible.')) {
            post(`/themes/${themeId}`, { _method:   'delete' });
        }
    };

    const getPreviewGradient = (theme: Theme) => {
        const primary = theme.css_variables['--accent-primary'] || '#3b82f6';
        const secondary = theme.css_variables['--accent-secondary'] || '#8b5cf6';
        return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
    };

    const ThemeCard = ({ theme, size = 'default' }: { theme: Theme; size?: 'default' | 'large' | 'small' }) => {
        const cardClass = size === 'large' ? 'aspect-[4/3]' : size === 'small' ? 'aspect-square' : 'aspect-[3/2]';

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
                <Card className="overflow-hidden transition-all duration-300 group-hover:scale-105 hover:shadow-lg">
                    {/* Preview */}
                    <div className={`relative ${cardClass}`}>
                        <div
                            className="absolute inset-0"
                            style={{
                                background: getPreviewGradient(theme),
                                backgroundImage: theme.preview_url ? `url(${theme.preview_url})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="absolute inset-0 flex items-center justify-center gap-2">
                                <Button size="sm" variant="secondary" asChild>
                                    <Link href={`/themes/${theme.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                                {theme.is_owned ? (
                                    <Button size="sm" variant="secondary" asChild>
                                        <Link href={`/themes/${theme.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="secondary" onClick={() => handleDownload(theme.id)} disabled={processing}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {theme.is_featured && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                    <Crown className="mr-1 h-3 w-3" />
                                    Vedette
                                </Badge>
                            )}
                            {theme.is_dark && <Badge variant="secondary">Sombre</Badge>}
                        </div>

                        <div className="absolute top-2 right-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className={`bg-white/20 backdrop-blur-sm ${theme.is_liked ? 'text-red-500' : 'text-white'}`}
                                onClick={() => handleLike(theme.id)}
                            >
                                <Heart className={`h-4 w-4 ${theme.is_liked ? 'fill-current' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-start justify-between">
                                <h3 className="mr-2 flex-1 truncate text-lg font-semibold">{theme.name}</h3>
                                {theme.is_owned && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(theme.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {theme.description && <p className="line-clamp-2 text-sm text-muted-foreground">{theme.description}</p>}

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={theme.created_by.avatar} />
                                        <AvatarFallback className="text-xs">{theme.created_by.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">{theme.created_by.name}</span>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Heart className="h-3 w-3" />
                                        <span>{theme.likes_count}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Download className="h-3 w-3" />
                                        <span>{theme.downloads_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <AppLayout>
            <Head title="Galerie de Thèmes" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Galerie de Thèmes</h1>
                        <p className="text-muted-foreground">Découvrez et partagez des thèmes personnalisés pour RTFM2Win</p>
                    </div>

                    {can_create && (
                        <Button asChild className="bg-gradient-to-r from-primary to-secondary">
                            <Link href="/themes/editor">
                                <Plus className="mr-2 h-4 w-4" />
                                Créer un thème
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.total_themes}</div>
                            <div className="text-sm text-muted-foreground">Thèmes au total</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{stats.featured_themes}</div>
                            <div className="text-sm text-muted-foreground">Thèmes en vedette</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.public_themes}</div>
                            <div className="text-sm text-muted-foreground">Thèmes publics</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.user_themes}</div>
                            <div className="text-sm text-muted-foreground">Mes thèmes</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Featured Themes */}
                {featured_themes.length > 0 && (
                    <section>
                        <div className="mb-6 flex items-center gap-2">
                            <Crown className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-2xl font-bold">Thèmes en vedette</h2>
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featured_themes.slice(0, 6).map((theme) => (
                                <ThemeCard key={theme.id} theme={theme} size="large" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher des thèmes..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filtrer
                                </Button>
                            </div>

                            <div className="flex gap-4">
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        <SelectItem value="light">Thèmes clairs</SelectItem>
                                        <SelectItem value="dark">Thèmes sombres</SelectItem>
                                        <SelectItem value="colorful">Thèmes colorés</SelectItem>
                                        <SelectItem value="minimal">Thèmes minimalistes</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Trier par" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="popular">Plus populaires</SelectItem>
                                        <SelectItem value="recent">Plus récents</SelectItem>
                                        <SelectItem value="downloads">Plus téléchargés</SelectItem>
                                        <SelectItem value="likes">Plus aimés</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* My Themes */}
                {user_themes.length > 0 && (
                    <section>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Palette className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-bold">Mes thèmes</h2>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/themes/my-themes">Voir tout</Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {user_themes.slice(0, 8).map((theme) => (
                                <ThemeCard key={theme.id} theme={theme} size="small" />
                            ))}
                        </div>
                    </section>
                )}

                {/* All Themes */}
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-6 w-6 text-blue-500" />
                            <h2 className="text-2xl font-bold">Tous les thèmes</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                                Grille
                            </Button>
                            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                                Liste
                            </Button>
                        </div>
                    </div>

                    {themes.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Palette className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-semibold">Aucun thème trouvé</h3>
                                <p className="mb-6 text-muted-foreground">Aucun thème ne correspond à vos critères de recherche.</p>
                                {can_create && (
                                    <Button asChild>
                                        <Link href="/themes/editor">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Créer le premier thème
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
                            {themes.map((theme) => (
                                <ThemeCard key={theme.id} theme={theme} size={viewMode === 'list' ? 'small' : 'default'} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Pagination could go here */}
            </div>
        </AppLayout>
    );
}
