import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Ban, Download, Edit, Eye, MoreHorizontal, Search, Shield, ShieldOff, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'presenter' | 'user' | 'guest';
    can_be_presenter: boolean;
    is_suspended: boolean;
    avatar?: string;
    last_login_at?: string;
    created_at: string;
    quizzes_count: number;
    sessions_count: number;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    stats: {
        total_users: number;
        active_users: number;
        suspended_users: number;
        admins_count: number;
        presenters_count: number;
    };
}

export default function AdminUsersIndex({ users, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const { get, post, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/users', {
            search,
            role: filters.role,
            status: filters.status,
            preserveState: true,
            preserveScroll: true,
        } as any);
    };

    const handleFilter = (key: string, value: string) => {
        get('/admin/users', {
            search,
            [key]: value,
            preserveState: true,
            preserveScroll: true,
        } as any);
    };

    const handleUserAction = (action: string, userId: number) => {
        const user = users.data.find((u) => u.id === userId);
        if (!user) return;

        switch (action) {
            case 'view':
                get(`/admin/users/${userId}`);
                break;
            case 'suspend':
                if (confirm(`Suspendre l'utilisateur ${user.name} ?`)) {
                    post(`/admin/users/${userId}/suspend`);
                }
                break;
            case 'reactivate':
                if (confirm(`Réactiver l'utilisateur ${user.name} ?`)) {
                    post(`/admin/users/${userId}/reactivate`);
                }
                break;
            case 'ban':
                if (confirm(`Bannir définitivement l'utilisateur ${user.name} ?`)) {
                    post(`/admin/users/${userId}/ban`);
                }
                break;
            case 'delete':
                if (confirm(`Supprimer définitivement l'utilisateur ${user.name} ? Cette action est irréversible.`)) {
                    post(`/admin/users/${userId}`, { _method:   'delete' });
                }
                break;
            case 'make_presenter':
                post(`/admin/users/${userId}/role`, { role: 'presenter' });
                break;
            case 'make_admin':
                if (confirm(`Promouvoir ${user.name} au rang d'administrateur ?`)) {
                    post(`/admin/users/${userId}/role`, { role: 'admin' });
                }
                break;
            case 'make_user':
                post(`/admin/users/${userId}/role`, { role: 'user' });
                break;
        }
    };

    const handleBulkAction = (action: string) => {
        if (selectedUsers.length === 0) return;

        if (confirm(`Appliquer l'action "${action}" à ${selectedUsers.length} utilisateur(s) ?`)) {
            post('/admin/users/bulk-action', {
                action,
                user_ids: selectedUsers,
            });
            setSelectedUsers([]);
        }
    };

    const toggleSelectUser = (userId: number) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    const toggleSelectAll = () => {
        setSelectedUsers(selectedUsers.length === users.data.length ? [] : users.data.map((user) => user.id));
    };

    const getRoleBadge = (user: User) => {
        const roleColors = {
            admin: 'bg-red-100 text-red-800',
            presenter: 'bg-blue-100 text-blue-800',
            user: 'bg-green-100 text-green-800',
            guest: 'bg-gray-100 text-gray-800',
        };

        return <Badge className={roleColors[user.role]}>{user.role}</Badge>;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <AppLayout>
            <Head title="Gestion des utilisateurs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
                        <p className="text-muted-foreground">Administrez les comptes utilisateurs et leurs permissions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => get('/admin/users/export')}>
                            <Download className="mr-2 h-4 w-4" />
                            Exporter
                        </Button>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Inviter un utilisateur
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <div className="text-sm text-muted-foreground">Total utilisateurs</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.active_users}</div>
                            <div className="text-sm text-muted-foreground">Actifs</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.suspended_users}</div>
                            <div className="text-sm text-muted-foreground">Suspendus</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.presenters_count}</div>
                            <div className="text-sm text-muted-foreground">Présentateurs</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{stats.admins_count}</div>
                            <div className="text-sm text-muted-foreground">Administrateurs</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <Select value={filters.role || ''} onValueChange={(value) => handleFilter('role', value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous les rôles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="presenter">Présentateur</SelectItem>
                                    <SelectItem value="user">Utilisateur</SelectItem>
                                    <SelectItem value="guest">Invité</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.status || ''} onValueChange={(value) => handleFilter('status', value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous les statuts</SelectItem>
                                    <SelectItem value="active">Actif</SelectItem>
                                    <SelectItem value="suspended">Suspendu</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" disabled={processing}>
                                <Search className="mr-2 h-4 w-4" />
                                Rechercher
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">{selectedUsers.length} utilisateur(s) sélectionné(s)</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('suspend')}>
                                        Suspendre
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('reactivate')}>
                                        Réactiver
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('make_presenter')}>
                                        Faire présentateur
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Utilisateurs ({users.total})</CardTitle>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedUsers.length === users.data.length && users.data.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <span className="text-sm text-muted-foreground">Tout sélectionner</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users.data.map((user) => (
                                <div key={user.id} className="flex items-center gap-4 rounded-lg border p-4">
                                    <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleSelectUser(user.id)} />

                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="font-semibold">{user.name}</span>
                                            {getRoleBadge(user)}
                                            {user.can_be_presenter && (
                                                <Badge variant="outline" className="text-xs">
                                                    Peut présenter
                                                </Badge>
                                            )}
                                            {user.is_suspended && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Suspendu
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mb-1 text-sm text-muted-foreground">{user.email}</div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{user.quizzes_count} quiz créés</span>
                                            <span>{user.sessions_count} sessions</span>
                                            <span>
                                                Dernière connexion:{' '}
                                                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Jamais'}
                                            </span>
                                            <span>Inscrit le {new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleUserAction('view', user.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir le profil
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            {user.role !== 'admin' && (
                                                <DropdownMenuItem onClick={() => handleUserAction('make_admin', user.id)}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Faire admin
                                                </DropdownMenuItem>
                                            )}

                                            {user.role !== 'presenter' && user.role !== 'admin' && (
                                                <DropdownMenuItem onClick={() => handleUserAction('make_presenter', user.id)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Faire présentateur
                                                </DropdownMenuItem>
                                            )}

                                            {(user.role === 'presenter' || user.role === 'admin') && (
                                                <DropdownMenuItem onClick={() => handleUserAction('make_user', user.id)}>
                                                    <ShieldOff className="mr-2 h-4 w-4" />
                                                    Rétrograder en utilisateur
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator />

                                            {user.is_suspended ? (
                                                <DropdownMenuItem onClick={() => handleUserAction('reactivate', user.id)}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Réactiver
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => handleUserAction('suspend', user.id)}>
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Suspendre
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem onClick={() => handleUserAction('delete', user.id)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === users.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => get(`/admin/users?page=${page}`)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
