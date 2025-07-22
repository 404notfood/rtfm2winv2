import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Copy, Download, Edit, Eye, MoreHorizontal, Palette, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface Theme {
    id: number;
    name: string;
    description?: string;
    is_default: boolean;
    is_active: boolean;
    is_user_selectable: boolean;
    is_dark: boolean;
    font_family: string;
    border_radius: number;
    css_variables: Record<string, string>;
    created_by?: number;
    creator?: {
        id: number;
        name: string;
    };
    preview_colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}

interface Props {
    system_themes: Theme[];
    user_themes: Theme[];
    current_theme_id?: number;
    can_create: boolean;
}

export default function ThemesIndex({ system_themes, user_themes, current_theme_id, can_create }: Props) {
    const [search, setSearch] = useState('');
    const { get, post, processing } = useForm();

    const filteredSystemThemes = system_themes.filter((theme) => theme.name.toLowerCase().includes(search.toLowerCase()));

    const filteredUserThemes = user_themes.filter((theme) => theme.name.toLowerCase().includes(search.toLowerCase()));

    const handleThemeAction = (action: string, themeId: number) => {
        switch (action) {
            case 'apply':
                post('/themes/apply', { theme_id: themeId });
                break;
            case 'edit':
                get(`/themes/editor/${themeId}`);
                break;
            case 'duplicate':
                post(`/themes/${themeId}/duplicate`);
                break;
            case 'export':
                get(`/themes/${themeId}/export`);
                break;
            case 'delete': {
                const theme = user_themes.find((t) => t.id === themeId);
                if (theme && confirm(`Supprimer le thème "${theme.name}" ?`)) {
                    post(`/themes/${themeId}`, { _method:   'DELETE' });
                }
                break;
            }
        }
    };

    const ThemeCard = ({ theme, isSystem = false }: { theme: Theme; isSystem?: boolean }) => (
        <Card className={`group relative overflow-hidden ${theme.id === current_theme_id ? 'ring-2 ring-blue-500' : ''}`}>
            {/* Theme Preview */}
            <div
                className="relative h-32"
                style={{
                    background: `linear-gradient(135deg, ${theme.preview_colors.primary} 0%, ${theme.preview_colors.secondary} 100%)`,
                }}
            >
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="flex items-start justify-between">
                        <div className="h-12 w-12 rounded-lg opacity-80" style={{ backgroundColor: theme.preview_colors.background }} />
                        <div className="flex gap-1">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.preview_colors.text }} />
                            <div className="h-3 w-3 rounded-full opacity-60" style={{ backgroundColor: theme.preview_colors.text }} />
                            <div className="h-3 w-3 rounded-full opacity-30" style={{ backgroundColor: theme.preview_colors.text }} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="h-2 w-20 rounded-full" style={{ backgroundColor: theme.preview_colors.background }} />
                        <div className="h-2 w-16 rounded-full opacity-60" style={{ backgroundColor: theme.preview_colors.background }} />
                    </div>
                </div>
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{theme.name}</CardTitle>
                        {theme.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{theme.description}</p>}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleThemeAction('apply', theme.id)}>
                                <Palette className="mr-2 h-4 w-4" />
                                Appliquer
                            </DropdownMenuItem>
                            {!isSystem && (
                                <DropdownMenuItem onClick={() => handleThemeAction('edit', theme.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleThemeAction('duplicate', theme.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleThemeAction('export', theme.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Exporter
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!isSystem && (
                                <DropdownMenuItem onClick={() => handleThemeAction('delete', theme.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Theme Info */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {theme.is_default && <Badge variant="secondary">Par défaut</Badge>}
                    {theme.is_dark && <Badge variant="outline">Mode sombre</Badge>}
                    {theme.id === current_theme_id && <Badge className="bg-blue-100 text-blue-800">Actuel</Badge>}
                    {!isSystem && theme.creator && (
                        <Badge variant="outline" className="text-xs">
                            Par {theme.creator.name}
                        </Badge>
                    )}
                </div>

                {/* Theme Properties */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Police: {theme.font_family}</div>
                    <div>Rayon: {theme.border_radius}px</div>
                </div>

                {/* Apply Button */}
                <Button
                    onClick={() => handleThemeAction('apply', theme.id)}
                    disabled={theme.id === current_theme_id || processing}
                    className="mt-4 w-full"
                    variant={theme.id === current_theme_id ? 'secondary' : 'default'}
                >
                    <Palette className="mr-2 h-4 w-4" />
                    {theme.id === current_theme_id ? 'Thème actuel' : 'Appliquer'}
                </Button>
            </CardContent>

            {/* Current Theme Indicator */}
            {theme.id === current_theme_id && (
                <div className="absolute top-2 left-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                        <Eye className="h-3 w-3 text-white" />
                    </div>
                </div>
            )}
        </Card>
    );

    return (
        <AppLayout>
            <Head title="Thèmes" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Thèmes</h1>
                        <p className="text-muted-foreground">Personnalisez l'apparence de l'interface</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Importer
                        </Button>
                        {can_create && (
                            <Button asChild>
                                <Link href="/themes/editor">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer un thème
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                placeholder="Rechercher des thèmes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* System Themes */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Thèmes système</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredSystemThemes.map((theme) => (
                            <ThemeCard key={theme.id} theme={theme} isSystem />
                        ))}
                    </div>
                </div>

                {/* User Themes */}
                {can_create && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Mes thèmes personnalisés</h2>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/themes/editor">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nouveau thème
                                </Link>
                            </Button>
                        </div>

                        {filteredUserThemes.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredUserThemes.map((theme) => (
                                    <ThemeCard key={theme.id} theme={theme} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                        <Palette className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">Aucun thème personnalisé</h3>
                                    <p className="mb-4 text-muted-foreground">
                                        Créez votre premier thème personnalisé pour adapter l'interface à vos goûts.
                                    </p>
                                    <Button asChild>
                                        <Link href="/themes/editor">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Créer mon premier thème
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Empty Search Results */}
                {search && filteredSystemThemes.length === 0 && filteredUserThemes.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">Aucun thème trouvé</h3>
                            <p className="text-muted-foreground">Essayez de modifier votre recherche ou créez un nouveau thème.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
