<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur admin
        $admin = User::create([
            'name' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'avatar' => 'default-admin.png',
        ]);

        // Créer quelques utilisateurs standards
        $users = [
            [
                'name' => 'julien',
                'email' => 'julien@example.com',
                'password' => Hash::make('password'),
                'avatar' => 'default-user-1.png',
            ],
            [
                'name' => 'sophie',
                'email' => 'sophie@example.com',
                'password' => Hash::make('password'),
                'avatar' => 'default-user-2.png',
            ],
            [
                'name' => 'lucas',
                'email' => 'lucas@example.com',
                'password' => Hash::make('password'),
                'avatar' => 'default-user-3.png',
            ],
            [
                'name' => 'emma',
                'email' => 'emma@example.com',
                'password' => Hash::make('password'),
                'avatar' => 'default-user-4.png',
            ],
            [
                'name' => 'thomas',
                'email' => 'thomas@example.com',
                'password' => Hash::make('password'),
                'avatar' => 'default-user-5.png',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // Assigner le rôle admin à l'utilisateur admin (assumant que le rôle id 1 est 'admin')
        // Cette partie dépend de la structure de votre table pivot des rôles
        if (Schema::hasTable('role_user')) {
            DB::table('role_user')->insert([
                'role_id' => 1, // Assumant que 1 est l'ID du rôle admin
                'user_id' => $admin->id,
                'assigned_at' => now(),
            ]);
        }
    }
}
