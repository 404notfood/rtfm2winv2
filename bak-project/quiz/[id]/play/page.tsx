'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';

interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  text: string;
  multiple_answers: boolean;
  answers: Answer[];
  points?: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  time_per_question: number;
}

export default function PlayQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<{questionId: number, selectedAnswers: number[], correct: boolean}[]>([]);
  
  // Récupérer les détails du quiz
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

  // Gérer le compte à rebours
  useEffect(() => {
    if (!gameStarted || !timeLeft) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Passer à la question suivante si le temps est écoulé
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Démarrer le jeu
  const startGame = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;
    
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setShowResults(false);
    
    // Définir le temps pour la première question
    const timePerQuestion = quiz.time_per_question || 30;
    setTimeLeft(timePerQuestion);
  };

  // Sélectionner une réponse
  const toggleAnswer = (answerId: number) => {
    if (!gameStarted) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    if (currentQuestion.multiple_answers) {
      // Pour les questions à choix multiples
      setSelectedAnswers(prev => {
        if (prev.includes(answerId)) {
          return prev.filter(id => id !== answerId);
        } else {
          return [...prev, answerId];
        }
      });
    } else {
      // Pour les questions à choix unique
      setSelectedAnswers([answerId]);
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    if (!quiz || !quiz.questions) return;
    
    // Enregistrer la réponse à la question actuelle
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    // Vérifier si la réponse est correcte
    let isCorrect = false;
    if (selectedAnswers.length > 0) {
      const correctAnswerIds = currentQuestion.answers
        .filter((a: any) => a.is_correct)
        .map((a: any) => a.id);
      
      // Pour une question à choix multiples, toutes les bonnes réponses doivent être sélectionnées
      // et aucune mauvaise réponse ne doit être sélectionnée
      if (currentQuestion.multiple_answers) {
        const allCorrectSelected = correctAnswerIds.every((id: number) => selectedAnswers.includes(id));
        const noIncorrectSelected = selectedAnswers.every(id => correctAnswerIds.includes(id));
        isCorrect = allCorrectSelected && noIncorrectSelected;
      } else {
        // Pour une question à choix unique, la réponse sélectionnée doit être correcte
        isCorrect = correctAnswerIds.includes(selectedAnswers[0]);
      }
    }
    
    // Ajouter des points au score si la réponse est correcte
    if (isCorrect) {
      const questionPoints = currentQuestion.points || 1000;
      setScore(prev => prev + questionPoints);
    }
    
    // Enregistrer la réponse
    setAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedAnswers,
        correct: isCorrect
      }
    ]);
    
    // Passer à la question suivante ou afficher les résultats
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      
      // Définir le temps pour la nouvelle question
      const timePerQuestion = quiz.time_per_question || 30;
      setTimeLeft(timePerQuestion);
    } else {
      // Fin du quiz
      setGameStarted(false);
      setShowResults(true);
    }
  };

  // Afficher le chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffff]"></div>
      </div>
    );
  }
  
  // Afficher les erreurs
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
  
  // Afficher l'écran de démarrage
  if (!gameStarted && !showResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black rounded-2xl p-6 shadow-2xl border border-[#333] mb-8 relative overflow-hidden"
        >
          <ShineBorder borderWidth={1} duration={14} shineColor={["#00ffff", "#00ffff", "#00ffff"]} />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#00ffff] mb-4">{quiz.title}</h1>
            <p className="text-gray-300 mb-6">{quiz.description}</p>
            
            <div className="flex justify-center space-x-6 text-gray-400">
              <div>
                <span className="text-[#00ffff] font-medium">{quiz.questions?.length || 0}</span> questions
              </div>
              <div>
                <span className="text-[#00ffff] font-medium">{quiz.time_per_question || 30}</span> secondes/question
              </div>
            </div>
          </div>
          
          <div className="mb-8 p-4 bg-black border border-[#333] rounded-lg">
            <h2 className="text-xl font-bold text-[#00ffff] mb-4 text-center">Instructions</h2>
            <ul className="text-gray-300 space-y-2">
              <li>• Répondez à toutes les questions dans le temps imparti</li>
              <li>• Les questions à choix multiples sont indiquées</li>
              <li>• Vous pouvez passer à la question suivante sans répondre</li>
              <li>• Votre score dépend de vos réponses correctes</li>
            </ul>
          </div>
          
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-black text-[#00ffff] border border-[#00ffff] font-medium rounded-xl hover:bg-[#00ffff]/10 focus:outline-none transition-all"
            >
              Commencer le Quiz
            </button>
          </div>
        </motion.div>
        
        <div className="text-center">
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="text-[#00ffff] hover:underline transition-all"
          >
            ← Retour au quiz
          </button>
        </div>
      </div>
    );
  }
  
  // Afficher les résultats
  if (showResults) {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = answers.filter(a => a.correct).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black rounded-2xl p-6 shadow-2xl border border-[#333] mb-8 relative overflow-hidden"
        >
          <ShineBorder borderWidth={1} duration={14} shineColor={["#00ffff", "#00ffff", "#00ffff"]} />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#00ffff] mb-2">Résultats</h1>
            <p className="text-gray-300">Vous avez terminé le quiz !</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black border border-[#333] rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-[#00ffff] mb-2">{score}</div>
              <div className="text-gray-400">Points</div>
            </div>
            
            <div className="bg-black border border-[#333] rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-[#00ffff] mb-2">{accuracy}%</div>
              <div className="text-gray-400">Précision</div>
            </div>
            
            <div className="bg-black border border-[#333] rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-[#00ffff] mb-2">{correctAnswers}</div>
              <div className="text-gray-400">Réponses correctes</div>
            </div>
            
            <div className="bg-black border border-[#333] rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-[#00ffff] mb-2">{totalQuestions - correctAnswers}</div>
              <div className="text-gray-400">Réponses incorrectes</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-black text-[#00ffff] border border-[#00ffff] font-medium rounded-xl hover:bg-[#00ffff]/10 focus:outline-none transition-all"
            >
              Rejouer
            </button>
            
            <button
              onClick={() => router.push(`/quiz/${quizId}`)}
              className="px-6 py-3 bg-black text-[#00ffff] border border-[#333] font-medium rounded-xl hover:bg-[#333]/20 focus:outline-none transition-all"
            >
              Retour au quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Afficher la question en cours
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="bg-black rounded-2xl p-6 shadow-2xl border border-[#333] mb-8 relative overflow-hidden"
      >
        <ShineBorder borderWidth={1} duration={14} shineColor={["#00ffff", "#00ffff", "#00ffff"]} />
        
        {/* En-tête de la question */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-black border border-[#333] px-3 py-1 rounded-lg">
            <span className="text-white font-medium">
              Question <span className="text-[#00ffff]">{currentQuestionIndex + 1}</span>/{quiz.questions.length}
            </span>
          </div>
          
          <div className="bg-black border border-[#333] px-3 py-1 rounded-lg">
            <span className="text-white font-medium">
              Score: <span className="text-[#00ffff]">{score}</span>
            </span>
          </div>
          
          <div className="bg-black border border-[#333] px-3 py-1 rounded-lg">
            <span className={`text-white font-medium ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
              Temps: <span className="text-[#00ffff]">{timeLeft}</span>
            </span>
          </div>
        </div>
        
        {/* Texte de la question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#00ffff] mb-4">
            {currentQuestion.question_text || currentQuestion.text}
          </h2>
          
          {currentQuestion.multiple_answers && (
            <div className="mb-4">
              <span className="inline-block bg-[#00ffff]/10 text-[#00ffff] px-3 py-1 rounded-full text-sm">
                Sélectionnez toutes les réponses correctes
              </span>
            </div>
          )}
        </div>
        
        {/* Liste des réponses */}
        <div className="space-y-4 mb-8">
          {currentQuestion.answers && currentQuestion.answers.map((answer: any, index: number) => (
            <button
              key={answer.id}
              onClick={() => toggleAnswer(answer.id)}
              className={`w-full p-4 rounded-xl border text-left flex items-center transition-all ${
                selectedAnswers.includes(answer.id) 
                  ? 'bg-[#00ffff]/20 border-[#00ffff] text-white' 
                  : 'bg-black border-[#333] text-white hover:bg-[#333]/20'
              }`}
            >
              <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold mr-3 ${
                selectedAnswers.includes(answer.id) 
                  ? 'bg-[#00ffff] text-black' 
                  : 'bg-[#333] text-white'
              }`}>
                {['A', 'B', 'C', 'D'][index]}
              </div>
              <span className="font-medium">{answer.answer_text || answer.text}</span>
            </button>
          ))}
        </div>
        
        {/* Bouton pour passer à la question suivante */}
        <div className="text-center">
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 bg-black text-[#00ffff] border border-[#00ffff] font-medium rounded-xl hover:bg-[#00ffff]/10 focus:outline-none transition-all"
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}