'use client';

import { useState, useEffect } from 'react';
import PresentationHost from '@/components/Quiz/PresentationHost';

const PresentationDemo = () => {
  // Simuler un sessionId pour la démo
  const sessionId = 'demo-session-123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Démonstration - Vue Présentateur
          </h1>
          <p className="text-gray-300">
            Interface de présentation avec salle d'attente modernisée
          </p>
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ Ceci est une démonstration. Les données sont simulées.
            </p>
          </div>
        </div>
        
        <PresentationHost sessionId={sessionId} />
      </div>
    </div>
  );
};

export default PresentationDemo; 