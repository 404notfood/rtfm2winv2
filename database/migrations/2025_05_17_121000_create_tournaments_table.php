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
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'registration', 'active', 'completed', 'canceled'])->default('draft');
            $table->datetime('registration_start');
            $table->datetime('registration_end');
            $table->datetime('start_date');
            $table->datetime('end_date')->nullable();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->integer('max_participants')->default(32);
            $table->enum('format', ['single_elimination', 'double_elimination', 'round_robin', 'swiss'])->default('single_elimination');
            $table->integer('rounds')->default(3);
            $table->integer('min_participants')->default(4);
            $table->json('rules')->nullable();
            $table->json('prizes')->nullable();
            $table->string('banner_image')->nullable();
            $table->string('tournament_code', 20)->unique();
            $table->boolean('is_featured')->default(false);
            $table->boolean('require_approval')->default(false);
            $table->timestamps();
        });

        // Table des rounds
        Schema::create('tournament_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->onDelete('cascade');
            $table->integer('round_number');
            $table->enum('status', ['pending', 'active', 'completed'])->default('pending');
            $table->datetime('start_time')->nullable();
            $table->datetime('end_time')->nullable();
            $table->timestamps();
            
            $table->unique(['tournament_id', 'round_number']);
        });

        // Table des matchs
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->onDelete('cascade');
            $table->foreignId('round_id')->constrained('tournament_rounds')->onDelete('cascade');
            $table->integer('match_number');
            $table->foreignId('player1_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('player2_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('player1_score')->default(0);
            $table->integer('player2_score')->default(0);
            $table->foreignId('winner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('quiz_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('status', ['pending', 'active', 'completed', 'canceled'])->default('pending');
            $table->datetime('scheduled_time')->nullable();
            $table->datetime('completion_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['tournament_id', 'round_id', 'match_number']);
        });

        // Table des participants au tournoi
        Schema::create('tournament_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->datetime('registered_at');
            $table->boolean('is_approved')->default(true);
            $table->integer('final_position')->nullable();
            $table->integer('total_score')->default(0);
            $table->integer('matches_won')->default(0);
            $table->integer('matches_lost')->default(0);
            $table->boolean('is_disqualified')->default(false);
            $table->text('disqualification_reason')->nullable();
            $table->timestamps();
            
            $table->unique(['tournament_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_participants');
        Schema::dropIfExists('tournament_matches');
        Schema::dropIfExists('tournament_rounds');
        Schema::dropIfExists('tournaments');
    }
};
