import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ExternalLink, MessageCircle, Users, Github, Twitter, Discord } from 'lucide-react';

export default function Community() {
    return (
        <AppLayout>
            <Head title="Communauté" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Communauté RTFM2Win</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Rejoignez notre communauté active d'éducateurs, formateurs et passionnés de quiz interactifs.
                    </p>
                </div>

                {/* Plateformes communautaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            icon: Discord,
                            name: "Discord",
                            description: "Chat en temps réel avec la communauté",
                            members: "250+ membres",
                            link: "#",
                            color: "bg-[#5865F2]/10 text-[#5865F2]"
                        },
                        {
                            icon: Github,
                            name: "GitHub",
                            description: "Contribuez au projet open source",
                            members: "Contributeurs bienvenus",
                            link: "https://github.com/404notfood/rtfm2winv2",
                            color: "bg-gray-900/10 text-gray-900 dark:text-white"
                        },
                        {
                            icon: Twitter,
                            name: "Twitter",
                            description: "Suivez les actualités et mises à jour",
                            members: "Actualités quotidiennes",
                            link: "#",
                            color: "bg-[#1DA1F2]/10 text-[#1DA1F2]"
                        }
                    ].map((platform, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${platform.color}`}>
                                        <platform.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                                        <CardDescription>{platform.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">{platform.members}</Badge>
                                    <Button variant="outline" size="sm" disabled>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Rejoindre
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Statistiques communautaires */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: "Utilisateurs actifs", value: "1,200+" },
                        { label: "Quiz créés", value: "5,500+" },
                        { label: "Sessions jouées", value: "15,000+" },
                        { label: "Participants", value: "50,000+" }
                    ].map((stat, index) => (
                        <Card key={index} className="text-center p-4">
                            <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </Card>
                    ))}
                </div>

                {/* Ressources communautaires */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Ressources</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    title: "Templates communautaires",
                                    description: "Quiz créés et partagés par la communauté",
                                    badge: "Gratuit"
                                },
                                {
                                    title: "Guides d'utilisation",
                                    description: "Tutoriels créés par les utilisateurs expérimentés",
                                    badge: "Community"
                                },
                                {
                                    title: "Bonnes pratiques",
                                    description: "Conseils pour créer des quiz engageants",
                                    badge: "Tips"
                                },
                                {
                                    title: "Showcase",
                                    description: "Présentez vos créations à la communauté",
                                    badge: "Inspiration"
                                }
                            ].map((resource, index) => (
                                <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold mb-1">{resource.title}</h3>
                                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                                        </div>
                                        <Badge variant="outline">{resource.badge}</Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6">Événements</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    title: "Webinaire mensuel",
                                    date: "Chaque premier mardi",
                                    description: "Découvrez les nouvelles fonctionnalités",
                                    status: "Récurrent"
                                },
                                {
                                    title: "Contest Quiz du mois",
                                    date: "En cours",
                                    description: "Créez le meilleur quiz thématique",
                                    status: "Ouvert"
                                },
                                {
                                    title: "Session Q&A développeurs",
                                    date: "Bientôt",
                                    description: "Posez vos questions techniques",
                                    status: "À venir"
                                }
                            ].map((event, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <Badge variant={
                                            event.status === 'Ouvert' ? 'default' : 
                                            event.status === 'Récurrent' ? 'secondary' : 'outline'
                                        }>
                                            {event.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                                    <p className="text-xs text-muted-foreground">{event.date}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Call to action */}
                <div className="mt-12 text-center">
                    <Card className="p-8 max-w-2xl mx-auto">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Contribuez à RTFM2Win</h2>
                        <p className="text-muted-foreground mb-6">
                            Que vous soyez développeur, designer, éducateur ou simplement passionné, 
                            votre contribution peut aider à améliorer l'expérience pour tous.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" disabled>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Rejoindre les discussions
                            </Button>
                            <Button disabled>
                                <Github className="h-4 w-4 mr-2" />
                                Contribuer sur GitHub
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}