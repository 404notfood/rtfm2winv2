'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  // Validation côté client pour l'inscription
  const validateRegisterForm = () => {
    // Vérification du mot de passe
    if (registerData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // Vérification de la confirmation du mot de passe
    if (registerData.password !== registerData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    // Vérification de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    // Vérification du nom d'utilisateur
    if (registerData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return false;
    }

    return true;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('login', loginData);
      
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
        localStorage.setItem('auth_token', token);
        console.log('Token sauvegardé:', token.substring(0, 10) + '...');
        
        // Rediriger vers la page d'accueil ou le tableau de bord
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
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validation côté client
    if (!validateRegisterForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await api.post('register', registerData);
      
      // Déboguer la structure de la réponse
      console.log('Structure de la réponse register:', response);
      
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
        localStorage.setItem('auth_token', token);
        console.log('Token sauvegardé:', token.substring(0, 10) + '...');
        
        // Rediriger vers la page d'accueil ou le tableau de bord
        router.push('/dashboard');
      } else {
        console.error('Token introuvable dans la réponse:', response);
        setError('Format de réponse inattendu: token introuvable');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
            
            {/* Onglets de navigation */}
            <div className="flex mb-6 border-b border-white/10">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Inscription
              </button>
            </div>

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

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                        placeholder="Email"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        placeholder="Mot de passe"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </motion.div>

                    <motion.button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 mt-6"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connexion en cours...
                        </div>
                      ) : 'Se connecter'}
                    </motion.button>
                  </form>

                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => router.push('/auth/forgot-password')}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <input
                        type="text"
                        name="username"
                        value={registerData.username}
                        onChange={handleRegisterInputChange}
                        placeholder="Nom d'utilisateur"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterInputChange}
                        placeholder="Email"
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
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterInputChange}
                        placeholder="Mot de passe"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <input
                        type="password"
                        name="password_confirmation"
                        value={registerData.password_confirmation}
                        onChange={handleRegisterInputChange}
                        placeholder="Confirmez le mot de passe"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </motion.div>

                    <motion.button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 mt-6"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Inscription en cours...
                        </div>
                      ) : 'S\'inscrire'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Retour à l'accueil
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 