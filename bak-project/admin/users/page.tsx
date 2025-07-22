'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';
import { User, isAdmin, Role } from '@/lib/types';
import UserRoleBadge from '@/components/Profile/UserRoleBadge';

export default function AdminUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier l'authentification et les permissions
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Charger le profil de l'utilisateur courant
        const userResponse = await api.get('user');
        if (userResponse.success && userResponse.data) {
          setCurrentUser(userResponse.data);
          
          // Vérifier si l'utilisateur est admin
          if (!isAdmin(userResponse.data)) {
            router.push('/dashboard');
            return;
          }
          
          // Charger la liste des utilisateurs
          const usersResponse = await api.get('admin/users');
          if (usersResponse.success && usersResponse.data) {
            setUsers(usersResponse.data);
          }
          
          // Charger la liste des rôles
          const rolesResponse = await api.get('admin/roles');
          if (rolesResponse.success && rolesResponse.data) {
            setRoles(rolesResponse.data);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        setErrorMessage(error.message || 'Une erreur est survenue lors du chargement des données');
        
        // Rediriger si non autorisé
        if (error.status === 401 || error.status === 403) {
          router.push('/dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const response = await api.post(`admin/users/${userId}/roles`, { role_id: roleId });
      
      if (response.success) {
        setSuccessMessage('Rôle attribué avec succès');
        
        // Mettre à jour la liste des utilisateurs
        const updatedUsers = users.map(user => {
          if (user.id === userId) {
            const role = roles.find(r => r.id === roleId);
            if (role && user.roles) {
              // Vérifier si l'utilisateur a déjà ce rôle
              if (!user.roles.some(r => r.id === roleId)) {
                return {
                  ...user,
                  roles: [...user.roles, role]
                };
              }
            } else if (role) {
              return {
                ...user,
                roles: [role]
              };
            }
          }
          return user;
        });
        
        setUsers(updatedUsers);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'attribution du rôle:', error);
      setErrorMessage(error.message || 'Une erreur est survenue lors de l\'attribution du rôle');
    }
  };

  const handleRemoveRole = async (userId: number, roleId: number) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const response = await api.delete(`admin/users/${userId}/roles/${roleId}`);
      
      if (response.success) {
        setSuccessMessage('Rôle retiré avec succès');
        
        // Mettre à jour la liste des utilisateurs
        const updatedUsers = users.map(user => {
          if (user.id === userId && user.roles) {
            return {
              ...user,
              roles: user.roles.filter(role => role.id !== roleId)
            };
          }
          return user;
        });
        
        setUsers(updatedUsers);
      }
    } catch (error: any) {
      console.error('Erreur lors du retrait du rôle:', error);
      setErrorMessage(error.message || 'Une erreur est survenue lors du retrait du rôle');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 mb-8 relative overflow-hidden"
      >
        <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des utilisateurs</h1>
        <p className="text-gray-300">
          Gérez les utilisateurs et leurs rôles dans l'application
        </p>
      </motion.div>
      
      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 text-white p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rôles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-white/10 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="h-8 w-8 rounded-full" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-sm font-medium text-white">{user.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map(role => (
                        <UserRoleBadge key={role.id} role={role} size="sm" />
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">Aucun rôle</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-white/10 border border-white/20 rounded-lg text-white py-1 px-2 text-sm"
                      onChange={(e) => {
                        const roleId = parseInt(e.target.value);
                        if (roleId > 0) {
                          handleAssignRole(user.id, roleId);
                          e.target.value = ""; // Réinitialiser le select
                        }
                      }}
                    >
                      <option value="">Ajouter un rôle</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    
                    {user.roles && user.roles.length > 0 && (
                      <select 
                        className="bg-white/10 border border-white/20 rounded-lg text-white py-1 px-2 text-sm"
                        onChange={(e) => {
                          const roleId = parseInt(e.target.value);
                          if (roleId > 0) {
                            handleRemoveRole(user.id, roleId);
                            e.target.value = ""; // Réinitialiser le select
                          }
                        }}
                      >
                        <option value="">Retirer un rôle</option>
                        {user.roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 