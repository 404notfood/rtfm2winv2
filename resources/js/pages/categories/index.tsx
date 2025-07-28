import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Brain, Calendar, Dumbbell, Palette } from 'lucide-react';

interface Props {
    categories: string[];
}

const categoryIcons = {
    'général': BookOpen,
    'science': Brain,
    'histoire': Calendar,
    'sport': Dumbbell,
    'culture': Palette,
};

export default function CategoriesIndex({ categories }: Props) {
    return (
        <AppLayout>
            <Head title="Catégories de Quiz" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Catégories de Quiz</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Explorez nos différentes catégories de quiz et trouvez ceux qui correspondent à vos intérêts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => {
                        const Icon = categoryIcons[category as keyof typeof categoryIcons] || BookOpen;
                        return (
                            <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="capitalize">{category}</CardTitle>
                                            <CardDescription>
                                                Quiz de {category}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary">Bientôt disponible</Badge>
                                        <Link 
                                            href={`/quiz?category=${category}`}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Voir les quiz →
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}