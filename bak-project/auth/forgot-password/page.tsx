'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/index';
import AuthLayout from '../auth-layout';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await api.post('password/email', { email });
      
      setSuccess('Un lien de réinitialisation de mot de passe a été envoyé à votre adresse email.');
      setEmail('');
    } catch (error: any) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      setError(error.message || 'Une erreur est survenue lors de la demande de réinitialisation');
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
      >
        <h1 className={styles.authTitle}>Mot de passe oublié</h1>
        <p className={styles.authSubtitle}>Entrez votre email pour réinitialiser votre mot de passe</p>
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
      
      {success && (
        <motion.div 
          className={`${styles.formError} bg-green-500/10 border-green-500/30 text-green-600`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {success}
        </motion.div>
      )}
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
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
            value={email}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="votre@email.com"
            required
          />
        </div>
        
        <button
          type="submit"
          className={styles.formButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" />
              </svg>
              Envoi en cours...
            </>
          ) : 'Envoyer le lien de réinitialisation'}
        </button>
        
        <div className={styles.authSwitchWrapper}>
          <span>Vous vous souvenez de votre mot de passe ?</span>
          <Link href="/auth/login" className={styles.authSwitchLink}>
            Se connecter
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