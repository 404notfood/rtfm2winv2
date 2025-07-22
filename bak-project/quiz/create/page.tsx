'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateQuizForm from '@/components/Quiz/CreateQuizForm';
import QuestionManager from '@/components/Quiz/QuestionManager';

export default function CreateQuizPage() {
  const router = useRouter();
  const [createdQuiz, setCreatedQuiz] = useState<any>(null);
  
  // Gérer le succès de la création du quiz
  const handleQuizCreated = (quiz: any) => {
    setCreatedQuiz(quiz);
  };
  
  // Gérer la finalisation du quiz
  const handleFinishQuiz = () => {
    router.push('/quiz/history');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Créer un Quiz</h1>
      
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Informations du Quiz</h2>
        
        {!createdQuiz ? (
          // Formulaire de création de quiz
          <CreateQuizForm onSuccess={handleQuizCreated} />
        ) : (
          // Gestionnaire de questions (uniquement pour les quiz manuels)
          <QuestionManager quiz={createdQuiz} onFinish={handleFinishQuiz} />
        )}
      </div>
    </div>
  );
}