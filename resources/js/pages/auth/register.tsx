import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Eye, EyeOff, LoaderCircle, Lock, Mail, User, XCircle, ArrowRight, Shield } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthModernLayout from '@/layouts/auth/auth-modern-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    // Validation de la force du mot de passe
    useEffect(() => {
        const password = data.password;
        setPasswordStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        });
    }, [data.password]);

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const passwordsMatch = data.password_confirmation && data.password === data.password_confirmation;
    const strengthInfo = getPasswordStrengthLabel();

    return (
        <AuthModernLayout 
            title="Rejoignez RTFM2Win" 
            description="Créez votre compte gratuitement et commencez à créer des quiz extraordinaires"
        >
            <Head title="Inscription - RTFM2Win" />

            <form className="space-y-6" onSubmit={submit}>
                {/* Name Field */}
                <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Label htmlFor="name" className="text-sm font-medium text-foreground/90">
                        Nom complet
                    </Label>
                    <div className="relative group">
                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Votre nom complet"
                            className="h-12 border-2 pl-10 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                        />
                    </div>
                    <InputError message={errors.name} />
                </motion.div>

                {/* Email Field */}
                <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                        Adresse email
                    </Label>
                    <div className="relative group">
                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="votre@email.com"
                            className="h-12 border-2 pl-10 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                        />
                    </div>
                    <InputError message={errors.email} />
                </motion.div>

                {/* Password Field */}
                <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                        Mot de passe
                    </Label>
                    <div className="relative group">
                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Créez un mot de passe fort"
                            className="h-12 border-2 pr-10 pl-10 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                        />
                        <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </motion.button>
                    </div>

                    {/* Password Strength Indicator */}
                    <AnimatePresence>
                        {data.password && (
                            <motion.div 
                                className="rounded-xl bg-muted/30 backdrop-blur-sm p-4 border border-border/30"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-medium text-muted-foreground">Force du mot de passe :</p>
                                    <span className={`text-xs font-semibold ${strengthInfo.color}`}>
                                        {strengthInfo.label}
                                    </span>
                                </div>
                                
                                {/* Strength Bar */}
                                <div className="w-full bg-muted rounded-full h-2 mb-3">
                                    <motion.div 
                                        className={`h-2 rounded-full ${strengthInfo.bgColor}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(getPasswordStrengthScore() / 5) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>

                                {/* Requirements Grid */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <motion.div
                                        className={`flex items-center gap-2 ${passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                                        animate={{ scale: passwordStrength.length ? [1, 1.1, 1] : 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {passwordStrength.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        8+ caractères
                                    </motion.div>
                                    <motion.div
                                        className={`flex items-center gap-2 ${passwordStrength.uppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                                        animate={{ scale: passwordStrength.uppercase ? [1, 1.1, 1] : 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {passwordStrength.uppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        Majuscule
                                    </motion.div>
                                    <motion.div
                                        className={`flex items-center gap-2 ${passwordStrength.lowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                                        animate={{ scale: passwordStrength.lowercase ? [1, 1.1, 1] : 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {passwordStrength.lowercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        Minuscule
                                    </motion.div>
                                    <motion.div
                                        className={`flex items-center gap-2 ${passwordStrength.number ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                                        animate={{ scale: passwordStrength.number ? [1, 1.1, 1] : 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {passwordStrength.number ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        Chiffre
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <InputError message={errors.password} />
                </motion.div>

                {/* Password Confirmation Field */}
                <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground/90">
                        Confirmer le mot de passe
                    </Label>
                    <div className="relative group">
                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirmez votre mot de passe"
                            className={`h-12 border-2 pr-10 pl-10 rounded-xl bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-border ${
                                data.password_confirmation ? 
                                    (passwordsMatch ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500') 
                                    : 'border-border/50 focus:border-primary/50'
                            } focus:bg-background/80`}
                        />
                        <motion.button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </motion.button>
                        {data.password_confirmation && (
                            <motion.div 
                                className={`absolute top-1/2 right-10 -translate-y-1/2 ${
                                    passwordsMatch ? 'text-green-500' : 'text-red-500'
                                }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                {passwordsMatch ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </motion.div>
                        )}
                    </div>
                    <InputError message={errors.password_confirmation} />
                </motion.div>

                {/* Terms Checkbox */}
                <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <div className="flex items-start space-x-3 p-4 rounded-xl bg-muted/20 backdrop-blur-sm border border-border/30">
                        <Checkbox
                            id="terms"
                            name="terms"
                            checked={data.terms}
                            onClick={() => setData('terms', !data.terms)}
                            tabIndex={5}
                            className="mt-0.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary rounded-md"
                        />
                        <div className="flex-1">
                            <Label htmlFor="terms" className="text-sm leading-relaxed text-foreground/90 cursor-pointer">
                                <Shield className="inline h-4 w-4 mr-1 text-primary" />
                                J'accepte les{' '}
                                <TextLink href="/terms" className="text-primary hover:text-primary/80 underline underline-offset-2">
                                    conditions d'utilisation
                                </TextLink>{' '}
                                et la{' '}
                                <TextLink href="/privacy" className="text-primary hover:text-primary/80 underline underline-offset-2">
                                    politique de confidentialité
                                </TextLink>
                            </Label>
                        </div>
                    </div>
                    <InputError message={errors.terms} />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                >
                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-primary to-secondary text-white font-medium shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        tabIndex={6}
                        disabled={processing || !data.terms}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-center">
                            {processing ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Création du compte...
                                </>
                            ) : (
                                <>
                                    Créer mon compte gratuitement
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </Button>
                </motion.div>

                {/* Login Link */}
                <motion.div 
                    className="text-center pt-4 border-t border-border/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                >
                    <p className="text-sm text-muted-foreground">
                        Déjà un compte ?{' '}
                        <TextLink 
                            href={route('login')} 
                            tabIndex={7} 
                            className="font-medium text-primary hover:text-primary/80 transition-colors relative group"
                        >
                            Se connecter
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                        </TextLink>
                    </p>
                </motion.div>
            </form>
        </AuthModernLayout>
    );
}
