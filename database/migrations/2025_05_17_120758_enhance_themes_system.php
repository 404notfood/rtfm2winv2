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
        // Améliorer la table themes existante
        Schema::table('themes', function (Blueprint $table) {
            // Champs manquants pour système complet de thèmes (code et is_default existent déjà)
            $table->boolean('is_user_selectable')->default(true)->after('is_default');
            
            // Couleurs détaillées
            $table->string('primary_color', 7)->default('#3B82F6')->after('is_user_selectable');
            $table->string('secondary_color', 7)->default('#10B981')->after('primary_color');
            $table->string('accent_color', 7)->default('#8B5CF6')->after('secondary_color');
            $table->string('text_color', 7)->default('#1E293B')->after('accent_color');
            $table->string('background_color', 7)->default('#FFFFFF')->after('text_color');
            $table->string('card_color', 7)->default('#F8FAFC')->after('background_color');
            
            // Propriétés d'apparence
            $table->boolean('is_dark')->default(false)->after('card_color');
            $table->string('font_family')->default('Inter, sans-serif')->after('is_dark');
            $table->integer('border_radius')->default(8)->after('font_family');
            
            // Variables CSS complètes (du système RTFM2WIN)
            $table->json('css_variables')->nullable()->after('border_radius');
            
            // Créateur du thème (pour thèmes personnalisés)
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('css_variables');
        });

        // Créer table pour thèmes personnalisés utilisateur
        Schema::create('user_custom_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->json('css_variables'); // Variables CSS personnalisées
            $table->boolean('is_active')->default(false);
            $table->boolean('is_public')->default(false); // Partage avec autres utilisateurs
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index(['is_public', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_custom_themes');
        
        Schema::table('themes', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn([
                'is_user_selectable', 'primary_color', 
                'secondary_color', 'accent_color', 'text_color', 'background_color', 
                'card_color', 'is_dark', 'font_family', 'border_radius', 
                'css_variables', 'created_by'
            ]);
        });
    }
};