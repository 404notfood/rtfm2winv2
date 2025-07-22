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
        Schema::create('quiz_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('presenter_id')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('ended_at')->nullable();
            $table->enum('status', ['pending', 'active', 'paused', 'completed', 'cancelled'])->default('pending');
            $table->string('join_code', 6)->nullable();
            $table->integer('current_question_index')->default(0);
            $table->boolean('is_presentation_mode')->default(false);
            $table->json('session_settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_sessions');
    }
};
