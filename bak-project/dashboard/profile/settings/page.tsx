'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import ThemeSelector from '@/components/ThemeSelector';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  trophies_count?: number;
  achievement_points?: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Charger les données de l'utilisateur
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('user');
        
        if (response.success && response.data) {
          setUser(response.data);
          setFormData(prev => ({
            ...prev,
            username: response.data.username,
            email: response.data.email,
          }));
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement du profil:', error);
        // Si l'erreur est liée à l'authentification, rediriger vers la page de connexion
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      const response = await api.post('user/update-profile', {
        username: formData.username,
        email: formData.email,
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        // Mettre à jour les données utilisateur
        setUser(prev => prev ? { ...prev, username: formData.username, email: formData.email } : null);
      } else {
        setMessage({ type: 'error', text: response.message || 'Erreur lors de la mise à jour du profil' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de la mise à jour du profil'
      });
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    
    try {
      const response = await api.post('user/update-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
        // Réinitialiser les champs de mot de passe
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: '',
        }));
      } else {
        setMessage({ type: 'error', text: response.message || 'Erreur lors de la mise à jour du mot de passe' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de la mise à jour du mot de passe'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl"
    >
      <motion.h1 
        variants={itemVariants}
        className="text-primary text-3xl font-bold mb-6"
      >
        Paramètres du profil
      </motion.h1>
      
      {/* Message de notification */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-destructive/20 text-destructive'
          }`}
        >
          {message.text}
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar des onglets */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-primary/20 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="mr-2">👤</span>
                Profil
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-primary/20 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="mr-2">🔒</span>
                Sécurité
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'appearance' 
                    ? 'bg-primary/20 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="mr-2">🎨</span>
                Apparence
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {/* Contenu de l'onglet Profil */}
          {activeTab === 'profile' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-xl">
                <h2 className="text-xl font-medium mb-4">Informations personnelles</h2>
                
                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-muted-foreground mb-1">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-muted-foreground mb-1">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Enregistrer les modifications
                  </motion.button>
                </form>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-xl">
                <h2 className="text-xl font-medium mb-4">Photo de profil</h2>
                
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  
                  <div>
                    <motion.button
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors mb-2 block"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Changer la photo
                    </motion.button>
                    
                    <button className="text-muted-foreground hover:text-destructive text-sm">
                      Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Contenu de l'onglet Sécurité */}
          {activeTab === 'security' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-xl">
                <h2 className="text-xl font-medium mb-4">Changer de mot de passe</h2>
                
                <form onSubmit={updatePassword} className="space-y-4">
                  <div>
                    <label htmlFor="current_password" className="block text-muted-foreground mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      id="current_password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="new_password" className="block text-muted-foreground mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm_password" className="block text-muted-foreground mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Mettre à jour le mot de passe
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
          
          {/* Contenu de l'onglet Apparence */}
          {activeTab === 'appearance' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-xl">
                <h2 className="text-xl font-medium mb-4">Thème de l'interface</h2>
                <p className="text-muted-foreground mb-4">
                  Personnalisez l'apparence de l'application en choisissant un thème qui vous convient.
                </p>
                
                <ThemeSelector />
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
} 