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
        Schema::table('battle_royale_sessions', function (Blueprint $table) {
            // Vérifier et ajouter les colonnes seulement si elles n'existent pas
            if (!Schema::hasColumn('battle_royale_sessions', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            if (!Schema::hasColumn('battle_royale_sessions', 'creator_id')) {
                $table->unsignedBigInteger('creator_id')->nullable()->after('status');
            }
            if (!Schema::hasColumn('battle_royale_sessions', 'quiz_pool')) {
                $table->json('quiz_pool')->nullable()->after('creator_id');
            }
            if (!Schema::hasColumn('battle_royale_sessions', 'current_round')) {
                $table->integer('current_round')->default(1)->after('quiz_pool');
            }
        });
        
        // Ajouter la clé étrangère seulement si la colonne creator_id existe et n'a pas déjà de contrainte
        if (Schema::hasColumn('battle_royale_sessions', 'creator_id')) {
            Schema::table('battle_royale_sessions', function (Blueprint $table) {
                try {
                    $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                } catch (\Exception $e) {
                    // La contrainte existe déjà, on ignore l'erreur
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('battle_royale_sessions', function (Blueprint $table) {
            $table->dropForeign(['creator_id']);
            $table->dropColumn([
                'description',
                'creator_id', 
                'quiz_pool',
                'current_round'
            ]);
        });
    }
}; 