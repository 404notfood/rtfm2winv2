import { Link } from '@inertiajs/react';

export function PublicFooter() {
    return (
        <footer className="flex w-screen items-center justify-center border-t bg-muted/50 py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 xl:px-16">
                <div className="flex flex-col items-center space-y-16 text-center">
                    {/* Section Logo et Description - Centrée */}
                    <div className="flex max-w-2xl flex-col items-center space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                                R
                            </div>
                            <div>
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
                                    RTFM2Win
                                </span>
                                <div className="text-xs text-muted-foreground">Quiz Interactifs</div>
                            </div>
                        </div>
                        <p className="text-center leading-relaxed text-muted-foreground">
                            La plateforme de quiz interactive nouvelle génération qui transforme l'apprentissage en expérience captivante et
                            mémorable.
                        </p>
                    </div>

                    {/* Sections de liens - Centrées avec espacement */}
                    <div className="grid w-full max-w-4xl grid-cols-1 gap-16 md:grid-cols-3 lg:gap-24">
                        {/* Section Produit */}
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-lg font-semibold text-foreground">Produit</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <Link href="/quiz" className="text-muted-foreground transition-colors hover:text-primary">
                                    Explorer les Quiz
                                </Link>
                                <Link href="/quiz" className="text-muted-foreground transition-colors hover:text-primary">
                                    Quiz Populaires
                                </Link>
                                <Link href="/categories" className="text-muted-foreground transition-colors hover:text-primary">
                                    Catégories
                                </Link>
                                <Link href="/templates" className="text-muted-foreground transition-colors hover:text-primary">
                                    Modèles
                                </Link>
                            </div>
                        </div>

                        {/* Section Support */}
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-lg font-semibold text-foreground">Support</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <Link href="/help" className="text-muted-foreground transition-colors hover:text-primary">
                                    Centre d'aide
                                </Link>
                                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                                    Contact
                                </Link>
                                <Link href="/docs" className="text-muted-foreground transition-colors hover:text-primary">
                                    Documentation
                                </Link>
                                <Link href="/community" className="text-muted-foreground transition-colors hover:text-primary">
                                    Communauté
                                </Link>
                            </div>
                        </div>

                        {/* Section Légal */}
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-lg font-semibold text-foreground">Légal</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
                                    Confidentialité
                                </Link>
                                <Link href="/terms" className="text-muted-foreground transition-colors hover:text-primary">
                                    Conditions d'utilisation
                                </Link>
                                <Link href="/cookies" className="text-muted-foreground transition-colors hover:text-primary">
                                    Politique des cookies
                                </Link>
                                <Link href="/security" className="text-muted-foreground transition-colors hover:text-primary">
                                    Sécurité
                                </Link>
                                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                                    À propos
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Section Copyright - Centrée */}
                    <div className="flex w-full flex-col items-center space-y-6 border-t pt-8">
                        <p className="text-center text-muted-foreground">
                            © {new Date().getFullYear()} <a href="https://404notfood.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">404NotFood</a>. Tous droits réservés. Fait avec ❤️ pour vous les apprentis dev.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}