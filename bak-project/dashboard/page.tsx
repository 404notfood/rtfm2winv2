'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { APP_CONFIG } from '@/lib/config';
import { MockDataService } from '@/lib/mockData';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  trophies_count?: number;
  achievement_points?: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  questions_count: number;
  category?: string;
}

interface Trophy {
  id: number;
  name: string;
  description: string;
  icon?: string;
  awarded_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [recentTrophies, setRecentTrophies] = useState<Trophy[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Utiliser les données mockées en mode développement
        if (APP_CONFIG.DEV_MODE && APP_CONFIG.DISABLE_API_CALLS) {
          const [userResponse, quizzesResponse, trophiesResponse] = await Promise.all([
            MockDataService.getUser(),
            MockDataService.getRecentQuizzes(),
            MockDataService.getRecentTrophies()
          ]);

          setUser(userResponse.data);
          setRecentQuizzes(quizzesResponse.data.slice(0, 5));
          setRecentTrophies(trophiesResponse.data.slice(0, 3));
          return;
        }

        // Récupérer les informations de l'utilisateur
        const userResponse = await api.get(API_ENDPOINTS.auth.user);
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }

        // Récupérer les quiz récents de l'utilisateur
        const quizzesResponse = await api.get(API_ENDPOINTS.quiz.recent);
        if (quizzesResponse.success && quizzesResponse.data) {
          setRecentQuizzes(quizzesResponse.data.slice(0, 5)); // Limiter à 5 quiz récents
        }

