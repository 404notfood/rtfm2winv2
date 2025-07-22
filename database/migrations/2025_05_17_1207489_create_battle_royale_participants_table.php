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
        Schema::create('battle_royale_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->nullable()->constrained('battle_royale_sessions')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('position')->nullable();
            $table->timestamp('eliminated_at')->nullable();
            $table->integer('score')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('battle_royale_participants');
    }
};
