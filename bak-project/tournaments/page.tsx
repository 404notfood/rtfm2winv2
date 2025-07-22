'use client';

import { useState, useEffect } from 'react';
import { tournamentService, Tournament } from '@/lib/api/tournaments';
import Link from 'next/link';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'active' | 'my'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const [allData, upcomingData, activeData, myData] = await Promise.all([
        tournamentService.getAll(),
        tournamentService.getUpcoming(),
        tournamentService.getActive(),
        tournamentService.getMyTournaments()
      ]);
      
      setTournaments(allData.data?.data || []);
      setUpcomingTournaments(upcomingData.data || []);
      setActiveTournaments(activeData.data || []);
      setMyTournaments(myData.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tournois:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId: number) => {
    try {
      await tournamentService.register(tournamentId);
      await loadTournaments(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'registration': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'registration': return 'Inscriptions ouvertes';
      case 'active': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'single_elimination': return 'Élimination simple';
      case 'double_elimination': return 'Élimination double';
      case 'round_robin': return 'Round Robin';
      case 'swiss': return 'Système suisse';
      default: return type;
    }
  };

  const getCurrentTournaments = () => {
    switch (activeTab) {
      case 'upcoming': return upcomingTournaments;
      case 'active': return activeTournaments;
      case 'my': return myTournaments;
      default: return tournaments;
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
        <h1 className="text-4xl font-bold text-foreground mb-4">Tournois</h1>
        <p className="text-muted-foreground">Participez aux tournois de programmation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Aucun tournoi actif</h3>
            <p className="text-muted-foreground mb-4">
              Les tournois arrivent bientôt ! Restez connecté pour ne rien manquer.
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Être notifié
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 