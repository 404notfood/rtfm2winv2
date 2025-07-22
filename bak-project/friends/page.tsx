'use client';

import { useState, useEffect } from 'react';
import { friendService, Friend, FriendRequest, FriendSearchResult } from '@/lib/api/friends';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsData, pendingData, sentData] = await Promise.all([
        friendService.getAll(),
        friendService.getPendingRequests(),
        friendService.getSentRequests()
      ]);
      
      setFriends(friendsData.data || []);
      setPendingRequests(pendingData.data || []);
      setSentRequests(sentData.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await friendService.search(searchQuery);
      setSearchResults(results.data || []);
      setActiveTab('search');
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const handleSendRequest = async (userId: number) => {
    try {
      await friendService.sendRequest({ user_id: userId });
      await handleSearch(); // Rafraîchir les résultats
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await friendService.acceptRequest({ request_id: requestId });
      await loadFriendsData();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await friendService.rejectRequest({ request_id: requestId });
      await loadFriendsData();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) return;
    
    try {
      await friendService.remove(friendId);
      await loadFriendsData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mes Amis</h1>
        <p className="text-gray-600">Gérez vos amis et découvrez de nouveaux joueurs</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{friends.length}</div>
          <div className="text-gray-600">Amis</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">{pendingRequests.length}</div>
          <div className="text-gray-600">Demandes reçues</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">{sentRequests.length}</div>
          <div className="text-gray-600">Demandes envoyées</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'friends'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mes Amis ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Demandes ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'search'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recherche
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend) => (
            <div key={friend.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {friend.friend.avatar ? (
                    <img src={friend.friend.avatar} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {friend.friend.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{friend.friend.username}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      friend.friend.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    {friend.friend.is_online ? 'En ligne' : 'Hors ligne'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>Score total: {friend.friend.total_score}</div>
                <div>Rang global: #{friend.friend.global_rank}</div>
                <div>Badges: {friend.friend.badges_count}</div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                  Défier
                </button>
                <button 
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Demandes d'amitié reçues</h2>
          {pendingRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {request.sender.avatar ? (
                    <img src={request.sender.avatar} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {request.sender.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{request.sender.username}</h3>
                  <p className="text-gray-600 text-sm">
                    Demande envoyée le {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  {request.message && (
                    <p className="text-gray-700 text-sm mt-1">"{request.message}"</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleRejectRequest(request.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
          
          {pendingRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune demande d'amitié en attente</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-gray-600 text-sm">
                    {user.mutual_friends_count} ami(s) en commun
                  </p>
                </div>
              </div>
              <div>
                {user.is_friend ? (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded">
                    ✓ Ami
                  </span>
                ) : user.has_pending_request ? (
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded">
                    Demande envoyée
                  </span>
                ) : user.is_blocked ? (
                  <span className="px-4 py-2 bg-red-100 text-red-800 rounded">
                    Bloqué
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Ajouter
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {searchResults.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun utilisateur trouvé pour "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 