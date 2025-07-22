'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  code: string;
  questions_count: number;
  created_at: string;
}

interface QuizSession {
  id: number;
  quiz: Quiz;
  score: number;
  completed_at: string;
  total_questions: number;
  correct_answers: number;
}

export default function QuizHistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [participatedQuizzes, setParticipatedQuizzes] = useState<QuizSession[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'participated'>('created');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    
    // Charger les données
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Charger les quiz créés par l'utilisateur
        const myQuizzesResponse = await api.get(API_ENDPOINTS.quiz.list);
        if (myQuizzesResponse.success && myQuizzesResponse.data) {
          setMyQuizzes(myQuizzesResponse.data.data || myQuizzesResponse.data);
        }
        
        // Charger les sessions de quiz auxquelles l'utilisateur a participé
        const sessionsResponse = await api.get(API_ENDPOINTS.sessions.list);
        if (sessionsResponse.success && sessionsResponse.data) {
          setParticipatedQuizzes(sessionsResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement de l\'historique');
        
        // Données de fallback
        const mockQuizzes = [
          {
            id: 1,
            title: 'Quiz JavaScript',
            description: 'Test de connaissances JavaScript',
            category: 'Programmation',
            status: 'active',
            code: 'JS001',
            questions_count: 10,
            created_at: '2023-10-15T10:30:00'
          }
        ];
        
        const mockSessions = [
          {
            id: 1,
            quiz: {
              id: 2,
              title: 'Quiz CSS',
              description: 'Test de connaissances CSS',
              category: 'Web Design',
              status: 'active',
              code: 'CSS001',
              questions_count: 8,
              created_at: '2023-10-10T14:20:00'
            },
            score: 85,
            completed_at: '2023-10-16T15:45:00',
            total_questions: 8,
            correct_answers: 7
          }
        ];
        
        setMyQuizzes(mockQuizzes);
        setParticipatedQuizzes(mockSessions);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  // Naviguer vers un quiz
  const navigateToQuiz = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  };
  
  // Naviguer vers la page de création de quiz
  const goToCreateQuiz = () => {
    router.push('/quiz/create');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 mb-8 relative overflow-hidden"
      >
        <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Mes Quiz</h1>
          <p className="text-gray-300">
            Gérez vos quiz créés et consultez votre historique de participation
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-4 py-3 rounded-xl flex-1 font-medium transition-colors ${
              activeTab === 'created'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Quiz créés
          </button>
          <button
            onClick={() => setActiveTab('participated')}
            className={`px-4 py-3 rounded-xl flex-1 font-medium transition-colors ${
              activeTab === 'participated'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Quiz joués
          </button>
        </div>
      </motion.div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeTab === 'created' ? (
        // Quiz créés par l'utilisateur
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Vos créations</h2>
            <button
              onClick={goToCreateQuiz}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
            >
              Créer un nouveau quiz
            </button>
          </div>
          
          {myQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateToQuiz(quiz.id)}
                  className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        quiz.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : quiz.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {quiz.status === 'active' ? 'Actif' : quiz.status === 'draft' ? 'Brouillon' : 'Archivé'}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                      {quiz.description || 'Aucune description'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                        Code: {quiz.code}
                      </div>
                      
                      {quiz.category && (
                        <div className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                          {quiz.category}
                        </div>
                      )}
                      
                      <div className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                        {quiz.questions_count} question{quiz.questions_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-xs">
                      Créé le {formatDate(quiz.created_at)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Vous n'avez pas encore créé de quiz</h3>
              <p className="text-gray-400 mb-6">
                Créez votre premier quiz et partagez-le avec vos amis !
              </p>
              
              <button
                onClick={goToCreateQuiz}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
              >
                Créer mon premier quiz
              </button>
            </div>
          )}
        </div>
      ) : (
        // Quiz auxquels l'utilisateur a participé
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Vos participations</h2>
          
          {participatedQuizzes.length > 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quiz</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {participatedQuizzes.map((session) => (
                    <tr 
                      key={session.id} 
                      className="hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => navigateToQuiz(session.quiz.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">{session.quiz.title}</div>
                        <div className="text-gray-400 text-xs">{session.quiz.category || 'Non catégorisé'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(session.completed_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-medium">{session.score} pts</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
                          {session.correct_answers} / {session.total_questions}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Vous n'avez pas encore participé à des quiz</h3>
              <p className="text-gray-400 mb-6">
                Explorez les quiz disponibles et testez vos connaissances !
              </p>
              
              <button
                onClick={() => router.push('/quiz/search')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
              >
                Explorer les quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 