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
            // Add missing fields from the form
            $table->boolean('is_active')->default(true)->after('status');
            $table->boolean('is_public')->default(true)->after('is_active');
            $table->integer('points_per_question')->default(1000)->after('base_points');
            $table->boolean('show_correct_answer')->default(true)->after('divide_points_multiple');
            $table->boolean('randomize_questions')->default(false)->after('show_correct_answer');
            $table->boolean('randomize_answers')->default(false)->after('randomize_questions');
            $table->boolean('allow_multiple_attempts')->default(false)->after('randomize_answers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn([
                'is_active', 'is_public', 'points_per_question', 
                'show_correct_answer', 'randomize_questions', 
                'randomize_answers', 'allow_multiple_attempts'
            ]);
        });
    }
};