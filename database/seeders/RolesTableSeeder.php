<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Définition des rôles par défaut du système
        $roles = [
            [
                'name' => 'player',
                'description' => 'Joueur standard, peut participer aux quiz et voir son profil',
                'permissions' => json_encode([
                    'quiz.participate',
                    'profile.view',
                    'profile.edit',
                    'achievements.view'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'creator',
                'description' => 'Créateur de quiz, peut créer et gérer ses propres quiz',
                'permissions' => json_encode([
                    'quiz.participate',
                    'quiz.create',
                    'quiz.edit',
                    'quiz.delete',
                    'profile.view',
                    'profile.edit',
                    'achievements.view'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'admin',
                'description' => 'Administrateur, peut gérer tous les aspects du système',
                'permissions' => json_encode([
                    'quiz.participate',
                    'quiz.create',
                    'quiz.edit',
                    'quiz.delete',
                    'quiz.manage_all',
                    'users.view',
                    'users.edit',
                    'users.delete',
                    'roles.assign',
                    'profile.view',
                    'profile.edit',
                    'achievements.view',
                    'achievements.assign',
                    'system.settings'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'super_admin',
                'description' => 'Super Administrateur, accès complet au système',
                'permissions' => json_encode([
                    'quiz.participate',
                    'quiz.create',
                    'quiz.edit',
                    'quiz.delete',
                    'quiz.manage_all',
                    'users.view',
                    'users.edit',
                    'users.delete',
                    'roles.assign',
                    'roles.manage',
                    'profile.view',
                    'profile.edit',
                    'achievements.view',
                    'achievements.assign',
                    'system.settings',
                    'system.advanced'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        // Insérer les rôles dans la base de données
        foreach ($roles as $role) {
            // Vérifier si le rôle existe déjà pour éviter les doublons
            if (!Role::where('name', $role['name'])->exists()) {
                Role::create($role);
            }
        }
    }
}
