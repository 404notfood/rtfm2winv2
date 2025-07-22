'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import PresentationCreator from '@/components/Quiz/PresentationCreator';

export default function PresentQuizPage() {
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
        
        if (!quizId) {
          setError('ID de quiz non spécifié');
          return;
        }
        
        const response = await api.get(`quizzes/${quizId}`);
        
        if (response.success && response.data) {
          setQuiz(response.data);
        } else {
          setError(response.message || 'Erreur lors du chargement du quiz');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizDetails();
  }, [quizId]);
  
  const handleCancel = () => {
    router.push(`/quiz/${quizId}`);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }
  
  // Vérifier si le quiz a des questions
  if (quiz.questions?.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-amber-500/20 border border-amber-500/50 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz incomplet</h2>
          <p className="mb-6">Ce quiz ne contient aucune question et ne peut pas être présenté.</p>
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
          >
            Retour au quiz
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PresentationCreator quiz={quiz} onCancel={handleCancel} />
    </div>
  );
} 