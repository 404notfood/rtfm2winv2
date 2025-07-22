'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User, isCreator, isAdmin } from '@/lib/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Navigation items
  const getNavigationItems = (user: User | null) => {
    const commonItems = [
      { name: 'Tableau de bord', path: '/dashboard', icon: '🏠' },
      { name: 'Explorer', path: '/quiz/search', icon: '🔍' },
      { name: 'Mes quiz', path: '/quiz/history', icon: '📊' },
      { name: 'Battle Royale', path: '/battle-royale', icon: '⚔️' },
      { name: 'Tournois', path: '/tournaments', icon: '🏆' },
      { name: 'Ligues', path: '/leagues', icon: '🏅' },
      { name: 'Classements', path: '/leaderboards', icon: '📈' },
      { name: 'Achievements', path: '/achievements', icon: '🎖️' },
      { name: 'Amis', path: '/friends', icon: '👥' },
      { name: 'Notifications', path: '/notifications', icon: '🔔' },
      { name: 'Sons', path: '/sounds', icon: '🔊' },
      { name: 'Thèmes', path: '/themes', icon: '🎨' },
      { name: 'Exports', path: '/exports', icon: '📤' },
      { name: 'Profil', path: '/dashboard/profile/settings', icon: '👤' },
    ];
    
    const creatorItems = [
      { name: 'Créer un quiz', path: '/quiz/create', icon: '✏️' },
    ];
    
    const adminItems = [
      { name: 'Admin Utilisateurs', path: '/admin/users', icon: '👥' },
      { name: 'Admin Thèmes', path: '/admin/themes', icon: '🎨' },
    ];
    
    let navigationItems = [...commonItems];
    
    if (user) {
      if (isCreator(user)) {
        navigationItems.splice(2, 0, ...creatorItems);
      }
      
      if (isAdmin(user)) {
        navigationItems = [...navigationItems, ...adminItems];
      }
    }
    
    return navigationItems;
  };

  useEffect(() => {
    // Simuler un utilisateur connecté
    const mockUser = {
      id: 1,
      username: 'Laurent',
      email: 'laurent@example.com',
      avatar: null,
      roles: [{ id: 2, name: 'super_admin' }],
      trophies_count: 5,
      achievement_points: 250
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const navigationItems = getNavigationItems(user);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-background text-foreground">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Header Sidebar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-primary">RTFM2WIN</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/20 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          )}
          
          {sidebarOpen && (
            <div className="mt-4 space-y-2">
              <ThemeSwitcher />
              <button
                onClick={handleLogout}
                className="w-full p-2 text-left text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quiz</h2>
              <p className="text-muted-foreground">Explorez et créez des quiz</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="text-right">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Super Admin
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}