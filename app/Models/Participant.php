<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Participant extends Model
{
    use HasFactory;

    // Désactiver les timestamps automatiques car cette table n'a pas created_at/updated_at
    public $timestamps = false;

    protected $fillable = [
        'quiz_session_id',
        'user_id',
        'pseudo',
        'score',
        'joined_at',
        'is_active',
        'is_presenter_mode',
        'random_avatar_id',
        'avatar_url',
        'display_color',
    ];

    protected $casts = [
        'score' => 'integer',
        'is_active' => 'boolean',
        'is_presenter_mode' => 'boolean',
        'joined_at' => 'datetime',
    ];

    /**
     * Get the quiz session this participant belongs to.
     */
    public function quizSession(): BelongsTo
    {
        return $this->belongsTo(QuizSession::class);
    }

    /**
     * Get the user account (if registered user).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the random avatar assigned to this participant.
     */
    public function randomAvatar(): BelongsTo
    {
        return $this->belongsTo(RandomAvatar::class);
    }

    /**
     * Get the participant's answers.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(ParticipantAnswer::class);
    }

    /**
     * Get the leaderboard entry for this participant.
     */
    public function leaderboardEntry()
    {
        return $this->hasOne(LeaderboardEntry::class);
    }

    /**
     * Check if participant is a guest (anonymous).
     */
    public function isGuest(): bool
    {
        return is_null($this->user_id);
    }

    /**
     * Check if participant is the presenter.
     */
    public function isPresenter(): bool
    {
        return $this->is_presenter_mode;
    }

    /**
     * Get display name for this participant.
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->isPresenter()) {
            return $this->user->name ?? 'Présentateur';
        }
        
        return $this->pseudo ?? $this->user->name ?? 'Participant';
    }

    /**
     * Get avatar URL for this participant.
     */
    public function getAvatarAttribute(): string
    {
        // Custom avatar URL if set
        if ($this->avatar_url) {
            return $this->avatar_url;
        }
        
        // Random avatar if assigned
        if ($this->randomAvatar) {
            return asset($this->randomAvatar->image_path);
        }
        
        // User avatar if registered user
        if ($this->user && $this->user->avatar) {
            return $this->user->avatar;
        }
        
        // Default avatar
        return asset('images/default-avatar.png');
    }

    /**
     * Get participant statistics.
     */
    public function getStats(): array
    {
        $answers = $this->answers;
        $correctAnswers = $answers->where('points_earned', '>', 0);
        
        return [
            'total_answers' => $answers->count(),
            'correct_answers' => $correctAnswers->count(),
            'wrong_answers' => $answers->count() - $correctAnswers->count(),
            'accuracy' => $answers->count() > 0 ? 
                round(($correctAnswers->count() / $answers->count()) * 100, 2) : 0,
            'average_response_time' => round($answers->avg('response_time') ?? 0, 2),
            'total_score' => $this->score,
            'current_streak' => $this->calculateCurrentStreak(),
            'best_streak' => $this->calculateBestStreak(),
        ];
    }

    /**
     * Calculate current answer streak.
     */
    public function calculateCurrentStreak(): int
    {
        $answers = $this->answers()
            ->orderBy('created_at', 'desc')
            ->get();
            
        $streak = 0;
        foreach ($answers as $answer) {
            if ($answer->points_earned > 0) {
                $streak++;
            } else {
                break;
            }
        }
        
        return $streak;
    }

    /**
     * Calculate best answer streak.
     */
    public function calculateBestStreak(): int
    {
        $answers = $this->answers()
            ->orderBy('created_at')
            ->get();
            
        $bestStreak = 0;
        $currentStreak = 0;
        
        foreach ($answers as $answer) {
            if ($answer->points_earned > 0) {
                $currentStreak++;
                $bestStreak = max($bestStreak, $currentStreak);
            } else {
                $currentStreak = 0;
            }
        }
        
        return $bestStreak;
    }

    /**
     * Add points to participant score.
     */
    public function addPoints(int $points): void
    {
        $this->increment('score', $points);
    }

    /**
     * Deactivate participant.
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Scope: Active participants.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Guest participants.
     */
    public function scopeGuests($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Scope: Registered participants.
     */
    public function scopeRegistered($query)
    {
        return $query->whereNotNull('user_id');
    }

    /**
     * Scope: Presenters.
     */
    public function scopePresenters($query)
    {
        return $query->where('is_presenter_mode', true);
    }
}