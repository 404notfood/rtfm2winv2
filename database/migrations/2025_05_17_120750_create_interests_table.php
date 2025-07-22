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
        Schema::create('interests', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('category', 50)->nullable();
            $table->timestamps();
        });

        // Table pivot pour la relation many-to-many avec les utilisateurs
        Schema::create('user_interests', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('interest_id')->constrained()->onDelete('cascade');
            $table->float('weight')->default(1);
            $table->primary(['user_id', 'interest_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_interests');
        Schema::dropIfExists('interests');
    }
};
