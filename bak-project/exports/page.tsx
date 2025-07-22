'use client';

export default function ExportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Exports</h1>
        <p className="text-muted-foreground">Exportez vos données et statistiques</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Statistiques Quiz</h3>
            <p className="text-muted-foreground mb-4">
              Exportez vos résultats de quiz en CSV ou PDF
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Exporter
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Achievements</h3>
            <p className="text-muted-foreground mb-4">
              Exportez vos trophées et accomplissements
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Exporter
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Progression</h3>
            <p className="text-muted-foreground mb-4">
              Exportez votre progression et historique
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Exporter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 