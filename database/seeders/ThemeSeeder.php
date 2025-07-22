<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ThemeSeeder extends Seeder
{
    /**
     * Exécute le seeder.
     */
    public function run(): void
    {
        // Désactiver temporairement les vérifications de clés étrangères
        Schema::disableForeignKeyConstraints();
        
        // Supprimer les thèmes existants au lieu d'utiliser truncate
        Theme::query()->delete();
        
        // Réactiver les vérifications de clés étrangères
        Schema::enableForeignKeyConstraints();
        
        // Tableau des thèmes à créer
        $themesData = [
            [
                'name' => 'Clair',
                'code' => 'light',
                'description' => 'Thème clair classique',
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Sombre',
                'code' => 'dark',
                'description' => 'Thème sombre par défaut',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Élégant',
                'code' => 'elegant',
                'description' => 'Thème élégant et sobre',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Néon',
                'code' => 'neon',
                'description' => 'Thème coloré et vibrant',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Pastel',
                'code' => 'pastel',
                'description' => 'Thème aux couleurs douces et pastel',
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Fun',
                'code' => 'fun',
                'description' => 'Thème amusant et coloré',
                'is_default' => false,
                'is_active' => true,
            ],
        ];
        
        // Créer les thèmes
        foreach ($themesData as $themeData) {
            Theme::create($themeData);
        }
        
        $this->command->info('Thèmes créés avec succès!');
    }
} 