import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Clock, Copy, Crown, Mail, QrCode, Search, Share, Star, Trophy, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
    games_played?: number;
    wins?: number;
    rank?: number;
    mutual_friends?: number;
    status?: 'none' | 'pending_sent' | 'pending_received' | 'friends';
}

interface Props {
    search_results?: User[];
    suggested_friends?: User[];
    popular_players?: User[];
    user_invite_code?: string;
    search_query?: string;
}

export default function AddFriend({
    search_results = [],
    suggested_friends = [],
    popular_players = [],
    user_invite_code = 'INVITE123',
    search_query,
}: Props) {
    const [search, setSearch] = useState(search_query || '');
    const [copiedCode, setCopiedCode] = useState(false);
    const { get, post, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            get(`/friends/add?search=${encodeURIComponent(search.trim())}`);
        }
    };

    const sendFriendRequest = (userId: number) => {
        post(`/friends/request/${userId}`);
    };

    const copyInviteCode = async () => {
        try {
            await navigator.clipboard.writeText(user_invite_code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareInviteLink = async () => {
        const inviteUrl = `${window.location.origin}/join/friend/${user_invite_code}`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Rejoins-moi sur RTFM2WIN !',
                    text: 'Viens jouer aux quiz avec moi !',
                    url: inviteUrl,
                });
            } else {
                await navigator.clipboard.writeText(inviteUrl);
                alert('Lien copié dans le presse-papier !');
            }
        } catch (err) {
            console.error('Failed to share:', err);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getStatusButton = (user: User) => {
        switch (user.status) {
            case 'friends':
                return (
                    <Button variant="outline" size="sm" disabled>
                        <Check className="mr-1 h-4 w-4" />
                        Ami
                    </Button>
                );
            case 'pending_sent':
                return (
                    <Button variant="outline" size="sm" disabled>
                        <Clock className="mr-1 h-4 w-4" />
                        Envoyée
                    </Button>
                );
            case 'pending_received':
                return (
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/friends">
                            <Clock className="mr-1 h-4 w-4" />
                            Répondre
                        </Link>
                    </Button>
                );
            default:
                return (
                    <Button size="sm" onClick={() => sendFriendRequest(user.id)} disabled={processing}>
                        <UserPlus className="mr-1 h-4 w-4" />
                        Ajouter
                    </Button>
                );
        }
    };

    const UserCard = ({ user }: { user: User }) => (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        {user.rank && user.rank <= 3 && <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium">{user.name}</h4>
                        <p className="text-xs text-muted-foreground">Inscrit {new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                        {user.mutual_friends && user.mutual_friends > 0 && (
                            <p className="text-xs text-blue-600">
                                {user.mutual_friends} ami{user.mutual_friends > 1 ? 's' : ''} en commun
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {(user.games_played || user.wins) && (
                    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                        {user.games_played && (
                            <div className="rounded bg-muted p-2 text-center">
                                <div className="font-medium">{user.games_played}</div>
                                <div className="text-muted-foreground">Parties</div>
                            </div>
                        )}
                        {user.wins && (
                            <div className="rounded bg-muted p-2 text-center">
                                <div className="font-medium text-green-600">{user.wins}</div>
                                <div className="text-muted-foreground">Victoires</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Rank Badge */}
                {user.rank && (
                    <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                            <Trophy className="mr-1 h-3 w-3" />#{user.rank} mondial
                        </Badge>
                    </div>
                )}

                {/* Action */}
                <div className="flex justify-end">{getStatusButton(user)}</div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout>
            <Head title="Ajouter des amis" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/friends">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux amis
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">Ajouter des amis</h1>
                        <p className="text-muted-foreground">Trouvez et ajoutez des joueurs pour enrichir votre expérience</p>
                    </div>
                </div>

                <Tabs defaultValue="search" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="search">
                            <Search className="mr-2 h-4 w-4" />
                            Rechercher
                        </TabsTrigger>
                        <TabsTrigger value="suggestions">
                            <Users className="mr-2 h-4 w-4" />
                            Suggestions ({suggested_friends.length})
                        </TabsTrigger>
                        <TabsTrigger value="popular">
                            <Star className="mr-2 h-4 w-4" />
                            Populaires ({popular_players.length})
                        </TabsTrigger>
                        <TabsTrigger value="invite">
                            <Share className="mr-2 h-4 w-4" />
                            Inviter
                        </TabsTrigger>
                    </TabsList>

                    {/* Search Tab */}
                    <TabsContent value="search" className="space-y-4">
                        {/* Search Form */}
                        <Card>
                            <CardContent className="p-4">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher par nom ou email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Button type="submit" disabled={!search.trim()}>
                                        Rechercher
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Search Results */}
                        {search_query && (
                            <>
                                {search_results.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                            <h3 className="mb-2 text-lg font-semibold">Aucun résultat</h3>
                                            <p className="text-muted-foreground">
                                                Aucun joueur trouvé pour "{search_query}". Essayez avec un autre terme de recherche.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {search_results.map((user) => (
                                            <UserCard key={user.id} user={user} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    {/* Suggestions Tab */}
                    <TabsContent value="suggestions" className="space-y-4">
                        {suggested_friends.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Pas de suggestions</h3>
                                    <p className="text-muted-foreground">
                                        Nous n'avons pas encore de suggestions d'amis pour vous. Revenez plus tard ou utilisez la recherche !
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Suggestions d'amis</CardTitle>
                                        <CardDescription>Basées sur vos intérêts et vos parties jouées</CardDescription>
                                    </CardHeader>
                                </Card>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {suggested_friends.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Popular Tab */}
                    <TabsContent value="popular" className="space-y-4">
                        {popular_players.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Pas encore de classements</h3>
                                    <p className="text-muted-foreground">Les joueurs populaires apparaîtront ici prochainement !</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Joueurs populaires</CardTitle>
                                        <CardDescription>Les meilleurs joueurs de la communauté</CardDescription>
                                    </CardHeader>
                                </Card>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {popular_players.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Invite Tab */}
                    <TabsContent value="invite" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Inviter des amis</CardTitle>
                                <CardDescription>Partagez votre code d'invitation ou votre lien personnel</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Invite Code */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Votre code d'invitation</label>
                                    <div className="flex gap-2">
                                        <Input value={user_invite_code} readOnly className="text-center font-mono text-lg" />
                                        <Button
                                            variant="outline"
                                            onClick={copyInviteCode}
                                            className={copiedCode ? 'border-green-200 bg-green-50' : ''}
                                        >
                                            {copiedCode ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copié !
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copier
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Partagez ce code avec vos amis pour qu'ils puissent vous retrouver facilement
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Button variant="outline" onClick={shareInviteLink} className="h-12">
                                        <Share className="mr-2 h-4 w-4" />
                                        Partager le lien
                                    </Button>
                                    <Button variant="outline" className="h-12">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Inviter par email
                                    </Button>
                                </div>

                                {/* QR Code placeholder */}
                                <div className="rounded-lg bg-muted p-8 text-center">
                                    <QrCode className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Code QR d'invitation (à implémenter)</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
