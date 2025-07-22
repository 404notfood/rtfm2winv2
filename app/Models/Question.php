<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'question_text',
        'points',
        'order_index',
        'multiple_answers',
    ];

    protected $casts = [
        'multiple_answers' => 'boolean',
        'points' => 'integer',
        'order_index' => 'integer',
    ];

    /**
     * Get the quiz that owns this question.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the answers for this question.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    /**
     * Get the correct answers for this question.
     */
    public function correctAnswers(): HasMany
    {
        return $this->hasMany(Answer::class)->where('is_correct', true);
    }

    /**
     * Get participant answers for this question.
     */
    public function participantAnswers(): HasMany
    {
        return $this->hasMany(ParticipantAnswer::class);
    }

    /**
     * Get learning stats for this question.
     */
    public function learningStats(): HasMany
    {
        return $this->hasMany(LearningStat::class);
    }

    /**
     * Check if a given answer combination is correct.
     */
    public function isCorrectAnswerCombination(array $answerIds): bool
    {
        $correctAnswerIds = $this->correctAnswers()->pluck('id')->toArray();
        
        if ($this->multiple_answers) {
            // For multiple answers, check if all selected answers are correct
            // and all correct answers are selected
            return count($answerIds) === count($correctAnswerIds) &&
                   empty(array_diff($answerIds, $correctAnswerIds));
        } else {
            // For single answer, check if exactly one correct answer is selected
            return count($answerIds) === 1 && 
                   count($correctAnswerIds) === 1 &&
                   $answerIds[0] === $correctAnswerIds[0];
        }
    }

    /**
     * Calculate points for a given answer combination and response time.
     */
    public function calculatePoints(array $answerIds, float $responseTime): int
    {
        $quiz = $this->quiz;
        $basePoints = $this->points ?: $quiz->base_points;
        $timePenalty = $quiz->time_penalty ?? 10;
        
        if (!$this->isCorrectAnswerCombination($answerIds)) {
            return 0;
        }
        
        // Calculate time-based deduction
        $timeDeduction = (int) ($responseTime * $timePenalty);
        $finalPoints = max(0, $basePoints - $timeDeduction);
        
        // For multiple answers, adjust points based on correct percentage
        if ($this->multiple_answers && $quiz->divide_points_multiple) {
            $correctCount = count($this->correctAnswers);
            $selectedCorrectCount = count(array_intersect(
                $answerIds, 
                $this->correctAnswers()->pluck('id')->toArray()
            ));
            
            if ($correctCount > 0) {
                $percentage = $selectedCorrectCount / $correctCount;
                $finalPoints = (int) ($finalPoints * $percentage);
            }
        }
        
        return $finalPoints;
    }

    /**
     * Get question difficulty based on historical performance.
     */
    public function getDifficultyAttribute(): string
    {
        $successRate = $this->getSuccessRate();
        
        if ($successRate >= 0.8) return 'easy';
        if ($successRate >= 0.5) return 'medium';
        if ($successRate >= 0.3) return 'hard';
        return 'very_hard';
    }

    /**
     * Get success rate for this question.
     */
    public function getSuccessRate(): float
    {
        $totalAnswers = $this->participantAnswers()->count();
        
        if ($totalAnswers === 0) {
            return 0.5; // Default for new questions
        }
        
        $correctAnswers = $this->participantAnswers()
            ->where('points_earned', '>', 0)
            ->count();
            
        return $correctAnswers / $totalAnswers;
    }

    /**
     * Get average response time for this question.
     */
    public function getAverageResponseTime(): float
    {
        return $this->participantAnswers()->avg('response_time') ?? 0;
    }
}