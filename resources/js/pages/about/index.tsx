import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Target, 
    Zap, 
    Shield, 
    Heart, 
    Code2, 
    Lightbulb, 
    Rocket, 
    Globe,
    Award,
    Calendar,
    Map
} from 'lucide-react';

export default function About() {
    return (
        <PublicLayout>
            <Head title="À propos de RTFM2Win" />
            
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
                            R
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        RTFM2Win
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        La plateforme de quiz interactive nouvelle génération qui transforme l'apprentissage 
                        en expérience captivante et mémorable. Créée par des passionnés pour les passionnés.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Badge variant="secondary" className="px-4 py-2 text-sm">
                            <Globe className="h-4 w-4 mr-2" />
                            Made in France
                        </Badge>
                        <Badge variant="secondary" className="px-4 py-2 text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Lancé en 2025
                        </Badge>
                        <Badge variant="secondary" className="px-4 py-2 text-sm">
                            <Code2 className="h-4 w-4 mr-2" />
                            Open Source
                        </Badge>
                    </div>
                </div>

                {/* Notre Histoire */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Notre Histoire</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Card className="p-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="h-6 w-6 text-yellow-500" />
                                        L'idée
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        RTFM2Win est né d'un constat simple : les outils de quiz existants manquaient 
                                        d'interactivité et d'engagement. Nous voulions créer quelque chose qui rappelle 
                                        l'excitation de Kahoot tout en offrant bien plus de fonctionnalités.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Card className="p-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Rocket className="h-6 w-6 text-blue-500" />
                                        La réalisation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Développé avec les technologies les plus modernes (Laravel 12, React 19, 
                                        WebSockets temps réel), RTFM2Win offre une expérience fluide et des 
                                        fonctionnalités innovantes comme le Battle Royale et les tournois.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Notre Mission */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Notre Mission</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="mb-4">Rassembler</CardTitle>
                            <CardDescription>
                                Créer des moments de partage et d'apprentissage collectif qui 
                                rapprochent les équipes, classes et communautés.
                            </CardDescription>
                        </Card>
                        
                        <Card className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Target className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="mb-4">Engager</CardTitle>
                            <CardDescription>
                                Transformer l'apprentissage passif en expérience interactive 
                                où chacun devient acteur de sa formation.
                            </CardDescription>
                        </Card>
                        
                        <Card className="text-center p-6">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-8 w-8 text-purple-600" />
                            </div>
                            <CardTitle className="mb-4">Innover</CardTitle>
                            <CardDescription>
                                Repousser les limites de ce qu'un quiz peut être avec des 
                                fonctionnalités uniques et une technologie de pointe.
                            </CardDescription>
                        </Card>
                    </div>
                </div>

                {/* Nos Valeurs */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                    <Heart className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Passion</h3>
                                    <p className="text-muted-foreground">
                                        Nous croyons que l'apprentissage doit être une source de plaisir. 
                                        Chaque fonctionnalité est pensée pour susciter l'enthousiasme.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Transparence</h3>
                                    <p className="text-muted-foreground">
                                        Code source ouvert, développement transparent, et communication 
                                        directe avec notre communauté.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Communauté</h3>
                                    <p className="text-muted-foreground">
                                        Nos utilisateurs sont au cœur de notre développement. 
                                        Leurs retours guident nos améliorations.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <Award className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Excellence</h3>
                                    <p className="text-muted-foreground">
                                        Nous visons la perfection dans chaque détail, de l'interface 
                                        utilisateur à la performance technique.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technologies */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Technologies</h2>
                    <Card className="p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-semibold mb-4">Stack Technique Moderne</h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                RTFM2Win utilise les dernières technologies pour offrir une expérience 
                                utilisateur exceptionnelle et des performances optimales.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { name: "Laravel 12", type: "Backend", color: "bg-red-100 text-red-700" },
                                { name: "React 19", type: "Frontend", color: "bg-blue-100 text-blue-700" },
                                { name: "TypeScript", type: "Language", color: "bg-blue-100 text-blue-700" },
                                { name: "Tailwind CSS", type: "Styling", color: "bg-cyan-100 text-cyan-700" },
                                { name: "Inertia.js", type: "Bridge", color: "bg-purple-100 text-purple-700" },
                                { name: "WebSockets", type: "Real-time", color: "bg-green-100 text-green-700" },
                                { name: "MySQL", type: "Database", color: "bg-orange-100 text-orange-700" },
                                { name: "Docker", type: "Deploy", color: "bg-sky-100 text-sky-700" }
                            ].map((tech, index) => (
                                <div key={index} className="text-center">
                                    <div className={`${tech.color} px-3 py-2 rounded-lg mb-2`}>
                                        <div className="font-medium">{tech.name}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{tech.type}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Équipe */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">L'Équipe</h2>
                    <Card className="p-8 text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                404
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">404NotFood</h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                            Studio de développement français spécialisé dans la création d'applications 
                            web innovantes. Nous combinons créativité et expertise technique pour donner 
                            vie à des projets ambitieux.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Badge variant="outline">Développement Full-Stack</Badge>
                            <Badge variant="outline">UI/UX Design</Badge>
                            <Badge variant="outline">Architecture Cloud</Badge>
                            <Badge variant="outline">DevOps</Badge>
                        </div>
                        <div className="mt-6">
                            <Button variant="outline" asChild>
                                <a href="https://404notfood.com" target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Découvrir 404NotFood
                                </a>
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Statistiques */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">En Chiffres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: "1,000+", label: "Utilisateurs actifs", icon: Users },
                            { value: "5,000+", label: "Quiz créés", icon: Target },
                            { value: "50,000+", label: "Participants", icon: Zap },
                            { value: "99.9%", label: "Uptime", icon: Shield }
                        ].map((stat, index) => (
                            <Card key={index} className="text-center p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <stat.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <Card className="p-12 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <h2 className="text-3xl font-bold mb-6">Rejoignez l'Aventure</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            Que vous soyez éducateur, formateur, ou simplement curieux, 
                            RTFM2Win vous offre les outils pour créer des expériences d'apprentissage inoubliables.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/quiz/create">
                                    <Rocket className="h-5 w-5 mr-2" />
                                    Créer mon premier quiz
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/community">
                                    <Users className="h-5 w-5 mr-2" />
                                    Rejoindre la communauté
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}