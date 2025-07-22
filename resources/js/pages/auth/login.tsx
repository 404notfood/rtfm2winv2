import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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
        <AuthLayout title="Bienvenue sur RTFM2Win" description="Connectez-vous à votre compte pour créer et participer à des quiz extraordinaires">
            <Head title="Connexion - RTFM2Win" />

            {status && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-green-600 dark:border-green-800 dark:bg-green-900/20">
                    {status}
                </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="login" className="text-sm font-medium">
                            Email ou Nom d'utilisateur
                        </Label>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                className="h-12 border-2 pl-10 transition-colors focus:border-primary/50"
                                disabled={processing}
                            />
                        </div>
                        <InputError message={errors.login} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Mot de passe
                            </Label>
                            {canResetPassword && (
                                <TextLink
                                    href={route('password.request')}
                                    className="text-sm text-primary transition-colors hover:text-primary/80"
                                    tabIndex={5}
                                >
                                    Mot de passe oublié ?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Votre mot de passe"
                                className="h-12 border-2 pr-10 pl-10 transition-colors focus:border-primary/50"
                                disabled={processing}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="remember" className="text-sm text-muted-foreground">
                            Se souvenir de moi
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 h-12 w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all hover:from-primary/90 hover:to-secondary/90 hover:shadow-xl"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Connexion en cours...
                            </>
                        ) : (
                            'Se connecter'
                        )}
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <TextLink href={route('register')} tabIndex={6} className="font-medium text-primary transition-colors hover:text-primary/80">
                        Créer un compte gratuitement
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
