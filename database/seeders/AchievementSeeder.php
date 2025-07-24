<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Achievement;

class AchievementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = [
            // Creator Achievements
            [
                'name' => 'Premier Quiz',
                'slug' => 'first-quiz',
                'description' => 'Créez votre premier quiz',
                'icon' => 'trophy',
                'category' => 'creator',
                'rarity' => 'common',
                'points' => 10,
                'requirements' => json_encode(['quizzes_created' => 1]),
            ],
            [
                'name' => 'Créateur Prolifique',
                'slug' => 'prolific-creator',
                'description' => 'Créez 10 quiz',
                'icon' => 'star',
                'category' => 'creator',
                'rarity' => 'uncommon',
                'points' => 50,
                'requirements' => json_encode(['quizzes_created' => 10]),
            ],
            [
                'name' => 'Maître Quiz',
                'slug' => 'quiz-master',
                'description' => 'Créez 50 quiz',
                'icon' => 'crown',
                'category' => 'creator',
                'rarity' => 'rare',
                'points' => 200,
                'requirements' => json_encode(['quizzes_created' => 50]),
            ],

            // Player Achievements
            [
                'name' => 'Première Participation',
                'slug' => 'first-participation',
                'description' => 'Participez à votre premier quiz',
                'icon' => 'play',
                'category' => 'player',
                'rarity' => 'common',
                'points' => 5,
                'requirements' => json_encode(['sessions_participated' => 1]),
            ],
            [
                'name' => 'Joueur Régulier',
                'slug' => 'regular-player',
                'description' => 'Participez à 25 quiz',
                'icon' => 'target',
                'category' => 'player',
                'rarity' => 'uncommon',
                'points' => 75,
                'requirements' => json_encode(['sessions_participated' => 25]),
            ],
            [
                'name' => 'Champion',
                'slug' => 'champion',
                'description' => 'Gagnez votre premier quiz',
                'icon' => 'medal',
                'category' => 'player',
                'rarity' => 'uncommon',
                'points' => 25,
                'requirements' => json_encode(['quizzes_won' => 1]),
            ],
            [
                'name' => 'Série de Victoires',
                'slug' => 'winning-streak',
                'description' => 'Gagnez 5 quiz consécutifs',
                'icon' => 'flame',
                'category' => 'player',
                'rarity' => 'rare',
                'points' => 100,
                'requirements' => json_encode(['consecutive_wins' => 5]),
            ],

            // Achievement Achievements
            [
                'name' => 'Collectionneur',
                'slug' => 'collector',
                'description' => 'Débloquez 10 achievements',
                'icon' => 'collection',
                'category' => 'achievement',
                'rarity' => 'uncommon',
                'points' => 50,
                'requirements' => json_encode(['achievements_earned' => 10]),
            ],
            [
                'name' => 'Maître des Achievements',
                'slug' => 'achievement-master',
                'description' => 'Débloquez 25 achievements',
                'icon' => 'diamond',
                'category' => 'achievement',
                'rarity' => 'epic',
                'points' => 150,
                'requirements' => json_encode(['achievements_earned' => 25]),
            ],

            // Social Achievements
            [
                'name' => 'Social Butterfly',
                'slug' => 'social-butterfly',
                'description' => 'Jouez avec 10 personnes différentes',
                'icon' => 'users',
                'category' => 'social',
                'rarity' => 'uncommon',
                'points' => 30,
                'requirements' => json_encode(['unique_opponents' => 10]),
            ],
            [
                'name' => 'Ambassadeur',
                'slug' => 'ambassador',
                'description' => 'Invitez 5 nouveaux joueurs',
                'icon' => 'share',
                'category' => 'social',
                'rarity' => 'rare',
                'points' => 75,
                'requirements' => json_encode(['invites_sent' => 5]),
            ],

            // Special/Legendary Achievements
            [
                'name' => 'Légende RTFM2WIN',
                'slug' => 'rtfm2win-legend',
                'description' => 'Atteignez 1000 points au total',
                'icon' => 'legendary-crown',
                'category' => 'achievement',
                'rarity' => 'legendary',
                'points' => 500,
                'requirements' => json_encode(['total_points' => 1000]),
            ],
            [
                'name' => 'Perfectionniste',
                'slug' => 'perfectionist',
                'description' => 'Obtenez 100% de bonnes réponses dans 10 quiz',
                'icon' => 'perfect-score',
                'category' => 'player',
                'rarity' => 'epic',
                'points' => 200,
                'requirements' => json_encode(['perfect_scores' => 10]),
            ],
            [
                'name' => 'Vitesse de l\'Éclair',
                'slug' => 'lightning-speed',
                'description' => 'Répondez en moins de 2 secondes à 50 questions',
                'icon' => 'lightning',
                'category' => 'player',
                'rarity' => 'rare',
                'points' => 100,
                'requirements' => json_encode(['fast_answers' => 50]),
            ],
        ];

        foreach ($achievements as $achievementData) {
            Achievement::firstOrCreate(
                ['slug' => $achievementData['slug']],
                $achievementData
            );
        }
    }
}