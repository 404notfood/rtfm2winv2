import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, Crown, Shield, Shuffle, Sword, Target, Trophy, User, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface BattleRoyaleSession {
    id: number;
    code: string;
    title: string;
    status: 'waiting' | 'active' | 'completed';
    max_participants: number;
    current_participants: number;
    elimination_rate: number;
    time_per_question: number;
    prize_pool?: number;
    quiz: {
        id: number;
        title: string;
        questions_count: number;
    };
    creator: {
        id: number;
        name: string;
    };
}

interface Props {
    session: BattleRoyaleSession;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export default function BattleRoyaleJoin({ session, user }: Props) {
    const [selectedAvatar, setSelectedAvatar] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        pseudo: user?.name || '',
        avatar: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/battle-royale/${session.code}/join`, {
            ...data,
            avatar: selectedAvatar,
        });
    };

    const generateRandomPseudo = () => {
        const adjectives = ['Warrior', 'Fighter', 'Champion', 'Hero', 'Legend', 'Master', 'Elite', 'Pro', 'Ace', 'Star'];
        const nouns = ['Slayer', 'Hunter', 'Knight', 'Guardian', 'Destroyer', 'Conqueror', 'Gladiator', 'Titan', 'Phoenix', 'Dragon'];
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNum = Math.floor(Math.random() * 999) + 1;
        setData('pseudo', `${randomAdj}${randomNoun}${randomNum}`);
    };

    const avatars = ['🦸', '🥷', '🦹', '👮', '🧙', '🧞', '🧛', '🧚', '🦾', '🔥', '⚡', '🌟', '💀', '🎯', '⚔️', '🛡️', '🏹', '🗡️', '🔱', '💎'];

    const getBattleDifficulty = () => {
        if (session.elimination_rate >= 40) return { label: 'Extrême', color: 'text-red-600' };
        if (session.elimination_rate >= 30) return { label: 'Difficile', color: 'text-orange-600' };
        if (session.elimination_rate >= 20) return { label: 'Normale', color: 'text-yellow-600' };
        return { label: 'Facile', color: 'text-green-600' };
    };

    const difficulty = getBattleDifficulty();
    const participationRate = (session.current_participants / session.max_participants) * 100;

    if (session.status !== 'waiting') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                <Head title={`Bataille ${session.title} - Indisponible`} />

                <Card className="max-w-md">
                    <CardContent className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <Sword className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold">Bataille indisponible</h2>
                        <p className="mb-4 text-muted-foreground">Cette bataille n'accepte plus de nouveaux participants.</p>
                        <Badge className="bg-red-100 text-red-800">{session.status === 'active' ? 'En cours' : 'Terminée'}</Badge>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (session.current_participants >= session.max_participants) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                <Head title={`Bataille ${session.title} - Complète`} />

                <Card className="max-w-md">
                    <CardContent className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                            <Users className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold">Bataille complète</h2>
                        <p className="mb-4 text-muted-foreground">Cette bataille a atteint son nombre maximum de participants.</p>
                        <Badge className="bg-yellow-100 text-yellow-800">
                            {session.current_participants}/{session.max_participants} guerriers
                        </Badge>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
            <Head title={`Rejoindre ${session.title}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                            <Sword className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">{session.title}</h1>
                            <p className="text-muted-foreground">
                                Préparez-vous pour la bataille • Code: <span className="font-mono font-bold">{session.code}</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Join Form */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Rejoindre la bataille
                                </CardTitle>
                                <CardDescription>Créez votre guerrier et entrez dans l'arène</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Pseudo */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pseudo">Nom de guerrier</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="pseudo"
                                                value={data.pseudo}
                                                onChange={(e) => setData('pseudo', e.target.value)}
                                                placeholder="Votre nom de bataille"
                                                className={errors.pseudo ? 'border-destructive' : ''}
                                                maxLength={20}
                                            />
                                            <Button type="button" variant="outline" onClick={generateRandomPseudo} title="Générer un nom aléatoire">
                                                <Shuffle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.pseudo && <p className="text-sm text-destructive">{errors.pseudo}</p>}
                                        {!user && (
                                            <p className="text-xs text-muted-foreground">
                                                En tant qu'invité, ce nom sera temporaire pour cette session
                                            </p>
                                        )}
                                    </div>

                                    {/* Avatar Selection */}
                                    <div className="space-y-3">
                                        <Label>Choisissez votre avatar</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {avatars.map((avatar, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => setSelectedAvatar(avatar)}
                                                    className={`flex aspect-square items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-110 ${
                                                        selectedAvatar === avatar
                                                            ? 'scale-110 border-red-500 bg-red-50'
                                                            : 'border-muted-foreground/20 hover:border-red-300'
                                                    }`}
                                                >
                                                    {avatar}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedAvatar && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>Avatar sélectionné:</span>
                                                <span className="text-xl">{selectedAvatar}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Preview */}
                                    {data.pseudo && (
                                        <div className="rounded-lg bg-muted/50 p-4">
                                            <h4 className="mb-2 text-sm font-medium">Aperçu de votre guerrier</h4>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="text-xl">
                                                        {selectedAvatar || data.pseudo.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{data.pseudo}</div>
                                                    <div className="text-sm text-muted-foreground">Guerrier {user ? 'enregistré' : 'invité'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={processing || !data.pseudo.trim()}
                                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                        size="lg"
                                    >
                                        <Sword className="mr-2 h-4 w-4" />
                                        {processing ? 'Entrée en cours...' : 'Entrer dans la bataille !'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Battle Info */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
                        {/* Battle Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Détails de la bataille
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Quiz</span>
                                        <span className="text-sm font-medium">{session.quiz.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Questions</span>
                                        <span className="text-sm font-medium">{session.quiz.questions_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Temps/question</span>
                                        <span className="text-sm font-medium">{session.time_per_question}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Élimination</span>
                                        <span className="text-sm font-medium">{session.elimination_rate}%/round</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Difficulté</span>
                                        <span className={`text-sm font-medium ${difficulty.color}`}>{difficulty.label}</span>
                                    </div>
                                    {session.prize_pool && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Prix total</span>
                                            <span className="text-sm font-medium text-yellow-600">{session.prize_pool.toLocaleString()} pts</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Participants Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Guerriers présents ({session.current_participants}/{session.max_participants})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="h-3 w-full rounded-full bg-muted/50">
                                        <div
                                            className="h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                                            style={{ width: `${participationRate}%` }}
                                        />
                                    </div>
                                    <div className="text-center text-sm text-muted-foreground">
                                        {session.max_participants - session.current_participants} places restantes
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Battle Rules */}
                        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <Shield className="h-5 w-5" />
                                    Règles de survie
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-orange-500" />
                                    <span>Répondez rapidement et correctement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-red-500" />
                                    <span>{session.elimination_rate}% des joueurs éliminés par round</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                    <span>Le dernier survivant remporte tout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span>Temps limité par question: {session.time_per_question}s</span>
                                </div>
                                {session.prize_pool && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-yellow-500" />
                                        <span>Prix à gagner: {session.prize_pool.toLocaleString()} points</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
