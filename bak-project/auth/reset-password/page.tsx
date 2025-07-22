'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';

// Composant qui utilise useSearchParams
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    token: ''
  });

  // Récupérer le token et l'email depuis l'URL
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      setFormData(prev => ({
        ...prev,
        token,
        email: decodeURIComponent(email)
      }));
    } else {
      setError('Token ou email manquant dans l\'URL. Veuillez utiliser le lien envoyé dans l\'email.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }
    
    try {
      await api.post('reset-password', formData);
      
      setSuccess('Votre mot de passe a été réinitialisé avec succès!');
      
      // Redirection vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (error: any) {
      console.error('Erreur de réinitialisation:', error);
      setError(error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe');
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

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative"
      >
        <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Réinitialisation du mot de passe</h2>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4"
          >
            {error.split('\n').map((line, i) => (
              <div key={i} className={i > 0 ? 'mt-1' : ''}>
                {line}
              </div>
            ))}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 text-white p-3 rounded-lg mb-4"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              readOnly
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 placeholder-gray-400 focus:outline-none transition-all duration-200 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1 ml-1">Email associé à votre compte</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nouveau mot de passe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleInputChange}
              placeholder="Confirmez le nouveau mot de passe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !!error}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Réinitialisation...
              </div>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => router.push('/auth')}
            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
          >
            Retour à la connexion
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Composant de fallback pour le Suspense
function LoadingFallback() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-white/10 rounded"></div>
            <div className="h-12 bg-white/10 rounded"></div>
            <div className="h-12 bg-white/10 rounded"></div>
            <div className="h-12 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal avec Suspense
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/img/logo4.png"
              alt="RTFM2Win Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              RTFM2Win
            </h1>
          </div>
        </motion.div>

        <Suspense fallback={<LoadingFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
} 