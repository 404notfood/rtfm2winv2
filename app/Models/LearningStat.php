<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'category',
        'total_questions_answered',
        'correct_answers',
        'incorrect_answers',
        'accuracy_rate',
        'average_response_time',
        'fastest_response_time',
        'slowest_response_time',
        'streak_current',
        'streak_best',
        'study_time_minutes',
        'sessions_completed',
        'difficulty_level',
        'mastery_level',
        'learning_progress',
        'weak_areas',
        'strong_areas',
        'last_activity_date',
        'metadata'
    ];

    protected $casts = [
        'accuracy_rate' => 'decimal:2',
        'average_response_time' => 'decimal:2',
        'fastest_response_time' => 'decimal:2',
        'slowest_response_time' => 'decimal:2',
        'learning_progress' => 'decimal:2',
        'mastery_level' => 'decimal:2',
        'weak_areas' => 'array',
        'strong_areas' => 'array',
        'last_activity_date' => 'datetime',
        'metadata' => 'array'
    ];

    /**
     * Mastery levels
     */
    const MASTERY_BEGINNER = 0;
    const MASTERY_NOVICE = 25;
    const MASTERY_INTERMEDIATE = 50;
    const MASTERY_ADVANCED = 75;
    const MASTERY_EXPERT = 90;

    /**
     * Difficulty levels
     */
    const DIFFICULTY_EASY = 1;
    const DIFFICULTY_MEDIUM = 2;
    const DIFFICULTY_HARD = 3;
    const DIFFICULTY_EXPERT = 4;

    /**
     * Get the user that owns these learning stats
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Update learning stats after a quiz session
     */
    public static function updateFromSession(User $user, QuizSession $session, Participant $participant): void
    {
        $quiz = $session->quiz;
        $subject = $quiz->category ?? 'general';
        $category = $quiz->subcategory ?? 'mixed';
        
        $answers = $participant->answers()->with('question')->get();
        $correctAnswers = $answers->where('is_correct', true);
        $incorrectAnswers = $answers->where('is_correct', false);
        
        $stats = static::firstOrCreate(
            [
                'user_id' => $user->id,
                'subject' => $subject,
                'category' => $category
            ],
            [
                'total_questions_answered' => 0,
                'correct_answers' => 0,
                'incorrect_answers' => 0,
                'accuracy_rate' => 0,
                'average_response_time' => 0,
                'fastest_response_time' => 0,
                'slowest_response_time' => 0,
                'streak_current' => 0,
                'streak_best' => 0,
                'study_time_minutes' => 0,
                'sessions_completed' => 0,
                'difficulty_level' => self::DIFFICULTY_EASY,
                'mastery_level' => self::MASTERY_BEGINNER,
                'learning_progress' => 0,
                'weak_areas' => [],
                'strong_areas' => []
            ]
        );

        // Update basic stats
        $stats->increment('total_questions_answered', $answers->count());
        $stats->increment('correct_answers', $correctAnswers->count());
        $stats->increment('incorrect_answers', $incorrectAnswers->count());
        $stats->increment('sessions_completed');

        // Calculate new accuracy rate
        $newAccuracy = $stats->total_questions_answered > 0 
            ? ($stats->correct_answers / $stats->total_questions_answered) * 100 
            : 0;
        $stats->update(['accuracy_rate' => round($newAccuracy, 2)]);

        // Update response times
        $responseTimes = $answers->pluck('response_time')->filter();
        if ($responseTimes->isNotEmpty()) {
            $avgResponseTime = $responseTimes->avg();
            $fastestTime = $responseTimes->min();
            $slowestTime = $responseTimes->max();

            $stats->update([
                'average_response_time' => round($avgResponseTime, 2),
                'fastest_response_time' => $stats->fastest_response_time > 0 
                    ? min($stats->fastest_response_time, $fastestTime) 
                    : $fastestTime,
                'slowest_response_time' => max($stats->slowest_response_time, $slowestTime)
            ]);
        }

        // Calculate current streak
        $currentStreak = static::calculateCurrentStreak($answers);
        $stats->update([
            'streak_current' => $currentStreak,
            'streak_best' => max($stats->streak_best, $currentStreak)
        ]);

        // Update study time (approximate)
        $sessionDuration = $session->ended_at && $session->started_at 
            ? $session->ended_at->diffInMinutes($session->started_at)
            : 10; // Default estimate
        $stats->increment('study_time_minutes', $sessionDuration);

        // Update mastery and difficulty
        $stats->updateMasteryLevel();
        $stats->updateDifficultyLevel();

        // Update learning areas
        $stats->updateLearningAreas($answers);

        // Update activity date
        $stats->update(['last_activity_date' => now()]);
    }

    /**
     * Calculate current streak from answers
     */
    private static function calculateCurrentStreak($answers): int
    {
        $streak = 0;
        foreach ($answers->sortByDesc('created_at') as $answer) {
            if ($answer->is_correct) {
                $streak++;
            } else {
                break;
            }
        }
        return $streak;
    }

    /**
     * Update mastery level based on performance
     */
    public function updateMasteryLevel(): void
    {
        $mastery = match(true) {
            $this->accuracy_rate >= 95 && $this->sessions_completed >= 20 => self::MASTERY_EXPERT,
            $this->accuracy_rate >= 85 && $this->sessions_completed >= 15 => self::MASTERY_ADVANCED,
            $this->accuracy_rate >= 70 && $this->sessions_completed >= 10 => self::MASTERY_INTERMEDIATE,
            $this->accuracy_rate >= 50 && $this->sessions_completed >= 5 => self::MASTERY_NOVICE,
            default => self::MASTERY_BEGINNER
        };

        $this->update(['mastery_level' => $mastery]);
    }

    /**
     * Update difficulty level based on performance
     */
    public function updateDifficultyLevel(): void
    {
        $difficulty = match(true) {
            $this->accuracy_rate >= 90 => min(self::DIFFICULTY_EXPERT, $this->difficulty_level + 1),
            $this->accuracy_rate >= 80 => $this->difficulty_level,
            $this->accuracy_rate >= 60 => max(self::DIFFICULTY_EASY, $this->difficulty_level),
            default => max(self::DIFFICULTY_EASY, $this->difficulty_level - 1)
        };

        $this->update(['difficulty_level' => $difficulty]);
    }

    /**
     * Update learning areas (weak/strong points)
     */
    public function updateLearningAreas($answers): void
    {
        $topicPerformance = [];

        foreach ($answers as $answer) {
            $topic = $answer->question->topic ?? 'general';
            if (!isset($topicPerformance[$topic])) {
                $topicPerformance[$topic] = ['correct' => 0, 'total' => 0];
            }
            $topicPerformance[$topic]['total']++;
            if ($answer->is_correct) {
                $topicPerformance[$topic]['correct']++;
            }
        }

        $weakAreas = [];
        $strongAreas = [];

        foreach ($topicPerformance as $topic => $performance) {
            $accuracy = $performance['total'] > 0 ? ($performance['correct'] / $performance['total']) * 100 : 0;
            
            if ($accuracy < 60) {
                $weakAreas[] = $topic;
            } elseif ($accuracy >= 85) {
                $strongAreas[] = $topic;
            }
        }

        $this->update([
            'weak_areas' => array_unique(array_merge($this->weak_areas ?? [], $weakAreas)),
            'strong_areas' => array_unique(array_merge($this->strong_areas ?? [], $strongAreas))
        ]);
    }

    /**
     * Get learning recommendations
     */
    public function getRecommendations(): array
    {
        $recommendations = [];

        // Based on weak areas
        if (!empty($this->weak_areas)) {
            $recommendations[] = [
                'type' => 'practice',
                'title' => 'Travaillez vos points faibles',
                'description' => 'Concentrez-vous sur : ' . implode(', ', $this->weak_areas),
                'priority' => 'high'
            ];
        }

        // Based on accuracy rate
        if ($this->accuracy_rate < 70) {
            $recommendations[] = [
                'type' => 'review',
                'title' => 'Révisez les bases',
                'description' => 'Votre taux de réussite est de ' . $this->accuracy_rate . '%. Révisez les concepts fondamentaux.',
                'priority' => 'high'
            ];
        }

        // Based on response time
        if ($this->average_response_time > 30) {
            $recommendations[] = [
                'type' => 'speed',
                'title' => 'Améliorez votre vitesse',
                'description' => 'Entraînez-vous à répondre plus rapidement pour gagner en confiance.',
                'priority' => 'medium'
            ];
        }

        return $recommendations;
    }

    /**
     * Get mastery level name
     */
    public function getMasteryLevelNameAttribute(): string
    {
        return match($this->mastery_level) {
            self::MASTERY_EXPERT => 'Expert',
            self::MASTERY_ADVANCED => 'Avancé',
            self::MASTERY_INTERMEDIATE => 'Intermédiaire',
            self::MASTERY_NOVICE => 'Débutant+',
            default => 'Débutant'
        };
    }

    /**
     * Get difficulty level name
     */
    public function getDifficultyLevelNameAttribute(): string
    {
        return match($this->difficulty_level) {
            self::DIFFICULTY_EXPERT => 'Expert',
            self::DIFFICULTY_HARD => 'Difficile',
            self::DIFFICULTY_MEDIUM => 'Moyen',
            default => 'Facile'
        };
    }

    /**
     * Get overall stats for a user
     */
    public static function getOverallStats(User $user): array
    {
        $stats = static::where('user_id', $user->id)->get();

        return [
            'total_questions' => $stats->sum('total_questions_answered'),
            'total_correct' => $stats->sum('correct_answers'),
            'overall_accuracy' => $stats->avg('accuracy_rate'),
            'total_study_time' => $stats->sum('study_time_minutes'),
            'total_sessions' => $stats->sum('sessions_completed'),
            'best_streak' => $stats->max('streak_best'),
            'subjects_studied' => $stats->pluck('subject')->unique()->count(),
            'average_mastery' => $stats->avg('mastery_level')
        ];
    }
}