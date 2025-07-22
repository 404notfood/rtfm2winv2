'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/index';
import AuthLayout from '../auth-layout';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  // Validation côté client pour l'inscription
  const validateRegisterForm = () => {
    // Vérification du mot de passe
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // Vérification de la confirmation du mot de passe
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    // Vérification de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    
    // Vérification du nom d'utilisateur
    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validation côté client
    if (!validateRegisterForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await api.post('register', formData);
      
      // Sauvegarder le token d'authentification
      localStorage.setItem('auth_token', response.access_token);
      
      // Rediriger vers la page d'accueil ou le tableau de bord
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Animation des champs du formulaire
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.1 + custom * 0.1 }
    })
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className={styles.authTitle}>Inscription</h1>
        <p className={styles.authSubtitle}>Créez votre compte RTFM2Win gratuitement</p>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <motion.div 
          className={styles.formGroup}
          custom={0}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label htmlFor="username" className={styles.formLabel}>Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Votre pseudo"
            required
          />
        </motion.div>

        <motion.div 
          className={styles.formGroup}
          custom={1}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
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
        </motion.div>

        <motion.div 
          className={styles.formGroup}
          custom={2}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
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
        </motion.div>

        <motion.div 
          className={styles.formGroup}
          custom={3}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label htmlFor="password_confirmation" className={styles.formLabel}>Confirmation du mot de passe</label>
          <input
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="••••••••"
            required
          />
        </motion.div>

        <motion.div
          custom={4}
          variants={formVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
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
                Inscription en cours...
              </>
            ) : 'S\'inscrire'}
          </RainbowButton>
        </motion.div>
        
        <motion.div 
          className={styles.authSwitchWrapper}
          custom={5}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <span>Vous avez déjà un compte ?</span>
          <Link href="/auth/login" className={styles.authSwitchLink}>
            Se connecter
          </Link>
        </motion.div>
        
        <motion.div 
          className="text-center mt-4"
          custom={6}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <Link href="/" className={styles.authBackLink}>
            Retour à l'accueil
          </Link>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
} 