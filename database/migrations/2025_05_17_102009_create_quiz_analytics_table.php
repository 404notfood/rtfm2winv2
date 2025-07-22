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
        Schema::create('quiz_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            
            // Analytics par question (inspiré des procédures legacy)
            $table->json('question_analytics')->nullable(); // Stats par question
            $table->json('response_distribution')->nullable(); // Données pour graphiques 3D
            $table->json('time_analytics')->nullable(); // Temps moyens, min, max
            $table->json('difficulty_metrics')->nullable(); // Analyse de difficulté
            
            // Métriques globales
            $table->decimal('success_rate', 5, 2)->nullable();
            $table->decimal('average_completion_time', 8, 2)->nullable();
            $table->integer('total_responses')->default(0);
            $table->integer('correct_responses')->default(0);
            
            // Données pour graphiques 3D (du legacy)
            $table->json('bar_chart_data')->nullable(); // Pour "3D Bars Effect"
            $table->json('tilt_chart_data')->nullable(); // Pour "3D Tilt Effect"
            
            $table->timestamps();
            
            $table->index(['quiz_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_analytics');
    }
};