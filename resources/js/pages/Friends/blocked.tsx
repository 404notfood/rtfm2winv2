import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { UserX, UserCheck, ArrowLeft, Calendar, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface BlockedUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    blocked_at: string;
    blocked_reason?: string;
    mutual_friends_count: number;
    last_activity_at?: string;
}

interface BlockedFriendsProps {
    blockedUsers: BlockedUser[];
    stats: {
        total_blocked: number;
        blocked_this_month: number;
    };
}

export default function BlockedFriends({ blockedUsers, stats }: BlockedFriendsProps) {
    const [processing, setProcessing] = useState<number | null>(null);

    const handleUnblock = async (userId: number) => {
        if (processing) return;
        
        setProcessing(userId);
        
        try {
            await router.delete(`/friends/${userId}/unblock`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be handled by the flash message system
                },
                onError: () => {
                    // Error will be displayed via flash message
                },
                onFinish: () => {
                    setProcessing(null);
                }
            });
        } catch (error) {
            setProcessing(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getActivityStatus = (lastActivity?: string) => {
        if (!lastActivity) return { text: 'Jamais connecté', color: 'text-gray-500' };
        
        const daysSince = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince === 0) return { text: 'En ligne aujourd\'hui', color: 'text-green-600' };
        if (daysSince < 7) return { text: `Il y a ${daysSince} jour${daysSince > 1 ? 's' : ''}`, color: 'text-blue-600' };
        if (daysSince < 30) return { text: `Il y a ${Math.floor(daysSince / 7)} semaine${Math.floor(daysSince / 7) > 1 ? 's' : ''}`, color: 'text-yellow-600' };
        
        return { text: 'Inactif depuis longtemps', color: 'text-gray-500' };
    };

    return (
        <>
            <Head title="Utilisateurs Bloqués" />
            <AppLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3">
                                <Link href="/friends">
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Retour aux amis
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold flex items-center">
                                        <UserX className="w-8 h-8 mr-3 text-red-500" />
                                        Utilisateurs Bloqués
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        Gérez votre liste d'utilisateurs bloqués
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Bloqués
                                </CardTitle>
                                <UserX className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_blocked}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Bloqués ce Mois
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.blocked_this_month}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerte d'information */}
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-yellow-800">
                                        À propos des utilisateurs bloqués
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        Les utilisateurs bloqués ne peuvent pas vous envoyer de demandes d'amis, 
                                        vous inviter à des quiz, ou interagir avec votre contenu. 
                                        Vous pouvez les débloquer à tout moment.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Liste des utilisateurs bloqués */}
                    {blockedUsers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {blockedUsers.map((user) => {
                                const activity = getActivityStatus(user.last_activity_at);
                                
                                return (
                                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage 
                                                            src={user.avatar} 
                                                            alt={user.name} 
                                                        />
                                                        <AvatarFallback className="bg-red-100 text-red-600">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="font-semibold text-lg">{user.name}</h3>
                                                            <Badge variant="destructive" className="text-xs">
                                                                Bloqué
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            <span className={activity.color}>
                                                                {activity.text}
                                                            </span>
                                                            {user.mutual_friends_count > 0 && (
                                                                <span>
                                                                    {user.mutual_friends_count} ami{user.mutual_friends_count > 1 ? 's' : ''} en commun
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            Bloqué le {formatDate(user.blocked_at)}
                                                        </div>
                                                        {user.blocked_reason && (
                                                            <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                                                                Raison : {user.blocked_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleUnblock(user.id)}
                                                    disabled={processing === user.id}
                                                    className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                                >
                                                    {processing === user.id ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                    ) : (
                                                        <UserCheck className="w-4 h-4 mr-2" />
                                                    )}
                                                    Débloquer
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Aucun utilisateur bloqué
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Vous n'avez bloqué aucun utilisateur pour le moment.
                                </p>
                                <Link href="/friends">
                                    <Button>
                                        Retour à mes amis
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        </>
    );
}