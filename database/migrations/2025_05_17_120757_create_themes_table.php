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
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100); // Nom affiché du thème
            $table->string('code', 50)->unique(); // ex: 'dark', 'light', 'neon'
            $table->string('description')->nullable();
            $table->boolean('is_default')->default(false); // Thème par défaut
            $table->boolean('is_active')->default(true); // Thème activé ou non
            $table->timestamps();
        });

        // Table pour stocker les préférences de thème des utilisateurs
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('theme_id')->nullable()->constrained()->onDelete('set null');
            $table->json('preferences')->nullable(); // Autres préférences utilisateur
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('themes');
    }
};
