import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { Shield, Eye, Database, UserCheck, Mail, Lock } from 'lucide-react';

export default function Privacy() {
    return (
        <PublicLayout>
            <Head title="Politique de confidentialité" />
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Politique de confidentialité</h1>
                    <p className="text-muted-foreground text-lg">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Introduction */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Introduction
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                            <p>
                                RTFM2Win s'engage à protéger votre vie privée et vos données personnelles. 
                                Cette politique de confidentialité explique comment nous collectons, utilisons, 
                                stockons et protégeons vos informations lorsque vous utilisez notre plateforme 
                                de quiz interactifs.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Données collectées */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Données que nous collectons
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Données d'inscription</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Nom et prénom</li>
                                        <li>• Adresse email</li>
                                        <li>• Mot de passe (chiffré)</li>
                                        <li>• Date de création du compte</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Données d'utilisation</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Quiz créés et participations</li>
                                        <li>• Scores et statistiques</li>
                                        <li>• Préférences de thème</li>
                                        <li>• Logs de connexion</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Données techniques</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Adresse IP</li>
                                        <li>• Type de navigateur</li>
                                        <li>• Données de performance</li>
                                        <li>• Cookies techniques</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Utilisation des données */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5" />
                                Comment nous utilisons vos données
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium">Fonctionnement du service</p>
                                        <p className="text-sm text-muted-foreground">
                                            Authentification, création de quiz, sessions en temps réel
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium">Amélioration du service</p>
                                        <p className="text-sm text-muted-foreground">
                                            Analyse des performances, correction de bugs, nouvelles fonctionnalités
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium">Support utilisateur</p>
                                        <p className="text-sm text-muted-foreground">
                                            Assistance technique, réponse aux questions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Partage des données */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Partage des données
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Nous ne vendons jamais vos données personnelles. Nous pouvons partager des données 
                                uniquement dans les cas suivants :
                            </p>
                            <div className="space-y-2">
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="font-medium text-sm">Prestataires de services</p>
                                    <p className="text-xs text-muted-foreground">
                                        Hébergement, emails, analytics - sous contrat de confidentialité
                                    </p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="font-medium text-sm">Obligations légales</p>
                                    <p className="text-xs text-muted-foreground">
                                        Sur demande d'autorités compétentes dans le cadre légal
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sécurité */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Sécurité de vos données
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Chiffrement</h4>
                                    <p className="text-xs text-muted-foreground">
                                        HTTPS/TLS pour toutes les communications
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Mots de passe</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Hachage sécurisé avec salt
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Accès limité</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Accès strict au personnel autorisé
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium text-sm mb-1">Surveillance</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Monitoring 24/7 des intrusions
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vos droits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vos droits (RGPD)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-medium mb-2">Droits d'accès et rectification</h4>
                                    <p className="text-muted-foreground text-xs">
                                        Consulter et corriger vos données personnelles
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit à l'effacement</h4>
                                    <p className="text-muted-foreground text-xs">
                                        Supprimer votre compte et vos données
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit à la portabilité</h4>
                                    <p className="text-muted-foreground text-xs">
                                        Exporter vos données dans un format standard
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit d'opposition</h4>
                                    <p className="text-muted-foreground text-xs">
                                        Vous opposer au traitement de vos données
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                            </p>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="font-medium">Email : privacy@rtfm2win.ovh</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Nous nous engageons à répondre dans les 30 jours
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}