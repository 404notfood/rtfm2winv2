'use client';

export default function BattleRoyalePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Battle Royale</h1>
        <p className="text-muted-foreground">Affrontez d'autres développeurs en temps réel</p>
      </div>

      {/* Mode de jeu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="text-center">
            <div className="text-4xl mb-4">⚔️</div>
            <h3 className="text-lg font-semibold mb-2">Battle Royale Classique</h3>
            <p className="text-muted-foreground mb-4">
              100 joueurs, 1 seul survivant
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Rejoindre (Bientôt)
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="text-center">
            <div className="text-4xl mb-4">🏃‍♂️</div>
            <h3 className="text-lg font-semibold mb-2">Speed Battle</h3>
            <p className="text-muted-foreground mb-4">
              Parties rapides de 10 joueurs
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Rejoindre (Bientôt)
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">Team Battle</h3>
            <p className="text-muted-foreground mb-4">
              Équipes de 4 joueurs
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Rejoindre (Bientôt)
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-card rounded-lg shadow p-6 border">
        <h2 className="text-2xl font-semibold mb-4">Vos Statistiques Battle Royale</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">0</div>
            <div className="text-muted-foreground">Victoires</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-muted-foreground">Top 10</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-muted-foreground">Parties jouées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">0%</div>
            <div className="text-muted-foreground">Taux de victoire</div>
          </div>
        </div>
      </div>
    </div>
  );
} 