import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail, ArrowRight } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { motion } from 'framer-motion';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthModernLayout from '@/layouts/auth/auth-modern-layout';

type LoginForm = {
    login: string; // Champ unifié pour email ou pseudo
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        login: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: (errors) => {
                if (errors.csrf_token || Object.keys(errors).includes('csrf_token')) {
                    alert('Session expirée. Veuillez rafraîchir la page et réessayer.');
                    window.location.reload();
                }
            },
        });
    };

    return (
        <AuthModernLayout 
            title="Bon retour sur RTFM2Win !" 
            description="Connectez-vous à votre compte pour créer et participer à des quiz extraordinaires"
        >
            <Head title="Connexion - RTFM2Win" />

            {status && (
                <motion.div 
                    className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center text-sm font-medium text-green-600 dark:text-green-400 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {status}
                </motion.div>
            )}

            <form className="space-y-6" onSubmit={submit}>
                {/* Email/Username Field */}
                <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Label htmlFor="login" className="text-sm font-medium text-foreground/90">
                        Email ou Nom d'utilisateur
                    </Label>
                    <div className="relative group">
                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            id="login"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username email"
                            value={data.login}
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="votre@email.com ou nomutilisateur"
                            className="h-12 border-2 pl-10 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                            disabled={processing}
                        />
                    </div>
                    <InputError message={errors.login} />
                </motion.div>

                {/* Password Field */}
                <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                            Mot de passe
                        </Label>
                        {canResetPassword && (
                            <TextLink
                                href={route('password.request')}
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                                tabIndex={5}
                            >
                                Mot de passe oublié ?
                            </TextLink>
                        )}
                    </div>
                    <div className="relative group">
                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Votre mot de passe"
                            className="h-12 border-2 pr-10 pl-10 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                            disabled={processing}
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
                    <InputError message={errors.password} />
                </motion.div>

                {/* Remember Me */}
                <motion.div 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onClick={() => setData('remember', !data.remember)}
                        tabIndex={3}
                        className="data-[state=checked]:border-primary data-[state=checked]:bg-primary rounded-md"
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        Se souvenir de moi
                    </Label>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-primary to-secondary text-white font-medium shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 group relative overflow-hidden"
                        tabIndex={4}
                        disabled={processing}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-center">
                            {processing ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </Button>
                </motion.div>

                {/* Register Link */}
                <motion.div 
                    className="text-center pt-4 border-t border-border/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <p className="text-sm text-muted-foreground">
                        Pas encore de compte ?{' '}
                        <TextLink 
                            href={route('register')} 
                            tabIndex={6} 
                            className="font-medium text-primary hover:text-primary/80 transition-colors relative group"
                        >
                            Créer un compte gratuitement
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                        </TextLink>
                    </p>
                </motion.div>
            </form>
        </AuthModernLayout>
    );
}
