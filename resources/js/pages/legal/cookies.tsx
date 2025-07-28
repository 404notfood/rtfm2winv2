import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PublicLayout } from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { Cookie, Shield, BarChart3, Target, Settings } from 'lucide-react';

export default function Cookies() {
    return (
        <PublicLayout>
            <Head title="Politique des cookies" />
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Cookie className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Politique des cookies</h1>
                    <p className="text-muted-foreground text-lg">
                        Comment nous utilisons les cookies sur RTFM2Win
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Qu'est-ce qu'un cookie */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cookie className="h-5 w-5" />
                                Qu'est-ce qu'un cookie ?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous 
                                visitez un site web. Ils permettent au site de se souvenir de vos actions et 
                                préférences sur une période donnée.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 border rounded-lg text-center">
                                    <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-medium text-sm">Sécurisés</h4>
                                    <p className="text-xs text-muted-foreground">Chiffrés et protégés</p>
                                </div>
                                <div className="p-3 border rounded-lg text-center">
                                    <Settings className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                    <h4 className="font-medium text-sm">Configurables</h4>
                                    <p className="text-xs text-muted-foreground">Vous contrôlez leur usage</p>
                                </div>
                                <div className="p-3 border rounded-lg text-center">
                                    <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                    <h4 className="font-medium text-sm">Ciblés</h4>
                                    <p className="text-xs text-muted-foreground">Adaptés à vos besoins</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Types de cookies */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Types de cookies que nous utilisons</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Cookies essentiels */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                                <Shield className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Cookies essentiels</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Nécessaires au fonctionnement du site
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">Always On</Badge>
                                            <Switch checked disabled />
                                        </div>
                                    </div>
                                    <div className="pl-10 space-y-2">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm">rtfm2win_session</span>
                                                <Badge variant="outline">Session</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Authentification et maintien de session
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm">csrf_token</span>
                                                <Badge variant="outline">Session</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Protection contre les attaques CSRF
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm">theme_preference</span>
                                                <Badge variant="outline">1 an</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Sauvegarde de votre thème préféré
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cookies analytiques */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Cookies analytiques</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Nous aident à améliorer le site
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">Optional</Badge>
                                            <Switch />
                                        </div>
                                    </div>
                                    <div className="pl-10 space-y-2">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm">analytics_session</span>
                                                <Badge variant="outline">2 ans</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Analyse de l'utilisation et performances
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm">user_insights</span>
                                                <Badge variant="outline">1 an</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Comprendre comment vous utilisez nos fonctionnalités
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cookies de préférence */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                                <Settings className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Cookies de préférence</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Personnalisent votre expérience
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">Optional</Badge>
                                            <Switch />
                                        </div>
                                    </div>
                                    <div className="pl-10 space-y-2">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm">language_pref</span>
                                                <Badge variant="outline">1 an</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Votre langue préférée
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm">layout_settings</span>
                                                <Badge variant="outline">6 mois</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Préférences d'affichage et de mise en page
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gestion des cookies */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gérer vos préférences</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Vous pouvez contrôler l'utilisation des cookies de plusieurs façons :
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Sur RTFM2Win</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Utilisez le panneau de préférences ci-dessus pour activer/désactiver 
                                            les cookies non essentiels.
                                        </p>
                                        <Button size="sm" disabled>
                                            Gérer les préférences
                                        </Button>
                                    </div>
                                    
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Dans votre navigateur</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Tous les navigateurs permettent de bloquer ou supprimer les cookies 
                                            dans leurs paramètres.
                                        </p>
                                        <Button variant="outline" size="sm" disabled>
                                            Guide navigateur
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <h4 className="font-medium mb-2 text-amber-800 dark:text-amber-200">
                                        ⚠️ Important
                                    </h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Désactiver tous les cookies peut affecter le fonctionnement du site. 
                                        Certaines fonctionnalités pourraient ne plus être disponibles.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Questions sur les cookies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                <Cookie className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="font-medium">Besoin d'aide ?</p>
                                    <p className="text-sm text-muted-foreground">
                                        Contactez-nous à <strong>privacy@rtfm2win.ovh</strong> pour toute question 
                                        sur notre utilisation des cookies.
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