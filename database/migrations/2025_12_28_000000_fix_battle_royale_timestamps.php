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
        // Ajouter updated_at à battle_royale_sessions
        Schema::table('battle_royale_sessions', function (Blueprint $table) {
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate()->after('created_at');
        });

        // Ajouter les timestamps à battle_royale_participants
        Schema::table('battle_royale_participants', function (Blueprint $table) {
            $table->timestamp('created_at')->useCurrent()->after('score');
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate()->after('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('battle_royale_sessions', function (Blueprint $table) {
            $table->dropColumn('updated_at');
        });

        Schema::table('battle_royale_participants', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at']);
        });
    }
}; 