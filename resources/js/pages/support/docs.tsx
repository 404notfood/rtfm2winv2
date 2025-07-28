import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { Book, Code, FileText, Video, Zap } from 'lucide-react';

export default function Docs() {
    return (
        <PublicLayout>
            <Head title="Documentation" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Tout ce que vous devez savoir pour utiliser RTFM2Win efficacement.
                    </p>
                </div>

                {/* Guides principaux */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            icon: Zap,
                            title: "Guide de démarrage rapide",
                            description: "Commencez à utiliser RTFM2Win en 5 minutes",
                            badge: "Recommandé",
                            time: "5 min"
                        },
                        {
                            icon: Book,
                            title: "Guide complet utilisateur",
                            description: "Toutes les fonctionnalités expliquées en détail",
                            badge: "Complet",
                            time: "30 min"
                        },
                        {
                            icon: Video,
                            title: "Tutoriels vidéo",
                            description: "Apprenez avec nos tutoriels vidéo",
                            badge: "Vidéo",
                            time: "Varies"
                        }
                    ].map((guide, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <guide.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <Badge variant="secondary">{guide.badge}</Badge>
                                </div>
                                <CardTitle className="text-lg">{guide.title}</CardTitle>
                                <CardDescription>{guide.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Temps de lecture: {guide.time}</span>
                                    <span>Bientôt disponible</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sections de documentation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Guides par fonctionnalité</h2>
                        <div className="space-y-4">
                            {[
                                { title: "Créer votre premier quiz", category: "Débutant" },
                                { title: "Types de questions avancées", category: "Intermédiaire" },
                                { title: "Sessions en temps réel", category: "Essentiel" },
                                { title: "Battle Royale et Tournois", category: "Avancé" },
                                { title: "Thèmes personnalisés", category: "Personnalisation" },
                                { title: "Analytics et statistiques", category: "Analyse" }
                            ].map((doc, index) => (
                                <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-medium">{doc.title}</span>
                                        </div>
                                        <Badge variant="outline">{doc.category}</Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6">Ressources techniques</h2>
                        <div className="space-y-4">
                            {[
                                { title: "API Documentation", description: "Intégrez RTFM2Win à vos applications" },
                                { title: "Webhooks", description: "Recevez des notifications en temps réel" },
                                { title: "Export de données", description: "Exportez vos quiz et résultats" },
                                { title: "Intégrations", description: "Connectez-vous à d'autres outils" },
                                { title: "Limites et quotas", description: "Comprendre les limites du service" }
                            ].map((resource, index) => (
                                <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Code className="h-5 w-5 text-primary" />
                                        <span className="font-medium">{resource.title}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        {resource.description}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section FAQ */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-center">Questions fréquentes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                question: "Comment créer mon premier quiz ?",
                                answer: "Connectez-vous, cliquez sur 'Créer un quiz', ajoutez vos questions et lancez une session."
                            },
                            {
                                question: "Combien de participants peuvent rejoindre un quiz ?",
                                answer: "Jusqu'à 100 participants peuvent rejoindre simultanément un quiz en temps réel."
                            },
                            {
                                question: "Puis-je exporter les résultats ?",
                                answer: "Oui, vous pouvez exporter les résultats en PDF ou CSV depuis le tableau de bord."
                            },
                            {
                                question: "Comment fonctionne le Battle Royale ?",
                                answer: "Les participants sont éliminés progressivement jusqu'à ce qu'il ne reste qu'un gagnant."
                            }
                        ].map((faq, index) => (
                            <Card key={index} className="p-4">
                                <h3 className="font-semibold mb-2">{faq.question}</h3>
                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}