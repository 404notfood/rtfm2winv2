<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrophiesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trophies = [
            [
                'name' => 'Débutant Brillant',
                'description' => 'Obtenez un score parfait à 3 quiz consécutifs',
                'icon' => 'trophy-beginner.png',
                'level' => 'bronze',
                'requirements' => json_encode(['consecutive_perfect_scores' => 3]),
                'created_at' => now()
            ],
            [
                'name' => 'Champion du Quiz',
                'description' => 'Gagnez 10 sessions de quiz multijoueur',
                'icon' => 'trophy-quiz-champion.png',
                'level' => 'silver',
                'requirements' => json_encode(['multiplayer_wins' => 10]),
                'created_at' => now()
            ],
            [
                'name' => 'Maître du Savoir',
                'description' => 'Complétez 50 quiz avec un score supérieur à 80%',
                'icon' => 'trophy-knowledge-master.png',
                'level' => 'gold',
                'requirements' => json_encode(['quizzes_above_80_percent' => 50]),
                'created_at' => now()
            ],
            [
                'name' => 'Légende du Quiz',
                'description' => 'Complétez 100 quiz et créez-en au moins 20',
                'icon' => 'trophy-quiz-legend.png',
                'level' => 'platinum',
                'requirements' => json_encode(['quizzes_completed' => 100, 'quizzes_created' => 20]),
                'created_at' => now()
            ],
            [
                'name' => 'Rapide comme l\'éclair',
                'description' => 'Répondez correctement à 20 questions en moins de 5 secondes chacune',
                'icon' => 'trophy-lightning-fast.png',
                'level' => 'silver',
                'requirements' => json_encode(['quick_correct_answers' => 20, 'time_per_answer' => 5]),
                'created_at' => now()
            ],
            [
                'name' => 'Créateur Populaire',
                'description' => 'Créez un quiz joué par plus de 100 personnes',
                'icon' => 'trophy-popular-creator.png',
                'level' => 'gold',
                'requirements' => json_encode(['quiz_participants' => 100]),
                'created_at' => now()
            ],
            [
                'name' => 'Spécialiste',
                'description' => 'Obtenez un score parfait dans 10 quiz d\'une même catégorie',
                'icon' => 'trophy-specialist.png',
                'level' => 'silver',
                'requirements' => json_encode(['perfect_scores_same_category' => 10]),
                'created_at' => now()
            ],
            [
                'name' => 'Battle Royale Champion',
                'description' => 'Gagnez 5 sessions Battle Royale',
                'icon' => 'trophy-battle-royale.png',
                'level' => 'gold',
                'requirements' => json_encode(['battle_royale_wins' => 5]),
                'created_at' => now()
            ],
            [
                'name' => 'Marathonien du Quiz',
                'description' => 'Participez à 10 quiz en une seule journée',
                'icon' => 'trophy-quiz-marathon.png',
                'level' => 'bronze',
                'requirements' => json_encode(['quizzes_per_day' => 10]),
                'created_at' => now()
            ],
            [
                'name' => 'Champion du Tournoi',
                'description' => 'Gagnez un tournoi officiel',
                'icon' => 'trophy-tournament-champion.png',
                'level' => 'platinum',
                'requirements' => json_encode(['tournament_wins' => 1]),
                'created_at' => now()
            ],
        ];

        DB::table('trophies')->insert($trophies);
    }
}
