<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'can_be_presenter',
        'is_suspended',
        'avatar',
        'current_theme_id',
        'preferences',
        'last_login_at',
        'current_avatar_id',
        'preferred_random_avatar_id',
        'avatar_preference',
        'current_league_id',
        'badges',
        'trophies',
        'trophy_showcase',
        'battle_royale_wins',
        'last_activity_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'can_be_presenter' => 'boolean',
            'is_suspended' => 'boolean',
            'preferences' => 'array',
            'last_login_at' => 'datetime',
            'badges' => 'array',
            'trophies' => 'array',
            'trophy_showcase' => 'array',
            'last_activity_at' => 'datetime',
        ];
    }

    /**
     * Get the quizzes created by this user.
     */
    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'creator_id');
    }

    /**
     * Get the quiz sessions presented by this user.
     */
    public function presentedSessions(): HasMany
    {
        return $this->hasMany(QuizSession::class, 'presenter_id');
    }

    /**
     * Get the participant records for this user.
     */
    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    /**
     * Get the themes associated with this user.
     */
    public function themes(): BelongsToMany
    {
        return $this->belongsToMany(Theme::class, 'user_themes')
            ->withTimestamps()
            ->withPivot('applied_at');
    }

    /**
     * Get the current theme for this user.
     */
    public function currentTheme(): BelongsTo
    {
        return $this->belongsTo(Theme::class, 'current_theme_id');
    }

    /**
     * Get custom themes created by this user.
     */
    public function customThemes(): HasMany
    {
        return $this->hasMany(Theme::class, 'created_by');
    }

    /**
     * Get the badges earned by this user.
     */
    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('earned_at', 'metadata');
    }

    /**
     * Get the custom avatars created by this user.
     */
    public function customAvatars(): HasMany
    {
        return $this->hasMany(CustomAvatar::class);
    }

    /**
     * Get the current custom avatar.
     */
    public function currentAvatar(): BelongsTo
    {
        return $this->belongsTo(CustomAvatar::class, 'current_avatar_id');
    }

    /**
     * Get the preferred random avatar.
     */
    public function preferredRandomAvatar(): BelongsTo
    {
        return $this->belongsTo(RandomAvatar::class, 'preferred_random_avatar_id');
    }

    /**
     * Get friends of this user.
     */
    public function friends(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_friends', 'user_id', 'friend_id')
            ->withTimestamps();
    }

    /**
     * Get users who have this user as a friend.
     */
    public function friendOf(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_friends', 'friend_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get notifications for this user.
     */
    public function userNotifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get learning stats for this user.
     */
    public function learningStats(): HasMany
    {
        return $this->hasMany(LearningStat::class);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user can create quizzes.
     */
    public function canCreateQuizzes(): bool
    {
        return in_array($this->role, ['presenter', 'admin']) || $this->can_be_presenter;
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is presenter.
     */
    public function isPresenter(): bool
    {
        return $this->role === 'presenter' || $this->role === 'admin';
    }

    /**
     * Check if user is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->is_suspended;
    }

    /**
     * Get user's current avatar URL.
     */
    public function getAvatarUrlAttribute(): string
    {
        // Custom avatar
        if ($this->avatar_preference === 'custom' && $this->currentAvatar) {
            return asset($this->currentAvatar->image_url);
        }
        
        // Random avatar
        if ($this->avatar_preference === 'random' && $this->preferredRandomAvatar) {
            return asset($this->preferredRandomAvatar->image_path);
        }
        
        // Default avatar or uploaded avatar
        return $this->avatar ? asset($this->avatar) : asset('images/default-avatar.png');
    }

    /**
     * Get user statistics.
     */
    public function getStats(): array
    {
        return [
            'quizzes_created' => $this->quizzes()->count(),
            'quizzes_played' => $this->participants()->count(),
            'sessions_presented' => $this->presentedSessions()->count(),
            'badges_earned' => $this->badges()->count(),
            'total_score' => $this->participants()->sum('score'),
            'average_score' => $this->participants()->avg('score'),
            'friends_count' => $this->friends()->count(),
        ];
    }

    /**
     * Apply a theme to this user.
     */
    public function applyTheme(Theme $theme): void
    {
        $this->themes()->detach();
        $this->themes()->attach($theme->id, ['applied_at' => now()]);
        $this->update(['current_theme_id' => $theme->id]);
    }

    /**
     * Scope: Active users (not suspended).
     */
    public function scopeActive($query)
    {
        return $query->where('is_suspended', false);
    }

    /**
     * Scope: Users by role.
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope: Presenters.
     */
    public function scopePresenters($query)
    {
        return $query->whereIn('role', ['presenter', 'admin'])
            ->orWhere('can_be_presenter', true);
    }

    /**
     * Scope: Admins.
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Get user achievements.
     */
    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    /**
     * Get achievements earned by this user.
     */
    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('earned_at', 'progress', 'metadata')
            ->withTimestamps();
    }

    /**
     * Get current league.
     */
    public function currentLeague(): BelongsTo
    {
        return $this->belongsTo(League::class, 'current_league_id');
    }

    /**
     * Get total achievement points.
     */
    public function getTotalAchievementPoints(): int
    {
        return $this->userAchievements()
            ->whereNotNull('earned_at')
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->sum('achievements.points');
    }

    /**
     * Check if user has specific achievement.
     */
    public function hasAchievement(string $slug): bool
    {
        return $this->userAchievements()
            ->whereHas('achievement', function($query) use ($slug) {
                $query->where('slug', $slug);
            })
            ->whereNotNull('earned_at')
            ->exists();
    }

    /**
     * Get achievement progress.
     */
    public function getAchievementProgress(string $slug): ?UserAchievement
    {
        return $this->userAchievements()
            ->whereHas('achievement', function($query) use ($slug) {
                $query->where('slug', $slug);
            })
            ->first();
    }

    /**
     * Award achievement to user.
     */
    public function awardAchievement(Achievement $achievement, array $metadata = []): UserAchievement
    {
        return $this->userAchievements()->updateOrCreate(
            ['achievement_id' => $achievement->id],
            [
                'earned_at' => now(),
                'progress' => 100,
                'metadata' => $metadata
            ]
        );
    }

    /**
     * Get user's league statistics.
     */
    public function getLeagueStats(): array
    {
        $points = $this->getTotalAchievementPoints();
        $currentLeague = $this->currentLeague;
        
        return [
            'current_points' => $points,
            'current_league' => $currentLeague ? $currentLeague->display_data : null,
            'next_league' => $currentLeague ? $currentLeague->next_league?->display_data : null,
            'progress_to_next' => $currentLeague ? $currentLeague->getProgressToNextLeague($this) : 0,
        ];
    }
}
