<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderboardEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_session_id',
        'participant_id',
        'user_id',
        'pseudo',
        'score',
        'position',
        'completion_time',
        'correct_answers',
        'total_questions',
        'accuracy_percentage',
        'streak_best',
        'bonus_points',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'accuracy_percentage' => 'decimal:2',
        'completion_time' => 'decimal:2'
    ];

    /**
     * Get the quiz session this entry belongs to
     */
    public function quizSession(): BelongsTo
    {
        return $this->belongsTo(QuizSession::class);
    }

    /**
     * Get the participant this entry represents
     */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * Get the user this entry represents (if not guest)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Update leaderboard for a quiz session
     */
    public static function updateForSession(QuizSession $session): void
    {
        $participants = $session->participants()
            ->with('answers.question')
            ->get()
            ->map(function ($participant) use ($session) {
                $answers = $participant->answers;
                $correctAnswers = $answers->where('is_correct', true)->count();
                $totalQuestions = $session->quiz->questions()->count();
                $accuracy = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
                
                // Calculate completion time (sum of response times)
                $completionTime = $answers->sum('response_time');
                
                // Calculate best streak
                $streak = 0;
                $bestStreak = 0;
                foreach ($answers->sortBy('created_at') as $answer) {
                    if ($answer->is_correct) {
                        $streak++;
                        $bestStreak = max($bestStreak, $streak);
                    } else {
                        $streak = 0;
                    }
                }

                return [
                    'participant_id' => $participant->id,
                    'user_id' => $participant->user_id,
                    'pseudo' => $participant->pseudo,
                    'score' => $participant->score,
                    'completion_time' => $completionTime,
                    'correct_answers' => $correctAnswers,
                    'total_questions' => $totalQuestions,
                    'accuracy_percentage' => round($accuracy, 2),
                    'streak_best' => $bestStreak,
                    'bonus_points' => 0, // Could be calculated based on scoring config
                    'metadata' => [
                        'answers_breakdown' => $answers->groupBy('is_correct')->map->count(),
                        'average_response_time' => $answers->avg('response_time'),
                        'fastest_answer' => $answers->min('response_time'),
                        'slowest_answer' => $answers->max('response_time')
                    ]
                ];
            })
            ->sortByDesc('score')
            ->values();

        // Clear existing entries for this session
        static::where('quiz_session_id', $session->id)->delete();

        // Create new entries with positions
        foreach ($participants as $index => $participantData) {
            static::create([
                'quiz_session_id' => $session->id,
                'position' => $index + 1,
                ...$participantData
            ]);
        }
    }

    /**
     * Get leaderboard for a session with ranking
     */
    public static function getForSession(QuizSession $session, int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = static::where('quiz_session_id', $session->id)
            ->orderBy('position')
            ->with(['participant', 'user']);

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get global leaderboard across all sessions
     */
    public static function getGlobal(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::select('user_id', 'pseudo')
            ->selectRaw('COUNT(*) as sessions_played')
            ->selectRaw('SUM(score) as total_score')
            ->selectRaw('AVG(score) as average_score')
            ->selectRaw('SUM(correct_answers) as total_correct')
            ->selectRaw('SUM(total_questions) as total_questions')
            ->selectRaw('AVG(accuracy_percentage) as average_accuracy')
            ->selectRaw('MAX(streak_best) as best_streak')
            ->whereNotNull('user_id')
            ->groupBy('user_id', 'pseudo')
            ->orderByDesc('total_score')
            ->limit($limit)
            ->with('user')
            ->get();
    }

    /**
     * Get user ranking
     */
    public static function getUserRanking(User $user): array
    {
        $userStats = static::where('user_id', $user->id)
            ->selectRaw('COUNT(*) as sessions_played')
            ->selectRaw('SUM(score) as total_score')
            ->selectRaw('AVG(score) as average_score')
            ->selectRaw('AVG(accuracy_percentage) as average_accuracy')
            ->selectRaw('MAX(streak_best) as best_streak')
            ->first();

        if (!$userStats || $userStats->sessions_played == 0) {
            return [
                'rank' => null,
                'stats' => null
            ];
        }

        // Calculate global rank
        $rank = static::selectRaw('user_id, SUM(score) as total_score')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->havingRaw('SUM(score) > ?', [$userStats->total_score])
            ->count() + 1;

        return [
            'rank' => $rank,
            'stats' => $userStats
        ];
    }
}