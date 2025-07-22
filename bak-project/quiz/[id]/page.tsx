'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Link from 'next/link';
import { Quiz, Question } from '@/lib/types';

export default function QuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!quizId) {
          setError('ID de quiz non spécifié');
          return;
        }
        
        // Utiliser l'endpoint défini pour récupérer un quiz par ID
        const response = await api.get(API_ENDPOINTS.quiz.byId(quizId as string));
        
        if (response.success && response.data) {
          setQuiz(response.data);
        } else {
          setError(response.message || 'Erreur lors du chargement du quiz');
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement du quiz:', err);
        setError(err.message || 'Erreur lors du chargement du quiz');
        
        // Données de fallback pour le développement
        const mockQuiz = {
          id: quizId,
          title: 'Quiz de démonstration',
          description: 'Ceci est un quiz de démonstration pour tester l\'interface',
          category: 'Général',
          code: 'DEMO123',
          creator: {
            id: 1,
            username: 'Créateur Demo'
          },
          creator_id: 1,
          current_user_id: 1,
          questions: [
            {
              id: 1,
              question_text: 'Quelle est la capitale de la France ?',
              multiple_answers: false,
              answers: [
                { id: 1, text: 'Paris', is_correct: true },
                { id: 2, text: 'Lyon', is_correct: false },
                { id: 3, text: 'Marseille', is_correct: false }
              ]
            },
            {
              id: 2,
              question_text: 'Quels sont les langages de programmation web ?',
              multiple_answers: true,
              answers: [
                { id: 4, text: 'JavaScript', is_correct: true },
                { id: 5, text: 'HTML', is_correct: true },
                { id: 6, text: 'CSS', is_correct: true },
                { id: 7, text: 'Python', is_correct: false }
              ]
            }
          ]
        };
        
        setQuiz(mockQuiz);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizDetails();
  }, [quizId]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffff]"></div>
      </div>
    );
  }
  
  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-500/20 border border-red-500/50 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p className="mb-6">{error || 'Quiz introuvable'}</p>
          <button
            onClick={() => router.push('/quiz/search')}
            className="px-6 py-3 bg-black text-[#00ffff] border border-[#00ffff] font-medium rounded-xl hover:bg-[#00ffff]/10 focus:outline-none transition-all"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }
  
  const handlePlay = () => {
    router.push(`/quiz/${quizId}/play`);
  };
  
  const handlePresent = () => {
    router.push(`/quiz/${quizId}/present`);
  };
  
  const handleEdit = () => {
    router.push(`/quiz/${quizId}/edit`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black rounded-2xl p-6 shadow-2xl border border-[#333] mb-8 relative overflow-hidden"
      >
        <ShineBorder borderWidth={1} duration={14} shineColor={["#00ffff", "#00ffff", "#00ffff"]} />
        
        {/* En-tête du quiz */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00ffff] mb-2">{quiz.title}</h1>
          
          <div className="flex items-center text-gray-400 mb-4">
            <span className="mr-4">
              <span className="text-[#00ffff]">{quiz.questions?.length || 0}</span> questions
            </span>
            <span className="mr-4">
              Catégorie: <span className="text-[#00ffff]">{quiz.category || 'Non classé'}</span>
            </span>
            <span>
              Créé par: <span className="text-[#00ffff]">{quiz.creator?.username || 'Anonyme'}</span>
            </span>
          </div>
          
          <p className="text-gray-300">{quiz.description || 'Aucune description disponible.'}</p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handlePlay}
            className="flex-1 px-6 py-3 bg-black text-[#00ffff] border border-[#00ffff] font-medium rounded-xl hover:bg-[#00ffff]/10 focus:outline-none transition-all"
          >
            🎮 Jouer 
          </button>
          
          <button
            onClick={handlePresent}
            className="flex-1 px-6 py-3 bg-black text-[#00ffff] border border-[#00ffff] font-medium rounded-xl hover:bg-[#00ffff]/10 focus:outline-none transition-all"
          >
            🎭 Présenter
          </button>
          
          {quiz.creator_id === (quiz.current_user_id || null) && (
            <button
              onClick={handleEdit}
              className="flex-1 px-6 py-3 bg-black text-[#00ffff] border border-[#00ffff] font-medium rounded-xl hover:bg-[#00ffff]/10 focus:outline-none transition-all"
            >
              ✏️ Modifier
            </button>
          )}
        </div>
        
        {/* Code de partage */}
        {quiz.code && (
          <div className="mb-8 p-4 bg-black border border-[#333] rounded-lg">
            <p className="text-gray-300 mb-2">Code de partage:</p>
            <div className="flex items-center gap-2">
              <span className="text-[#00ffff] font-mono text-2xl">{quiz.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(quiz.code);
                  alert('Code copié !');
                }}
                className="p-2 text-[#00ffff] hover:bg-[#00ffff]/10 rounded-lg"
              >
                📋
              </button>
              <Link
                href={`/quiz/join/${quiz.code}`}
                className="ml-auto p-2 text-[#00ffff] hover:bg-[#00ffff]/10 rounded-lg"
              >
                Lien d'invitation →
              </Link>
            </div>
          </div>
        )}
        
        {/* Liste des questions */}
        <div>
          <h2 className="text-xl font-bold text-[#00ffff] mb-4">Questions ({quiz.questions?.length || 0})</h2>
          
          {quiz.questions && quiz.questions.length > 0 ? (
            <div className="space-y-4">
              {quiz.questions.map((question: any, index: number) => (
                <div key={question.id} className="p-4 bg-black border border-[#333] rounded-lg">
                  <h3 className="font-medium text-white">
                    <span className="text-[#00ffff] mr-2">Q{index + 1}.</span> 
                    {question.question_text || question.text}
                  </h3>
                  
                  {question.multiple_answers && (
                    <span className="inline-block bg-[#00ffff]/10 text-[#00ffff] text-xs px-2 py-1 rounded-full ml-2">
                      Multiple
                    </span>
                  )}
                  
                  {quiz.creator_id === (quiz.current_user_id || null) && (
                    <div className="mt-2 pl-6">
                      <span className="text-gray-500 text-sm">
                        {question.answers?.length || 0} réponses disponibles
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune question dans ce quiz.</p>
          )}
        </div>
      </motion.div>
      
      {/* Bouton retour */}
      <div className="text-center">
        <button
          onClick={() => router.push('/quiz/search')}
          className="text-[#00ffff] hover:underline transition-all"
        >
          ← Retour à la recherche
        </button>
      </div>
    </div>
  );
} 