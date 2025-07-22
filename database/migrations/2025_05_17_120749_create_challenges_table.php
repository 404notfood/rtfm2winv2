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
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenger_id')->nullable()->constrained('users');
            $table->foreignId('challenged_id')->nullable()->constrained('users');
            $table->foreignId('quiz_id')->nullable()->constrained();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'completed'])->default('pending');
            $table->foreignId('winner_id')->nullable()->constrained('users');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};
