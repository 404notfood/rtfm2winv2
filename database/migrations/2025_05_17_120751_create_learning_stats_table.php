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
        Schema::create('learning_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('quiz_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('correct_count')->default(0);
            $table->integer('incorrect_count')->default(0);
            $table->float('average_time')->nullable();
            $table->timestamp('last_reviewed_at')->nullable();
            $table->date('next_review_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_stats');
    }
};
