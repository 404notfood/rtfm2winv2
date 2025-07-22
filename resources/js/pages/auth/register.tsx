import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Eye, EyeOff, LoaderCircle, Lock, Mail, User, XCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Rejoignez RTFM2Win" description="Créez votre compte gratuitement et commencez à créer des quiz extraordinaires">
            <Head title="Inscription - RTFM2Win" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Nom complet
                        </Label>
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                className="h-12 border-2 pl-10 transition-colors focus:border-primary/50"
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Adresse email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                className="h-12 border-2 pl-10 transition-colors focus:border-primary/50"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Mot de passe
                        </Label>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                className="h-12 border-2 pr-10 pl-10 transition-colors focus:border-primary/50"
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

                        {/* Indicateur de force du mot de passe */}
                        {data.password && (
                            <div className="mt-2 rounded-lg bg-muted/50 p-3">
                                <p className="mb-2 text-xs font-medium text-muted-foreground">Force du mot de passe :</p>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div
                                        className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-muted-foreground'}`}
                                    >
                                        {passwordStrength.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        8+ caractères
                                    </div>
                                    <div
                                        className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}
                                    >
                                        {passwordStrength.uppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        Majuscule
                                    </div>
                                    <div
                                        className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}
                                    >
                                        {passwordStrength.lowercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        Minuscule
                                    </div>
                                    <div
                                        className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-600' : 'text-muted-foreground'}`}
                                    >
                                        {passwordStrength.number ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        Chiffre
                                    </div>
                                </div>
                            </div>
                        )}
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium">
                            Confirmer le mot de passe
                        </Label>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                className="h-12 border-2 pr-10 pl-10 transition-colors focus:border-primary/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="terms"
                            name="terms"
                            checked={data.terms}
                            onClick={() => setData('terms', !data.terms)}
                            tabIndex={5}
                            className="mt-0.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
                            J'accepte les{' '}
                            <TextLink href="/terms" className="text-primary hover:text-primary/80">
                                conditions d'utilisation
                            </TextLink>{' '}
                            et la{' '}
                            <TextLink href="/privacy" className="text-primary hover:text-primary/80">
                                politique de confidentialité
                            </TextLink>
                        </Label>
                    </div>
                    <InputError message={errors.terms} />

                    <Button
                        type="submit"
                        className="mt-2 h-12 w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all hover:from-primary/90 hover:to-secondary/90 hover:shadow-xl"
                        tabIndex={6}
                        disabled={processing || !data.terms}
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Création du compte...
                            </>
                        ) : (
                            'Créer mon compte gratuitement'
                        )}
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Déjà un compte ?{' '}
                    <TextLink href={route('login')} tabIndex={7} className="font-medium text-primary transition-colors hover:text-primary/80">
                        Se connecter
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
