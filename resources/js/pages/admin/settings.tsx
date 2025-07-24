import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/layouts/admin-layout';
import { User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Save, Settings as SettingsIcon, Shield, Database, Mail, Bell } from 'lucide-react';

interface SystemSettings {
    site_name: string;
    site_description: string;
    max_quiz_duration: number;
    max_participants_per_quiz: number;
    enable_guest_participation: boolean;
    enable_registrations: boolean;
    maintenance_mode: boolean;
    analytics_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
}

interface Props {
    auth: { user: User };
    settings: SystemSettings;
}

export default function AdminSettings({ auth, settings }: Props) {
    const { data, setData, put, processing, errors, isDirty } = useForm<SystemSettings>(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings', {
            onSuccess: () => {
                // Success handled by controller
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Paramètres Administration" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
                        <p className="text-muted-foreground">
                            Configurez les paramètres globaux de RTFM2WIN
                        </p>
                    </div>
                    <Button 
                        onClick={handleSubmit} 
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

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <SettingsIcon className="h-4 w-4" />
                            Général
                        </TabsTrigger>
                        <TabsTrigger value="quiz" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Quiz
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Sécurité
                        </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <TabsContent value="general" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations du site</CardTitle>
                                    <CardDescription>
                                        Configurez les informations de base de votre plateforme
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="site_name">Nom du site</Label>
                                        <Input
                                            id="site_name"
                                            value={data.site_name}
                                            onChange={(e) => setData('site_name', e.target.value)}
                                            placeholder="RTFM2WIN"
                                        />
                                        {errors.site_name && (
                                            <p className="text-sm text-destructive">{errors.site_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="site_description">Description du site</Label>
                                        <Textarea
                                            id="site_description"
                                            value={data.site_description}
                                            onChange={(e) => setData('site_description', e.target.value)}
                                            placeholder="Plateforme de quiz interactive..."
                                            rows={3}
                                        />
                                        {errors.site_description && (
                                            <p className="text-sm text-destructive">{errors.site_description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Mode de maintenance</CardTitle>
                                    <CardDescription>
                                        Active le mode maintenance pour effectuer des mises à jour
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Mode maintenance</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Les utilisateurs ne pourront pas accéder au site
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.maintenance_mode}
                                            onCheckedChange={(checked) => setData('maintenance_mode', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="quiz" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Paramètres des quiz</CardTitle>
                                    <CardDescription>
                                        Configurez les limites et restrictions pour les quiz
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_quiz_duration">Durée maximale (minutes)</Label>
                                            <Input
                                                id="max_quiz_duration"
                                                type="number"
                                                value={data.max_quiz_duration}
                                                onChange={(e) => setData('max_quiz_duration', parseInt(e.target.value))}
                                                min="1"
                                                max="180"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="max_participants">Participants max par quiz</Label>
                                            <Input
                                                id="max_participants"
                                                type="number"
                                                value={data.max_participants_per_quiz}
                                                onChange={(e) => setData('max_participants_per_quiz', parseInt(e.target.value))}
                                                min="1"
                                                max="1000"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>Participation invité</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Autoriser les utilisateurs non-inscrits à participer
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.enable_guest_participation}
                                                onCheckedChange={(checked) => setData('enable_guest_participation', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>Inscriptions ouvertes</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Permettre aux nouveaux utilisateurs de s'inscrire
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.enable_registrations}
                                                onCheckedChange={(checked) => setData('enable_registrations', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Système de notifications</CardTitle>
                                    <CardDescription>
                                        Configurez les types de notifications envoyées aux utilisateurs
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Notifications e-mail
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Envoyer des notifications par e-mail
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.email_notifications}
                                            onCheckedChange={(checked) => setData('email_notifications', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="flex items-center gap-2">
                                                <Bell className="h-4 w-4" />
                                                Notifications push
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications en temps réel dans l'interface
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.push_notifications}
                                            onCheckedChange={(checked) => setData('push_notifications', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sécurité et Analytics</CardTitle>
                                    <CardDescription>
                                        Paramètres de sécurité et de collecte de données
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Analytics activées</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Collecter des données d'utilisation anonymes
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.analytics_enabled}
                                            onCheckedChange={(checked) => setData('analytics_enabled', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations système</CardTitle>
                                    <CardDescription>
                                        Détails techniques de l'installation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">Version RTFM2WIN</Label>
                                            <p className="font-mono">2.0.0</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Version Laravel</Label>
                                            <p className="font-mono">12.x</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Version PHP</Label>
                                            <p className="font-mono">8.3+</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Base de données</Label>
                                            <p className="font-mono">MySQL</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </form>
                </Tabs>
            </div>
        </AdminLayout>
    );
}