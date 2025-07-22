<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'category',
        'rarity',
        'points',
        'requirements',
        'is_active',
        'metadata'
    ];

    protected $casts = [
        'requirements' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get all user achievements for this achievement.
     */
    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    /**
     * Get all users who have earned this achievement.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot('earned_at', 'metadata')
            ->withTimestamps();
    }

    /**
     * Scope for active achievements only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by category.
     */
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope by rarity.
     */
    public function scopeRarity($query, $rarity)
    {
        return $query->where('rarity', $rarity);
    }

    /**
     * Get achievement difficulty level based on rarity.
     */
    public function getDifficultyLevelAttribute(): string
    {
        return match($this->rarity) {
            'common' => 'Facile',
            'uncommon' => 'Moyen',
            'rare' => 'Difficile',
            'epic' => 'Très Difficile',
            'legendary' => 'Légendaire',
            default => 'Normal'
        };
    }

    /**
     * Get achievement color based on rarity.
     */
    public function getColorAttribute(): string
    {
        return match($this->rarity) {
            'common' => '#6c757d',
            'uncommon' => '#28a745',
            'rare' => '#007bff',
            'epic' => '#6f42c1',
            'legendary' => '#fd7e14',
            default => '#6c757d'
        };
    }

    /**
     * Check if achievement has specific requirement.
     */
    public function hasRequirement(string $key): bool
    {
        return isset($this->requirements[$key]);
    }

    /**
     * Get requirement value.
     */
    public function getRequirement(string $key, $default = null)
    {
        return $this->requirements[$key] ?? $default;
    }

    /**
     * Get total users who earned this achievement.
     */
    public function getTotalEarnersAttribute(): int
    {
        return $this->userAchievements()->count();
    }

    /**
     * Get earn rate percentage.
     */
    public function getEarnRateAttribute(): float
    {
        $totalUsers = User::count();
        if ($totalUsers === 0) {
            return 0.0;
        }
        
        return round(($this->total_earners / $totalUsers) * 100, 2);
    }

    /**
     * Check if achievement is rare (less than 10% earn rate).
     */
    public function getIsRareAttribute(): bool
    {
        return $this->earn_rate < 10;
    }

    /**
     * Get recent earners (last 10).
     */
    public function getRecentEarnersAttribute()
    {
        return $this->userAchievements()
            ->with('user')
            ->orderBy('earned_at', 'desc')
            ->limit(10)
            ->get();
    }

    /**
     * Get achievement statistics.
     */
    public function getStatsAttribute(): array
    {
        return [
            'total_earners' => $this->total_earners,
            'earn_rate' => $this->earn_rate,
            'is_rare' => $this->is_rare,
            'difficulty_level' => $this->difficulty_level,
            'average_time_to_earn' => $this->getAverageTimeToEarn(),
        ];
    }

    /**
     * Calculate average time to earn this achievement.
     */
    protected function getAverageTimeToEarn(): ?float
    {
        $userAchievements = $this->userAchievements()
            ->whereHas('user')
            ->with('user')
            ->get();

        if ($userAchievements->isEmpty()) {
            return null;
        }

        $totalDays = $userAchievements->sum(function ($userAchievement) {
            return $userAchievement->user->created_at->diffInDays($userAchievement->earned_at);
        });

        return round($totalDays / $userAchievements->count(), 1);
    }

    /**
     * Boot method for model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($achievement) {
            if (empty($achievement->slug)) {
                $achievement->slug = \Str::slug($achievement->name);
            }
        });
    }
}