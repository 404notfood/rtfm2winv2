import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, Clock, Crown, Gamepad2, MessageCircle, Search, UserPlus, Users, X } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
}

interface Friend {
    id: number;
    user: User;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: string;
    last_seen?: string;
    games_played?: number;
    wins?: number;
    rank?: number;
}

interface Props {
    friends?: Friend[];
    pending_requests?: Friend[];
    sent_requests?: Friend[];
    stats?: {
        total_friends: number;
        online_friends: number;
        pending_requests: number;
        sent_requests: number;
    };
}

export default function FriendsIndex({
    friends = [],
    pending_requests = [],
    sent_requests = [],
    stats = {
        total_friends: 0,
        online_friends: 0,
        pending_requests: 0,
        sent_requests: 0,
    },
}: Props) {
    const [search, setSearch] = useState('');
    const { post, processing } = useForm();

    const acceptFriend = (friendId: number) => {
        post(`/friends/${friendId}/accept`);
    };

    const rejectFriend = (friendId: number) => {
        post(`/friends/${friendId}/reject`);
    };

    const removeFriend = (friendId: number) => {
        if (confirm('Supprimer cet ami de votre liste ?')) {
            post(`/friends/${friendId}/remove`);
        }
    };

    const cancelRequest = (friendId: number) => {
        post(`/friends/${friendId}/cancel`);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getOnlineStatus = (lastSeen?: string) => {
        if (!lastSeen) return 'offline';
        const now = new Date();
        const seen = new Date(lastSeen);
        const diffMinutes = Math.floor((now.getTime() - seen.getTime()) / (1000 * 60));

        if (diffMinutes < 5) return 'online';
        if (diffMinutes < 30) return 'away';
        return 'offline';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'away':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "À l'instant";
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

        return date.toLocaleDateString('fr-FR');
    };

    const filteredFriends = friends.filter(
        (friend) => friend.user.name.toLowerCase().includes(search.toLowerCase()) || friend.user.email.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            <Head title="Mes Amis" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Mes Amis</h1>
                        <p className="text-muted-foreground">Gérez vos connexions sociales et défiez vos amis</p>
                    </div>
                    <Button asChild>
                        <Link href="/friends/add">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Ajouter un ami
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.total_friends}</div>
                            <div className="text-sm text-muted-foreground">Amis</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.online_friends}</div>
                            <div className="text-sm text-muted-foreground">En ligne</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.pending_requests}</div>
                            <div className="text-sm text-muted-foreground">Demandes reçues</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{stats.sent_requests}</div>
                            <div className="text-sm text-muted-foreground">Demandes envoyées</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="friends" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="friends" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Amis ({friends.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Demandes reçues ({pending_requests.length})
                            {pending_requests.length > 0 && (
                                <Badge variant="destructive" className="ml-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                                    {pending_requests.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="sent" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Demandes envoyées ({sent_requests.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Friends Tab */}
                    <TabsContent value="friends" className="space-y-4">
                        {/* Search */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher des amis..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Friends List */}
                        {filteredFriends.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">{search ? 'Aucun ami trouvé' : 'Aucun ami pour le moment'}</h3>
                                    <p className="mb-4 text-muted-foreground">
                                        {search
                                            ? 'Aucun ami ne correspond à votre recherche.'
                                            : 'Commencez par ajouter des amis pour jouer ensemble !'}
                                    </p>
                                    {!search && (
                                        <Button asChild>
                                            <Link href="/friends/add">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Ajouter des amis
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredFriends.map((friend) => {
                                    const status = getOnlineStatus(friend.last_seen);

                                    return (
                                        <Card key={friend.id} className="transition-shadow hover:shadow-md">
                                            <CardContent className="p-4">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={friend.user.avatar} />
                                                            <AvatarFallback>{getInitials(friend.user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div
                                                            className={cn(
                                                                'absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white',
                                                                getStatusColor(status),
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate font-medium">{friend.user.name}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {status === 'online'
                                                                ? 'En ligne'
                                                                : status === 'away'
                                                                  ? 'Absent'
                                                                  : `Vu ${getRelativeTime(friend.last_seen || friend.created_at)}`}
                                                        </p>
                                                    </div>
                                                    {friend.rank && friend.rank <= 3 && <Crown className="h-4 w-4 text-yellow-500" />}
                                                </div>

                                                {/* Stats */}
                                                {(friend.games_played || friend.wins) && (
                                                    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                                                        {friend.games_played && (
                                                            <div className="rounded bg-muted p-2 text-center">
                                                                <div className="font-medium">{friend.games_played}</div>
                                                                <div className="text-muted-foreground">Parties</div>
                                                            </div>
                                                        )}
                                                        {friend.wins && (
                                                            <div className="rounded bg-muted p-2 text-center">
                                                                <div className="font-medium text-green-600">{friend.wins}</div>
                                                                <div className="text-muted-foreground">Victoires</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <MessageCircle className="mr-1 h-3 w-3" />
                                                        Message
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Gamepad2 className="mr-1 h-3 w-3" />
                                                        Défier
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => removeFriend(friend.id)} disabled={processing}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* Pending Requests Tab */}
                    <TabsContent value="pending" className="space-y-4">
                        {pending_requests.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Aucune demande en attente</h3>
                                    <p className="text-muted-foreground">Vous n'avez pas de nouvelles demandes d'ami.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {pending_requests.map((request) => (
                                    <Card key={request.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={request.user.avatar} />
                                                        <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h4 className="font-medium">{request.user.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Demande envoyée {getRelativeTime(request.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => acceptFriend(request.id)} disabled={processing}>
                                                        <Check className="mr-1 h-4 w-4" />
                                                        Accepter
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => rejectFriend(request.id)}
                                                        disabled={processing}
                                                    >
                                                        <X className="mr-1 h-4 w-4" />
                                                        Refuser
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Sent Requests Tab */}
                    <TabsContent value="sent" className="space-y-4">
                        {sent_requests.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <UserPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Aucune demande envoyée</h3>
                                    <p className="mb-4 text-muted-foreground">Vous n'avez pas encore envoyé de demandes d'ami.</p>
                                    <Button asChild>
                                        <Link href="/friends/add">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Ajouter des amis
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {sent_requests.map((request) => (
                                    <Card key={request.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={request.user.avatar} />
                                                        <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h4 className="font-medium">{request.user.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Demande envoyée {getRelativeTime(request.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline">En attente</Badge>
                                                    <Button variant="ghost" size="sm" onClick={() => cancelRequest(request.id)} disabled={processing}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
