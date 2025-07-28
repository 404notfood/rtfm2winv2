import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Book, HelpCircle, MessageSquare, Search, Users, Video } from 'lucide-react';

export default function Help() {
    return (
        <AppLayout>
            <Head title="Centre d'aide" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Centre d'aide</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Trouvez rapidement les réponses à vos questions sur RTFM2Win.
                    </p>
                </div>

                {/* Barre de recherche */}
                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Rechercher dans l'aide..." 
                            className="pl-10"
                            disabled
                        />
                    </div>
                </div>

                {/* Catégories d'aide */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Users,
                            title: "Premiers pas",
                            description: "Apprenez les bases de RTFM2Win",
                            articles: ["Créer un compte", "Premier quiz", "Interface utilisateur"]
                        },
                        {
                            icon: Book,
                            title: "Créer des quiz",
                            description: "Guide complet pour créer vos quiz",
                            articles: ["Types de questions", "Paramètres avancés", "Médias"]
                        },
                        {
                            icon: Video,
                            title: "Sessions en direct",
                            description: "Gérer vos sessions de quiz",
                            articles: ["Lancer une session", "Gérer les participants", "Résultats"]
                        },
                        {
                            icon: MessageSquare,
                            title: "Collaboration",
                            description: "Travailler en équipe",
                            articles: ["Partager des quiz", "Permissions", "Organisations"]
                        },
                        {
                            icon: HelpCircle,
                            title: "Dépannage",
                            description: "Résoudre les problèmes courants",
                            articles: ["Problèmes de connexion", "Erreurs fréquentes", "Performance"]
                        }
                    ].map((category, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <category.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{category.title}</CardTitle>
                                        <CardDescription>
                                            {category.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {category.articles.map((article, articleIndex) => (
                                        <li key={articleIndex}>
                                            <a 
                                                href="#" 
                                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {article}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Section de contact */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
                    <p className="text-muted-foreground mb-6">
                        Notre équipe de support est là pour vous aider.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Card className="p-4">
                            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold mb-1">Chat en direct</h3>
                            <p className="text-sm text-muted-foreground">Bientôt disponible</p>
                        </Card>
                        <Card className="p-4">
                            <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold mb-1">Support par email</h3>
                            <p className="text-sm text-muted-foreground">support@rtfm2win.ovh</p>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}