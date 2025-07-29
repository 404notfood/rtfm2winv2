<?php

namespace App\Providers;

use App\Models\Quiz;
use App\Models\Tournament;
use App\Models\BattleRoyaleSession;
use App\Policies\QuizPolicy;
use App\Policies\TournamentPolicy;
use App\Policies\BattleRoyalePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Quiz::class => QuizPolicy::class,
        Tournament::class => TournamentPolicy::class,
        BattleRoyaleSession::class => BattleRoyalePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}