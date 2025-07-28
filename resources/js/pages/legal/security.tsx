import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Zap, Server, Users } from 'lucide-react';

export default function Security() {
    return (
        <PublicLayout>
            <Head title="Sécurité" />
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Sécurité</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        La sécurité de vos données et de votre vie privée est notre priorité absolue.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Vue d'ensemble */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Notre approche sécuritaire
                            </CardTitle>
                            <CardDescription>
                                RTFM2Win implémente des mesures de sécurité de niveau entreprise pour protéger vos données.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Conforme RGPD</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Respect total des réglementations européennes
                                    </p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lock className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Chiffrement bout en bout</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Toutes les données sont chiffrées en transit et au repos
                                    </p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Zap className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Monitoring 24/7</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Surveillance continue des menaces et anomalies
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sécurité des données */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                Protection des données
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Chiffrement
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">En transit</span>
                                                <Badge variant="secondary">TLS 1.3</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Toutes les communications sont chiffrées avec les protocoles les plus récents
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">Au repos</span>
                                                <Badge variant="secondary">AES-256</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Base de données et fichiers chiffrés avec des clés de chiffrement rotatives
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">Mots de passe</span>
                                                <Badge variant="secondary">Argon2</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Hachage sécurisé avec salt unique et coût de calcul adaptatif
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">Sessions</span>
                                                <Badge variant="secondary">Sécurisées</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Tokens de session chiffrés avec expiration automatique
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Contrôle d'accès
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                                <Users className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Authentification multi-facteurs</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Disponible pour tous les comptes (recommandé pour les présentateurs)
                                                </p>
                                            </div>
                                            <Badge variant="outline">Bientôt</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                                <Lock className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Principe du moindre privilège</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Chaque utilisateur n'a accès qu'aux données nécessaires
                                                </p>
                                            </div>
                                            <Badge variant="secondary">Actif</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                                                <Eye className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Audit des accès</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Journalisation de tous les accès et modifications
                                                </p>
                                            </div>
                                            <Badge variant="secondary">Actif</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Infrastructure */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                Infrastructure sécurisée
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Hébergement</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">Centres de données certifiés ISO 27001</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">Redondance géographique</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">Sauvegardes chiffrées quotidiennes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">Isolation réseau et pare-feu</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3">Surveillance</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">Détection d'intrusion en temps réel</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">Analyse comportementale</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">Alertes automatiques</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">Équipe de sécurité dédiée</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sécurité développement */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sécurité du développement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Code sécurisé
                                    </h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Revue de code systématique</li>
                                        <li>• Tests de sécurité automatisés</li>
                                        <li>• Analyse statique du code</li>
                                        <li>• Dépendances auditées</li>
                                    </ul>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Protection OWASP
                                    </h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Protection CSRF</li>
                                        <li>• Validation d'entrée</li>
                                        <li>• Échappement XSS</li>
                                        <li>• Headers de sécurité</li>
                                    </ul>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Déploiement
                                    </h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Pipeline CI/CD sécurisé</li>
                                        <li>• Tests d'intrusion réguliers</li>
                                        <li>• Mise à jour automatique</li>
                                        <li>• Rollback instantané</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Incident response */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Gestion des incidents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                                    <h4 className="font-semibold mb-2">Signalement d'incident</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Si vous découvrez une faille de sécurité, veuillez nous la signaler de manière responsable.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline">Email</Badge>
                                            <span>security@rtfm2win.ovh</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline">Délai</Badge>
                                            <span>Réponse sous 24h</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline">Chiffrement</Badge>
                                            <span>PGP disponible sur demande</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 mb-1">&lt; 1h</div>
                                        <p className="text-sm font-medium">Détection</p>
                                        <p className="text-xs text-muted-foreground">Temps moyen de détection d'incident</p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 mb-1">&lt; 4h</div>
                                        <p className="text-sm font-medium">Réponse</p>
                                        <p className="text-xs text-muted-foreground">Temps de réponse initial</p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600 mb-1">&lt; 24h</div>
                                        <p className="text-sm font-medium">Résolution</p>
                                        <p className="text-xs text-muted-foreground">Temps de résolution critique</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Certifications et conformité</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { name: "RGPD", status: "Conforme", color: "text-green-600" },
                                    { name: "ISO 27001", status: "En cours", color: "text-orange-600" },
                                    { name: "SOC 2", status: "Planifié", color: "text-blue-600" },
                                    { name: "OWASP", status: "Implémenté", color: "text-green-600" }
                                ].map((cert, index) => (
                                    <div key={index} className="text-center p-4 border rounded-lg">
                                        <div className="font-semibold mb-1">{cert.name}</div>
                                        <div className={`text-sm ${cert.color}`}>{cert.status}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}