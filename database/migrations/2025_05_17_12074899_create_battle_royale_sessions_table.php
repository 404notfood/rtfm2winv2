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
        Schema::create('battle_royale_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->integer('max_players');
            $table->integer('elimination_interval');
            $table->enum('status', ['waiting', 'active', 'finished'])->default('waiting');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('battle_royale_sessions');
    }
};
