'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import CreateQuizForm from '@/components/Quiz/CreateQuizForm';
import QuestionManager from '@/components/Quiz/QuestionManager';

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  time_limit: number;
  questions_count: number;
  questions: Question[];
}

interface Question {
  id: number;
  text: string;
  time: number;
  points: number;
  multiple_answers: boolean;
  answers: Answer[];
}

interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
  explanation?: string;
}

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestions, setEditingQuestions] = useState(false);

  // Charger le quiz existant
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`quizzes/${quizId}`);
        if (response.success) {
          setQuiz(response.data);
        } else {
          setError('Quiz introuvable');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du quiz:', error);
        setError('Erreur lors du chargement du quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  // Gérer la mise à jour des informations du quiz
  const handleQuizUpdated = (updatedQuiz: any) => {
    setQuiz(updatedQuiz);
    setEditingQuestions(true);
  };

  // Gérer la finalisation de l'édition
  const handleFinishEditing = () => {
    router.push(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement du quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="mb-4">{error || 'Quiz introuvable'}</p>
          <button 
            onClick={() => router.push('/quiz/history')}
            className="btn btn-primary"
          >
            Retour à l'historique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Modifier le Quiz</h1>
        <p className="text-muted-foreground">
          Modifiez les informations et les questions de votre quiz
        </p>
      </div>

      <div className="card p-6">
        {!editingQuestions ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations du Quiz</h2>
            <CreateQuizForm 
              initialData={quiz}
              isEditing={true}
              onQuizCreated={handleQuizUpdated}
            />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Questions du Quiz</h2>
              <button
                onClick={() => setEditingQuestions(false)}
                className="btn btn-outline"
              >
                Modifier les infos du quiz
              </button>
            </div>
            <QuestionManager 
              quiz={quiz}
              onFinish={handleFinishEditing}
              isEditing={true}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => router.push(`/quiz/${quizId}`)}
          className="btn btn-outline"
        >
          Annuler
        </button>
        
        {quiz.questions_count > 0 && (
          <button
            onClick={() => setEditingQuestions(true)}
            className="btn btn-primary"
          >
            {editingQuestions ? 'Continuer l\'édition' : 'Modifier les questions'}
          </button>
        )}
      </div>
    </div>
  );
} 