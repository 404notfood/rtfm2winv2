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
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('reward_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('trophy_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamp('earned_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
    }
};
