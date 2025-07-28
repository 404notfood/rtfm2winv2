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
        Schema::table('questions', function (Blueprint $table) {
            // Add missing columns that the QuestionController expects
            $table->enum('type', ['single', 'multiple'])->default('single')->after('question_text');
            $table->integer('time_limit')->default(30)->after('type');
            
            // Remove the old multiple_answers column if it exists
            if (Schema::hasColumn('questions', 'multiple_answers')) {
                $table->dropColumn('multiple_answers');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['type', 'time_limit']);
            $table->boolean('multiple_answers')->default(false);
        });
    }
};