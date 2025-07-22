<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class UserAchievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'achievement_id',
        'earned_at',
        'progress',
        'metadata'
    ];

    protected $casts = [
        'earned_at' => 'datetime',
        'metadata' => 'array',
        'progress' => 'integer'
    ];

    /**
     * Get the user that owns the achievement.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the achievement that was earned.
     */
    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }

    /**
     * Scope for completed achievements only.
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('earned_at');
    }

    /**
     * Scope for achievements in progress.
     */
    public function scopeInProgress($query)
    {
        return $query->whereNull('earned_at');
    }

    /**
     * Scope by achievement category.
     */
    public function scopeCategory($query, $category)
    {
        return $query->whereHas('achievement', function($q) use ($category) {
            $q->where('category', $category);
        });
    }

    /**
     * Scope for recent achievements (last 30 days).
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('earned_at', '>=', now()->subDays($days));
    }

    /**
     * Check if achievement is completed.
     */
    public function getIsCompletedAttribute(): bool
    {
        return !is_null($this->earned_at);
    }

    /**
     * Get progress percentage.
     */
    public function getProgressPercentageAttribute(): int
    {
        if ($this->is_completed) {
            return 100;
        }

        if (!$this->achievement) {
            return 0;
        }

        $requirements = $this->achievement->requirements;
        if (empty($requirements)) {
            return 0;
        }

        // Calculate progress based on achievement type
        return $this->calculateProgressPercentage($requirements);
    }

    /**
     * Calculate progress percentage based on requirements.
     */
    protected function calculateProgressPercentage(array $requirements): int
    {
        $metadata = $this->metadata ?? [];
        
        // Handle different types of achievements
        if (isset($requirements['count'])) {
            $current = $metadata['current_count'] ?? 0;
            $target = $requirements['count'];
            return min(100, round(($current / $target) * 100));
        }

        if (isset($requirements['score'])) {
            $current = $metadata['current_score'] ?? 0;
            $target = $requirements['score'];
            return min(100, round(($current / $target) * 100));
        }

        if (isset($requirements['streak'])) {
            $current = $metadata['current_streak'] ?? 0;
            $target = $requirements['streak'];
            return min(100, round(($current / $target) * 100));
        }

        return $this->progress ?? 0;
    }

    /**
     * Update progress towards achievement.
     */
    public function updateProgress(array $data): void
    {
        $metadata = $this->metadata ?? [];
        
        // Merge new data with existing metadata
        $metadata = array_merge($metadata, $data);
        
        // Calculate new progress
        $newProgress = $this->calculateProgressPercentage($this->achievement->requirements ?? []);
        
        $this->update([
            'metadata' => $metadata,
            'progress' => $newProgress
        ]);

        // Check if achievement should be completed
        if ($newProgress >= 100 && !$this->is_completed) {
            $this->complete();
        }
    }

    /**
     * Mark achievement as completed.
     */
    public function complete(): void
    {
        $this->update([
            'earned_at' => now(),
            'progress' => 100
        ]);

        // Trigger achievement earned event
        if (class_exists('\App\Events\AchievementEarned')) {
            event(new \App\Events\AchievementEarned($this->user, $this->achievement));
        }
    }

    /**
     * Get time since earned.
     */
    public function getTimeSinceEarnedAttribute(): ?string
    {
        if (!$this->is_completed) {
            return null;
        }

        return $this->earned_at->diffForHumans();
    }

    /**
     * Get days to complete achievement.
     */
    public function getDaysToCompleteAttribute(): ?int
    {
        if (!$this->is_completed) {
            return null;
        }

        return $this->user->created_at->diffInDays($this->earned_at);
    }

    /**
     * Get achievement display data.
     */
    public function getDisplayDataAttribute(): array
    {
        return [
            'id' => $this->id,
            'achievement' => [
                'id' => $this->achievement->id,
                'name' => $this->achievement->name,
                'description' => $this->achievement->description,
                'icon' => $this->achievement->icon,
                'category' => $this->achievement->category,
                'rarity' => $this->achievement->rarity,
                'points' => $this->achievement->points,
                'color' => $this->achievement->color,
            ],
            'progress' => $this->progress_percentage,
            'is_completed' => $this->is_completed,
            'earned_at' => $this->earned_at,
            'time_since_earned' => $this->time_since_earned,
            'days_to_complete' => $this->days_to_complete,
            'metadata' => $this->metadata,
        ];
    }

    /**
     * Get achievements by rarity for user.
     */
    public static function getByRarityForUser(User $user): array
    {
        $achievements = static::where('user_id', $user->id)
            ->completed()
            ->with('achievement')
            ->get()
            ->groupBy('achievement.rarity');

        return [
            'common' => $achievements->get('common', collect())->count(),
            'uncommon' => $achievements->get('uncommon', collect())->count(),
            'rare' => $achievements->get('rare', collect())->count(),
            'epic' => $achievements->get('epic', collect())->count(),
            'legendary' => $achievements->get('legendary', collect())->count(),
        ];
    }

    /**
     * Get recent achievements for user.
     */
    public static function getRecentForUser(User $user, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        return static::where('user_id', $user->id)
            ->completed()
            ->with('achievement')
            ->orderBy('earned_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get achievement statistics for user.
     */
    public static function getStatsForUser(User $user): array
    {
        $completed = static::where('user_id', $user->id)->completed()->count();
        $inProgress = static::where('user_id', $user->id)->inProgress()->count();
        $totalPoints = static::where('user_id', $user->id)
            ->completed()
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->sum('achievements.points');

        $rarityBreakdown = static::getByRarityForUser($user);

        return [
            'total_completed' => $completed,
            'total_in_progress' => $inProgress,
            'total_points' => $totalPoints,
            'completion_rate' => $completed + $inProgress > 0 ? 
                round(($completed / ($completed + $inProgress)) * 100, 1) : 0,
            'rarity_breakdown' => $rarityBreakdown,
            'average_points_per_achievement' => $completed > 0 ? round($totalPoints / $completed, 1) : 0,
        ];
    }

    /**
     * Boot method for model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($userAchievement) {
            if (is_null($userAchievement->progress)) {
                $userAchievement->progress = 0;
            }
        });
    }
}