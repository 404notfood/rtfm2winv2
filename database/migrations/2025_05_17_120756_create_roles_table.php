<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('description')->nullable();
            $table->json('permissions')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        // Création de la table pivot pour la relation many-to-many entre users et roles
        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamp('assigned_at')->useCurrent();
            $table->primary(['user_id', 'role_id']);
        });

        // Insertion des rôles par défaut
        $this->insertDefaultRoles();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
    }

    /**
     * Insérer les rôles par défaut du système
     */
    private function insertDefaultRoles(): void
    {
        $roles = [
            [
                'name' => 'super_admin',
                'description' => 'Super administrateur avec tous les droits',
                'permissions' => json_encode([
                    'manage_users', 'manage_roles', 'manage_quizzes', 'manage_system',
                    'create_presentations', 'moderate_content', 'view_analytics'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'admin',
                'description' => 'Administrateur avec droits de gestion',
                'permissions' => json_encode([
                    'manage_users', 'manage_quizzes', 'create_presentations', 
                    'moderate_content', 'view_analytics'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'moderator',
                'description' => 'Modérateur de contenu',
                'permissions' => json_encode([
                    'moderate_content', 'manage_quizzes', 'create_presentations'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'presenter',
                'description' => 'Présentateur de quiz avec droits de création et animation',
                'permissions' => json_encode([
                    'create_quizzes', 'create_presentations', 'manage_own_quizzes',
                    'start_sessions', 'control_presentations'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'player',
                'description' => 'Joueur standard avec droits de participation',
                'permissions' => json_encode([
                    'join_sessions', 'participate_quizzes', 'view_leaderboards'
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('roles')->insert($roles);
    }
};
