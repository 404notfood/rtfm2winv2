import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// ShadcnUI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Icons
import { ArrowRight, BarChart3, Brain, Gamepad2, Menu, Monitor, Play, Sparkles, Target, Users, X, Zap } from 'lucide-react';

// Auth Sidebar
import AuthSidebar from '@/components/auth-sidebar';


// Composant Header
const Header = () => {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 right-0 left-0 z-50 w-screen transition-all duration-300 ${
                isScrolled ? 'border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-16">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo section */}
                    <Link href="/" className="group flex items-center space-x-3">
                        <div className="relative">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
                                <img 
                                    src="/img/logo4.png" 
                                    alt="RTFM2Win Logo" 
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 blur transition-opacity group-hover:opacity-100"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-2xl font-bold text-transparent">
                                RTFM2Win
                            </span>
                            <span className="-mt-1 text-xs text-muted-foreground">Quiz Interactifs</span>
                        </div>
                    </Link>

                    {/* Navigation centrale */}
                    <nav className="hidden items-center space-x-24 lg:flex">
                        <Link href="/quiz" className="group relative px-8 py-3 text-foreground/80 transition-colors hover:text-foreground">
                            <span>Explorer</span>
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></div>
                        </Link>
                        {(auth.user?.role === 'admin' || auth.user?.role === 'presenter') && (
                            <Link href="/quiz/create" className="group relative px-8 py-3 text-foreground/80 transition-colors hover:text-foreground">
                                <span>Créer</span>
                                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></div>
                            </Link>
                        )}
                        <Link href="/about" className="group relative px-8 py-3 text-foreground/80 transition-colors hover:text-foreground">
                            <span>À propos</span>
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></div>
                        </Link>
                    </nav>

                    {/* Actions à droite */}
                    <div className="flex items-center space-x-6">
                        {/* Boutons d'authentification */}
                        <div className="hidden items-center space-x-6 md:flex">
                            {auth.user ? (
                                <Button
                                    asChild
                                    className="h-10 bg-gradient-to-r from-primary to-secondary px-6 py-2 text-white shadow-md hover:from-primary/90 hover:to-secondary/90 hover:shadow-lg"
                                >
                                    <Link href="/dashboard">
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        variant="ghost" 
                                        className="h-10 px-5 py-2 hover:bg-muted/50"
                                        onClick={() => {
                                            setAuthModalMode('login');
                                            setAuthModalOpen(true);
                                        }}
                                    >
                                        <span className="text-sm">Connexion</span>
                                    </Button>
                                    <Button
                                        className="h-10 bg-gradient-to-r from-primary to-secondary px-6 py-2 text-white shadow-md hover:from-primary/90 hover:to-secondary/90 hover:shadow-lg"
                                        onClick={() => {
                                            setAuthModalMode('register');
                                            setAuthModalOpen(true);
                                        }}
                                    >
                                        <span className="text-sm font-medium">Inscription</span>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Menu mobile */}
                        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="ml-2 h-10 w-10 p-0 lg:hidden">
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Menu mobile */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-t border-border/50 bg-background/95 backdrop-blur-xl lg:hidden"
                    >
                        <div className="space-y-4 py-6">
                            <Link href="/quiz" className="block rounded-lg px-6 py-4 text-foreground transition-colors hover:bg-muted/50">
                                Explorer les Quiz
                            </Link>

                            {(auth.user?.role === 'admin' || auth.user?.role === 'presenter') && (
                                <Link href="/quiz/create" className="block rounded-lg px-6 py-4 text-foreground transition-colors hover:bg-muted/50">
                                    Créer un Quiz
                                </Link>
                            )}

                            <Link href="/about" className="block rounded-lg px-6 py-4 text-foreground transition-colors hover:bg-muted/50">
                                À propos
                            </Link>

                            <div className="mt-6 border-t border-border/50 pt-6">
                                <div className="space-y-4 px-6">
                                    {auth.user ? (
                                        <Button asChild className="h-12 w-full bg-gradient-to-r from-primary to-secondary">
                                            <Link href="/dashboard">Dashboard</Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" asChild className="h-12 w-full">
                                                <Link href="/login">Connexion</Link>
                                            </Button>

                                            <Button asChild className="h-12 w-full bg-gradient-to-r from-primary to-secondary">
                                                <Link href="/register">Inscription</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Auth Sidebar */}
            <AuthSidebar 
                isOpen={authModalOpen} 
                onClose={() => setAuthModalOpen(false)}
                initialMode={authModalMode}
            />
        </header>
    );
};

// Composant Hero Section
const HeroSection = () => {
    const { auth } = usePage<SharedData>().props;

    return (
        <section className="flex min-h-screen w-screen items-center justify-center overflow-hidden">
            {/* Background avec gradient et pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>

            {/* Éléments décoratifs flottants */}
            <div className="absolute top-20 left-10 h-20 w-20 animate-pulse rounded-full bg-primary/10 blur-xl"></div>
            <div className="absolute right-10 bottom-20 h-32 w-32 animate-pulse rounded-full bg-secondary/10 blur-xl delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 h-16 w-16 animate-pulse rounded-full bg-accent/10 blur-xl delay-500"></div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-12 xl:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center space-y-8"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <Badge
                            variant="secondary"
                            className="border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 text-base font-medium"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            RTFM2Win La Plateforme de Quiz Interactive Nouvelle Génération
                        </Badge>
                    </motion.div>

                    {/* Titre principal */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-center text-5xl leading-tight font-bold md:text-7xl lg:text-8xl xl:text-9xl"
                    >
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Créez des Quiz</span>
                        <br />
                        <span className="text-foreground">Extraordinaires</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mx-auto max-w-4xl text-center text-xl leading-relaxed text-muted-foreground md:text-2xl lg:text-3xl"
                    >
                        Transformez vos présentations en expériences interactives captivantes. Parfait pour l'éducation, les formations d'entreprise
                        et les événements.
                    </motion.p>

                    {/* Boutons CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex flex-col items-center justify-center gap-6 sm:flex-row"
                    >
                        {auth.user ? (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-primary to-secondary px-10 py-6 text-lg text-white shadow-xl transition-all hover:from-primary/90 hover:to-secondary/90 hover:shadow-2xl"
                                asChild
                            >
                                <Link href="/dashboard">
                                    <Play className="mr-3 h-6 w-6" />
                                    Aller au Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-primary to-secondary px-10 py-6 text-lg text-white shadow-xl transition-all hover:from-primary/90 hover:to-secondary/90 hover:shadow-2xl"
                                asChild
                            >
                                <Link href="/register">
                                    <Play className="mr-3 h-6 w-6" />
                                    Commencer Gratuitement
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" size="lg" className="border-2 px-10 py-6 text-lg hover:bg-muted/50" asChild>
                            <Link href="/quiz">
                                Découvrir les Quiz
                                <ArrowRight className="ml-3 h-6 w-6" />
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Statistiques */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-8 border-t border-border/50 pt-12 md:grid-cols-3"
                    >
                        <div className="space-y-2 text-center">
                            <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
                                10K+
                            </div>
                            <div className="text-lg text-muted-foreground">Quiz Créés</div>
                        </div>
                        <div className="space-y-2 text-center">
                            <div className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
                                50K+
                            </div>
                            <div className="text-lg text-muted-foreground">Participants Actifs</div>
                        </div>
                        <div className="space-y-2 text-center">
                            <div className="bg-gradient-to-r from-accent to-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
                                99%
                            </div>
                            <div className="text-lg text-muted-foreground">Satisfaction</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

// Composant Join Quiz Section
const JoinQuizSection = () => {
    const [quizCode, setQuizCode] = useState('');

    const handleJoinQuiz = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (quizCode.trim()) {
            router.visit(`/quiz/join/${quizCode}`);
        }
    };

    return (
        <section className="flex w-screen items-center justify-center bg-gradient-to-b from-muted/30 to-background py-32">
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-12 xl:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="w-full"
                >
                    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-2xl backdrop-blur-sm">
                        <CardHeader className="pb-8 text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Gamepad2 className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="mb-4 text-3xl font-bold md:text-4xl">Rejoindre un Quiz</CardTitle>
                            <CardDescription className="text-xl text-muted-foreground">
                                Entrez le code du quiz pour participer instantanément à l'expérience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8">
                            <form onSubmit={handleJoinQuiz} className="flex flex-col gap-4 sm:flex-row">
                                <Input
                                    type="text"
                                    value={quizCode}
                                    onChange={(e) => setQuizCode(e.target.value)}
                                    placeholder="Code du quiz (ex: ABC123)"
                                    className="h-14 flex-1 border-2 px-6 text-lg focus:border-primary/50"
                                    required
                                />
                                <Button type="submit" size="lg" className="h-14 bg-gradient-to-r from-primary to-secondary px-10 text-white">
                                    <Play className="mr-2 h-5 w-5" />
                                    Rejoindre
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="justify-center pt-6">
                            <p className="text-center text-muted-foreground">💡 Vous pouvez aussi scanner un QR code depuis l'application mobile</p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
};

// Composant Features Section
const FeaturesSection = () => {
    const features = [
        {
            icon: Zap,
            title: 'Rapide et Facile',
            description:
                'Créez un quiz professionnel en quelques minutes avec notre interface intuitive et partagez-le instantanément avec votre audience.',
            color: 'from-yellow-400 to-orange-500',
        },
        {
            icon: Monitor,
            title: 'Totalement Interactif',
            description:
                'Questions à choix multiples, sondages en temps réel, classements dynamiques et interactions en direct pour captiver votre audience.',
            color: 'from-blue-400 to-cyan-500',
        },
        {
            icon: BarChart3,
            title: 'Analyses Détaillées',
            description: "Statistiques précises et insights approfondis sur les performances, l'engagement et la progression de vos participants.",
            color: 'from-green-400 to-emerald-500',
        },
        {
            icon: Users,
            title: 'Collaboration',
            description: 'Travaillez en équipe, partagez vos quiz et créez des expériences collaboratives enrichissantes pour tous.',
            color: 'from-purple-400 to-violet-500',
        },
        {
            icon: Target,
            title: 'Personnalisation',
            description: "Thèmes personnalisés, branding complet et options avancées pour s'adapter parfaitement à votre identité visuelle.",
            color: 'from-red-400 to-pink-500',
        },
        {
            icon: Brain,
            title: 'Interface Moderne',
            description: "Design épuré et moderne avec une expérience utilisateur optimisée pour tous les appareils et toutes les tailles d'écran.",
            color: 'from-indigo-400 to-purple-500',
        },
    ];

    return (
        <section className="flex w-screen items-center justify-center py-32">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-20 text-center"
                >
                    <h2 className="mb-6 text-center text-4xl font-bold md:text-5xl lg:text-6xl">Pourquoi choisir notre plateforme ?</h2>
                    <p className="mx-auto max-w-3xl text-center text-xl leading-relaxed text-muted-foreground md:text-2xl">
                        Des fonctionnalités puissantes et innovantes pour créer des expériences d'apprentissage inoubliables
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 justify-items-center gap-12 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                            viewport={{ once: true }}
                            className="group w-full max-w-sm"
                        >
                            <Card className="h-full border-0 bg-gradient-to-br from-card to-card/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-105 hover:shadow-2xl">
                                <CardHeader className="pb-6 text-center">
                                    <div className="mb-6 flex justify-center">
                                        <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5`}>
                                            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-card">
                                                <feature.icon className="h-8 w-8 text-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                    <CardTitle className="mb-3 text-center text-2xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <CardDescription className="text-center text-base leading-relaxed">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Composant CTA Section
const CTASection = () => {
    const { auth } = usePage<SharedData>().props;

    return (
        <section className="relative flex w-screen items-center justify-center overflow-hidden py-32">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent"></div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="space-y-8 text-center text-white"
                >
                    <h2 className="text-center text-4xl leading-tight font-bold md:text-6xl lg:text-7xl">Prêt à révolutionner vos présentations ?</h2>
                    <p className="mx-auto max-w-4xl text-center text-xl leading-relaxed opacity-90 md:text-2xl lg:text-3xl">
                        Rejoignez des milliers d'éducateurs, formateurs et animateurs qui transforment leurs sessions avec nos quiz interactifs
                        nouvelle génération.
                    </p>
                    <div className="flex flex-col justify-center gap-6 pt-8 sm:flex-row">
                        {auth.user ? (
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-white px-10 py-6 text-lg text-primary shadow-xl hover:bg-white/90"
                                asChild
                            >
                                <Link href="/dashboard">
                                    Aller au Dashboard
                                    <ArrowRight className="ml-3 h-6 w-6" />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-white px-10 py-6 text-lg text-primary shadow-xl hover:bg-white/90"
                                asChild
                            >
                                <Link href="/register">
                                    S'inscrire Gratuitement
                                    <ArrowRight className="ml-3 h-6 w-6" />
                                </Link>
                            </Button>
                        )}
                        {(auth.user?.role === 'admin' || auth.user?.role === 'presenter') && (
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-white px-10 py-6 text-lg text-white backdrop-blur-sm hover:bg-white/10"
                                asChild
                            >
                                <Link href="/quiz/create">Créer mon Premier Quiz</Link>
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// Composant Footer
const Footer = () => {
    return (
        <footer className="flex w-screen items-center justify-center border-t bg-muted/50 py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 xl:px-16">
                <div className="flex flex-col items-center space-y-16 text-center">
                    {/* Section Logo et Description - Centrée */}
                    <div className="flex max-w-2xl flex-col items-center space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                                R
                            </div>
                            <div>
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
                                    RTFM2Win
                                </span>
                                <div className="text-xs text-muted-foreground">Quiz Interactifs</div>
                            </div>
                        </div>
                        <p className="text-center leading-relaxed text-muted-foreground">
                            La plateforme de quiz interactive nouvelle génération qui transforme l'apprentissage en expérience captivante et
                            mémorable.
                        </p>
                    </div>

                    {/* Sections de liens - Centrées avec espacement */}
                    <div className="grid w-full max-w-4xl grid-cols-1 gap-16 md:grid-cols-3 lg:gap-24">
                        {/* Section Produit */}
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-lg font-semibold text-foreground">Produit</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <Link href="/quiz" className="text-muted-foreground transition-colors hover:text-primary">
                                    Explorer les Quiz
                                </Link>
                                <Link href="/quiz" className="text-muted-foreground transition-colors hover:text-primary">
                                    Quiz Populaires
                                </Link>
                                <Link href="/categories" className="text-muted-foreground transition-colors hover:text-primary">
                                    Catégories
                                </Link>
                                <Link href="/templates" className="text-muted-foreground transition-colors hover:text-primary">
                                    Modèles
                                </Link>
                            </div>
                        </div>

                        {/* Section Support */}
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-lg font-semibold text-foreground">Support</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <Link href="/help" className="text-muted-foreground transition-colors hover:text-primary">
                                    Centre d'aide
                                </Link>
                                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                                    Contact
                                </Link>
                                <Link href="/docs" className="text-muted-foreground transition-colors hover:text-primary">
                                    Documentation
                                </Link>
                                <Link href="/community" className="text-muted-foreground transition-colors hover:text-primary">
                                    Communauté
                                </Link>
                            </div>
                        </div>

                        {/* Section Légal */}
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-lg font-semibold text-foreground">Légal</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
                                    Confidentialité
                                </Link>
                                <Link href="/terms" className="text-muted-foreground transition-colors hover:text-primary">
                                    Conditions d'utilisation
                                </Link>
                                <Link href="/cookies" className="text-muted-foreground transition-colors hover:text-primary">
                                    Politique des cookies
                                </Link>
                                <Link href="/security" className="text-muted-foreground transition-colors hover:text-primary">
                                    Sécurité
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Section Copyright - Centrée */}
                    <div className="flex w-full flex-col items-center space-y-6 border-t pt-8">
                        <p className="text-center text-muted-foreground">
                            © {new Date().getFullYear()} <a href="https://404notfood.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">404NotFood</a>. Tous droits réservés. Fait avec ❤️ pour vous les apprentis dev.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Composant principal Welcome
export default function Welcome() {
    return (
        <>
            <Head title="RTFM2Win - Quiz Interactifs Nouvelle Génération">
                <meta
                    name="description"
                    content="Créez des quiz interactifs extraordinaires avec RTFM2Win. Parfait pour l'éducation, les formations et les événements."
                />
            </Head>
            <div className="min-h-screen w-screen overflow-x-hidden bg-background">
                <Header />
                <HeroSection />
                <JoinQuizSection />
                <FeaturesSection />
                <CTASection />
                <Footer />
            </div>
        </>
    );
}
