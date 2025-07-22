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
        Schema::create('sound_effects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('description')->nullable();
            $table->string('file_path', 255);
            $table->string('category', 50)->index();
            $table->enum('trigger_event', [
                'correct_answer', 
                'wrong_answer', 
                'quiz_start', 
                'quiz_end', 
                'elimination', 
                'victory', 
                'timer_warning', 
                'level_up',
                'achievement_unlocked'
            ]);
            $table->boolean('is_enabled')->default(true);
            $table->integer('volume')->default(100);
            $table->integer('duration_ms')->nullable();
            $table->timestamps();
        });

        // Table de préférences sonores des utilisateurs
        Schema::create('user_sound_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('sounds_enabled')->default(true);
            $table->integer('volume_level')->default(80);
            $table->json('disabled_categories')->nullable();
            $table->json('custom_settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sound_preferences');
        Schema::dropIfExists('sound_effects');
    }
};