        // Récupérer les trophées récents
        const trophiesResponse = await api.get(API_ENDPOINTS.achievements.recent);
        if (trophiesResponse.success && trophiesResponse.data) {
          setRecentTrophies(trophiesResponse.data.slice(0, 3)); // Limiter à 3 trophées récents
        }

      } catch (error) {
        console.warn('API non disponible, utilisation des données mockées:', error);
        setError(null); // Pas d'erreur en mode développement
        
        // Fallback avec des données mockées en cas d'erreur
        const mockUser = {
          id: 1,
          username: 'Laurent',
          email: 'laurent@example.com',
          avatar: null,
          trophies_count: 5,
          achievement_points: 250
        };

        const mockQuizzes = [
          {
            id: 1,
            title: 'Les bases de JavaScript',
            created_at: '2023-10-15T10:30:00',
            questions_count: 10
          },
          {
            id: 2,
            title: 'CSS avancé',
            created_at: '2023-10-10T14:20:00',
            questions_count: 8
          },
          {
            id: 3,
            title: 'React pour débutants',
            created_at: '2023-10-05T09:15:00',
            questions_count: 12
          }
        ];

        const mockTrophies = [
          {
            id: 1,
            name: 'Premier Quiz',
            description: 'Vous avez terminé votre premier quiz'
          },
          {
            id: 2,
            name: 'Maître du JavaScript',
            description: 'Score parfait dans un quiz JavaScript'
          }
        ];

        setUser(mockUser);
        setRecentQuizzes(mockQuizzes);
        setRecentTrophies(mockTrophies);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderTop: '2px solid var(--primary-color)', 
          borderBottom: '2px solid var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <div style={{ 
          color: 'var(--error-color)', 
          fontSize: '1.125rem',
          marginBottom: '16px'
        }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête de bienvenue */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: 'var(--primary-color)', 
          fontSize: '1.875rem', 
          fontWeight: 'bold',
          marginBottom: '8px' 
        }}>
          Bienvenue, {user?.username || 'Laurent'} !
        </h1>
        <p style={{ color: 'var(--muted-color)' }}>
          Que souhaitez-vous faire aujourd'hui ?
        </p>
      </div>

      {/* Boutons d'action rapide */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px',
        marginBottom: '24px'
      }}>
        <button 
          onClick={() => router.push('/quiz/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            border: '1px solid var(--primary-color)',
            color: 'var(--primary-color)',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          <span style={{ marginRight: '8px', fontSize: '1.125rem' }}>✏️</span>
          Créer un quiz
        </button>
        <button 
          onClick={() => router.push('/quiz/search')}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            border: '1px solid #0d9488',
            color: '#0d9488',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          <span style={{ marginRight: '8px', fontSize: '1.125rem' }}>🔍</span>
          Rejoindre un quiz
        </button>
      </div>

      {/* Contenu principal en deux colonnes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px'
      }}>
        {/* Colonne de gauche (2/3) */}
        <div style={{ gridColumn: 'span 2 / span 2' }}>
          {/* Quiz récents */}
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border-color)', 
            padding: '24px', 
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              color: 'var(--primary-color)', 
              fontSize: '1.25rem', 
              fontWeight: '500',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>📋</span>
              Quiz récents
            </h2>
            
            {recentQuizzes.length === 0 ? (
              <div style={{ 
                backgroundColor: 'rgba(243, 244, 246, 0.5)', 
                padding: '20px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: 'var(--muted-color)' }}>
                  Aucun quiz récent. C'est le moment d'en créer un !
                </p>
                <button
                  onClick={() => router.push('/quiz/create')}
                  style={{
                    marginTop: '12px',
                    color: 'var(--primary-color)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Créer mon premier quiz
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    style={{ 
                      padding: '12px', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'rgba(243, 244, 246, 0.1)', 
                      borderRadius: '8px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <h3 style={{ fontWeight: '500' }}>{quiz.title}</h3>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--muted-color)'
                      }}>
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      marginTop: '8px', 
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--muted-color)'
                      }}>
                        {quiz.questions_count || 0} questions
                      </span>
                      <Link 
                        href={`/quiz/${quiz.id}`}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--primary-color)',
                          textDecoration: 'none'
                        }}
                      >
                        Voir le détail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => router.push('/quiz/history')}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px 0',
                border: '1px solid var(--primary-color)',
                color: 'var(--primary-color)',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Voir tous mes quiz
            </button>
          </div>
        </div>

        {/* Colonne de droite (1/3) */}
        <div>
          {/* Statistiques en cartes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div 
              style={{
                padding: '20px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📊</div>
              <h2 style={{ 
                color: 'var(--muted-color)', 
                fontSize: '1rem', 
                fontWeight: '500' 
              }}>
                Quiz créés
              </h2>
              <p style={{ 
                color: 'var(--primary-color)', 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                marginTop: '8px'
              }}>
                {recentQuizzes.length || 0}
              </p>
            </div>
            
            <div 
              style={{
                padding: '20px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏆</div>
              <h2 style={{ 
                color: 'var(--muted-color)', 
                fontSize: '1rem', 
                fontWeight: '500' 
              }}>
                Trophées
              </h2>
              <p style={{ 
                color: 'var(--primary-color)', 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                marginTop: '8px'
              }}>
                {user?.trophies_count || 5}
              </p>
            </div>
            
            <div 
              style={{
                padding: '20px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⭐</div>
              <h2 style={{ 
                color: 'var(--muted-color)', 
                fontSize: '1rem', 
                fontWeight: '500' 
              }}>
                Points
              </h2>
              <p style={{ 
                color: 'var(--primary-color)', 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                marginTop: '8px'
              }}>
                {user?.achievement_points || 250}
              </p>
            </div>
          </div>

          {/* Trophées récents */}
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border-color)', 
            padding: '24px', 
            borderRadius: '12px'
          }}>
            <h2 style={{ 
              color: 'var(--primary-color)', 
              fontSize: '1.25rem', 
              fontWeight: '500',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>🏆</span>
              Trophées récents
            </h2>
            
            {recentTrophies.length === 0 ? (
              <div style={{ 
                backgroundColor: 'rgba(243, 244, 246, 0.5)', 
                padding: '20px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: 'var(--muted-color)' }}>
                  Aucun trophée obtenu. Participez à des quiz pour en gagner !
                </p>
                <button
                  onClick={() => router.push('/quiz/search')}
                  style={{
                    marginTop: '12px',
                    color: 'var(--primary-color)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Trouver un quiz
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentTrophies.map((trophy) => (
                  <div 
                    key={trophy.id} 
                    style={{ 
                      padding: '12px', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'rgba(243, 244, 246, 0.1)', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>🏆</div>
                    <div>
                      <h3 style={{ fontWeight: '500' }}>{trophy.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--muted-color)' }}>{trophy.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => router.push('/profile/badges')}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px 0',
                border: '1px solid var(--primary-color)',
                color: 'var(--primary-color)',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Voir tous mes trophées
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 