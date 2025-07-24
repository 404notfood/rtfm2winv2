import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Clock, Play, QrCode, Trophy, Users, Zap } from 'lucide-react';

interface RecentQuiz {
    id: number;
    title: string;
    code: string;
    participants_count: number;
    status: 'waiting' | 'active' | 'completed';
    creator_name: string;
    created_at: string;
}

interface Props {
    recentQuizzes: RecentQuiz[];
    stats: {
        total_quizzes: number;
        active_sessions: number;
        total_participants: number;
    };
}

export default function GuestDashboard({ recentQuizzes, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Bienvenue sur RTFM2WIN" />

            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                            <Trophy className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Bienvenue sur RTFM2WIN
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        La plateforme de quiz interactive ultime. Participez à des quiz en temps réel, 
                        défiez vos amis et gravissez les classements !
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quiz Disponibles</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_quizzes}</div>
                            <p className="text-xs text-muted-foreground">
                                Prêts à être joués
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_sessions}</div>
                            <p className="text-xs text-muted-foreground">
                                En cours maintenant
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Participants Total</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_participants}</div>
                            <p className="text-xs text-muted-foreground">
                                Joueurs dans la communauté
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="group hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                Rejoindre un Quiz
                            </CardTitle>
                            <CardDescription>
                                Entrez un code de session ou scannez un QR code
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <Link href="/join">
                                    <Play className="mr-2 h-4 w-4" />
                                    Rejoindre maintenant
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Créer un Compte
                            </CardTitle>
                            <CardDescription>
                                Débloquez toutes les fonctionnalités et suivez vos progrès
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/register">
                                    S'inscrire gratuitement
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Quizzes */}
                {recentQuizzes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Récents</CardTitle>
                            <CardDescription>
                                Découvrez les derniers quiz créés par la communauté
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <h3 className="font-medium">{quiz.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {quiz.participants_count} participants
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Par {quiz.creator_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(quiz.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant={
                                                    quiz.status === 'active' ? 'default' : 
                                                    quiz.status === 'waiting' ? 'secondary' : 'outline'
                                                }
                                            >
                                                {quiz.status === 'active' && 'En cours'}
                                                {quiz.status === 'waiting' && 'En attente'}
                                                {quiz.status === 'completed' && 'Terminé'}
                                            </Badge>
                                            {quiz.status === 'waiting' && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/join?code=${quiz.code}`}>
                                                        Rejoindre
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                                <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">Temps Réel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Participez à des quiz en direct avec des classements mis à jour en temps réel
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                                <Trophy className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg">Compétitions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Participez à des tournois et des modes Battle Royale pour des défis épiques
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg">Communauté</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Rejoignez une communauté active de joueurs et créateurs de quiz
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Call to Action */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="text-center py-8">
                        <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Créez un compte gratuit pour accéder à toutes les fonctionnalités, 
                            suivre vos progrès et débloquer des achievements exclusifs.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button size="lg" asChild>
                                <Link href="/register">
                                    Créer un compte
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/login">
                                    Se connecter
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}