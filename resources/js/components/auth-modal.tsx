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
    Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

interface AuthModalProps {
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

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
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

    const getPasswordStrengthScore = () => {
        return Object.values(passwordStrength).reduce((acc, curr) => acc + (curr ? 1 : 0), 0);
    };

    const getPasswordStrengthLabel = () => {
        const score = getPasswordStrengthScore();
        if (score <= 2) return { label: 'Faible', color: 'text-red-500', bgColor: 'bg-red-500' };
        if (score <= 3) return { label: 'Moyen', color: 'text-orange-500', bgColor: 'bg-orange-500' };
        if (score <= 4) return { label: 'Fort', color: 'text-blue-500', bgColor: 'bg-blue-500' };
        return { label: 'Très fort', color: 'text-green-500', bgColor: 'bg-green-500' };
    };

    const submitLogin: FormEventHandler = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onSuccess: () => {
                onClose();
                window.location.reload();
            },
            onError: (errors) => {
                if (errors.csrf_token || Object.keys(errors).includes('csrf_token')) {
                    alert('Session expirée. Veuillez rafraîchir la page et réessayer.');
                    window.location.reload();
                }
            },
        });
    };

    const submitRegister: FormEventHandler = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onSuccess: () => {
                onClose();
                window.location.reload();
            },
        });
    };

    const passwordsMatch = registerForm.data.password_confirmation && registerForm.data.password === registerForm.data.password_confirmation;
    const strengthInfo = getPasswordStrengthLabel();

    // Close modal on escape key
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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    className="relative w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                >
                    {/* Glass card effect */}
                    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                        {/* Animated background elements */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div 
                                className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3] 
                                }}
                                transition={{ 
                                    duration: 8, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                            />
                            <motion.div 
                                className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"
                                animate={{ 
                                    scale: [1.2, 1, 1.2],
                                    opacity: [0.5, 0.3, 0.5] 
                                }}
                                transition={{ 
                                    duration: 10, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                            />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="relative p-8">
                            {/* Header */}
                            <motion.div 
                                className="text-center mb-8"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {/* Logo */}
                                <div className="mb-6">
                                    <motion.div 
                                        className="relative mx-auto w-16 h-16"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg" />
                                        <img 
                                            src="/img/logo4.png" 
                                            alt="RTFM2Win Logo" 
                                            className="relative w-full h-full rounded-full shadow-lg ring-2 ring-primary/20"
                                        />
                                    </motion.div>
                                </div>

                                {/* Mode toggle */}
                                <div className="flex rounded-xl bg-muted/30 p-1 mb-6">
                                    <button
                                        onClick={() => setMode('login')}
                                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                            mode === 'login'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Connexion
                                    </button>
                                    <button
                                        onClick={() => setMode('register')}
                                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                            mode === 'register'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Inscription
                                    </button>
                                </div>

                                {/* Title and description */}
                                <div className="space-y-2">
                                    <h1 className="text-xl font-bold">
                                        {mode === 'login' ? 'Bon retour !' : 'Rejoignez-nous !'}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {mode === 'login' 
                                            ? 'Connectez-vous pour accéder à vos quiz'
                                            : 'Créez votre compte et commencez à jouer'
                                        }
                                    </p>
                                </div>
                            </motion.div>

                            {/* Forms */}
                            <AnimatePresence mode="wait">
                                {mode === 'login' ? (
                                    <motion.form
                                        key="login"
                                        className="space-y-4"
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
                                                    className="h-11 pl-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
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
                                                    className="h-11 pl-10 pr-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
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
                                            className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium shadow-lg hover:shadow-xl transition-all group"
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
                                        className="space-y-4"
                                        onSubmit={submitRegister}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Register fields */}
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
                                                Adresse email
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

                                        <div className="space-y-3">
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
                                                    placeholder="Créez un mot de passe fort"
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

                                            {/* Password strength */}
                                            {registerForm.data.password && (
                                                <div className="rounded-lg bg-muted/30 p-3 text-xs">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-muted-foreground">Force :</span>
                                                        <span className={`font-semibold ${strengthInfo.color}`}>
                                                            {strengthInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                            {passwordStrength.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                            8+ caractères
                                                        </div>
                                                        <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                            {passwordStrength.uppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                            Majuscule
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <InputError message={registerForm.errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                                Confirmer le mot de passe
                                            </Label>
                                            <div className="relative group">
                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    required
                                                    value={registerForm.data.password_confirmation}
                                                    onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                                    placeholder="Confirmez votre mot de passe"
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
                                                    J'accepte les conditions d'utilisation et la politique de confidentialité
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
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
} 