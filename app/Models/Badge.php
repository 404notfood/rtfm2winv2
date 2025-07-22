<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'category',
        'requirements',
    ];

    protected $casts = [
        'requirements' => 'array',
    ];

    /**
     * Get users who earned this badge.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('earned_at', 'metadata');
    }

    /**
     * Check if a user has earned this badge.
     */
    public function isEarnedBy(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Check if a user meets the requirements for this badge.
     */
    public function checkRequirements(User $user): bool
    {
        if (!$this->requirements) {
            return false;
        }

        switch ($this->category) {
            case 'creator':
                return $this->checkCreatorRequirements($user);
            case 'player':
                return $this->checkPlayerRequirements($user);
            case 'achievement':
                return $this->checkAchievementRequirements($user);
            default:
                return false;
        }
    }

    /**
     * Check creator-specific requirements.
     */
    private function checkCreatorRequirements(User $user): bool
    {
        $requirements = $this->requirements;
        
        if (isset($requirements['quizzes_created'])) {
            $quizCount = $user->quizzes()->count();
            if ($quizCount < $requirements['quizzes_created']) {
                return false;
            }
        }

        if (isset($requirements['total_participants'])) {
            $totalParticipants = $user->quizzes()
                ->withSum('sessions.participants', 'id')
                ->sum('sessions_participants_sum_id');
            if ($totalParticipants < $requirements['total_participants']) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check player-specific requirements.
     */
    private function checkPlayerRequirements(User $user): bool
    {
        $requirements = $this->requirements;
        
        if (isset($requirements['quizzes_played'])) {
            $playedCount = $user->participants()->count();
            if ($playedCount < $requirements['quizzes_played']) {
                return false;
            }
        }

        if (isset($requirements['different_categories'])) {
            $categoriesPlayed = $user->participants()
                ->join('quiz_sessions', 'participants.quiz_session_id', '=', 'quiz_sessions.id')
                ->join('quizzes', 'quiz_sessions.quiz_id', '=', 'quizzes.id')
                ->distinct('quizzes.category')
                ->count('quizzes.category');
            if ($categoriesPlayed < $requirements['different_categories']) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check achievement-specific requirements.
     */
    private function checkAchievementRequirements(User $user): bool
    {
        $requirements = $this->requirements;
        
        if (isset($requirements['perfect_score'])) {
            $perfectScores = $user->participants()
                ->whereHas('answers', function ($query) {
                    $query->where('is_perfect', true);
                })
                ->count();
            if ($perfectScores < 1) {
                return false;
            }
        }

        if (isset($requirements['time_under'])) {
            // Check for completion under specific time
            $fastCompletions = $user->participants()
                ->whereHas('quizSession', function ($query) use ($requirements) {
                    $query->whereRaw('TIMESTAMPDIFF(SECOND, started_at, ended_at) < ?', 
                        [$requirements['time_under']]);
                })
                ->count();
            if ($fastCompletions < 1) {
                return false;
            }
        }

        if (isset($requirements['friends_invited'])) {
            // This would require a separate tracking system
            return true; // Placeholder
        }

        return true;
    }

    /**
     * Award this badge to a user.
     */
    public function awardTo(User $user, array $metadata = []): void
    {
        if (!$this->isEarnedBy($user)) {
            $this->users()->attach($user->id, [
                'earned_at' => now(),
                'metadata' => json_encode($metadata),
            ]);
        }
    }

    /**
     * Get the icon URL.
     */
    public function getIconUrlAttribute(): string
    {
        return $this->icon ? asset("images/badges/{$this->icon}") : asset('images/badges/default.png');
    }

    /**
     * Scope: Creator badges.
     */
    public function scopeCreator($query)
    {
        return $query->where('category', 'creator');
    }

    /**
     * Scope: Player badges.
     */
    public function scopePlayer($query)
    {
        return $query->where('category', 'player');
    }

    /**
     * Scope: Achievement badges.
     */
    public function scopeAchievement($query)
    {
        return $query->where('category', 'achievement');
    }
}