<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            [
                'name' => 'Créateur Débutant',
                'description' => 'Créez votre premier quiz',
                'icon' => 'badge-creator-novice.png',
                'category' => 'creator',
                'requirements' => json_encode(['quizzes_created' => 1]),
                'created_at' => now()
            ],
            [
                'name' => 'Créateur Intermédiaire',
                'description' => 'Créez 10 quiz',
                'icon' => 'badge-creator-intermediate.png',
                'category' => 'creator',
                'requirements' => json_encode(['quizzes_created' => 10]),
                'created_at' => now()
            ],
            [
                'name' => 'Créateur Expert',
                'description' => 'Créez 50 quiz',
                'icon' => 'badge-creator-expert.png',
                'category' => 'creator',
                'requirements' => json_encode(['quizzes_created' => 50]),
                'created_at' => now()
            ],
            [
                'name' => 'Joueur Novice',
                'description' => 'Participez à votre premier quiz',
                'icon' => 'badge-player-novice.png',
                'category' => 'player',
                'requirements' => json_encode(['quizzes_played' => 1]),
                'created_at' => now()
            ],
            [
                'name' => 'Joueur Régulier',
                'description' => 'Participez à 20 quiz',
                'icon' => 'badge-player-regular.png',
                'category' => 'player',
                'requirements' => json_encode(['quizzes_played' => 20]),
                'created_at' => now()
            ],
            [
                'name' => 'Joueur Passionné',
                'description' => 'Participez à 100 quiz',
                'icon' => 'badge-player-passionate.png',
                'category' => 'player',
                'requirements' => json_encode(['quizzes_played' => 100]),
                'created_at' => now()
            ],
            [
                'name' => 'Sans Faute',
                'description' => 'Terminez un quiz avec un score parfait',
                'icon' => 'badge-perfect-score.png',
                'category' => 'achievement',
                'requirements' => json_encode(['perfect_score' => true]),
                'created_at' => now()
            ],
            [
                'name' => 'Éclair',
                'description' => 'Terminez un quiz en moins de 30 secondes',
                'icon' => 'badge-lightning-fast.png',
                'category' => 'achievement',
                'requirements' => json_encode(['time_under' => 30]),
                'created_at' => now()
            ],
            [
                'name' => 'Ami des Quiz',
                'description' => 'Invitez 5 amis qui participent à un quiz',
                'icon' => 'badge-quiz-friend.png',
                'category' => 'achievement',
                'requirements' => json_encode(['friends_invited' => 5]),
                'created_at' => now()
            ],
            [
                'name' => 'Explorateur',
                'description' => 'Participez à des quiz dans 5 catégories différentes',
                'icon' => 'badge-explorer.png',
                'category' => 'achievement',
                'requirements' => json_encode(['different_categories' => 5]),
                'created_at' => now()
            ]
        ];

        DB::table('badges')->insert($badges);
    }
}
