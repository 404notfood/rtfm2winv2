<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Appeler nos seeders personnalisés
        $this->call([
            ThemeSeeder::class,
            RolesTableSeeder::class,
            LeagueSeeder::class,
            AchievementSeeder::class,
            UsersTableSeeder::class,
            BadgesTableSeeder::class,
            TrophiesTableSeeder::class,
        ]);
    }
}
