import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/layouts/admin-layout';
import { User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User as UserIcon, Shield, Crown } from 'lucide-react';

interface Props {
    auth: { user: User };
    user: User;
}

interface EditUserForm {
    name: string;
    email: string;
    role: 'user' | 'presenter' | 'admin' | 'guest';
    is_suspended: boolean;
    can_be_presenter: boolean;
    notes: string;
}

export default function AdminUserEdit({ auth, user }: Props) {
    const { data, setData, put, processing, errors, isDirty } = useForm<EditUserForm>({
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        is_suspended: user.is_suspended || false,
        can_be_presenter: user.can_be_presenter || false,
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                // Redirect handled by controller
            },
        });
    };

    const roleOptions = [
        { value: 'user', label: 'Utilisateur', icon: UserIcon, description: 'Accès standard' },
        { value: 'presenter', label: 'Présentateur', icon: Crown, description: 'Peut créer des quiz' },
        ...(auth.user.role === 'admin' ? [
            { value: 'admin', label: 'Administrateur', icon: Shield, description: 'Accès complet' }
        ] : []),
    ];

    return (
        <AdminLayout>
            <Head title={`Modifier: ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/users/${user.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au profil
                            </Link>
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Modifier l'utilisateur</h1>
                            <p className="text-muted-foreground">
                                Gérer les informations et permissions de {user.name}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de base</CardTitle>
                                <CardDescription>
                                    Modifiez les informations personnelles de l'utilisateur
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom d'utilisateur</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nom d'utilisateur"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="adresse@exemple.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes administratives</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Notes internes sur cet utilisateur..."
                                        rows={3}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Ces notes ne sont visibles que par les administrateurs
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role and Permissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rôle et Permissions</CardTitle>
                                <CardDescription>
                                    Configurez les autorisations et le statut de l'utilisateur
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="role">Rôle principal</Label>
                                    <Select value={data.role} onValueChange={(value: any) => setData('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        <option.icon className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">{option.label}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {option.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm text-destructive">{errors.role}</p>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="can_be_presenter">Peut devenir présentateur</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Autoriser la création de quiz même si le rôle est 'utilisateur'
                                            </p>
                                        </div>
                                        <Switch
                                            id="can_be_presenter"
                                            checked={data.can_be_presenter}
                                            onCheckedChange={(checked) => setData('can_be_presenter', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_suspended" className="text-destructive">
                                                Compte suspendu
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                L'utilisateur ne pourra pas se connecter
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_suspended"
                                            checked={data.is_suspended}
                                            onCheckedChange={(checked) => setData('is_suspended', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du compte</CardTitle>
                            <CardDescription>
                                Détails techniques et statistiques du compte
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">ID Utilisateur</Label>
                                    <p className="font-mono">{user.id}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Date d'inscription</Label>
                                    <p>{new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Dernière modification</Label>
                                    <p>{new Date(user.updated_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">E-mail vérifié</Label>
                                    <p>{user.email_verified_at ? 'Oui' : 'Non'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Dernière connexion</Label>
                                    <p>{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('fr-FR') : 'Jamais'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Statut</Label>
                                    <p className={user.is_suspended ? 'text-destructive' : 'text-green-600'}>
                                        {user.is_suspended ? 'Suspendu' : 'Actif'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <Button variant="outline" asChild disabled={processing}>
                            <Link href={`/admin/users/${user.id}`}>
                                Annuler
                            </Link>
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || !isDirty}
                            className="min-w-[120px]"
                        >
                            {processing ? (
                                'Sauvegarde...'
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Sauvegarder
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}