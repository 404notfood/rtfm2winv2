<?php

return [

    /*
    |--------------------------------------------------------------------------
    | RTFM2WIN Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration spécifique à l'application RTFM2WIN
    |
    */

    'app' => [
        'name' => 'RTFM2WIN',
        'version' => '2.0.0',
        'description' => 'Plateforme interactive de quiz et d\'apprentissage',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rôles utilisateur
    |--------------------------------------------------------------------------
    */
    'roles' => [
        'guest' => 'Invité',
        'user' => 'Utilisateur',
        'presenter' => 'Présentateur',
        'admin' => 'Administrateur',
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration des quiz
    |--------------------------------------------------------------------------
    */
    'quiz' => [
        'max_questions' => 50,
        'min_questions' => 1,
        'max_answers_per_question' => 6,
        'min_answers_per_question' => 2,
        'default_time_per_question' => 30, // secondes
        'max_time_per_question' => 300, // 5 minutes
        'min_time_per_question' => 5,
        'default_points' => 100,
        'max_points' => 1000,
        'min_points' => 1,
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration des sessions
    |--------------------------------------------------------------------------
    */
    'session' => [
        'code_length' => 6,
        'max_participants' => 100,
        'waiting_room_timeout' => 300, // 5 minutes
        'question_timeout' => 30, // secondes par défaut
        'results_display_time' => 10, // secondes
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration Battle Royale
    |--------------------------------------------------------------------------
    */
    'battle_royale' => [
        'min_participants' => 4,
        'max_participants' => 50,
        'elimination_percentage' => 25, // % éliminés par round
        'min_elimination_count' => 1,
        'max_rounds' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration des tournois
    |--------------------------------------------------------------------------
    */
    'tournaments' => [
        'min_participants' => 4,
        'max_participants' => 64,
        'formats' => [
            'single_elimination' => 'Élimination simple',
            'double_elimination' => 'Élimination double',
            'round_robin' => 'Round Robin',
            'swiss' => 'Système Suisse',
        ],
        'max_rounds' => 8,
    ],

    /*
    |--------------------------------------------------------------------------
    | Thèmes prédéfinis
    |--------------------------------------------------------------------------
    */
    'themes' => [
        'system' => [
            'light' => 'Clair',
            'dark' => 'Sombre',
            'neon' => 'Néon',
            'pastel' => 'Pastel',
            'fun' => 'Amusant',
            'elegant' => 'Élégant',
        ],
        'max_custom_themes' => 10, // par utilisateur
    ],

    /*
    |--------------------------------------------------------------------------
    | Système de points et achievements
    |--------------------------------------------------------------------------
    */
    'scoring' => [
        'base_points' => 100,
        'time_bonus_multiplier' => 1.5,
        'streak_bonus' => 50,
        'perfect_score_bonus' => 200,
        'participation_points' => 10,
    ],

    'achievements' => [
        'categories' => [
            'participation' => 'Participation',
            'performance' => 'Performance',
            'streak' => 'Séries',
            'social' => 'Social',
            'creation' => 'Création',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration de l'export
    |--------------------------------------------------------------------------
    */
    'export' => [
        'pdf' => [
            'max_file_size' => '10MB',
            'formats' => ['A4', 'Letter'],
            'orientations' => ['portrait', 'landscape'],
        ],
        'csv' => [
            'delimiter' => ',',
            'encoding' => 'UTF-8',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Limites et quotas
    |--------------------------------------------------------------------------
    */
    'limits' => [
        'quiz_per_user' => 50,
        'sessions_per_day' => 20,
        'participants_per_session' => 100,
        'file_upload_max_size' => '5MB',
        'avatar_max_size' => '2MB',
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration temps réel
    |--------------------------------------------------------------------------
    */
    'realtime' => [
        'heartbeat_interval' => 30, // secondes
        'reconnect_attempts' => 5,
        'connection_timeout' => 10, // secondes
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration de cache
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'quiz_ttl' => 3600, // 1 heure
        'leaderboard_ttl' => 300, // 5 minutes
        'theme_ttl' => 86400, // 24 heures
        'user_stats_ttl' => 1800, // 30 minutes
    ],

]; 