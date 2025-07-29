import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, FormEventHandler } from 'react';
import { 
    Eye, 
    EyeOff, 
    LoaderCircle, 
    Lock, 
    Mail, 
    User, 
    X, 
    ArrowRight, 
    CheckCircle, 
    XCircle,
    Shield,
    Sparkles,
    ChevronLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

interface AuthSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

type LoginForm = {
    login: string;
    password: string;
    remember: boolean;
};

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
};

export default function AuthSidebar({ isOpen, onClose, initialMode = 'login' }: AuthSidebarProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    // Login form
    const loginForm = useForm<Required<LoginForm>>({
        login: '',
        password: '',
        remember: false,
    });

    // Register form
    const registerForm = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    // Password strength validation
    useEffect(() => {
        if (mode === 'register') {
            const password = registerForm.data.password;
            setPasswordStrength({
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password),
            });
        }
    }, [registerForm.data.password, mode]);

    const submitLogin: FormEventHandler = (e) => {
        e.preventDefault();
        
        // S'assurer que le token CSRF est présent
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        loginForm.post(route('login'), {
            headers: {
                'X-CSRF-TOKEN': token || '',
            },
            onSuccess: () => {
                onClose();
                window.location.reload();
            },
            onError: (errors) => {
                console.log('Login errors:', errors);
                if (errors.csrf_token || Object.keys(errors).some(key => key.includes('csrf') || key.includes('419'))) {
                    alert('Session expirée. Veuillez rafraîchir la page et réessayer.');
                    window.location.reload();
                }
            },
        });
    };

    const submitRegister: FormEventHandler = (e) => {
        e.preventDefault();
        
        // S'assurer que le token CSRF est présent
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        registerForm.post(route('register'), {
            headers: {
                'X-CSRF-TOKEN': token || '',
            },
            onSuccess: () => {
                onClose();
                window.location.reload();
            },
            onError: (errors) => {
                console.log('Register errors:', errors);
                if (errors.csrf_token || Object.keys(errors).some(key => key.includes('csrf') || key.includes('419'))) {
                    alert('Session expirée. Veuillez rafraîchir la page et réessayer.');
                    window.location.reload();
                }
            },
        });
    };

    const passwordsMatch = registerForm.data.password_confirmation && registerForm.data.password === registerForm.data.password_confirmation;

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop subtil */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    >
                        {/* Header avec bouton retour */}
                        <div className="flex items-center justify-between p-6 border-b border-border/30">
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm">Retour</span>
                            </button>
                            
                            <div className="flex items-center gap-3">
                                <img 
                                    src="/img/logo4.png" 
                                    alt="RTFM2Win Logo" 
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="font-semibold text-lg">RTFM2Win</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Mode toggle */}
                                <div className="flex rounded-xl bg-muted/30 p-1 mb-8">
                                    <button
                                        onClick={() => setMode('login')}
                                        className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                            mode === 'login'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Connexion
                                    </button>
                                    <button
                                        onClick={() => setMode('register')}
                                        className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                            mode === 'register'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Inscription
                                    </button>
                                </div>

                                {/* Title */}
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-2">
                                        {mode === 'login' ? 'Bon retour !' : 'Rejoignez-nous !'}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {mode === 'login' 
                                            ? 'Connectez-vous pour accéder à vos quiz'
                                            : 'Créez votre compte et commencez à jouer'
                                        }
                                    </p>
                                </div>

                                {/* Forms */}
                                <AnimatePresence mode="wait">
                                    {mode === 'login' ? (
                                        <motion.form
                                            key="login"
                                            className="space-y-6"
                                            onSubmit={submitLogin}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Login fields */}
                                            <div className="space-y-2">
                                                <Label htmlFor="login" className="text-sm font-medium">
                                                    Email ou Nom d'utilisateur
                                                </Label>
                                                <div className="relative group">
                                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="login"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        value={loginForm.data.login}
                                                        onChange={(e) => loginForm.setData('login', e.target.value)}
                                                        placeholder="votre@email.com"
                                                        className="h-12 pl-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                        disabled={loginForm.processing}
                                                    />
                                                </div>
                                                <InputError message={loginForm.errors.login} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="text-sm font-medium">
                                                    Mot de passe
                                                </Label>
                                                <div className="relative group">
                                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        required
                                                        value={loginForm.data.password}
                                                        onChange={(e) => loginForm.setData('password', e.target.value)}
                                                        placeholder="Votre mot de passe"
                                                        className="h-12 pl-10 pr-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                        disabled={loginForm.processing}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <InputError message={loginForm.errors.password} />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="remember"
                                                        checked={loginForm.data.remember}
                                                        onClick={() => loginForm.setData('remember', !loginForm.data.remember)}
                                                    />
                                                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                                                        Se souvenir de moi
                                                    </Label>
                                                </div>
                                                <TextLink href={route('password.request')} className="text-sm text-primary hover:text-primary/80">
                                                    Mot de passe oublié ?
                                                </TextLink>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium shadow-lg hover:shadow-xl transition-all group"
                                                disabled={loginForm.processing}
                                            >
                                                {loginForm.processing ? (
                                                    <>
                                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                        Connexion...
                                                    </>
                                                ) : (
                                                    <>
                                                        Se connecter
                                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </motion.form>
                                    ) : (
                                        <motion.form
                                            key="register"
                                            className="space-y-5"
                                            onSubmit={submitRegister}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Register fields - Version compacte pour sidebar */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium">
                                                    Nom complet
                                                </Label>
                                                <div className="relative group">
                                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        value={registerForm.data.name}
                                                        onChange={(e) => registerForm.setData('name', e.target.value)}
                                                        placeholder="Votre nom complet"
                                                        className="h-11 pl-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                        disabled={registerForm.processing}
                                                    />
                                                </div>
                                                <InputError message={registerForm.errors.name} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium">
                                                    Email
                                                </Label>
                                                <div className="relative group">
                                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        required
                                                        value={registerForm.data.email}
                                                        onChange={(e) => registerForm.setData('email', e.target.value)}
                                                        placeholder="votre@email.com"
                                                        className="h-11 pl-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                        disabled={registerForm.processing}
                                                    />
                                                </div>
                                                <InputError message={registerForm.errors.email} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="text-sm font-medium">
                                                    Mot de passe
                                                </Label>
                                                <div className="relative group">
                                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        required
                                                        value={registerForm.data.password}
                                                        onChange={(e) => registerForm.setData('password', e.target.value)}
                                                        placeholder="Mot de passe fort"
                                                        className="h-11 pl-10 pr-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                        disabled={registerForm.processing}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                
                                                {/* Password strength - Version compacte */}
                                                {registerForm.data.password && (
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <span>Force:</span>
                                                        <div className="flex gap-1">
                                                            {passwordStrength.length && <CheckCircle className="h-3 w-3 text-green-500" />}
                                                            {passwordStrength.uppercase && <CheckCircle className="h-3 w-3 text-green-500" />}
                                                            {passwordStrength.number && <CheckCircle className="h-3 w-3 text-green-500" />}
                                                        </div>
                                                    </div>
                                                )}
                                                <InputError message={registerForm.errors.password} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                                    Confirmer
                                                </Label>
                                                <div className="relative group">
                                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        required
                                                        value={registerForm.data.password_confirmation}
                                                        onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                                        placeholder="Confirmez"
                                                        className={`h-11 pl-10 pr-10 rounded-xl bg-background/50 transition-all ${
                                                            registerForm.data.password_confirmation ? 
                                                                (passwordsMatch ? 'border-green-500/50' : 'border-red-500/50') 
                                                                : 'border-border/50'
                                                        }`}
                                                        disabled={registerForm.processing}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <InputError message={registerForm.errors.password_confirmation} />
                                            </div>

                                            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20">
                                                <Checkbox
                                                    id="terms"
                                                    checked={registerForm.data.terms}
                                                    onClick={() => registerForm.setData('terms', !registerForm.data.terms)}
                                                    className="mt-0.5"
                                                />
                                                <div className="flex-1">
                                                    <Label htmlFor="terms" className="text-xs leading-relaxed text-foreground/90">
                                                        <Shield className="inline h-3 w-3 mr-1 text-primary" />
                                                        J'accepte les conditions d'utilisation
                                                    </Label>
                                                </div>
                                            </div>
                                            <InputError message={registerForm.errors.terms} />

                                            <Button
                                                type="submit"
                                                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium shadow-lg hover:shadow-xl transition-all group disabled:opacity-50"
                                                disabled={registerForm.processing || !registerForm.data.terms}
                                            >
                                                {registerForm.processing ? (
                                                    <>
                                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                        Création...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        Créer mon compte
                                                    </>
                                                )}
                                            </Button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
} 