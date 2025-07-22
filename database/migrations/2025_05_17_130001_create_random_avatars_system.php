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
        // Système d'avatars aléatoires pour les participants
        Schema::create('random_avatars', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('image_path');
            $table->string('category', 30)->default('general'); // animals, robots, humans, etc.
            $table->string('style', 30)->default('cartoon'); // cartoon, realistic, minimalist
            $table->boolean('is_active')->default(true);
            $table->integer('usage_count')->default(0); // Compteur d'utilisation
            $table->timestamps();
            
            $table->index(['category', 'style', 'is_active']);
        });

        // Améliorer la table participants pour avatars
        Schema::table('participants', function (Blueprint $table) {
            $table->foreignId('random_avatar_id')->nullable()->constrained('random_avatars')->onDelete('set null')->after('pseudo');
            $table->string('avatar_url')->nullable()->after('random_avatar_id'); // URL générée ou custom
            $table->string('display_color', 7)->nullable()->after('avatar_url'); // Couleur de profil
        });

        // Améliorer la table users pour avatars personnalisés
        // All avatar columns already exist in create_users_table migration
        // No modifications needed to users table

        // Table pour générer des combinaisons d'avatars uniques
        Schema::create('avatar_combinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('base_avatar_id')->constrained('random_avatars')->onDelete('cascade');
            $table->string('accessory_type', 30)->nullable(); // hat, glasses, etc.
            $table->string('accessory_color', 7)->nullable();
            $table->string('background_color', 7)->nullable();
            $table->json('style_modifiers')->nullable(); // Modifications CSS/SVG
            $table->string('generated_hash', 32)->unique(); // Hash unique de la combinaison
            $table->timestamps();
            
            $table->index(['base_avatar_id', 'generated_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avatar_combinations');
        
        // Users table modifications are managed by create_users_table migration
        // No cleanup needed for users table
        
        Schema::table('participants', function (Blueprint $table) {
            $table->dropForeign(['random_avatar_id']);
            $table->dropColumn(['random_avatar_id', 'avatar_url', 'display_color']);
        });
        
        Schema::dropIfExists('random_avatars');
    }
};