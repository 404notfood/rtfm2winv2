'use client';

import { useState, useEffect } from 'react';
import { leaderboardService, LeaderboardEntry } from '@/lib/api/leaderboards';

export default function LeaderboardsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('global');
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'global', name: 'Global' },
    { id: 'science', name: 'Science' },
    { id: 'history', name: 'Histoire' },
    { id: 'sports', name: 'Sports' },
    { id: 'culture', name: 'Culture' },
    { id: 'technology', name: 'Technologie' }
  ];

  useEffect(() => {
    loadLeaderboards();
  }, [selectedCategory]);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);
      const [leaderboardData, friendsData, statsData] = await Promise.all([
        selectedCategory === 'global' 
          ? leaderboardService.getGlobal()
          : leaderboardService.getByCategory(selectedCategory),
        leaderboardService.getFriends(),
        leaderboardService.getUserStats()
      ]);
      
      setLeaderboard(leaderboardData.data?.entries || []);
      setFriendsLeaderboard(friendsData.data?.entries || []);
      setUserStats(statsData.data || null);
    } catch (error) {
      console.error('Erreur lors du chargement des classements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
        <h1 className="text-4xl font-bold text-foreground mb-4">Classements</h1>
        <p className="text-muted-foreground">Découvrez les meilleurs développeurs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow p-6 border">
          <h3 className="text-xl font-semibold mb-4">🥇 Top Global</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🥇</span>
                <span className="font-medium">Laurent</span>
              </div>
              <span className="text-primary font-bold">2500 pts</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🥈</span>
                <span className="font-medium">DevMaster</span>
              </div>
              <span className="text-primary font-bold">2300 pts</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🥉</span>
                <span className="font-medium">CodeNinja</span>
              </div>
              <span className="text-primary font-bold">2100 pts</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border">
          <h3 className="text-xl font-semibold mb-4">📊 Cette semaine</h3>
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-muted-foreground">
              Classement hebdomadaire en cours de calcul...
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border">
          <h3 className="text-xl font-semibold mb-4">🏆 Ce mois</h3>
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-muted-foreground">
              Classement mensuel en cours de calcul...
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques utilisateur */}
      {userStats && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Vos Statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{userStats.global_rank || 'N/A'}</div>
              <div className="text-blue-100">Rang Global</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{userStats.total_score || 0}</div>
              <div className="text-blue-100">Score Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{userStats.games_played || 0}</div>
              <div className="text-blue-100">Parties Jouées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{userStats.average_score || 0}%</div>
              <div className="text-blue-100">Score Moyen</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'global'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Classement Global
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'friends'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mes Amis
          </button>
        </div>
      </div>

      {/* Podium pour le top 3 */}
      {activeTab === 'global' && leaderboard.length >= 3 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">🏆 Podium</h2>
          <div className="flex justify-center items-end space-x-4">
            {/* 2ème place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                {leaderboard[1]?.avatar ? (
                  <img src={leaderboard[1].avatar} alt="" className="w-20 h-20 rounded-full" />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {leaderboard[1]?.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-4xl mb-2">🥈</div>
              <div className="font-semibold">{leaderboard[1]?.username}</div>
              <div className="text-gray-600">{leaderboard[1]?.score} pts</div>
              <div className="bg-gray-200 h-16 w-24 mx-auto mt-2 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-gray-600 font-bold">2</span>
              </div>
            </div>

            {/* 1ère place */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                {leaderboard[0]?.avatar ? (
                  <img src={leaderboard[0].avatar} alt="" className="w-24 h-24 rounded-full" />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {leaderboard[0]?.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-5xl mb-2">🥇</div>
              <div className="font-bold text-lg">{leaderboard[0]?.username}</div>
              <div className="text-gray-600 font-semibold">{leaderboard[0]?.score} pts</div>
              <div className="bg-yellow-300 h-20 w-28 mx-auto mt-2 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-yellow-800 font-bold">1</span>
              </div>
            </div>

            {/* 3ème place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                {leaderboard[2]?.avatar ? (
                  <img src={leaderboard[2].avatar} alt="" className="w-20 h-20 rounded-full" />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {leaderboard[2]?.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-4xl mb-2">🥉</div>
              <div className="font-semibold">{leaderboard[2]?.username}</div>
              <div className="text-gray-600">{leaderboard[2]?.score} pts</div>
              <div className="bg-orange-200 h-12 w-24 mx-auto mt-2 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-orange-800 font-bold">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste complète du classement */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {activeTab === 'global' ? 'Classement Global' : 'Classement de mes Amis'}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {(activeTab === 'global' ? leaderboard : friendsLeaderboard).map((entry, index) => (
            <div key={entry.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`text-2xl font-bold mr-4 w-12 text-center ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {entry.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{entry.username}</h3>
                  <div className="text-sm text-gray-600">
                    {entry.total_quizzes} parties • {entry.accuracy_percentage}% de moyenne
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{entry.score}</div>
                <div className="text-sm text-gray-600">points</div>
                {entry.badges_count > 0 && (
                  <div className="text-xs text-yellow-600">
                    🏅 {entry.badges_count} badges
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {(activeTab === 'global' ? leaderboard : friendsLeaderboard).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {activeTab === 'global' ? 'Aucun classement disponible' : 'Aucun ami dans le classement'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'global' 
                ? 'Le classement sera bientôt disponible !' 
                : 'Ajoutez des amis pour voir leur classement !'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 