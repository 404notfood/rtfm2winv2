<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAnalytic extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'total_participants',
        'total_sessions',
        'average_score',
        'average_completion_time',
        'difficulty_rating',
        'success_rate',
        'popular_answers',
        'common_mistakes',
        'engagement_metrics',
        'metadata'
    ];

    protected $casts = [
        'popular_answers' => 'array',
        'common_mistakes' => 'array',
        'engagement_metrics' => 'array',
        'metadata' => 'array',
        'difficulty_rating' => 'decimal:2',
        'success_rate' => 'decimal:2',
        'average_score' => 'decimal:2',
        'average_completion_time' => 'decimal:2'
    ];

    /**
     * Get the quiz that owns this analytic record
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Calculate analytics for a quiz
     */
    public static function calculateForQuiz(Quiz $quiz): array
    {
        $sessions = $quiz->sessions()->completed()->with('participants.answers')->get();
        
        if ($sessions->isEmpty()) {
            return [
                'total_participants' => 0,
                'total_sessions' => 0,
                'average_score' => 0,
                'average_completion_time' => 0,
                'difficulty_rating' => 0,
                'success_rate' => 0,
                'popular_answers' => [],
                'common_mistakes' => [],
                'engagement_metrics' => []
            ];
        }

        $totalParticipants = $sessions->sum('participants_count');
        $allParticipants = $sessions->flatMap->participants;
        
        $averageScore = $allParticipants->avg('score') ?? 0;
        $averageTime = $sessions->avg('duration') ?? 0;
        
        // Calculate success rate (participants scoring > 70%)
        $passingScore = $quiz->questions->sum('points') * 0.7;
        $successfulParticipants = $allParticipants->where('score', '>=', $passingScore);
        $successRate = $totalParticipants > 0 ? ($successfulParticipants->count() / $totalParticipants) * 100 : 0;
        
        // Calculate difficulty rating based on success rate
        $difficultyRating = match(true) {
            $successRate >= 80 => 1, // Easy
            $successRate >= 60 => 2, // Medium
            $successRate >= 40 => 3, // Hard
            default => 4 // Very Hard
        };

        return [
            'total_participants' => $totalParticipants,
            'total_sessions' => $sessions->count(),
            'average_score' => round($averageScore, 2),
            'average_completion_time' => round($averageTime, 2),
            'difficulty_rating' => $difficultyRating,
            'success_rate' => round($successRate, 2),
            'popular_answers' => static::getPopularAnswers($quiz),
            'common_mistakes' => static::getCommonMistakes($quiz),
            'engagement_metrics' => static::getEngagementMetrics($sessions)
        ];
    }

    /**
     * Get popular answer choices
     */
    private static function getPopularAnswers(Quiz $quiz): array
    {
        // Implementation for tracking popular answers
        return [];
    }

    /**
     * Get common mistake patterns
     */
    private static function getCommonMistakes(Quiz $quiz): array
    {
        // Implementation for tracking common mistakes
        return [];
    }

    /**
     * Get engagement metrics
     */
    private static function getEngagementMetrics($sessions): array
    {
        return [
            'average_session_duration' => $sessions->avg('duration'),
            'completion_rate' => $sessions->where('status', 'completed')->count() / max($sessions->count(), 1) * 100,
            'return_rate' => 0 // Calculate return participants
        ];
    }
}