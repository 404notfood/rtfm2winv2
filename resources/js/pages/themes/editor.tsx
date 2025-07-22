import { ThemePreview } from '@/components/theme/theme-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Copy,
    Download,
    Layout,
    Monitor,
    Moon,
    Palette,
    Redo,
    RefreshCw,
    Save,
    Settings,
    Share2,
    Smartphone,
    Tablet,
    Type,
    Undo,
    Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Theme {
    id?: number;
    name: string;
    description?: string;
    is_dark: boolean;
    font_family: string;
    border_radius: number;
    css_variables: Record<string, string>;
    is_public?: boolean;
    base_theme?: string;
}

interface Props {
    theme?: Theme;
    editing?: boolean;
    base_themes?: Array<{
        value: string;
        label: string;
        variables: Record<string, string>;
    }>;
}

const defaultCssVariables = {
    // Base colors
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafc',
    '--bg-tertiary': '#f1f5f9',
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--text-muted': '#94a3b8',
    '--border-color': '#e2e8f0',

    // Accent colors
    '--accent-primary': '#3b82f6',
    '--accent-secondary': '#10b981',
    '--accent-tertiary': '#8b5cf6',

    // Interactive colors
    '--button-primary-bg': '#3b82f6',
    '--button-primary-text': '#ffffff',
    '--button-secondary-bg': '#f1f5f9',
    '--button-secondary-text': '#475569',

    // Status colors
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--error': '#ef4444',
    '--info': '#3b82f6',

    // Quiz specific
    '--quiz-correct': '#10b981',
    '--quiz-incorrect': '#ef4444',
    '--timer-bg': '#fbbf24',
    '--leaderboard-gold': '#fbbf24',
    '--leaderboard-silver': '#94a3b8',
    '--leaderboard-bronze': '#fb7185',
};

