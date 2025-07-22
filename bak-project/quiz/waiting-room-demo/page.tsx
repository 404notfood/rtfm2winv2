'use client';

import { useState, useEffect } from 'react';
import WaitingRoom from '@/components/Quiz/WaitingRoom';
import ConnectionStatus from '@/components/Quiz/ConnectionStatus';

const WaitingRoomDemo = () => {
  const [players, setPlayers] = useState([
    {
      id: '1',
      name: 'Alice Martin',
      isHost: true,
      joinedAt: new Date(Date.now() - 30000).toISOString(),
      level: 15,
      badges: ['🏆', '⭐', '🔥']
    },
    {
      id: '2',
      name: 'Bob Dupont',
      isHost: false,
      joinedAt: new Date(Date.now() - 20000).toISOString(),
      level: 8,
      badges: ['⭐']
    }
  ]);

  const [isConnected, setIsConnected] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Simuler l'arrivée de nouveaux joueurs
  useEffect(() => {
    const interval = setInterval(() => {
      const newPlayerNames = [
        'Charlie Leroy', 'Diana Prince', 'Ethan Hunt', 'Fiona Shaw',
        'Gabriel Stone', 'Hannah Lee', 'Ivan Petrov', 'Julia Roberts'
      ];
      
      if (players.length < 6 && Math.random() > 0.7) {
        const randomName = newPlayerNames[Math.floor(Math.random() * newPlayerNames.length)];
        const newPlayer = {
          id: (players.length + 1).toString(),
          name: randomName,
          isHost: false,
          joinedAt: new Date().toISOString(),
          level: Math.floor(Math.random() * 20) + 1,
          badges: Math.random() > 0.5 ? ['⭐'] : []
        };
        
        setPlayers(prev => [...prev, newPlayer]);
        setLastUpdate(Date.now());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [players.length]);

  // Simuler les changements d'état de connexion
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
      
      // Simuler parfois une perte de connexion
      if (Math.random() > 0.95) {
        setIsConnected(false);
        setIsPolling(false);
        setTimeout(() => {
          setIsConnected(true);
          setIsPolling(true);
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStartQuiz = () => {
    alert('🚀 Quiz démarré ! (Ceci est une démo)');
  };

  const quizUrl = 'https://quiz.example.com/join/ABC123';
  const quizCode = 'ABC123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ConnectionStatus
        isConnected={isConnected}
        isPolling={isPolling}
        lastUpdate={lastUpdate}
        error={!isConnected ? 'Connexion perdue' : null}
      />
      
      <WaitingRoom
        players={players}
        quizUrl={quizUrl}
        quizCode={quizCode}
        isHost={true}
        onStartQuiz={handleStartQuiz}
        quizTitle="Quiz de Démonstration"
        estimatedDuration={20}
        totalQuestions={15}
      />
      
      {/* Boutons de contrôle pour la démo */}
      <div className="fixed bottom-4 left-4 space-y-2">
        <button
          onClick={() => {
            const newPlayer = {
              id: (players.length + 1).toString(),
              name: `Joueur ${players.length + 1}`,
              isHost: false,
              joinedAt: new Date().toISOString(),
              level: Math.floor(Math.random() * 20) + 1,
              badges: ['⭐']
            };
            setPlayers(prev => [...prev, newPlayer]);
          }}
          className="block w-full px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/50 hover:bg-blue-500/30 transition-all text-sm"
        >
          + Ajouter un joueur
        </button>
        
        <button
          onClick={() => setPlayers(prev => prev.slice(0, -1))}
          className="block w-full px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/50 hover:bg-red-500/30 transition-all text-sm"
          disabled={players.length <= 1}
        >
          - Retirer un joueur
        </button>
        
        <button
          onClick={() => {
            setIsConnected(!isConnected);
            setIsPolling(!isPolling);
          }}
          className="block w-full px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/50 hover:bg-yellow-500/30 transition-all text-sm"
        >
          {isConnected ? 'Simuler déconnexion' : 'Reconnecter'}
        </button>
      </div>
    </div>
  );
};

export default WaitingRoomDemo; 