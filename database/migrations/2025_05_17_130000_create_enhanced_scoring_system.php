<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Configuration avancée du scoring (inspiré du legacy)
        Schema::create('scoring_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            
            // Configuration de base (du legacy)
            $table->integer('base_points')->default(3000);
            $table->integer('time_penalty_per_second')->default(10); // -10 points par 0.1s
            $table->boolean('divide_points_multiple')->default(true);
            
            // Nouvelles fonctionnalités de scoring
            $table->json('bonus_conditions')->nullable(); // Bonus streak, vitesse, etc.
            $table->integer('perfect_score_bonus')->default(500);
            $table->integer('speed_bonus_threshold')->default(5); // secondes
            $table->integer('speed_bonus_points')->default(100);
            $table->integer('streak_bonus_per_question')->default(50);
            
            // Configuration des pénalités
            $table->boolean('enable_negative_scoring')->default(false);
            $table->integer('wrong_answer_penalty')->default(0);
            $table->integer('timeout_penalty')->default(0);
            
            $table->timestamps();
            
            $table->unique('quiz_id');
        });

        // Table pour classements en temps réel améliorés
        Schema::create('leaderboard_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_session_id')->constrained('quiz_sessions')->onDelete('cascade');
            $table->foreignId('participant_id')->constrained('participants')->onDelete('cascade');
            
            // Scores détaillés
            $table->integer('total_score')->default(0);
            $table->integer('base_score')->default(0);
            $table->integer('time_bonus')->default(0);
            $table->integer('streak_bonus')->default(0);
            $table->integer('perfect_bonus')->default(0);
            
            // Métriques de performance
            $table->integer('questions_answered')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('wrong_answers')->default(0);
            $table->decimal('average_response_time', 8, 2)->nullable();
            $table->integer('current_streak')->default(0);
            $table->integer('best_streak')->default(0);
            
            // Position dans le classement
            $table->integer('current_position')->nullable();
            $table->integer('previous_position')->nullable();
            
            $table->timestamps();
            
            $table->index(['quiz_session_id', 'total_score']);
            $table->index(['quiz_session_id', 'current_position']);
        });

        // Améliorer la table participant_answers pour scoring avancé
        Schema::table('participant_answers', function (Blueprint $table) {
            // Détails du scoring
            $table->integer('base_points')->default(0)->after('points_earned');
            $table->integer('time_bonus')->default(0)->after('base_points');
            $table->integer('streak_bonus')->default(0)->after('time_bonus');
            $table->boolean('is_perfect')->default(false)->after('streak_bonus');
            $table->integer('streak_position')->default(0)->after('is_perfect');
            
            // Métriques de réponse
            $table->boolean('is_timeout')->default(false)->after('response_time');
            $table->decimal('time_percentage', 5, 2)->nullable()->after('is_timeout'); // % du temps utilisé
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participant_answers', function (Blueprint $table) {
            $table->dropColumn([
                'base_points', 'time_bonus', 'streak_bonus', 'is_perfect', 
                'streak_position', 'is_timeout', 'time_percentage'
            ]);
        });
        
        Schema::dropIfExists('leaderboard_entries');
        Schema::dropIfExists('scoring_configurations');
    }
};