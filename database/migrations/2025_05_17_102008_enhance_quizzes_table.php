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
        Schema::table('quizzes', function (Blueprint $table) {
            // Ajout des fonctionnalités manquantes du legacy
            $table->string('unique_link')->unique()->after('id');
            $table->string('qr_code_path')->nullable()->after('unique_link');
            $table->boolean('allow_anonymous')->default(true)->after('status');
            $table->json('advanced_settings')->nullable()->after('allow_anonymous');
            
            // Configuration de scoring avancée
            $table->integer('base_points')->default(3000)->after('time_per_question');
            $table->integer('time_penalty')->default(10)->after('base_points');
            $table->boolean('divide_points_multiple')->default(true)->after('time_penalty');
            
            // Analytics et métriques
            $table->integer('total_sessions')->default(0)->after('status');
            $table->integer('total_participants')->default(0)->after('total_sessions');
            $table->decimal('average_score', 8, 2)->nullable()->after('total_participants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn([
                'unique_link', 'qr_code_path', 'allow_anonymous', 'advanced_settings',
                'base_points', 'time_penalty', 'divide_points_multiple',
                'total_sessions', 'total_participants', 'average_score'
            ]);
        });
    }
};