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
        Schema::table('leagues', function (Blueprint $table) {
            // Supprimer les colonnes qui ne correspondent pas au modèle
            $table->dropColumn(['level', 'season', 'status']);
            
            // Ajouter les nouvelles colonnes attendues par le modèle
            $table->string('slug')->unique()->after('name');
            $table->string('color', 7)->nullable()->after('description');
            $table->string('icon')->nullable()->after('color');
            $table->json('benefits')->nullable()->after('max_points');
            $table->integer('order')->default(0)->after('benefits');
            $table->boolean('is_active')->default(true)->after('order');
            
            // Ajouter des index pour les performances
            $table->index(['is_active', 'order']);
            $table->index('min_points');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leagues', function (Blueprint $table) {
            // Remettre les anciennes colonnes
            $table->integer('level')->after('description');
            $table->integer('season')->after('max_points');
            $table->enum('status', ['active', 'finished'])->default('active')->after('season');
            
            // Supprimer les nouvelles colonnes
            $table->dropColumn(['slug', 'color', 'icon', 'benefits', 'order', 'is_active']);
            
            // Supprimer les index
            $table->dropIndex(['is_active', 'order']);
            $table->dropIndex(['min_points']);
        });
    }
};