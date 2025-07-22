<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class League extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'min_points',
        'max_points',
        'color',
        'icon',
        'benefits',
        'order',
        'is_active'
    ];

    protected $casts = [
        'benefits' => 'array',
        'is_active' => 'boolean',
        'min_points' => 'integer',
        'max_points' => 'integer',
        'order' => 'integer'
    ];

    /**
     * Get all users in this league.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'current_league_id');
    }

    /**
     * Scope for active leagues only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope leagues by order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * Get league for specific points.
     */
    public static function getLeagueForPoints(int $points): ?self
    {
        return static::active()
            ->where('min_points', '<=', $points)
            ->where(function($query) use ($points) {
                $query->where('max_points', '>=', $points)
                      ->orWhereNull('max_points');
            })
            ->orderBy('order', 'desc')
            ->first();
    }

    /**
     * Get next league.
     */
    public function getNextLeagueAttribute(): ?self
    {
        return static::active()
            ->where('order', '>', $this->order)
            ->orderBy('order')
            ->first();
    }

    /**
     * Get previous league.
     */
    public function getPreviousLeagueAttribute(): ?self
    {
        return static::active()
            ->where('order', '<', $this->order)
            ->orderBy('order', 'desc')
            ->first();
    }

    /**
     * Check if user can be promoted to this league.
     */
    public function canPromoteUser(User $user): bool
    {
        $userPoints = $user->getTotalAchievementPoints();
        return $userPoints >= $this->min_points && 
               ($this->max_points === null || $userPoints <= $this->max_points);
    }

    /**
     * Get points needed for this league.
     */
    public function getPointsNeededForUser(User $user): int
    {
        $userPoints = $user->getTotalAchievementPoints();
        return max(0, $this->min_points - $userPoints);
    }

    /**
     * Get progress percentage towards next league.
     */
    public function getProgressToNextLeague(User $user): float
    {
        $userPoints = $user->getTotalAchievementPoints();
        $nextLeague = $this->next_league;

        if (!$nextLeague) {
            return 100.0; // Already at max league
        }

        $currentMin = $this->min_points;
        $nextMin = $nextLeague->min_points;
        $range = $nextMin - $currentMin;

        if ($range <= 0) {
            return 100.0;
        }

        $progress = $userPoints - $currentMin;
        return min(100.0, max(0.0, ($progress / $range) * 100));
    }

    /**
     * Get league statistics.
     */
    public function getStatsAttribute(): array
    {
        $totalUsers = $this->users()->count();
        $activeUsers = $this->users()->where('last_activity_at', '>=', now()->subDays(30))->count();

        return [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'activity_rate' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0,
            'points_range' => [
                'min' => $this->min_points,
                'max' => $this->max_points
            ],
            'benefits_count' => count($this->benefits ?? []),
        ];
    }

    /**
     * Get league display data.
     */
    public function getDisplayDataAttribute(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'color' => $this->color,
            'icon' => $this->icon,
            'min_points' => $this->min_points,
            'max_points' => $this->max_points,
            'benefits' => $this->benefits,
            'order' => $this->order,
            'stats' => $this->stats,
        ];
    }

    /**
     * Get all leagues with user counts.
     */
    public static function getLeaderboard(): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()
            ->withCount('users')
            ->ordered()
            ->get()
            ->map(function($league) {
                return [
                    'league' => $league->display_data,
                    'user_count' => $league->users_count,
                ];
            });
    }

    /**
     * Promote user to appropriate league based on points.
     */
    public static function updateUserLeague(User $user): ?self
    {
        $userPoints = $user->getTotalAchievementPoints();
        $appropriateLeague = static::getLeagueForPoints($userPoints);

        if ($appropriateLeague && $user->current_league_id !== $appropriateLeague->id) {
            $oldLeague = $user->currentLeague;
            $user->update(['current_league_id' => $appropriateLeague->id]);

            // Fire league promotion event if available
            if (class_exists('\App\Events\LeaguePromotion') && $oldLeague) {
                event(new \App\Events\LeaguePromotion($user, $oldLeague, $appropriateLeague));
            }
        }

        return $appropriateLeague;
    }

    /**
     * Get league distribution across all users.
     */
    public static function getDistribution(): array
    {
        $totalUsers = User::count();
        $leagues = static::active()
            ->withCount('users')
            ->ordered()
            ->get();

        return $leagues->map(function($league) use ($totalUsers) {
            return [
                'league' => $league->display_data,
                'user_count' => $league->users_count,
                'percentage' => $totalUsers > 0 ? round(($league->users_count / $totalUsers) * 100, 1) : 0,
            ];
        })->toArray();
    }

    /**
     * Create default league system.
     */
    public static function createDefaultLeagues(): void
    {
        $defaultLeagues = [
            [
                'name' => 'Bronze',
                'slug' => 'bronze',
                'description' => 'Ligue de départ pour tous les nouveaux joueurs',
                'min_points' => 0,
                'max_points' => 999,
                'color' => '#CD7F32',
                'icon' => '🥉',
                'order' => 1,
                'benefits' => ['Accès aux quiz de base']
            ],
            [
                'name' => 'Argent',
                'slug' => 'silver',
                'description' => 'Ligue pour les joueurs expérimentés',
                'min_points' => 1000,
                'max_points' => 2999,
                'color' => '#C0C0C0',
                'icon' => '🥈',
                'order' => 2,
                'benefits' => ['Création de quiz illimitée', 'Thèmes personnalisés']
            ],
            [
                'name' => 'Or',
                'slug' => 'gold',
                'description' => 'Ligue pour les joueurs avancés',
                'min_points' => 3000,
                'max_points' => 7499,
                'color' => '#FFD700',
                'icon' => '🥇',
                'order' => 3,
                'benefits' => ['Statistiques avancées', 'Tournois privés', 'Badges exclusifs']
            ],
            [
                'name' => 'Platine',
                'slug' => 'platinum',
                'description' => 'Ligue d\'élite pour les experts',
                'min_points' => 7500,
                'max_points' => 14999,
                'color' => '#E5E4E2',
                'icon' => '💎',
                'order' => 4,
                'benefits' => ['API accès', 'Export données', 'Support prioritaire']
            ],
            [
                'name' => 'Diamant',
                'slug' => 'diamond',
                'description' => 'Ligue pour les maîtres absolus',
                'min_points' => 15000,
                'max_points' => 29999,
                'color' => '#B9F2FF',
                'icon' => '💎',
                'order' => 5,
                'benefits' => ['Fonctionnalités bêta', 'Feedback direct développeurs']
            ],
            [
                'name' => 'Maître',
                'slug' => 'master',
                'description' => 'Ligue des champions légendaires',
                'min_points' => 30000,
                'max_points' => null,
                'color' => '#FF6347',
                'icon' => '👑',
                'order' => 6,
                'benefits' => ['Tous privilèges', 'Badge spécial', 'Hall of Fame']
            ]
        ];

        foreach ($defaultLeagues as $leagueData) {
            static::firstOrCreate(
                ['slug' => $leagueData['slug']],
                array_merge($leagueData, ['is_active' => true])
            );
        }
    }

    /**
     * Boot method for model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($league) {
            if (empty($league->slug)) {
                $league->slug = \Str::slug($league->name);
            }
        });
    }
}