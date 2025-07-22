'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { ShineBorder } from '@/components/magicui/shine-border';

export default function JoinQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [pseudo, setPseudo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  
  useEffect(() => {
    if (params.code) {
      setJoinCode(params.code as string);
    }
  }, [params]);
  
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode) {
      setError('Veuillez saisir un code de participation');
      return;
    }
    
    if (!pseudo || pseudo.trim().length < 2) {
      setError('Veuillez saisir un pseudo d\'au moins 2 caractères');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('presentation/join', {
        join_code: joinCode,
        pseudo: pseudo.trim()
      }, { skipAuth: true });
      
      if (response.success && response.data) {
        setSessionInfo(response.data);
        
        // Stocker les informations du participant dans le localStorage pour la session
        localStorage.setItem('participant_session', JSON.stringify({
          participant_id: response.data.participant.id,
          session_id: response.data.session.id,
          pseudo: response.data.participant.pseudo,
          is_anonymous: response.data.is_anonymous
        }));
        
        // Redirection vers la page de participation
        router.push(`/quiz/participate/${response.data.session.id}?participant=${response.data.participant.id}`);
      } else {
        setError(response.message || 'Erreur lors de la connexion à la session');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion à la session');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 w-full max-w-md relative overflow-hidden"
      >
        <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Rejoindre un Quiz</h1>
          <p className="text-gray-300">
            Entrez vos informations pour participer à la session
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="joinCode" className="block text-gray-300 text-sm font-medium mb-2">
              Code de participation
            </label>
            <input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Entrez le code à 6 caractères"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={6}
              disabled={isLoading || !!params.code}
            />
          </div>
          
          <div>
            <label htmlFor="pseudo" className="block text-gray-300 text-sm font-medium mb-2">
              Pseudo (obligatoire)
            </label>
            <input
              id="pseudo"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Comment souhaitez-vous être appelé?"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !joinCode}
            className={`w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
              isLoading || !joinCode ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              "Rejoindre le Quiz"
            )}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/quiz/search')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}