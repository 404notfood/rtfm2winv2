import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Crown, Info, Save, Settings, Target, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description?: string;
    questions_count: number;
    category?: string;
}

interface Props {
    quizzes: Quiz[];
}

export default function TournamentCreate({ quizzes }: Props) {
    const [maxParticipants, setMaxParticipants] = useState([16]);
    const [entryFee, setEntryFee] = useState([0]);
    const [prizePool, setPrizePool] = useState([1000]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        quiz_id: '',
        format: 'single_elimination',
        max_participants: 16,
        is_public: true,
        registration_start: '',
        registration_end: '',
        start_date: '',
        entry_fee: 0,
        prize_pool: 1000,
        auto_start: true,
        allow_late_registration: false,
        randomize_bracket: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tournaments', {
            ...data,
            max_participants: maxParticipants[0],
            entry_fee: entryFee[0],
            prize_pool: prizePool[0],
        });
    };

    const formatOptions = [
        {
            value: 'single_elimination',
            label: 'Élimination directe',
            description: 'Format classique - perdez et vous êtes éliminé',
        },
        {
            value: 'double_elimination',
            label: 'Double élimination',
            description: 'Seconde chance - deux défaites pour être éliminé',
        },
        {
            value: 'round_robin',
            label: 'Championnat (Round Robin)',
            description: 'Chaque participant affronte tous les autres',
        },
        {
            value: 'swiss',
            label: 'Système suisse',
            description: 'Appariement basé sur les performances',
        },
    ];

    const getEstimatedDuration = () => {
        const participants = maxParticipants[0];
        const format = data.format;

        switch (format) {
            case 'single_elimination':
                return Math.ceil(Math.log2(participants)) * 20; // 20 min par round
            case 'double_elimination':
                return Math.ceil(Math.log2(participants)) * 30; // 30 min par round
            case 'round_robin':
                return (((participants - 1) * participants) / 2) * 10; // 10 min par match
            case 'swiss':
                return Math.ceil(Math.log2(participants)) * 15; // 15 min par round
            default:
                return 60;
        }
    };

    const getEstimatedRounds = () => {
        const participants = maxParticipants[0];
        const format = data.format;

        switch (format) {
            case 'single_elimination':
                return Math.ceil(Math.log2(participants));
            case 'double_elimination':
                return Math.ceil(Math.log2(participants)) + 2;
            case 'round_robin':
                return participants - 1;
            case 'swiss':
                return Math.ceil(Math.log2(participants));
            default:
                return 0;
        }
    };

    return (
        <AppLayout>
            <Head title="Créer un tournoi" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/tournaments">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux tournois
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                                <Trophy className="h-5 w-5 text-white" />
                            </div>
                            Créer un tournoi
                        </h1>
                        <p className="text-muted-foreground">Organisez une compétition de quiz passionnante</p>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Informations générales
                                </CardTitle>
                                <CardDescription>Donnez un nom et une description à votre tournoi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nom du tournoi</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="ex: Tournoi des Champions"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description (optionnel)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Décrivez votre tournoi..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="quiz_id">Quiz de base</Label>
                                    <Select value={data.quiz_id} onValueChange={(value) => setData('quiz_id', value)}>
                                        <SelectTrigger className={errors.quiz_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Choisissez un quiz" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {quizzes.map((quiz) => (
                                                <SelectItem key={quiz.id} value={quiz.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span>{quiz.title}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {quiz.questions_count} questions
                                                            {quiz.category && ` • ${quiz.category}`}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.quiz_id && <p className="mt-1 text-sm text-destructive">{errors.quiz_id}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Tournament Settings */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Configuration du tournoi
                                </CardTitle>
                                <CardDescription>Définissez le format et les règles de votre compétition</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Format Selection */}
                                <div>
                                    <Label htmlFor="format">Format du tournoi</Label>
                                    <Select value={data.format} onValueChange={(value) => setData('format', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formatOptions.map((format) => (
                                                <SelectItem key={format.value} value={format.value}>
                                                    <div className="flex flex-col">
                                                        <span>{format.label}</span>
                                                        <span className="text-xs text-muted-foreground">{format.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Max Participants */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Nombre maximum de participants : {maxParticipants[0]}
                                    </Label>
                                    <Slider value={maxParticipants} onValueChange={setMaxParticipants} min={4} max={64} step={2} className="w-full" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>4 participants</span>
                                        <span>64 participants</span>
                                    </div>
                                </div>

                                {/* Tournament Preview */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <h4 className="mb-2 font-medium">Aperçu du tournoi</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Participants max :</span>
                                            <span className="ml-2 font-medium">{maxParticipants[0]}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Rounds estimés :</span>
                                            <span className="ml-2 font-medium">{getEstimatedRounds()}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Durée estimée :</span>
                                            <span className="ml-2 font-medium">{getEstimatedDuration()} min</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Format :</span>
                                            <span className="ml-2 font-medium">{formatOptions.find((f) => f.value === data.format)?.label}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tournament Options */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="is_public">Tournoi public</Label>
                                            <p className="text-sm text-muted-foreground">Visible par tous les utilisateurs</p>
                                        </div>
                                        <Switch
                                            id="is_public"
                                            checked={data.is_public}
                                            onCheckedChange={(checked) => setData('is_public', !!checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="auto_start">Démarrage automatique</Label>
                                            <p className="text-sm text-muted-foreground">Lance le tournoi automatiquement à la date prévue</p>
                                        </div>
                                        <Switch
                                            id="auto_start"
                                            checked={data.auto_start}
                                            onCheckedChange={(checked) => setData('auto_start', !!checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="randomize_bracket">Bracket aléatoire</Label>
                                            <p className="text-sm text-muted-foreground">Mélange l'ordre des participants dans le bracket</p>
                                        </div>
                                        <Switch
                                            id="randomize_bracket"
                                            checked={data.randomize_bracket}
                                            onCheckedChange={(checked) => setData('randomize_bracket', !!checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="allow_late_registration">Inscription tardive</Label>
                                            <p className="text-sm text-muted-foreground">Autorise les inscriptions après le début</p>
                                        </div>
                                        <Switch
                                            id="allow_late_registration"
                                            checked={data.allow_late_registration}
                                            onCheckedChange={(checked) => setData('allow_late_registration', !!checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Schedule */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Planification
                                </CardTitle>
                                <CardDescription>Définissez les dates importantes de votre tournoi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="registration_start">Début des inscriptions</Label>
                                        <Input
                                            id="registration_start"
                                            type="datetime-local"
                                            value={data.registration_start}
                                            onChange={(e) => setData('registration_start', e.target.value)}
                                            className={errors.registration_start ? 'border-destructive' : ''}
                                        />
                                        {errors.registration_start && <p className="mt-1 text-sm text-destructive">{errors.registration_start}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="registration_end">Fin des inscriptions</Label>
                                        <Input
                                            id="registration_end"
                                            type="datetime-local"
                                            value={data.registration_end}
                                            onChange={(e) => setData('registration_end', e.target.value)}
                                            className={errors.registration_end ? 'border-destructive' : ''}
                                        />
                                        {errors.registration_end && <p className="mt-1 text-sm text-destructive">{errors.registration_end}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="start_date">Début du tournoi</Label>
                                    <Input
                                        id="start_date"
                                        type="datetime-local"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    {errors.start_date && <p className="mt-1 text-sm text-destructive">{errors.start_date}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Prizes */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5" />
                                    Récompenses
                                </CardTitle>
                                <CardDescription>Définissez les prix pour motiver les participants</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Entry Fee */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Frais d'inscription : {entryFee[0]} points
                                    </Label>
                                    <Slider value={entryFee} onValueChange={setEntryFee} min={0} max={500} step={10} className="w-full" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Gratuit</span>
                                        <span>500 points</span>
                                    </div>
                                </div>

                                {/* Prize Pool */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4" />
                                        Cagnotte totale : {prizePool[0]} points
                                    </Label>
                                    <Slider value={prizePool} onValueChange={setPrizePool} min={100} max={10000} step={100} className="w-full" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>100 points</span>
                                        <span>10,000 points</span>
                                    </div>
                                </div>

                                {/* Prize Distribution */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <h4 className="mb-2 font-medium">Répartition des prix</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>🥇 1er place</span>
                                            <span className="font-medium">{Math.round(prizePool[0] * 0.5)} points (50%)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>🥈 2ème place</span>
                                            <span className="font-medium">{Math.round(prizePool[0] * 0.3)} points (30%)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>🥉 3ème place</span>
                                            <span className="font-medium">{Math.round(prizePool[0] * 0.2)} points (20%)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-end gap-4"
                    >
                        <Button type="button" variant="outline" asChild>
                            <Link href="/tournaments">Annuler</Link>
                        </Button>
                        <Button type="submit" disabled={processing} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Création...' : 'Créer le tournoi'}
                        </Button>
                    </motion.div>
                </form>
            </div>
        </AppLayout>
    );
}
