<?php

namespace App\Providers;

use App\Services\QuizService;
use Illuminate\Support\ServiceProvider;

/**
 * Service Provider pour RTFM2WIN.
 * Implémente le principe d'inversion de dépendance (Dependency Inversion Principle).
 */
class Rtfm2winServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     * 
     * Enregistre tous les services de l'application dans le conteneur de services.
     * Suit le principe d'inversion de dépendance en permettant l'injection de dépendances.
     */
    public function register(): void
    {
        // Enregistrer le service Quiz comme singleton
        $this->app->singleton(QuizService::class, function ($app) {
            return new QuizService();
        });

        // Enregistrer d'autres services ici...
        // $this->app->singleton(ThemeService::class, ThemeService::class);
        // $this->app->singleton(TournamentService::class, TournamentService::class);
        // $this->app->singleton(BattleRoyaleService::class, BattleRoyaleService::class);
    }

    /**
     * Bootstrap services.
     * 
     * Configure les services après leur enregistrement.
     */
    public function boot(): void
    {
        // Configuration additionnelle des services si nécessaire
        
        // Publier les assets de configuration
        $this->publishes([
            __DIR__.'/../../config/rtfm2win.php' => config_path('rtfm2win.php'),
        ], 'rtfm2win-config');

        // Enregistrer les vues personnalisées
        $this->loadViewsFrom(__DIR__.'/../../resources/views/rtfm2win', 'rtfm2win');

        // Enregistrer les migrations si nécessaire
        // $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [
            QuizService::class,
            // Ajouter d'autres services ici
        ];
    }
} 