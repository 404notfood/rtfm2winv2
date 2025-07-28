import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Clock, Play, QrCode, Search, Users } from 'lucide-react';
import { useState } from 'react';

interface Session {
    id: number;
    code: string;
    status: 'waiting' | 'active';
    participants_count: number;
    max_participants?: number;
    created_at: string;
    quiz: {
        id: number;
        title: string;
        description?: string;
        creator: {
            id: number;
            name: string;
        };
    };
}

interface Props {
    sessions: Session[];
}

export default function ActiveSessions({ sessions }: Props) {
    const [joinCode, setJoinCode] = useState('');
    const { post, processing } = useForm();

    const handleJoinByCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) return;
        
        // Redirect to join route with the code
        window.location.href = `/join/${joinCode.toUpperCase()}`;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} min`;
        } else {
            const diffInHours = Math.floor(diffInMinutes / 60);
            return `${diffInHours}h`;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'En attente';
            case 'active':
                return 'En cours';
            default:
                return status;
        }
    };

    return (
        <AppLayout>
            <Head title="Sessions Actives" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Sessions de Quiz Actives</h1>
                    <p className="text-muted-foreground mb-6">
                        Rejoignez un quiz en cours ou entrez un code de session
                    </p>

                    {/* Join by code form */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                Rejoindre avec un code
                            </CardTitle>
                            <CardDescription>
                                Entrez le code à 6 lettres fourni par le présentateur
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleJoinByCode} className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Entrez le code (ex: ABC123)"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    className="uppercase text-center text-lg font-mono tracking-wider"
                                    maxLength={6}
                                />
                                <Button type="submit" disabled={!joinCode.trim() || processing}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Rejoindre
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Active sessions list */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Sessions Disponibles</h2>
                    
                    {sessions.length > 0 ? (
                        <div className="grid gap-4">
                            {sessions.map((session) => (
                                <Card key={session.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{session.quiz.title}</h3>
                                                    <Badge className={getStatusColor(session.status)}>
                                                        {getStatusText(session.status)}
                                                    </Badge>
                                                </div>
                                                
                                                <p className="text-muted-foreground mb-2">
                                                    {session.quiz.description || 'Aucune description'}
                                                </p>
                                                
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {session.participants_count} participant{session.participants_count !== 1 ? 's' : ''}
                                                        {session.max_participants && ` / ${session.max_participants}`}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        Créé il y a {formatTimeAgo(session.created_at)}
                                                    </span>
                                                    <span>
                                                        Par {session.quiz.creator.name}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-mono font-bold text-primary">
                                                        {session.code}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Code</div>
                                                </div>
                                                
                                                <Button 
                                                    onClick={() => window.location.href = `/join/${session.code}`}
                                                    disabled={session.status === 'active'}
                                                    className="min-w-[100px]"
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    {session.status === 'waiting' ? 'Rejoindre' : 'En cours'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucune session active</h3>
                                <p className="text-muted-foreground mb-6">
                                    Il n'y a actuellement aucune session de quiz disponible.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Demandez à un présentateur de lancer un quiz ou utilisez un code de session si vous en avez un.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}