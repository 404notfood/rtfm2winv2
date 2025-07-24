<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\League;

class LeagueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leagues = [
            [
                'name' => 'Bronze',
                'slug' => 'bronze',
                'description' => 'Ligue de départ pour tous les nouveaux joueurs',
                'min_points' => 0,
                'max_points' => 99,
                'color' => '#CD7F32',
                'icon' => 'bronze-medal',
                'benefits' => json_encode([
                    'basic_features' => true,
                    'daily_bonus' => 5,
                ]),
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Argent',
                'slug' => 'silver',
                'description' => 'Première promotion pour les joueurs réguliers',
                'min_points' => 100,
                'max_points' => 249,
                'color' => '#C0C0C0',
                'icon' => 'silver-medal',
                'benefits' => json_encode([
                    'basic_features' => true,
                    'daily_bonus' => 10,
                    'custom_themes' => true,
                ]),
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Or',
                'slug' => 'gold',
                'description' => 'Ligue dorée pour les joueurs expérimentés',
                'min_points' => 250,
                'max_points' => 499,
                'color' => '#FFD700',
                'icon' => 'gold-medal',
                'benefits' => json_encode([
                    'basic_features' => true,
                    'daily_bonus' => 20,
                    'custom_themes' => true,
                    'priority_support' => true,
                ]),
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Platine',
                'slug' => 'platinum',
                'description' => 'Ligue prestigieuse pour les experts',
                'min_points' => 500,
                'max_points' => 999,
                'color' => '#E5E4E2',
                'icon' => 'platinum-medal',
                'benefits' => json_encode([
                    'basic_features' => true,
                    'daily_bonus' => 35,
                    'custom_themes' => true,
                    'priority_support' => true,
                    'exclusive_tournaments' => true,
                ]),
                'order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Diamant',
                'slug' => 'diamond',
                'description' => 'Ligue d\'élite pour les maîtres du quiz',
                'min_points' => 1000,
                'max_points' => 1999,
                'color' => '#B9F2FF',
                'icon' => 'diamond',
                'benefits' => json_encode([
                    'basic_features' => true,
                    'daily_bonus' => 50,
                    'custom_themes' => true,
                    'priority_support' => true,
                    'exclusive_tournaments' => true,
                    'beta_features' => true,
                ]),
                'order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Maître',
                'slug' => 'master',
                'description' => 'Ligue légendaire pour les véritables champions',
                'min_points' => 2000,
                'max_points' => null,
                'color' => '#9966CC',
                'icon' => 'crown',
                'benefits' => json_encode([
                    'basic_features' => true,
                    'daily_bonus' => 100,
                    'custom_themes' => true,
                    'priority_support' => true,
                    'exclusive_tournaments' => true,
                    'beta_features' => true,
                    'vip_status' => true,
                    'special_badge' => true,
                ]),
                'order' => 6,
                'is_active' => true,
            ],
        ];

        foreach ($leagues as $leagueData) {
            League::firstOrCreate(
                ['slug' => $leagueData['slug']],
                $leagueData
            );
        }
    }
}