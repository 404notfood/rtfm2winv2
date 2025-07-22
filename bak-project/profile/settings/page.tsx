'use client';

export default function ProfileSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Paramètres du Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow p-6 border">
          <h3 className="text-xl font-semibold mb-4">👤 Informations Personnelles</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom d'utilisateur</label>
              <input type="text" defaultValue="Laurent" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" defaultValue="laurent@example.com" className="w-full p-2 border rounded-lg" />
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border">
          <h3 className="text-xl font-semibold mb-4">🔒 Sécurité</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
              <input type="password" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
              <input type="password" className="w-full p-2 border rounded-lg" />
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 