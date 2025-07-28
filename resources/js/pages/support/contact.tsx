import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
    return (
        <AppLayout>
            <Head title="Contact" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Une question, une suggestion ou besoin d'aide ? Nous sommes là pour vous accompagner.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Formulaire de contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Envoyez-nous un message</CardTitle>
                            <CardDescription>
                                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">Prénom</Label>
                                        <Input id="firstName" placeholder="Votre prénom" disabled />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Nom</Label>
                                        <Input id="lastName" placeholder="Votre nom" disabled />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="votre@email.com" disabled />
                                </div>
                                <div>
                                    <Label htmlFor="subject">Sujet</Label>
                                    <Input id="subject" placeholder="Sujet de votre message" disabled />
                                </div>
                                <div>
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea 
                                        id="message" 
                                        placeholder="Décrivez votre demande..." 
                                        rows={6}
                                        disabled
                                    />
                                </div>
                                <Button className="w-full" disabled>
                                    Envoyer le message
                                </Button>
                                <p className="text-sm text-muted-foreground text-center">
                                    Formulaire temporairement indisponible
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Informations de contact */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Autres moyens de contact</CardTitle>
                                <CardDescription>
                                    Vous pouvez également nous joindre directement par ces moyens.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">support@rtfm2win.ovh</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Téléphone</p>
                                        <p className="text-sm text-muted-foreground">Bientôt disponible</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Adresse</p>
                                        <p className="text-sm text-muted-foreground">France</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Temps de réponse</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Support général</span>
                                        <span className="text-sm text-muted-foreground">24-48h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Questions techniques</span>
                                        <span className="text-sm text-muted-foreground">12-24h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Urgences</span>
                                        <span className="text-sm text-muted-foreground">2-4h</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}