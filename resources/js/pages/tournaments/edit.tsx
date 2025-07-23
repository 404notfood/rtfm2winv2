import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Quiz {
    id: number;
    title: string;
}

interface Tournament {
    id: number;
    title: string;
    description?: string;
    quiz_id: number;
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
    max_participants: number;
    registration_start: string;
    registration_end: string;
    tournament_start: string;
    is_public: boolean;
    entry_fee?: number;
    prize_pool?: string;
    rules?: string;
    status: 'upcoming' | 'active' | 'completed';
}

interface Props {
    tournament: Tournament;
    quizzes: Quiz[];
}

export default function TournamentEdit({ tournament, quizzes }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: tournament.title,
        description: tournament.description || '',
        registration_end: tournament.registration_end.slice(0, 16), // Format for datetime-local
        tournament_start: tournament.tournament_start.slice(0, 16),
        is_public: tournament.is_public,
        prize_pool: tournament.prize_pool || '',
        rules: tournament.rules || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/tournaments/${tournament.id}`);
    };

    const cannotEdit = tournament.status !== 'upcoming';

    return (
        <AppLayout>
            <Head title={`Modifier ${tournament.title}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/tournaments/${tournament.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Modifier le tournoi</h1>
                        <p className="text-muted-foreground">Modifiez les paramètres de votre tournoi</p>
                    </div>
                </div>

                {/* Warning for active/completed tournaments */}
                {cannotEdit && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-orange-800">
                                <AlertCircle className="h-5 w-5" />
                                <div>
                                    <p className="font-semibold">Modification limitée</p>
                                    <p className="text-sm">
                                        Ce tournoi ne peut plus être modifié car il a déjà commencé ou est terminé.
                                        Seules certaines informations peuvent être mises à jour.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Tournament Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre du tournoi *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Ex: Championnat d'automne"
                                    className={errors.title ? 'border-red-500' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Décrivez votre tournoi..."
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Public/Private */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_public"
                                    checked={data.is_public}
                                    onCheckedChange={(checked) => setData('is_public', checked)}
                                />
                                <Label htmlFor="is_public">Tournoi public</Label>
                                <p className="text-sm text-muted-foreground">
                                    Les tournois publics sont visibles par tous les utilisateurs
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tournament Info (Read-only for started tournaments) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration du tournoi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Quiz (Read-only) */}
                            <div className="space-y-2">
                                <Label>Quiz</Label>
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-semibold">
                                        {quizzes.find(q => q.id === tournament.quiz_id)?.title || 'Quiz non trouvé'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Le quiz ne peut pas être modifié après la création
                                    </p>
                                </div>
                            </div>

                            {/* Type (Read-only) */}
                            <div className="space-y-2">
                                <Label>Type de tournoi</Label>
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-semibold">
                                        {tournament.type === 'single_elimination' && 'Élimination simple'}
                                        {tournament.type === 'double_elimination' && 'Élimination double'}
                                        {tournament.type === 'round_robin' && 'Round Robin'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Le type de tournoi ne peut pas être modifié après la création
                                    </p>
                                </div>
                            </div>

                            {/* Max Participants (Read-only) */}
                            <div className="space-y-2">
                                <Label>Nombre maximum de participants</Label>
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-semibold">{tournament.max_participants} participants</p>
                                    <p className="text-sm text-muted-foreground">
                                        Le nombre de participants ne peut pas être modifié après la création
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Planning</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Registration Start (Read-only) */}
                            <div className="space-y-2">
                                <Label>Début des inscriptions</Label>
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-semibold">
                                        {new Date(tournament.registration_start).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        La date de début des inscriptions ne peut pas être modifiée
                                    </p>
                                </div>
                            </div>

                            {/* Registration End */}
                            <div className="space-y-2">
                                <Label htmlFor="registration_end">Fin des inscriptions *</Label>
                                <Input
                                    id="registration_end"
                                    type="datetime-local"
                                    value={data.registration_end}
                                    onChange={(e) => setData('registration_end', e.target.value)}
                                    className={errors.registration_end ? 'border-red-500' : ''}
                                />
                                {errors.registration_end && (
                                    <p className="text-sm text-red-600">{errors.registration_end}</p>
                                )}
                            </div>

                            {/* Tournament Start */}
                            <div className="space-y-2">
                                <Label htmlFor="tournament_start">Début du tournoi *</Label>
                                <Input
                                    id="tournament_start"
                                    type="datetime-local"
                                    value={data.tournament_start}
                                    onChange={(e) => setData('tournament_start', e.target.value)}
                                    className={errors.tournament_start ? 'border-red-500' : ''}
                                />
                                {errors.tournament_start && (
                                    <p className="text-sm text-red-600">{errors.tournament_start}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Paramètres supplémentaires</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Prize Pool */}
                            <div className="space-y-2">
                                <Label htmlFor="prize_pool">Prix à gagner</Label>
                                <Input
                                    id="prize_pool"
                                    value={data.prize_pool}
                                    onChange={(e) => setData('prize_pool', e.target.value)}
                                    placeholder="Ex: 100€ en bons d'achat, Trophée personnalisé..."
                                    className={errors.prize_pool ? 'border-red-500' : ''}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Décrivez les prix à gagner (optionnel)
                                </p>
                                {errors.prize_pool && (
                                    <p className="text-sm text-red-600">{errors.prize_pool}</p>
                                )}
                            </div>

                            {/* Rules */}
                            <div className="space-y-2">
                                <Label htmlFor="rules">Règles du tournoi</Label>
                                <Textarea
                                    id="rules"
                                    value={data.rules}
                                    onChange={(e) => setData('rules', e.target.value)}
                                    placeholder="Décrivez les règles spécifiques à votre tournoi..."
                                    rows={4}
                                    className={errors.rules ? 'border-red-500' : ''}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Règles et conditions particulières (optionnel)
                                </p>
                                {errors.rules && (
                                    <p className="text-sm text-red-600">{errors.rules}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href={`/tournaments/${tournament.id}`}>
                                Annuler
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}