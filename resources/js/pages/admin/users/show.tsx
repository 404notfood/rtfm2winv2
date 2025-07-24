import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/layouts/admin-layout';
import { User, Quiz, Tournament, Achievement } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Crown, Edit, Mail, Shield, Star, Trophy, User as UserIcon, Zap } from 'lucide-react';
import { useState } from 'react';

interface UserQuiz extends Quiz {
    sessions_count: number;
    total_participants: number;
}

interface UserStats {
    total_quizzes: number;
    total_sessions: number;
    total_participants: number;
    total_points: number;
    achievements_count: number;
    tournaments_won: number;
    avg_quiz_rating: number;
    join_date: string;
    last_activity: string;
}

interface Props {
    auth: { user: User };
    user: User;
    stats: UserStats;
    recentQuizzes: UserQuiz[];
    recentAchievements: Achievement[];
    recentTournaments: Tournament[];
}

export default function AdminUserShow({ auth, user, stats, recentQuizzes, recentAchievements, recentTournaments }: Props) {
    const [loading, setLoading] = useState(false);

    const handleRoleChange = (newRole: string) => {
        setLoading(true);
        router.put(`/admin/users/${user.id}/role`, { role: newRole }, {
            onFinish: () => setLoading(false),
        });
    };

    const handleSuspend = () => {
        if (confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) {
            setLoading(true);
            router.put(`/admin/users/${user.id}/suspend`, {}, {
                onFinish: () => setLoading(false),
            });
        }
    };

    const handleActivate = () => {
        setLoading(true);
        router.put(`/admin/users/${user.id}/activate`, {}, {
            onFinish: () => setLoading(false),
        });
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'presenter': return 'default';
            case 'user': return 'secondary';
            case 'guest': return 'outline';
            default: return 'secondary';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="h-3 w-3" />;
            case 'presenter': return <Crown className="h-3 w-3" />;
            case 'user': return <UserIcon className="h-3 w-3" />;
            default: return <UserIcon className="h-3 w-3" />;
        }
    };

    return (
        <AdminLayout>
            <Head title={`Utilisateur: ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/users">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux utilisateurs
                            </Link>
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Profil Utilisateur</h1>
                            <p className="text-muted-foreground">
                                Détails et gestion de {user.name}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild disabled={loading}>
                            <Link href={`/admin/users/${user.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Link>
                        </Button>
                        {user.is_suspended ? (
                            <Button variant="default" onClick={handleActivate} disabled={loading}>
                                Réactiver
                            </Button>
                        ) : (
                            <Button variant="destructive" onClick={handleSuspend} disabled={loading}>
                                Suspendre
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Info Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="text-center pb-4">
                            <Avatar className="h-24 w-24 mx-auto">
                                <AvatarImage src={user.avatar_url} alt={user.name} />
                                <AvatarFallback className="text-2xl">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                <div className="flex justify-center">
                                    <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                                        {getRoleIcon(user.role)}
                                        {user.role === 'admin' && 'Administrateur'}
                                        {user.role === 'presenter' && 'Présentateur'}
                                        {user.role === 'user' && 'Utilisateur'}
                                        {user.role === 'guest' && 'Invité'}
                                    </Badge>
                                </div>
                                {user.is_suspended && (
                                    <Badge variant="destructive">Suspendu</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Inscrit le {new Date(stats.join_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>Dernière activité: {new Date(stats.last_activity).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Quick Role Change */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Changer le rôle:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        size="sm" 
                                        variant={user.role === 'user' ? 'default' : 'outline'}
                                        onClick={() => handleRoleChange('user')}
                                        disabled={loading || user.role === 'user'}
                                    >
                                        Utilisateur
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant={user.role === 'presenter' ? 'default' : 'outline'}
                                        onClick={() => handleRoleChange('presenter')}
                                        disabled={loading || user.role === 'presenter'}
                                    >
                                        Présentateur
                                    </Button>
                                </div>
                                {auth.user.role === 'admin' && (
                                    <Button 
                                        size="sm" 
                                        variant={user.role === 'admin' ? 'default' : 'outline'}
                                        onClick={() => handleRoleChange('admin')}
                                        disabled={loading || user.role === 'admin'}
                                        className="w-full"
                                    >
                                        Administrateur
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats and Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.total_quizzes}</div>
                                    <div className="text-sm text-muted-foreground">Quiz créés</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.total_sessions}</div>
                                    <div className="text-sm text-muted-foreground">Sessions</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{stats.total_points}</div>
                                    <div className="text-sm text-muted-foreground">Points</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.achievements_count}</div>
                                    <div className="text-sm text-muted-foreground">Succès</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Activity */}
                        <Tabs defaultValue="quizzes" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="quizzes">Quiz Récents</TabsTrigger>
                                <TabsTrigger value="achievements">Succès</TabsTrigger>
                                <TabsTrigger value="tournaments">Tournois</TabsTrigger>
                            </TabsList>

                            <TabsContent value="quizzes" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quiz Créés</CardTitle>
                                        <CardDescription>Les derniers quiz créés par cet utilisateur</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {recentQuizzes.length > 0 ? (
                                            <div className="space-y-3">
                                                {recentQuizzes.map((quiz) => (
                                                    <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <h4 className="font-medium">{quiz.title}</h4>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span>{quiz.sessions_count} sessions</span>
                                                                <span>{quiz.total_participants} participants</span>
                                                                <span>{new Date(quiz.created_at).toLocaleDateString('fr-FR')}</span>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/quiz/${quiz.id}`}>Voir</Link>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-8">
                                                Aucun quiz créé pour le moment.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="achievements" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Succès Récents</CardTitle>
                                        <CardDescription>Les derniers achievements débloqués</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {recentAchievements.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {recentAchievements.map((achievement) => (
                                                    <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                        <div className="p-2 bg-yellow-100 rounded-full">
                                                            <Trophy className="h-4 w-4 text-yellow-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{achievement.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-8">
                                                Aucun succès débloqué pour le moment.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="tournaments" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tournois</CardTitle>
                                        <CardDescription>Participation aux tournois récents</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {recentTournaments.length > 0 ? (
                                            <div className="space-y-3">
                                                {recentTournaments.map((tournament) => (
                                                    <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <h4 className="font-medium">{tournament.name}</h4>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Badge variant="outline">{tournament.status}</Badge>
                                                                <span>{new Date(tournament.created_at).toLocaleDateString('fr-FR')}</span>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/tournaments/${tournament.id}`}>Voir</Link>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-8">
                                                Aucune participation aux tournois.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}