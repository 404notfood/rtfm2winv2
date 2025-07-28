import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PublicHeader() {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 right-0 left-0 z-50 w-screen transition-all duration-300 ${
                isScrolled ? 'border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-16">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo section */}
                    <Link href="/" className="group flex items-center space-x-3">
                        <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                                R
                            </div>
                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 blur transition-opacity group-hover:opacity-100"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-2xl font-bold text-transparent">
                                RTFM2Win
                            </span>
                            <span className="-mt-1 text-xs text-muted-foreground">Quiz Interactifs</span>
                        </div>
                    </Link>

                    {/* Navigation centrale */}
                    <nav className="hidden items-center space-x-8 lg:flex">
                        <Link href="/categories" className="group relative px-4 py-3 text-foreground/80 transition-colors hover:text-foreground">
                            <span>Catégories</span>
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></div>
                        </Link>
                        <Link href="/templates" className="group relative px-4 py-3 text-foreground/80 transition-colors hover:text-foreground">
                            <span>Templates</span>
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></div>
                        </Link>
                        <Link href="/help" className="group relative px-4 py-3 text-foreground/80 transition-colors hover:text-foreground">
                            <span>Aide</span>
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></div>
                        </Link>
                        <Link href="/about" className="group relative px-4 py-3 text-foreground/80 transition-colors hover:text-foreground">
                            <span>À propos</span>
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></div>
                        </Link>
                    </nav>

                    {/* Actions de droite */}
                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-muted-foreground">Bonjour, {auth.user.name}</span>
                                <Button asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Se connecter</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">S'inscrire</Link>
                                </Button>
                            </div>
                        )}

                        {/* Menu mobile */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 lg:hidden"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Menu mobile */}
                {mobileMenuOpen && (
                    <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl lg:hidden">
                        <nav className="flex flex-col space-y-2 py-4">
                            <Link
                                href="/categories"
                                className="px-4 py-2 text-foreground/80 transition-colors hover:text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Catégories
                            </Link>
                            <Link
                                href="/templates"
                                className="px-4 py-2 text-foreground/80 transition-colors hover:text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Templates
                            </Link>
                            <Link
                                href="/help"
                                className="px-4 py-2 text-foreground/80 transition-colors hover:text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Aide
                            </Link>
                            <Link
                                href="/about"
                                className="px-4 py-2 text-foreground/80 transition-colors hover:text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                À propos
                            </Link>
                            <div className="border-t border-border/50 pt-2">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-2 text-foreground/80 transition-colors hover:text-foreground"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex flex-col space-y-2 px-4">
                                        <Link
                                            href="/login"
                                            className="block py-2 text-foreground/80 transition-colors hover:text-foreground"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Se connecter
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block py-2 text-foreground/80 transition-colors hover:text-foreground"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            S'inscrire
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}