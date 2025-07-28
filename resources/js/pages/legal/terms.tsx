import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { FileText, Users, Shield, AlertTriangle, Scale, Zap } from 'lucide-react';

export default function Terms() {
    return (
        <PublicLayout>
            <Head title="Conditions d'utilisation" />
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Conditions d'utilisation</h1>
                    <p className="text-muted-foreground text-lg">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Acceptation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Acceptation des conditions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                            <p>
                                En accédant et en utilisant RTFM2Win, vous acceptez d'être lié par ces 
                                conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
                                veuillez ne pas utiliser notre service.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Description du service */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Description du service
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                RTFM2Win est une plateforme de quiz interactifs en temps réel qui permet de :
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Créer des quiz</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Questions personnalisées, thèmes, paramètres avancés
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Sessions en temps réel</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Diffusion live, participants multiples, classements
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Battle Royale</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Mode compétitif avec éliminations progressives
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Analytics</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Statistiques détaillées et exports de résultats
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comptes utilisateurs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Comptes utilisateurs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Responsabilités</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Fournir des informations exactes lors de l'inscription</li>
                                        <li>• Maintenir la sécurité de votre mot de passe</li>
                                        <li>• Signaler toute utilisation non autorisée de votre compte</li>
                                        <li>• Respecter les droits d'auteur dans vos contenus</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Types de comptes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="font-medium text-sm">Utilisateur</p>
                                            <p className="text-xs text-muted-foreground">Participation aux quiz</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="font-medium text-sm">Présentateur</p>
                                            <p className="text-xs text-muted-foreground">Création et gestion</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="font-medium text-sm">Administrateur</p>
                                            <p className="text-xs text-muted-foreground">Gestion complète</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Utilisation acceptable */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Utilisation acceptable
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2 text-green-600">Autorisé</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Créer des quiz éducatifs, formatifs ou ludiques</li>
                                        <li>• Organiser des sessions publiques ou privées</li>
                                        <li>• Exporter vos données et résultats</li>
                                        <li>• Personnaliser l'apparence avec des thèmes</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 text-red-600">Interdit</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Contenu illégal, haineux ou discriminatoire</li>
                                        <li>• Violation des droits d'auteur</li>
                                        <li>• Tentatives de piratage ou d'intrusion</li>
                                        <li>• Spam ou utilisation abusive des ressources</li>
                                        <li>• Revente ou redistribution du service</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Propriété intellectuelle */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="h-5 w-5" />
                                Propriété intellectuelle
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 border-l-4 border-primary bg-primary/5">
                                    <h4 className="font-medium mb-2">Vos contenus</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Vous conservez tous les droits sur les quiz et contenus que vous créez. 
                                        Vous nous accordez une licence d'utilisation pour fournir le service.
                                    </p>
                                </div>
                                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                                    <h4 className="font-medium mb-2">Notre plateforme</h4>
                                    <p className="text-sm text-muted-foreground">
                                        RTFM2Win, son code, design et fonctionnalités sont protégés par 
                                        les droits d'auteur et autres droits de propriété intellectuelle.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Limitations de responsabilité */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Limitations de responsabilité</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-1">Disponibilité du service</h4>
                                    <p className="text-muted-foreground text-xs">
                                        Nous nous efforçons d'assurer une disponibilité maximale mais ne 
                                        garantissons pas un service ininterrompu.
                                    </p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-1">Perte de données</h4>
                                    <p className="text-muted-foreground text-xs">
                                        Nous recommandons de sauvegarder vos contenus importants. 
                                        Nous ne sommes pas responsables de la perte de données.
                                    </p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-1">Contenu des utilisateurs</h4>
                                    <p className="text-muted-foreground text-xs">
                                        Les utilisateurs sont responsables de leurs contenus. 
                                        Nous ne contrôlons pas tous les contenus publiés.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Résiliation */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Résiliation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Par vous</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Vous pouvez supprimer votre compte à tout moment depuis 
                                        les paramètres de votre profil.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Par nous</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Nous pouvons suspendre ou supprimer votre compte en cas 
                                        de violation de ces conditions.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact et modifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="font-medium mb-2">Questions sur ces conditions</p>
                                    <p className="text-sm text-muted-foreground">
                                        Email : legal@rtfm2win.ovh
                                    </p>
                                </div>
                                <div className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                    <p className="font-medium mb-2 text-orange-800 dark:text-orange-200">
                                        Modifications
                                    </p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                        Nous nous réservons le droit de modifier ces conditions. 
                                        Les utilisateurs seront notifiés des changements importants.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}