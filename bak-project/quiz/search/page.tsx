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
  creator: {
    id: number;
    username: string;
    avatar: string;
  };
  questions_count: number;
  created_at: string;
}

export default function SearchQuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Charger les données initiales
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Charger les quizzes publics
        const quizzesResponse = await api.get(API_ENDPOINTS.quiz.public);
        if (quizzesResponse.success && quizzesResponse.data) {
          setQuizzes(quizzesResponse.data.data || quizzesResponse.data);
        }
        
        // Charger les quizzes en vedette
        const featuredResponse = await api.get(API_ENDPOINTS.quiz.featured);
        if (featuredResponse.success && featuredResponse.data) {
          setFeaturedQuizzes(featuredResponse.data);
        }
        
        // Charger les catégories
        const categoriesResponse = await api.get(API_ENDPOINTS.quiz.categories);
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des quiz');
        
        // Données de fallback en cas d'erreur
        const mockQuizzes = [
          {
            id: 1,
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of JavaScript basics',
            category: 'Programming',
            creator: { id: 1, username: 'CodeMaster', avatar: '' },
            questions_count: 15,
            created_at: '2023-10-15T10:30:00'
          },
          {
            id: 2,
            title: 'CSS Advanced Techniques',
            description: 'Master advanced CSS concepts',
            category: 'Web Design',
            creator: { id: 2, username: 'DesignPro', avatar: '' },
            questions_count: 12,
            created_at: '2023-10-10T14:20:00'
          }
        ];
        
        setQuizzes(mockQuizzes);
        setFeaturedQuizzes(mockQuizzes.slice(0, 1));
        setCategories(['Programming', 'Web Design', 'Science', 'History']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtrer les quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = searchTerm === '' || 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || quiz.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Naviguer vers un quiz
  const navigateToQuiz = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
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
          <h1 className="text-3xl font-bold text-white mb-2">Explorer les Quiz</h1>
          <p className="text-gray-300">
            Découvrez des quiz variés et testez vos connaissances
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="search" className="block text-white mb-2">
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Rechercher un quiz..."
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-white mb-2">
              Catégorie
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* Quiz en vedette */}
      {featuredQuizzes.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">Quiz en vedette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateToQuiz(quiz.id)}
                className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-xl cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                    <div className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      En vedette
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                    {quiz.description || 'Aucune description'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-2">
                        {quiz.creator?.avatar ? (
                          <img src={quiz.creator.avatar} alt={quiz.creator.username} className="w-8 h-8 rounded-full" />
                        ) : (
                          quiz.creator?.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-gray-300 text-sm">{quiz.creator?.username || 'Anonyme'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-300 text-xs">
                        {quiz.questions_count} question{quiz.questions_count !== 1 ? 's' : ''}
                      </div>
                      
                      {quiz.category && (
                        <div className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                          {quiz.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Résultats de recherche */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Tous les Quiz</h2>
          <div className="text-gray-400">
            {filteredQuizzes.length} résultat{filteredQuizzes.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateToQuiz(quiz.id)}
                className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer"
              >
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
                  
                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                    {quiz.description || 'Aucune description'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-2">
                        {quiz.creator?.avatar ? (
                          <img src={quiz.creator.avatar} alt={quiz.creator.username} className="w-8 h-8 rounded-full" />
                        ) : (
                          quiz.creator?.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-gray-300 text-sm">{quiz.creator?.username || 'Anonyme'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-300 text-xs">
                        {quiz.questions_count} question{quiz.questions_count !== 1 ? 's' : ''}
                      </div>
                      
                      {quiz.category && (
                        <div className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                          {quiz.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Aucun quiz trouvé</h3>
            <p className="text-gray-400">
              Essayez de modifier vos critères de recherche ou créez votre propre quiz !
            </p>
            
            <button
              onClick={() => router.push('/quiz/create')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
            >
              Créer un nouveau quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 