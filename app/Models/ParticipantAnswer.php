<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParticipantAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'question_id',
        'answer_id',
        'response_time',
        'points_earned',
        'base_points',
        'time_bonus',
        'streak_bonus',
        'is_perfect',
        'streak_position',
        'is_timeout',
        'time_percentage',
    ];

    protected $casts = [
        'response_time' => 'float',
        'points_earned' => 'integer',
        'base_points' => 'integer',
        'time_bonus' => 'integer',
        'streak_bonus' => 'integer',
        'is_perfect' => 'boolean',
        'streak_position' => 'integer',
        'is_timeout' => 'boolean',
        'time_percentage' => 'float',
    ];

    /**
     * Get the participant who answered.
     */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * Get the question that was answered.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the selected answer.
     */
    public function answer(): BelongsTo
    {
        return $this->belongsTo(Answer::class);
    }

    /**
     * Check if this answer was correct.
     */
    public function isCorrect(): bool
    {
        return $this->points_earned > 0;
    }

    /**
     * Get the speed rating for this answer.
     */
    public function getSpeedRating(): string
    {
        if ($this->time_percentage <= 0.25) return 'lightning';
        if ($this->time_percentage <= 0.5) return 'fast';
        if ($this->time_percentage <= 0.75) return 'normal';
        return 'slow';
    }

    /**
     * Calculate points breakdown.
     */
    public function getPointsBreakdown(): array
    {
        return [
            'base_points' => $this->base_points,
            'time_bonus' => $this->time_bonus,
            'streak_bonus' => $this->streak_bonus,
            'total' => $this->points_earned,
            'is_perfect' => $this->is_perfect,
        ];
    }

    /**
     * Scope: Correct answers only.
     */
    public function scopeCorrect($query)
    {
        return $query->where('points_earned', '>', 0);
    }

    /**
     * Scope: Incorrect answers only.
     */
    public function scopeIncorrect($query)
    {
        return $query->where('points_earned', 0);
    }

    /**
     * Scope: Perfect answers (full points).
     */
    public function scopePerfect($query)
    {
        return $query->where('is_perfect', true);
    }

    /**
     * Scope: Fast answers.
     */
    public function scopeFast($query)
    {
        return $query->where('time_percentage', '<=', 0.5);
    }

    /**
     * Scope: Timeout answers.
     */
    public function scopeTimeout($query)
    {
        return $query->where('is_timeout', true);
    }
}