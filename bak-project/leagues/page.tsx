'use client';

import { useState, useEffect } from 'react';
import { leagueService, League, LeagueParticipant } from '@/lib/api/leagues';
import Link from 'next/link';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      const [allData, myData] = await Promise.all([
        leagueService.getAll(),
        leagueService.getMyLeagues()
      ]);
      
      setLeagues(allData.data || []);
      setMyLeagues(myData.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ligues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async (leagueId: number) => {
    try {
      await leagueService.join(leagueId);
      await loadLeagues(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'inscription à la ligue:', error);
    }
  };

  const handleLeaveLeague = async (leagueId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir quitter cette ligue ?')) return;
    
    try {
      await leagueService.leave(leagueId);
      await loadLeagues();
    } catch (error) {
      console.error('Erreur lors de la sortie de la ligue:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'À venir';
      case 'ended': return 'Terminée';
      default: return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return difficulty;
    }
  };

  const getCurrentLeagues = () => {
    return activeTab === 'my' ? myLeagues : leagues;
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ligues</h1>
        <p className="text-gray-600">Rejoignez des ligues et grimpez dans les classements</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{leagues.length}</div>
          <div className="text-gray-600">Ligues disponibles</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {leagues.filter(l => l.status === 'active').length}
          </div>
          <div className="text-gray-600">Ligues actives</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">{myLeagues.length}</div>
          <div className="text-gray-600">Mes ligues</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-orange-600">
            {leagues.reduce((sum, l) => sum + l.participants_count, 0)}
          </div>
          <div className="text-gray-600">Participants totaux</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Toutes les ligues ({leagues.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'my'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mes ligues ({myLeagues.length})
          </button>
        </div>
      </div>

      {/* Action de création */}
      <div className="mb-6 flex justify-end">
        <Link
          href="/leagues/create"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
        >
          Créer une ligue
        </Link>
      </div>

      {/* Liste des ligues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getCurrentLeagues().map((league) => (
          <div key={league.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{league.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(league.status || 'active')}`}>
                      {getStatusText(league.status || 'active')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(league.difficulty || 'beginner')}`}>
                      {getDifficultyText(league.difficulty || 'beginner')}
                    </span>
                    {league.is_private && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        Privée
                      </span>
                    )}
                  </div>
                </div>
                {league.prize_pool && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{league.prize_pool}€</div>
                    <div className="text-sm text-gray-600">Prix</div>
                  </div>
                )}
              </div>

              {league.description && (
                <p className="text-gray-600 mb-4">{league.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Participants:</span>
                  <div className="font-semibold">
                    {league.participants_count}
                    {league.max_participants && `/${league.max_participants}`}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Début:</span>
                  <div className="font-semibold">
                    {league.start_date ? new Date(league.start_date).toLocaleDateString() : 'Non défini'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Fin:</span>
                  <div className="font-semibold">
                    {league.end_date ? new Date(league.end_date).toLocaleDateString() : 'Non défini'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Créateur:</span>
                  <div className="font-semibold">{league.creator?.username || 'Inconnu'}</div>
                </div>
              </div>

              {/* Barre de progression des participants */}
              {league.max_participants && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Participants</span>
                    <span>{league.participants_count}/{league.max_participants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(league.participants_count / league.max_participants) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Règles de la ligue */}
              {league.rules && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Règles:</h4>
                  <p className="text-sm text-gray-600">{league.rules}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Link
                  href={`/leagues/${league.id}`}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center"
                >
                  Voir détails
                </Link>
                
                {activeTab === 'my' ? (
                  <>
                    <Link
                      href={`/leagues/${league.id}/leaderboard`}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center"
                    >
                      Classement
                    </Link>
                    <button
                      onClick={() => handleLeaveLeague(league.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Quitter
                    </button>
                  </>
                ) : (
                  <>
                    {league.status === 'active' && !league.is_private && (
                      <button
                        onClick={() => handleJoinLeague(league.id)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Rejoindre
                      </button>
                    )}
                    
                    {league.status === 'active' && (
                      <Link
                        href={`/leagues/${league.id}/leaderboard`}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Classement
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Informations supplémentaires pour les ligues privées */}
              {league.is_private && activeTab === 'all' && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center text-purple-700">
                    <span className="text-sm">🔒 Ligue privée - Invitation requise</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {getCurrentLeagues().length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {activeTab === 'my' ? 'Vous ne participez à aucune ligue' : 'Aucune ligue disponible'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'my' 
              ? 'Rejoignez une ligue pour commencer à concourir !' 
              : 'Les ligues seront bientôt disponibles !'}
          </p>
        </div>
      )}

      {/* Section d'aide */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Comment fonctionnent les ligues ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">1. Rejoignez une ligue</h3>
            <p className="text-blue-700">
              Choisissez une ligue qui correspond à votre niveau et à vos intérêts.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">2. Participez aux quiz</h3>
            <p className="text-blue-700">
              Jouez aux quiz pour gagner des points et grimper dans le classement.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">3. Gagnez des récompenses</h3>
            <p className="text-blue-700">
              Les meilleurs joueurs remportent des prix et des badges exclusifs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 