export default function ThemeEditor({ theme, editing = false, base_themes = [] }: Props) {
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
    const [activeTab, setActiveTab] = useState('colors');
    const [isLivePreview, setIsLivePreview] = useState(true);
    const [history, setHistory] = useState<Record<string, string>[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        name: theme?.name || 'Mon Thème Personnalisé',
        description: theme?.description || '',
        is_dark: theme?.is_dark || false,
        font_family: theme?.font_family || 'Inter',
        border_radius: theme?.border_radius || 8,
        css_variables: theme?.css_variables || defaultCssVariables,
        is_public: theme?.is_public || false,
        base_theme: theme?.base_theme || 'light',
    });

    const [liveVariables, setLiveVariables] = useState(data.css_variables);

    // Font options
    const fontOptions = [
        'Inter',
        'Roboto',
        'Open Sans',
        'Lato',
        'Montserrat',
        'Poppins',
        'Source Sans Pro',
        'Nunito',
        'Ubuntu',
        'Raleway',
        'Merriweather',
        'Playfair Display',
    ];

    // History management
    const addToHistory = useCallback(
        (variables: Record<string, string>) => {
            setHistory((prev) => {
                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push({ ...variables });
                return newHistory.slice(-20); // Keep last 20 states
            });
            setHistoryIndex((prev) => Math.min(prev + 1, 19));
        },
        [historyIndex],
    );

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setLiveVariables(prevState);
            setHistoryIndex((prev) => prev - 1);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setLiveVariables(nextState);
            setHistoryIndex((prev) => prev + 1);
        }
    }, [history, historyIndex]);

    // Update live preview when variables change
    useEffect(() => {
        const root = document.documentElement;

        if (isLivePreview) {
            Object.entries(liveVariables).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
        }

        return () => {
            // Cleanup on unmount
            Object.keys(liveVariables).forEach((property) => {
                root.style.removeProperty(property);
            });
        };
    }, [liveVariables, isLivePreview]);

    // Initialize history
    useEffect(() => {
        addToHistory(liveVariables);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            redo();
                        } else {
                            e.preventDefault();
                            undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        handleSubmit();
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const finalData = {
            ...data,
            css_variables: liveVariables,
        };

        if (editing && theme?.id) {
            put(`/themes/${theme.id}`, finalData as any);
        } else {
            post('/themes', finalData as any);
        }
    };

    const handleColorChange = (variable: string, color: string) => {
        const newVariables = { ...liveVariables, [variable]: color };
        setLiveVariables(newVariables);
        addToHistory(newVariables);
    };

    const handleBaseThemeChange = (baseTheme: string) => {
        const selectedBase = base_themes.find((t) => t.value === baseTheme);
        if (selectedBase) {
            setData('base_theme', baseTheme);
            setLiveVariables(selectedBase.variables);
            addToHistory(selectedBase.variables);
        }
    };

    const resetToDefaults = () => {
        setLiveVariables(defaultCssVariables);
        setData('css_variables', defaultCssVariables);
        addToHistory(defaultCssVariables);
    };

    const exportTheme = () => {
        const themeData = {
            name: data.name,
            description: data.description,
            is_dark: data.is_dark,
            font_family: data.font_family,
            border_radius: data.border_radius,
            css_variables: liveVariables,
            is_public: data.is_public,
            base_theme: data.base_theme,
        };

        const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target?.result as string);
                    setData((prev) => ({ ...prev, ...imported }));
                    setLiveVariables(imported.css_variables);
                    addToHistory(imported.css_variables);
                } catch (error) {
                    console.error('Failed to import theme:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    const copyToClipboard = async () => {
        const cssVars = Object.entries(liveVariables)
            .map(([key, value]) => `  ${key}: ${value};`)
            .join('\n');

        const cssCode = `:root {\n${cssVars}\n}`;

        try {
            await navigator.clipboard.writeText(cssCode);
            // You might want to show a toast notification here
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const colorCategories = [
        {
            title: 'Couleurs de base',
            variables: [
                { key: '--bg-primary', label: 'Arrière-plan principal' },
                { key: '--bg-secondary', label: 'Arrière-plan secondaire' },
                { key: '--bg-tertiary', label: 'Arrière-plan tertiaire' },
                { key: '--text-primary', label: 'Texte principal' },
                { key: '--text-secondary', label: 'Texte secondaire' },
                { key: '--text-muted', label: 'Texte atténué' },
                { key: '--border-color', label: 'Bordures' },
            ],
        },
        {
            title: 'Couleurs accent',
            variables: [
                { key: '--accent-primary', label: 'Accent principal' },
                { key: '--accent-secondary', label: 'Accent secondaire' },
                { key: '--accent-tertiary', label: 'Accent tertiaire' },
            ],
        },
        {
            title: 'Boutons et interactions',
            variables: [
                { key: '--button-primary-bg', label: 'Bouton principal' },
                { key: '--button-primary-text', label: 'Texte bouton principal' },
                { key: '--button-secondary-bg', label: 'Bouton secondaire' },
                { key: '--button-secondary-text', label: 'Texte bouton secondaire' },
            ],
        },
        {
            title: 'Couleurs de statut',
            variables: [
                { key: '--success', label: 'Succès' },
                { key: '--warning', label: 'Avertissement' },
                { key: '--error', label: 'Erreur' },
                { key: '--info', label: 'Information' },
            ],
        },
        {
            title: 'Quiz et jeux',
            variables: [
                { key: '--quiz-correct', label: 'Bonne réponse' },
                { key: '--quiz-incorrect', label: 'Mauvaise réponse' },
                { key: '--timer-bg', label: 'Timer' },
                { key: '--leaderboard-gold', label: '1ère place' },
                { key: '--leaderboard-silver', label: '2ème place' },
                { key: '--leaderboard-bronze', label: '3ème place' },
            ],
        },
    ];

    return (
        <AppLayout>
            <Head title={editing ? 'Modifier le thème' : 'Éditeur de Thèmes Avancé'} />

            <div className="flex h-screen overflow-hidden">
                {/* Editor Panel */}
                <div className="w-96 overflow-y-auto border-r bg-background">
                    <div className="border-b p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-xl font-bold">Éditeur de Thèmes</h1>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} title="Annuler (Ctrl+Z)">
                                    <Undo className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={redo}
                                    disabled={historyIndex >= history.length - 1}
                                    title="Refaire (Ctrl+Shift+Z)"
                                >
                                    <Redo className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Settings */}
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="theme-name">Nom du thème</Label>
                                <Input
                                    id="theme-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                            </div>

                            {base_themes.length > 0 && (
                                <div>
                                    <Label htmlFor="base-theme">Thème de base</Label>
                                    <Select value={data.base_theme} onValueChange={handleBaseThemeChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {base_themes.map((theme) => (
                                                <SelectItem key={theme.value} value={theme.value}>
                                                    {theme.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <Label htmlFor="live-preview">Aperçu en temps réel</Label>
                                <Switch id="live-preview" checked={isLivePreview} onCheckedChange={setIsLivePreview} />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="is-dark">Mode sombre</Label>
                                <Switch id="is-dark" checked={data.is_dark} onCheckedChange={(checked) => setData('is_dark', checked as boolean)} />
                            </div>
                        </div>
                    </div>

                    {/* Customization Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                        <TabsList className="m-4 grid w-full grid-cols-4">
                            <TabsTrigger value="colors" className="text-xs">
                                <Palette className="mr-1 h-3 w-3" />
                                Couleurs
                            </TabsTrigger>
                            <TabsTrigger value="typography" className="text-xs">
                                <Type className="mr-1 h-3 w-3" />
                                Typo
                            </TabsTrigger>
                            <TabsTrigger value="layout" className="text-xs">
                                <Layout className="mr-1 h-3 w-3" />
                                Mise en page
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="text-xs">
                                <Settings className="mr-1 h-3 w-3" />
                                Avancé
                            </TabsTrigger>
                        </TabsList>

                        <div className="px-4 pb-4">
                            <TabsContent value="colors" className="space-y-4">
                                {colorCategories.map((category) => (
                                    <Card key={category.title}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">{category.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {category.variables.map((variable) => (
                                                <div key={variable.key} className="space-y-2">
                                                    <Label className="text-xs font-medium">{variable.label}</Label>
                                                    <div className="flex gap-2">
                                                        <div className="relative">
                                                            <Input
                                                                type="color"
                                                                value={(liveVariables as any)[variable.key] || '#000000'}
                                                                onChange={(e) => handleColorChange(variable.key, e.target.value)}
                                                                className="h-8 w-12 cursor-pointer border-0 p-0"
                                                            />
                                                        </div>
                                                        <Input
                                                            value={(liveVariables as any)[variable.key] || '#000000'}
                                                            onChange={(e) => handleColorChange(variable.key, e.target.value)}
                                                            className="h-8 flex-1 font-mono text-xs"
                                                            placeholder="#000000"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            <TabsContent value="typography" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Police</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-xs">Famille de police</Label>
                                            <Select value={data.font_family} onValueChange={(value) => setData('font_family', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fontOptions.map((font) => (
                                                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                                            {font}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="layout" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Géométrie</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-xs">Rayon des bordures</Label>
                                            <div className="space-y-2">
                                                <Slider
                                                    value={[data.border_radius]}
                                                    onValueChange={([value]) => setData('border_radius', value)}
                                                    max={24}
                                                    min={0}
                                                    step={1}
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>0px</span>
                                                    <span>{data.border_radius}px</span>
                                                    <span>24px</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="advanced" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Informations générales</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-xs">Description</Label>
                                            <Textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Décrivez votre thème..."
                                                rows={2}
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Thème public</Label>
                                            <Switch
                                                checked={data.is_public}
                                                onCheckedChange={(checked) => setData('is_public', checked as boolean)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Outils</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm" onClick={exportTheme}>
                                                <Download className="mr-1 h-3 w-3" />
                                                Exporter
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
                                                <Upload className="mr-1 h-3 w-3" />
                                                Importer
                                            </Button>
                                        </div>

                                        <Button variant="outline" size="sm" className="w-full" onClick={copyToClipboard}>
                                            <Copy className="mr-1 h-3 w-3" />
                                            Copier CSS
                                        </Button>

                                        <Button variant="outline" size="sm" className="w-full" onClick={resetToDefaults}>
                                            <RefreshCw className="mr-1 h-3 w-3" />
                                            Réinitialiser
                                        </Button>

                                        <input id="import-file" type="file" accept=".json" onChange={importTheme} className="hidden" />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>

                    {/* Save Actions */}
                    <div className="border-t bg-muted/30 p-4">
                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} disabled={processing} className="flex-1">
                                {processing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {editing ? 'Mettre à jour' : 'Enregistrer'}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="flex flex-1 flex-col">
                    {/* Preview Toolbar */}
                    <div className="flex items-center justify-between border-b bg-muted/30 p-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Aperçu</Badge>
                            <span className="text-sm text-muted-foreground">{data.name}</span>
                            {data.is_dark && (
                                <Badge variant="outline">
                                    <Moon className="mr-1 h-3 w-3" />
                                    Sombre
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant={previewMode === 'desktop' ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewMode('desktop')}>
                                <Monitor className="h-4 w-4" />
                            </Button>
                            <Button variant={previewMode === 'tablet' ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewMode('tablet')}>
                                <Tablet className="h-4 w-4" />
                            </Button>
                            <Button variant={previewMode === 'mobile' ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewMode('mobile')}>
                                <Smartphone className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="flex-1 overflow-auto bg-muted/20 p-8">
                        <motion.div
                            layout
                            className="mx-auto"
                            style={{
                                maxWidth: previewMode === 'desktop' ? '1200px' : previewMode === 'tablet' ? '768px' : '375px',
                            }}
                        >
                            <ThemePreview
                                variables={liveVariables}
                                mode={previewMode === 'desktop' ? 'desktop' : 'mobile'}
                                fontFamily={data.font_family}
                                borderRadius={data.border_radius}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
