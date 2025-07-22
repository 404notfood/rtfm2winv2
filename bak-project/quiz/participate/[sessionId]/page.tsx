'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { ShineBorder } from '@/components/magicui/shine-border';

type ParticipationState = 'loading' | 'waiting' | 'question' | 'results' | 'ended';

export default function ParticipateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [state, setState] = useState<ParticipationState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [results, setResults] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [participantInfo, setParticipantInfo] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  
  // Fonction pour récupérer l'état actuel de la session
  const fetchSessionState = useCallback(async () => {
    try {
      // Pour les participants anonymes, utiliser l'endpoint spécifique avec participant_id
      const participantData = localStorage.getItem('participant_session');
      let response;
      
      if (participantData) {
        const participant = JSON.parse(participantData);
        if (participant.session_id === sessionId) {
          // Utiliser l'endpoint spécifique pour les participants
          response = await api.get(`presentation/sessions/${sessionId}/participants/${participant.participant_id}`, { skipAuth: true });
        } else {
          // Session différente, utiliser l'endpoint général
          response = await api.get(`presentation/sessions/${sessionId}`, { skipAuth: true });
        }
      } else {
        // Pas de données de participant, utiliser l'endpoint général
        response = await api.get(`presentation/sessions/${sessionId}`, { skipAuth: true });
      }
      
      if (response.success && response.data) {
        setSession(response.data.session);
        
        // Gérer les informations du participant (peut être undefined pour les anonymes)
        if (response.data.participant) {
          setParticipantInfo(response.data.participant);
          setScore(response.data.participant.score || 0);
        } else {
          // Pour les utilisateurs anonymes sans participant_id
          setParticipantInfo(null);
          setScore(0);
        }
        
        if (response.data.session.status === 'pending') {
          setState('waiting');
        } else if (response.data.session.status === 'active') {
          if (response.data.current_question) {
            setCurrentQuestion(response.data.current_question);
            setState('question');
            
            // Vérifier si l'utilisateur a déjà répondu à cette question
            if (response.data.current_question.has_answered) {
              setHasAnswered(true);
            } else {
              setHasAnswered(false);
              // Réinitialiser les réponses sélectionnées pour une nouvelle question
              setSelectedAnswers([]);
              setStartTime(Date.now());
            }
          } else {
            setState('waiting');
          }
        } else if (response.data.session.status === 'completed') {
          setState('ended');
        }
      } else {
        setError(response.message || 'Erreur lors du chargement de la session');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la session');
    }
  }, [sessionId]);

  // Effet pour récupérer l'état initial
  useEffect(() => {
    fetchSessionState();
    
    // Établir une actualisation régulière seulement si nécessaire
    const interval = setInterval(() => {
      // Ne faire du polling que si on est en attente ou en question
      if (state === 'waiting' || state === 'question') {
        fetchSessionState();
      }
    }, 3000); // Toutes les 3 secondes (moins agressif)
    
    return () => clearInterval(interval);
  }, [fetchSessionState, state]); // Ajouter state comme dépendance

  // Arrêter le polling quand la session est terminée ou en erreur
  useEffect(() => {
    if (state === 'ended' || error) {
      // Le polling s'arrêtera automatiquement grâce à la condition dans setInterval
      console.log('🛑 Arrêt du polling - Session terminée ou erreur');
    }
  }, [state, error]);

  // Fonction pour gérer la sélection d'une réponse
  const toggleAnswer = (answerId: number) => {
    if (hasAnswered) return;
    
    setSelectedAnswers(prev => {
      // Pour les questions à choix unique, remplacer la sélection
      if (!currentQuestion.multiple_answers) {
        return [answerId];
      }
      
      // Pour les questions à choix multiples, ajouter/retirer de la sélection
      if (prev.includes(answerId)) {
        return prev.filter(id => id !== answerId);
      } else {
        return [...prev, answerId];
      }
    });
  };

  // Fonction pour soumettre la réponse
  const submitAnswer = async () => {
    if (selectedAnswers.length === 0 || hasAnswered) return;
    
    try {
      setHasAnswered(true);
      
      // Récupérer les données du participant depuis localStorage
      const participantData = localStorage.getItem('participant_session');
      if (!participantData) {
        setError('Informations de participant manquantes. Veuillez rejoindre à nouveau la session.');
        return;
      }
      
      const participant = JSON.parse(participantData);
      
      // Calculer le temps pris pour répondre (en dixièmes de seconde)
      const timeTaken = Math.floor((Date.now() - startTime) / 100);
      
      const response = await api.post(`presentation/sessions/${sessionId}/answer`, {
        answer_ids: selectedAnswers,
        time_taken: timeTaken,
        participant_id: participant.participant_id
      }, { skipAuth: true });
      
      if (response.success && response.data) {
        setResults(response.data);
        setState('results');
        setScore(response.data.total_score || score);
      } else {
        setError(response.message || 'Erreur lors de l\'envoi de la réponse');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la réponse');
      setHasAnswered(false);
    }
  };

  // Retourner à l'accueil
  const backToHome = () => {
    router.push('/quiz/search');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/50 text-white p-8 rounded-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={backToHome}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-[80vh]"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </motion.div>
        )}

        {state === 'waiting' && (
          <motion.div 
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative overflow-hidden">
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  En attente...
                </h1>
                <p className="text-gray-300">
                  Le présentateur va bientôt lancer la question suivante
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Votre score:</span>
                  <span className="text-2xl font-bold text-white">{score} pts</span>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 p-6 rounded-xl text-center">
                <div className="animate-pulse flex justify-center mb-4">
                  <div className="h-4 w-4 bg-indigo-500 rounded-full mx-1"></div>
                  <div className="h-4 w-4 bg-indigo-500 rounded-full mx-1 animation-delay-200"></div>
                  <div className="h-4 w-4 bg-indigo-500 rounded-full mx-1 animation-delay-400"></div>
                </div>
                <p className="text-indigo-300">
                  Restez prêt pour la prochaine question !
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'question' && currentQuestion && (
          <motion.div 
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 relative overflow-hidden">
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              
              <div className="flex justify-between items-center mb-6">
                <div className="bg-indigo-900/50 px-3 py-1 rounded-lg">
                  <span className="text-white font-medium">
                    Question {session?.question_index}/{session?.total_questions}
                  </span>
                </div>
                
                <div className="bg-indigo-900/50 px-3 py-1 rounded-lg">
                  <span className="text-white font-medium">
                    Score: {score} pts
                  </span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {currentQuestion.text}
              </h2>
              
              {currentQuestion.multiple_answers && (
                <div className="mb-4 text-center">
                  <span className="inline-block bg-purple-900/50 text-purple-300 px-4 py-1 rounded-full text-sm">
                    Sélectionnez plusieurs réponses
                  </span>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                {currentQuestion.answers && currentQuestion.answers.map((answer: any, index: number) => (
                  <button
                    key={answer.id}
                    onClick={() => toggleAnswer(answer.id)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-xl border transition-all flex items-start ${
                      selectedAnswers.includes(answer.id) 
                        ? 'bg-indigo-500/30 border-indigo-500/70 text-white' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    } ${hasAnswered ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold mr-3 ${
                      selectedAnswers.includes(answer.id) 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {['A', 'B', 'C', 'D'][index]}
                    </div>
                    <span className="font-medium text-left">{answer.answer_text}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={submitAnswer}
                  disabled={selectedAnswers.length === 0 || hasAnswered}
                  className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
                    selectedAnswers.length === 0 || hasAnswered ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {hasAnswered ? "Réponse envoyée" : "Valider ma réponse"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'results' && results && (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 relative overflow-hidden">
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {results.is_correct ? '✅ Correct !' : 
                   results.is_partially_correct ? '🟡 Partiellement correct' : '❌ Incorrect'}
                </h2>
                <p className="text-xl font-bold text-indigo-300">
                  +{results.points_earned} points
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Score total:</span>
                  <span className="text-2xl font-bold text-white">{results.total_score} pts</span>
                </div>
              </div>
              
              {results.correct_answers && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-xl font-bold text-white">Réponses correctes:</h3>
                  {results.correct_answers.map((answer: any) => (
                    <div key={answer.id} className="bg-green-500/20 border border-green-500/50 text-white p-4 rounded-lg">
                      <p className="font-medium mb-2">{answer.answer_text}</p>
                      {answer.explanation && (
                        <p className="text-sm text-gray-300">{answer.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-indigo-900/20 p-6 rounded-xl text-center">
                <p className="text-indigo-300">
                  Attendez la prochaine question...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'ended' && (
          <motion.div 
            key="ended"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative overflow-hidden">
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Quiz terminé !
                </h1>
                <p className="text-gray-300">
                  Merci d'avoir participé
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-8">
                <div className="text-center">
                  <p className="text-gray-300 mb-2">Votre score final</p>
                  <p className="text-4xl font-bold text-white">{score} pts</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={backToHome}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 