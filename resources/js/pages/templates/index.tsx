import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { FileText, Plus, Zap } from 'lucide-react';

interface Props {
    templates: any[];
}

export default function TemplatesIndex({ templates }: Props) {
    return (
        <AppLayout>
            <Head title="Modèles de Quiz" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Modèles de Quiz</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Gagnez du temps avec nos modèles prêts à l'emploi. Créez des quiz professionnels en quelques clics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Template exemple */}
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="text-center">
                            <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-3">
                                <Plus className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Créer un modèle</CardTitle>
                            <CardDescription>
                                Créez votre propre modèle personnalisé
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button variant="outline" disabled>
                                Bientôt disponible
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Templates par défaut - pour l'exemple */}
                    {[
                        {
                            name: "Quiz Éducatif",
                            description: "Modèle pour quiz éducatifs avec explications",
                            icon: FileText,
                            questions: 10,
                            category: "Éducation"
                        },
                        {
                            name: "Quiz Rapide",
                            description: "Format court pour évaluations rapides",
                            icon: Zap,
                            questions: 5,
                            category: "Formation"
                        }
                    ].map((template, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <template.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription>
                                            {template.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{template.category}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {template.questions} questions
                                        </span>
                                    </div>
                                </div>
                                <Button className="w-full" disabled>
                                    Utiliser ce modèle
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground mb-4">
                        Cette fonctionnalité sera bientôt disponible
                    </p>
                    <Button variant="outline" disabled>
                        Voir tous les modèles
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}