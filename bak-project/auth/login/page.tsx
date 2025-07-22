'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/index';
import AuthLayout from '../auth-layout';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('login', formData);
      
      // Déboguer la structure de la réponse
      console.log('Structure de la réponse login:', response);
      
      // Chercher le token d'authentification à différents endroits possibles de la réponse
      let token = null;
      if (response.access_token) {
        token = response.access_token;
      } else if (response.data && response.data.access_token) {
        token = response.data.access_token;
      } else if (response.token) {
        token = response.token;
      } else if (response.data && response.data.token) {
        token = response.data.token;
      }
      
      if (token) {
        // Sauvegarder le token d'authentification
        localStorage.setItem('auth_token', token);
        console.log('Token d\'authentification sauvegardé:', token.substring(0, 10) + '...');
        
        // Rediriger vers le tableau de bord
        router.push('/dashboard');
      } else {
        console.error('Token introuvable dans la réponse:', response);
        setError('Format de réponse inattendu: token introuvable');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-20"
      >
        <h1 className={styles.authTitle}>Connexion</h1>
        <p className={styles.authSubtitle}>Connectez-vous à votre compte RTFM2Win</p>
      </motion.div>
      
      {error && (
        <motion.div 
          className={styles.formError}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {error}
        </motion.div>
      )}
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4 relative z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="votre@email.com"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>Mot de passe</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className={styles.formHelp}>
          <Link href="/auth/forgot-password" className={styles.formHelpLink}>
            Mot de passe oublié ?
          </Link>
        </div>
        
        <RainbowButton
          type="submit"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" />
              </svg>
              Connexion en cours...
            </>
          ) : 'Se connecter'}
        </RainbowButton>
        
        <div className={styles.authSwitchWrapper}>
          <span>Vous n'avez pas de compte ?</span>
          <Link href="/auth/register" className={styles.authSwitchLink}>
            Inscrivez-vous
          </Link>
        </div>
        
        <div className="text-center mt-4">
          <Link href="/" className={styles.authBackLink}>
            Retour à l'accueil
          </Link>
        </div>
      </motion.form>
    </AuthLayout>
  );
} 