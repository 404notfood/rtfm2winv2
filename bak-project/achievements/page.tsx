'use client';

import { useState, useEffect } from 'react';
import { achievementService, Achievement, UserAchievement } from '@/lib/api/achievements';

export default function AchievementsPage() {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [userAchievementsData, categoriesData] = await Promise.all([
        achievementService.getUserAchievements(),
        achievementService.getCategories()
      ]);
      
      setUserAchievements(userAchievementsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievementsByCategory = async (category: string) => {
    try {
      if (category === 'all') {
        const data = await achievementService.getAll();
        setAllAchievements(data.data || []);
      } else {
        const data = await achievementService.getByCategory(category);
        setAllAchievements(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des achievements par catégorie:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    loadAchievementsByCategory(category);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mes Achievements</h1>
        <p className="text-gray-600">Découvrez vos accomplissements et débloquez de nouveaux défis</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{userAchievements.length}</div>
          <div className="text-gray-600">Achievements obtenus</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {userAchievements.filter(a => a.is_completed).length}
          </div>
          <div className="text-gray-600">Complétés</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {userAchievements.reduce((sum, a) => sum + a.achievement.points, 0)}
          </div>
          <div className="text-gray-600">Points totaux</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
          <div className="text-gray-600">Catégories</div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Toutes
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userAchievements.map((userAchievement) => (
          <div
            key={userAchievement.id}
            className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
              userAchievement.is_completed
                ? 'border-green-500'
                : 'border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-3">{userAchievement.achievement.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{userAchievement.achievement.name}</h3>
                  <p className="text-sm text-gray-600">{userAchievement.achievement.category}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${
                userAchievement.achievement.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                userAchievement.achievement.rarity === 'epic' ? 'bg-orange-100 text-orange-800' :
                userAchievement.achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {userAchievement.achievement.rarity}
              </div>
            </div>

            <p className="text-gray-700 mb-4">{userAchievement.achievement.description}</p>

            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression</span>
                <span>{userAchievement.progress}/{userAchievement.max_progress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    userAchievement.is_completed ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${(userAchievement.progress / userAchievement.max_progress) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {userAchievement.achievement.points} points
              </div>
              {userAchievement.is_completed && (
                <div className="text-sm text-green-600 font-semibold">
                  ✓ Complété
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {userAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun achievement pour le moment</h3>
          <p className="text-gray-500">Commencez à jouer aux quiz pour débloquer vos premiers achievements !</p>
        </div>
      )}
    </div>
  );
} 