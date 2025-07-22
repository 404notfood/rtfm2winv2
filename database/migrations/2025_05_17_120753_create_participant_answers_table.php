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
        Schema::create('participant_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('answer_id')->nullable()->constrained()->onDelete('cascade');
            $table->float('response_time')->nullable();
            $table->integer('points_earned')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participant_answers');
    }
};
