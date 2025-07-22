import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Gamepad2, Play, QrCode, Sparkles, Target, Trophy, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description?: string;
    category?: string;
    questions_count: number;
    time_per_question: number;
    creator: {
        id: number;
        name: string;
        avatar?: string;
    };
}

interface QuizSession {
    id: number;
    code: string;
    status: 'waiting' | 'active' | 'completed';
    quiz: Quiz;
    participants_count: number;
    max_participants?: number;
    created_at: string;
    started_at?: string;
}

interface RandomAvatar {
    id: number;
    name: string;
    image_path: string;
    category: string;
}

interface Props {
    session?: QuizSession;
    code: string;
    randomAvatars: RandomAvatar[];
    error?: string;
}

export default function Join({ session, code, randomAvatars, error }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [selectedAvatar, setSelectedAvatar] = useState<RandomAvatar | null>(
        randomAvatars.length > 0 ? randomAvatars[Math.floor(Math.random() * randomAvatars.length)] : null,
    );

    const { data, setData, post, processing, errors } = useForm({
        pseudo: auth.user?.name || '',
        avatar_id: selectedAvatar?.id || null,
    });

    useEffect(() => {
        if (selectedAvatar) {
            setData('avatar_id', selectedAvatar.id);
        }
    }, [selectedAvatar]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/join/${code}`);
    };

    const generateRandomPseudo = () => {
        const adjectives = ['Super', 'Mega', 'Ultra', 'Turbo', 'Cosmic', 'Royal', 'Swift', 'Clever', 'Bright', 'Cool'];
        const nouns = ['Player', 'Genius', 'Master', 'Champion', 'Hero', 'Star', 'Ace', 'Pro', 'Legend', 'Winner'];
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNum = Math.floor(Math.random() * 999) + 1;
        setData('pseudo', `${randomAdj}${randomNoun}${randomNum}`);
    };

    const getAvatarsByCategory = () => {
        const categories = randomAvatars.reduce(
            (acc, avatar) => {
                if (!acc[avatar.category]) {
                    acc[avatar.category] = [];
                }
                acc[avatar.category].push(avatar);
                return acc;
            },
            {} as Record<string, RandomAvatar[]>,
        );
        return categories;
    };

    // Error state
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
                <Head title="Session introuvable" />

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                    <Card className="border-red-200">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <QrCode className="h-8 w-8 text-red-600" />
                            </div>
                            <CardTitle className="text-red-800">Session introuvable</CardTitle>
                            <CardDescription className="text-red-600">{error}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button onClick={() => window.history.back()} variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Loading state
    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                <Head title="Chargement..." />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
                />
            </div>
        );
    }

    // Session completed
    if (session.status === 'completed') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50 p-4">
                <Head title="Session terminée" />

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Trophy className="h-8 w-8 text-gray-600" />
                            </div>
                            <CardTitle>Session terminée</CardTitle>
                            <CardDescription>Cette session de quiz est déjà terminée.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <Button onClick={() => window.history.back()} variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <Head title={`Rejoindre - ${session.quiz.title}`} />

            <div className="mx-auto max-w-4xl py-8">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 text-center">
                    <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                        Rejoindre le Quiz
                    </h1>
                    <p className="text-muted-foreground">
                        Code de session : <span className="font-mono font-bold">{code}</span>
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Quiz Information */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Card className="h-fit">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                        <Gamepad2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{session.quiz.title}</CardTitle>
                                        <CardDescription>Par {session.quiz.creator.name}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {session.quiz.description && <p className="text-muted-foreground">{session.quiz.description}</p>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{session.quiz.questions_count}</div>
                                        <div className="text-sm text-blue-700">Questions</div>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{session.quiz.time_per_question}s</div>
                                        <div className="text-sm text-green-700">Par question</div>
                                    </div>
                                </div>

                                {session.quiz.category && (
                                    <div className="flex justify-center">
                                        <Badge variant="outline" className="capitalize">
                                            {session.quiz.category}
                                        </Badge>
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-2 border-t pt-4">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {session.participants_count} participant{session.participants_count > 1 ? 's' : ''} connecté
                                        {session.participants_count > 1 ? 's' : ''}
                                    </span>
                                    {session.status === 'waiting' && (
                                        <Badge variant="secondary" className="ml-2">
                                            <Clock className="mr-1 h-3 w-3" />
                                            En attente
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Join Form */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Rejoindre la partie
                                </CardTitle>
                                <CardDescription>
                                    {auth.user ? 'Vous êtes connecté, prêt à jouer !' : 'Choisissez votre pseudo et votre avatar pour participer'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Pseudo */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pseudo">Pseudo</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="pseudo"
                                                value={data.pseudo}
                                                onChange={(e) => setData('pseudo', e.target.value)}
                                                placeholder="Votre pseudo"
                                                maxLength={20}
                                                className={errors.pseudo ? 'border-destructive' : ''}
                                                disabled={auth.user !== null}
                                            />
                                            {!auth.user && (
                                                <Button type="button" variant="outline" onClick={generateRandomPseudo} className="whitespace-nowrap">
                                                    <Sparkles className="mr-1 h-4 w-4" />
                                                    Aléatoire
                                                </Button>
                                            )}
                                        </div>
                                        {errors.pseudo && <p className="text-sm text-destructive">{errors.pseudo}</p>}
                                        {auth.user && (
                                            <p className="text-xs text-muted-foreground">Votre pseudo est basé sur votre compte utilisateur</p>
                                        )}
                                    </div>

                                    {/* Avatar Selection (only for guests) */}
                                    {!auth.user && randomAvatars.length > 0 && (
                                        <div className="space-y-3">
                                            <Label>Choisir un avatar</Label>
                                            <div className="space-y-4">
                                                {Object.entries(getAvatarsByCategory()).map(([category, avatars]) => (
                                                    <div key={category}>
                                                        <h4 className="mb-2 text-sm font-medium capitalize">{category}</h4>
                                                        <div className="grid grid-cols-6 gap-2">
                                                            {avatars.slice(0, 12).map((avatar) => (
                                                                <button
                                                                    key={avatar.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedAvatar(avatar)}
                                                                    className={`relative rounded-lg p-2 transition-all ${
                                                                        selectedAvatar?.id === avatar.id
                                                                            ? 'bg-primary/10 ring-2 ring-primary'
                                                                            : 'hover:bg-muted'
                                                                    }`}
                                                                >
                                                                    <Avatar className="mx-auto h-8 w-8">
                                                                        <AvatarImage src={avatar.image_path} alt={avatar.name} />
                                                                        <AvatarFallback className="text-xs">{avatar.name.slice(0, 2)}</AvatarFallback>
                                                                    </Avatar>
                                                                    {selectedAvatar?.id === avatar.id && (
                                                                        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                                                                            <div className="h-2 w-2 rounded-full bg-white" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {selectedAvatar && (
                                                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={selectedAvatar.image_path} alt={selectedAvatar.name} />
                                                        <AvatarFallback>{selectedAvatar.name.slice(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{selectedAvatar.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={processing || !data.pseudo.trim() || session.status === 'active'}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Connexion...
                                            </>
                                        ) : session.status === 'active' ? (
                                            <>
                                                <Play className="mr-2 h-5 w-5" />
                                                Quiz en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Target className="mr-2 h-5 w-5" />
                                                Rejoindre le quiz
                                            </>
                                        )}
                                    </Button>

                                    {session.status === 'active' && (
                                        <p className="text-center text-sm text-muted-foreground">
                                            Le quiz a déjà commencé. Vous ne pouvez plus le rejoindre.
                                        </p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
