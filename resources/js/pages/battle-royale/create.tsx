import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock, Save, Sword, Target, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description?: string;
    questions_count: number;
}

interface Props {
    quizzes: Quiz[];
}

export default function BattleRoyaleCreate({ quizzes }: Props) {
    const [maxParticipants, setMaxParticipants] = useState([16]);
    const [eliminationRate, setEliminationRate] = useState([25]);
    const [timePerQuestion, setTimePerQuestion] = useState([30]);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        quiz_id: '',
        max_participants: 16,
        elimination_rate: 25,
        time_per_question: 30,
        prize_pool: 0,
        is_public: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/battle-royale', {
            ...data,
            max_participants: maxParticipants[0],
            elimination_rate: eliminationRate[0],
            time_per_question: timePerQuestion[0],
        });
    };

    const calculateRounds = (participants: number, elimination: number) => {
        let rounds = 0;
        let remaining = participants;
        while (remaining > 1) {
            remaining = Math.ceil(remaining * (1 - elimination / 100));
            rounds++;
        }
        return rounds;
    };

    const estimatedRounds = calculateRounds(maxParticipants[0], eliminationRate[0]);

    return (
        <AppLayout>
            <Head title="Créer une Battle Royale" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/battle-royale">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux batailles
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                                <Sword className="h-5 w-5 text-white" />
                            </div>
                            Créer une Battle Royale
                        </h1>
                        <p className="text-muted-foreground">Organisez une bataille épique où seul le plus fort survit</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations de base</CardTitle>
                            <CardDescription>Donnez un nom et une description à votre bataille</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Nom de la bataille</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="ex: Bataille des Champions"
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description (optionnel)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Décrivez votre bataille..."
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
                                                {quiz.title} ({quiz.questions_count} questions)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.quiz_id && <p className="mt-1 text-sm text-destructive">{errors.quiz_id}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Battle Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Paramètres de bataille
                            </CardTitle>
                            <CardDescription>Configurez les règles d'élimination et la difficulté</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Max Participants */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Nombre maximum de participants : {maxParticipants[0]}
                                </Label>
                                <Slider value={maxParticipants} onValueChange={setMaxParticipants} min={4} max={64} step={2} className="w-full" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>4 joueurs</span>
                                    <span>64 joueurs</span>
                                </div>
                            </div>

                            {/* Elimination Rate */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Taux d'élimination par round : {eliminationRate[0]}%
                                </Label>
                                <Slider value={eliminationRate} onValueChange={setEliminationRate} min={10} max={50} step={5} className="w-full" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>10% (lent)</span>
                                    <span>50% (rapide)</span>
                                </div>
                            </div>

                            {/* Time per Question */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Temps par question : {timePerQuestion[0]}s
                                </Label>
                                <Slider value={timePerQuestion} onValueChange={setTimePerQuestion} min={10} max={60} step={5} className="w-full" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>10s (difficile)</span>
                                    <span>60s (facile)</span>
                                </div>
                            </div>

                            {/* Battle Preview */}
                            <div className="rounded-lg bg-muted/50 p-4">
                                <h4 className="mb-2 font-medium">Aperçu de la bataille</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Participants max :</span>
                                        <span className="ml-2 font-medium">{maxParticipants[0]}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Rounds estimés :</span>
                                        <span className="ml-2 font-medium">{estimatedRounds}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Durée estimée :</span>
                                        <span className="ml-2 font-medium">{Math.round((estimatedRounds * timePerQuestion[0]) / 60)} min</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Difficulté :</span>
                                        <span className="ml-2 font-medium">
                                            {eliminationRate[0] >= 40
                                                ? 'Extrême'
                                                : eliminationRate[0] >= 30
                                                  ? 'Difficile'
                                                  : eliminationRate[0] >= 20
                                                    ? 'Normale'
                                                    : 'Facile'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rewards */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Récompenses
                            </CardTitle>
                            <CardDescription>Définissez les prix pour motiver les participants</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="prize_pool">Prix total (points)</Label>
                                <Input
                                    id="prize_pool"
                                    type="number"
                                    min="0"
                                    max="100000"
                                    step="100"
                                    value={data.prize_pool}
                                    onChange={(e) => setData('prize_pool', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Le gagnant recevra 60% du prix, le 2ème 30% et le 3ème 10%</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/battle-royale">Annuler</Link>
                        </Button>
                        <Button type="submit" disabled={processing} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Création...' : 'Créer la bataille'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
