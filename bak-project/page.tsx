'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from './providers/ThemeProvider';
import { api } from '@/lib/api';

// ShadcnUI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Icons
import { 
  Zap, 
  Monitor, 
  BarChart3, 
  Users, 
  Trophy, 
  Clock, 
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Target,
  Brain,
  Gamepad2,
  Menu,
  X,
  Palette,
  ChevronDown
} from 'lucide-react';

// Interface pour le type Quiz
interface Quiz {
  id: number;
  title: string;
  questions_count: number;
  category: string;
  description?: string;
  difficulty?: 'Facile' | 'Moyen' | 'Difficile';
  participants?: number;
  rating?: number;
}

// Composant Header
const Header = () => {
  const { currentTheme, themes, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeChange = (themeId: number) => {
    const themeExists = themes.some(theme => theme.id === themeId);
    if (themeExists) {
      setTheme(themeId);
      setThemeMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-screen z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo section */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src="/img/logo4.png"
                alt="RTFM2Win Logo"
                width={40}
                height={40}
                className="rounded-xl transition-transform group-hover:scale-105"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                RTFM2Win
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Quiz Interactifs</span>
            </div>
          </Link>

          {/* Navigation centrale */}
          <nav className="hidden lg:flex items-center space-x-24">
            <Link href="/quiz/featured" className="relative group px-8 py-3 text-foreground/80 hover:text-foreground transition-colors">
              <span>Explorer</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link href="/quiz/create" className="relative group px-8 py-3 text-foreground/80 hover:text-foreground transition-colors">
              <span>Créer</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link href="/about" className="relative group px-8 py-3 text-foreground/80 hover:text-foreground transition-colors">
              <span>À propos</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
            </Link>
          </nav>

          {/* Actions à droite */}
          <div className="flex items-center space-x-6">
            {/* Sélecteur de thème */}
            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="h-10 px-3 hover:bg-muted/50"
              >
                <Palette className="h-4 w-4 mr-1.5" />
                <span className="hidden lg:inline text-sm">Thème</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
              
              {themeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl p-1.5 z-[100]">
                  <div className="space-y-0.5 max-h-[400px] overflow-y-auto">
                    {themes.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                          currentTheme?.id === theme.id 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{theme.name}</span>
                          {currentTheme?.id === theme.id && (
                            <div className="w-2 h-2 bg-primary-foreground rounded-full ml-2 flex-shrink-0"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'authentification */}
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" asChild className="hover:bg-muted/50 px-5 py-2 h-10">
                <Link href="/auth/login">
                  <span className="text-sm">Connexion</span>
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-md hover:shadow-lg px-6 py-2 h-10">
                <Link href="/auth/register">
                  <span className="text-sm font-medium">Inscription</span>
                </Link>
              </Button>
            </div>

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-10 w-10 p-0 ml-2"
            >
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
            className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="py-6 space-y-4">
              <Link href="/quiz/featured" className="block px-6 py-4 text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                Explorer les Quiz
              </Link>
              
              <Link href="/quiz/create" className="block px-6 py-4 text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                Créer un Quiz
              </Link>
              
              <Link href="/about" className="block px-6 py-4 text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                À propos
              </Link>
              
              <div className="border-t border-border/50 pt-6 mt-6">
                <div className="px-6 space-y-4">
                  <Button variant="outline" asChild className="w-full h-12">
                    <Link href="/auth/login">
                      Connexion
                    </Link>
                  </Button>
                  
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-primary to-secondary">
                    <Link href="/auth/register">
                      Inscription
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Thèmes en mobile */}
              <div className="border-t border-border/50 pt-6 mt-6">
                <p className="px-6 text-sm font-medium text-foreground mb-4">Choisir un thème</p>
                <div className="px-6 grid grid-cols-2 gap-3">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`px-4 py-3 rounded-lg text-sm transition-all ${
                        currentTheme?.id === theme.id 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

// Composant Hero Section
const HeroSection = () => {
  return (
    <section className="w-screen min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background avec gradient et pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      
      {/* Éléments décoratifs flottants */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <Badge variant="secondary" className="px-6 py-3 text-base font-medium bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <Sparkles className="w-5 h-5 mr-2" />
              RTFM2Win La Plateforme de Quiz Interactive Nouvelle Génération
            </Badge>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight text-center"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Créez des Quiz
            </span>
            <br />
            <span className="text-foreground">Extraordinaires</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground leading-relaxed max-w-4xl mx-auto text-center"
          >
            Transformez vos présentations en expériences interactives captivantes. 
            Parfait pour l'éducation, les formations d'entreprise et les événements.
          </motion.p>

          {/* Boutons CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Button size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-xl hover:shadow-2xl transition-all" asChild>
              <Link href="/auth/register">
                <Play className="w-6 h-6 mr-3" />
                Commencer Gratuitement
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-6 text-lg border-2 hover:bg-muted/50" asChild>
              <Link href="/quiz/featured">
                Découvrir les Quiz
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
            </Button>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-border/50 w-full max-w-4xl"
          >
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">10K+</div>
              <div className="text-muted-foreground text-lg">Quiz Créés</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">50K+</div>
              <div className="text-muted-foreground text-lg">Participants Actifs</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">99%</div>
              <div className="text-muted-foreground text-lg">Satisfaction</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Composant Join Quiz Section
const JoinQuizSection = () => {
  const router = useRouter();
  const [quizCode, setQuizCode] = useState('');

  const handleJoinQuiz = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (quizCode.trim()) {
      router.push(`/quiz/${quizCode}`);
    }
  };

  return (
    <section className="w-screen py-32 bg-gradient-to-b from-muted/30 to-background flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                <Gamepad2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Rejoindre un Quiz
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground">
                Entrez le code du quiz pour participer instantanément à l'expérience
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8">
              <form onSubmit={handleJoinQuiz} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  placeholder="Code du quiz (ex: ABC123)"
                  className="flex-1 h-14 text-lg px-6 border-2 focus:border-primary/50"
                  required
                />
                <Button type="submit" size="lg" className="px-10 h-14 bg-gradient-to-r from-primary to-secondary text-white">
                  <Play className="w-5 h-5 mr-2" />
                  Rejoindre
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center pt-6">
              <p className="text-muted-foreground text-center">
                💡 Vous pouvez aussi scanner un QR code depuis l'application mobile
              </p>
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
      title: "Rapide et Facile",
      description: "Créez un quiz professionnel en quelques minutes avec notre interface intuitive et partagez-le instantanément avec votre audience.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Monitor,
      title: "Totalement Interactif",
      description: "Questions à choix multiples, sondages en temps réel, classements dynamiques et interactions en direct pour captiver votre audience.",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Analyses Détaillées",
      description: "Statistiques précises et insights approfondis sur les performances, l'engagement et la progression de vos participants.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Travaillez en équipe, partagez vos quiz et créez des expériences collaboratives enrichissantes pour tous.",
      color: "from-purple-400 to-violet-500"
    },
    {
      icon: Target,
      title: "Personnalisation",
      description: "Thèmes personnalisés, branding complet et options avancées pour s'adapter parfaitement à votre identité visuelle.",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: Brain,
      title: "Interface Moderne",
      description: "Design épuré et moderne avec une expérience utilisateur optimisée pour tous les appareils et toutes les tailles d'écran.",
      color: "from-indigo-400 to-purple-500"
    }
  ];

  return (
    <section className="w-screen py-32 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center">
            Pourquoi choisir notre plateforme ?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
            Des fonctionnalités puissantes et innovantes pour créer des expériences d'apprentissage inoubliables
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="group w-full max-w-sm"
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-card to-card/30 backdrop-blur-sm group-hover:scale-105">
                <CardHeader className="pb-6 text-center">
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5`}>
                      <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-foreground" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-3 text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Composant Popular Quizzes Section
const PopularQuizzesSection = ({ quizzes, isLoading }: { quizzes: Quiz[], isLoading: boolean }) => {
  const router = useRouter();

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Difficile': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <section className="w-screen py-32 bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center">Quiz Populaires</h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-center mb-8">
            Découvrez les quiz les plus appréciés et rejoignez notre communauté d'apprenants passionnés
          </p>
          <div className="flex justify-center">
            <Button variant="outline" size="lg" asChild className="border-2 hover:bg-muted/50">
              <Link href="/quiz/featured">
                Voir tous les quiz
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
          {isLoading ? (
            // Placeholders pendant le chargement
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="animate-pulse border-0 bg-gradient-to-br from-card to-card/30 w-full max-w-sm">
                <CardHeader>
                  <div className="h-6 bg-muted rounded-lg mb-3"></div>
                  <div className="h-4 bg-muted rounded-lg w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded-lg mb-6"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-muted rounded-full w-20"></div>
                    <div className="h-6 bg-muted rounded-full w-24"></div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-12 bg-muted rounded-lg w-full"></div>
                </CardFooter>
              </Card>
            ))
          ) : (
            quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="group w-full max-w-sm"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-500 group cursor-pointer border-0 bg-gradient-to-br from-card to-card/30 backdrop-blur-sm group-hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {quiz.category}
                      </Badge>
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{quiz.rating || 4.5}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors leading-tight">
                      {quiz.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-base">
                      {quiz.description || 'Découvrez ce quiz passionnant et testez vos connaissances'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${getDifficultyColor(quiz.difficulty)} border-0`}>
                        {quiz.difficulty || 'Moyen'}
                      </Badge>
                      <Badge variant="outline" className="text-sm border-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {quiz.questions_count} Questions
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{quiz.participants || 0} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>Populaire</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg group-hover:shadow-xl transition-all"
                      onClick={() => router.push(`/quiz/${quiz.id}`)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Commencer le Quiz
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// Composant CTA Section
const CTASection = () => {
  return (
    <section className="w-screen py-32 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8 text-white text-center"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-center">
            Prêt à révolutionner vos présentations ?
          </h2>
          <p className="text-xl md:text-2xl lg:text-3xl opacity-90 leading-relaxed max-w-4xl mx-auto text-center">
            Rejoignez des milliers d'éducateurs, formateurs et animateurs qui transforment 
            leurs sessions avec nos quiz interactifs nouvelle génération.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button size="lg" variant="secondary" className="px-10 py-6 text-lg bg-white text-primary hover:bg-white/90 shadow-xl" asChild>
              <Link href="/auth/register">
                S'inscrire Gratuitement
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-10 py-6 text-lg border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm" asChild>
              <Link href="/quiz/create">
                Créer mon Premier Quiz
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Composant Footer
const Footer = () => {
  return (
    <footer className="w-screen py-20 bg-muted/50 border-t flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex flex-col items-center text-center space-y-16">
          {/* Section Logo et Description - Centrée */}
          <div className="flex flex-col items-center space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <Image
                src="/img/logo4.png"
                alt="RTFM2Win Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RTFM2Win</span>
                <div className="text-xs text-muted-foreground">Quiz Interactifs</div>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-center">
              La plateforme de quiz interactive nouvelle génération qui transforme l'apprentissage en expérience captivante et mémorable.
            </p>
          </div>
          
          {/* Sections de liens - Centrées avec espacement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 w-full max-w-4xl">
            {/* Section Produit */}
            <div className="flex flex-col items-center space-y-6">
              <h3 className="font-semibold text-lg text-foreground">Produit</h3>
              <div className="flex flex-col items-center space-y-4">
                <Link href="/quiz/create" className="text-muted-foreground hover:text-primary transition-colors">Créer un Quiz</Link>
                <Link href="/quiz/featured" className="text-muted-foreground hover:text-primary transition-colors">Quiz Populaires</Link>
                <Link href="/quiz/categories" className="text-muted-foreground hover:text-primary transition-colors">Catégories</Link>
                <Link href="/templates" className="text-muted-foreground hover:text-primary transition-colors">Modèles</Link>
              </div>
            </div>
            
            {/* Section Support */}
            <div className="flex flex-col items-center space-y-6">
              <h3 className="font-semibold text-lg text-foreground">Support</h3>
              <div className="flex flex-col items-center space-y-4">
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">Centre d'aide</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                <Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
                <Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">Communauté</Link>
              </div>
            </div>
            
            {/* Section Légal */}
            <div className="flex flex-col items-center space-y-6">
              <h3 className="font-semibold text-lg text-foreground">Légal</h3>
              <div className="flex flex-col items-center space-y-4">
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</Link>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Politique des cookies</Link>
                <Link href="/security" className="text-muted-foreground hover:text-primary transition-colors">Sécurité</Link>
              </div>
            </div>
          </div>
          
          {/* Section Copyright - Centrée */}
          <div className="border-t w-full pt-8 flex flex-col items-center space-y-6">
            <p className="text-muted-foreground text-center">
              © {new Date().getFullYear()} RTFM2Win. Tous droits réservés. Fait avec ❤️ en France.
            </p>
            <div className="flex gap-8">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Composant principal HomePage
export default function HomePage() {
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Effet pour marquer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Charger les quiz vedettes depuis l'API backend
    const loadFeaturedQuizzes = async () => {
      try {
        const response = await api.get('quizzes/featured');
        setFeaturedQuizzes(response.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des quiz vedettes:', error);
        // En cas d'erreur, utiliser des données factices enrichies
        setFeaturedQuizzes([
          { 
            id: 1, 
            title: 'Quiz de Programmation JavaScript', 
            questions_count: 15, 
            category: 'Informatique',
            description: 'Testez vos connaissances en JavaScript moderne',
            difficulty: 'Moyen',
            participants: 1250,
            rating: 4.8
          },
          { 
            id: 2, 
            title: 'Culture Générale Française', 
            questions_count: 20, 
            category: 'Culture',
            description: 'Histoire, géographie et traditions françaises',
            difficulty: 'Facile',
            participants: 890,
            rating: 4.6
          },
          { 
            id: 3, 
            title: 'Sciences Physiques Avancées', 
            questions_count: 12, 
            category: 'Sciences',
            description: 'Mécanique quantique et relativité',
            difficulty: 'Difficile',
            participants: 456,
            rating: 4.9
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      loadFeaturedQuizzes();
    }
  }, [isMounted]);

  // Valeurs par défaut pour le rendu côté serveur
  const defaultQuizzes: Quiz[] = [
    { 
      id: 1, 
      title: 'Quiz de Programmation', 
      questions_count: 10, 
      category: 'Informatique',
      difficulty: 'Moyen',
      participants: 1000,
      rating: 4.5
    },
    { 
      id: 2, 
      title: 'Quiz de Culture Générale', 
      questions_count: 15, 
      category: 'Culture',
      difficulty: 'Facile',
      participants: 800,
      rating: 4.3
    },
    { 
      id: 3, 
      title: 'Quiz de Sciences', 
      questions_count: 8, 
      category: 'Sciences',
      difficulty: 'Difficile',
      participants: 600,
      rating: 4.7
    }
  ];

  const displayedQuizzes = isMounted ? featuredQuizzes : defaultQuizzes;
  const showLoading = isMounted && isLoading;

  return (
    <div className="w-screen min-h-screen bg-background overflow-x-hidden">
      <Header />
      <HeroSection />
      <JoinQuizSection />
      <FeaturesSection />
      <PopularQuizzesSection quizzes={displayedQuizzes} isLoading={showLoading} />
      <CTASection />
      <Footer />
    </div>
  );
}