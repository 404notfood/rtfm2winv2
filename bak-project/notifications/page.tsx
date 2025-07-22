'use client';

import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/api/notifications';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'achievement' | 'friend_request' | 'quiz_invitation' | 'quiz_result' | 'system' | 'reminder';
  is_read: boolean;
  data?: any;
  created_at: string;
  read_at?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [allData, unreadData] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnread()
      ]);
      
      setNotifications(allData.data?.data || []);
      setUnreadNotifications(unreadData.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      await loadNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await notificationService.delete(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return '💬';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'achievement': return '🏆';
      case 'friend_request': return '👥';
      case 'quiz_invite': return '🎯';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'achievement': return 'border-purple-200 bg-purple-50';
      case 'friend_request': return 'border-indigo-200 bg-indigo-50';
      case 'quiz_invite': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getCurrentNotifications = () => {
    return activeTab === 'unread' ? unreadNotifications : notifications;
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Notifications</h1>
        <p className="text-gray-600">Restez informé de toutes vos activités</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
          <div className="text-gray-600">Total notifications</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">{unreadNotifications.length}</div>
          <div className="text-gray-600">Non lues</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {notifications.length - unreadNotifications.length}
          </div>
          <div className="text-gray-600">Lues</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'unread'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Non lues ({unreadNotifications.length})
          </button>
        </div>

        {/* Actions */}
        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Marquer toutes comme lues
          </button>
        )}
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {getCurrentNotifications().map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-lg p-6 ${
              notification.is_read ? 'bg-white border-gray-200' : getNotificationColor(notification.type)
            } ${!notification.is_read ? 'border-l-4' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    
                    <div className="flex space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Marquer comme lu
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions spécifiques selon le type */}
            {notification.type === 'friend_request' && notification.data && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                    Accepter
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                    Refuser
                  </button>
                </div>
              </div>
            )}

            {notification.type === 'quiz_invitation' && notification.data && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                    Rejoindre le quiz
                  </button>
                  <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">
                    Ignorer
                  </button>
                </div>
              </div>
            )}

            {notification.type === 'achievement' && notification.data && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <div className="font-semibold text-yellow-800">
                      Achievement débloqué: {notification.data.achievement_name}
                    </div>
                    <div className="text-sm text-yellow-600">
                      +{notification.data.points} points
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {getCurrentNotifications().length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'unread' 
              ? 'Toutes vos notifications ont été lues !' 
              : 'Vous recevrez ici toutes vos notifications.'}
          </p>
        </div>
      )}
    </div>
  );
} 