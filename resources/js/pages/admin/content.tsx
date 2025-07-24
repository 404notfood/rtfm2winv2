import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/layouts/admin-layout';
import { Quiz, Tournament, User, Tag, Theme } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { BookOpen, Calendar, Crown, Eye, EyeOff, Folder, MoreHorizontal, Palette, Search, Tag as TagIcon, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

interface ContentStats {
    total_quizzes: number;
    published_quizzes: number;
    draft_quizzes: number;
    total_tournaments: number;
    active_tournaments: number;
    total_tags: number;
    total_themes: number;
}

interface Props {
    auth: { user: User };
    stats: ContentStats;
    recentQuizzes: Quiz[];
    recentTournaments: Tournament[];
    popularTags: Tag[];
    userThemes: Theme[];
}

export default function AdminContent({ auth, stats, recentQuizzes, recentTournaments, popularTags, userThemes }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('quizzes');
    
    const { data, setData, get } = useForm({
        search: '',
        status: '',
        category: '',
    });

    const handleSearch = () => {
        get(`/admin/content/${activeTab}`, {
            preserveState: true,
        });
    };

    const handleQuizStatusToggle = (quizId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        router.put(`/admin/content/quizzes/${quizId}/status`, {
            status: newStatus,
        });
    };

    const handleTournamentStatusToggle = (tournamentId: number, currentStatus: string) => {
        router.put(`/admin/content/tournaments/${tournamentId}/status`, {
            status: currentStatus === 'active' ? 'completed' : 'active',
        });
    };

    return (
        <AdminLayout>
            <Head title="Gestion du Contenu" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion du Contenu</h1>
                        <p className="text-muted-foreground">
                            Gérez tous les contenus de la plateforme RTFM2WIN
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quiz Total</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_quizzes}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.published_quizzes} publiés, {stats.draft_quizzes} brouillons
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tournois</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_tournaments}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_tournaments} actifs
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tags</CardTitle>
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_tags}</div>
                            <p className="text-xs text-muted-foreground">
                                Catégories et labels
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Thèmes</CardTitle>
                            <Palette className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_themes}</div>
                            <p className="text-xs text-muted-foreground">
                                Personnalisations utilisateur
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Management Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="quizzes" className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Quiz
                            </TabsTrigger>
                            <TabsTrigger value="tournaments" className="flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                Tournois
                            </TabsTrigger>
                            <TabsTrigger value="tags" className="flex items-center gap-2">
                                <TagIcon className="h-4 w-4" />
                                Tags
                            </TabsTrigger>
                            <TabsTrigger value="themes" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Thèmes
                            </TabsTrigger>
                        </TabsList>

                        {/* Search and Filters */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="pl-8 w-[250px]"
                                />
                            </div>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous</SelectItem>
                                    <SelectItem value="published">Publié</SelectItem>
                                    <SelectItem value="draft">Brouillon</SelectItem>
                                    <SelectItem value="archived">Archivé</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="quizzes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Récents</CardTitle>
                                <CardDescription>
                                    Les derniers quiz créés sur la plateforme
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentQuizzes.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentQuizzes.map((quiz) => (
                                            <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">{quiz.title}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {quiz.participants_count || 0} participants
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(quiz.created_at).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        <span>Par {quiz.creator?.name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge 
                                                        variant={
                                                            quiz.status === 'published' ? 'default' : 
                                                            quiz.status === 'draft' ? 'secondary' : 'outline'
                                                        }
                                                    >
                                                        {quiz.status === 'published' && 'Publié'}
                                                        {quiz.status === 'draft' && 'Brouillon'}
                                                        {quiz.status === 'archived' && 'Archivé'}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleQuizStatusToggle(quiz.id, quiz.status)}
                                                    >
                                                        {quiz.status === 'published' ? (
                                                            <>
                                                                <EyeOff className="h-3 w-3 mr-1" />
                                                                Dépublier
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                Publier
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/quiz/${quiz.id}`}>
                                                            Voir
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        Aucun quiz trouvé.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tournaments" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tournois Récents</CardTitle>
                                <CardDescription>
                                    Les derniers tournois organisés
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentTournaments.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentTournaments.map((tournament) => (
                                            <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">{tournament.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Crown className="h-3 w-3" />
                                                            {tournament.participants?.length || 0}/{tournament.max_participants}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(tournament.created_at).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge 
                                                        variant={
                                                            tournament.status === 'active' ? 'default' : 
                                                            tournament.status === 'completed' ? 'secondary' : 'outline'
                                                        }
                                                    >
                                                        {tournament.status === 'active' && 'Actif'}
                                                        {tournament.status === 'completed' && 'Terminé'}
                                                        {tournament.status === 'draft' && 'Brouillon'}
                                                        {tournament.status === 'cancelled' && 'Annulé'}
                                                    </Badge>
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/tournaments/${tournament.id}`}>
                                                            Voir
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        Aucun tournoi trouvé.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tags" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags Populaires</CardTitle>
                                <CardDescription>
                                    Les tags les plus utilisés sur la plateforme
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {popularTags.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {popularTags.map((tag) => (
                                            <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: tag.color || '#6B7280' }}
                                                    />
                                                    <span className="font-medium">{tag.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {tag.usage_count || 0}
                                                    </Badge>
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/tags/${tag.id}/edit`}>
                                                            Modifier
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        Aucun tag trouvé.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="themes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thèmes Utilisateur</CardTitle>
                                <CardDescription>
                                    Thèmes personnalisés créés par les utilisateurs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userThemes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userThemes.map((theme) => (
                                            <div key={theme.id} className="p-4 border rounded-lg space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium">{theme.name}</h3>
                                                    <Badge variant={theme.is_public ? 'default' : 'secondary'}>
                                                        {theme.is_public ? 'Public' : 'Privé'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {theme.description || 'Aucune description'}
                                                </p>
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {Object.entries(theme.css_variables || {}).slice(0, 3).map(([key, value], index) => (
                                                                <div 
                                                                    key={index}
                                                                    className="w-4 h-4 rounded-full border"
                                                                    style={{ backgroundColor: value as string }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {theme.is_dark ? 'Sombre' : 'Clair'}
                                                        </span>
                                                    </div>
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/themes/${theme.id}`}>
                                                            Voir
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        Aucun thème trouvé.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}