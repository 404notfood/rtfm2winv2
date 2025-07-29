<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class SetUserAsPresenter extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Mettre à jour tous les utilisateurs existants en tant que presenter
        // (pour le développement seulement)
        User::where('role', 'user')->update([
            'role' => 'presenter',
            'can_be_presenter' => true
        ]);

        // Créer un utilisateur admin de test si aucun n'existe
        if (!User::where('role', 'admin')->exists()) {
            User::create([
                'name' => 'Admin Test',
                'email' => 'admin@rtfm2win.test',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'can_be_presenter' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Créer un utilisateur presenter de test si aucun n'existe
        if (!User::where('role', 'presenter')->exists()) {
            User::create([
                'name' => 'Presenter Test',
                'email' => 'presenter@rtfm2win.test',
                'password' => bcrypt('password'),
                'role' => 'presenter',
                'can_be_presenter' => true,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Utilisateurs mis à jour avec le rôle presenter.');
    }
} 