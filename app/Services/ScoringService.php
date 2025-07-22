<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Participant;
use App\Models\ScoringConfiguration;

class ScoringService
{
    const BASE_SCORE = 3000;
    const TIME_PENALTY_PER_TENTH = 10; // 10 points per 0.1 second
    const STREAK_BONUS_MULTIPLIER = 0.1; // 10% bonus per consecutive correct
    const PERFECT_SCORE_BONUS = 1000;
    const MINIMUM_SCORE = 100;

    /**
     * Calculate score for a participant's answer
     */
    public function calculateScore(
        Question $question, 
        array $selectedAnswerIds, 
        float $responseTime, 
        ?Participant $participant = null,
        ?ScoringConfiguration $config = null
    ): int {
        // Use custom scoring configuration if provided
        $baseScore = $config?->base_score ?? self::BASE_SCORE;
        $timePenalty = $config?->time_penalty ?? self::TIME_PENALTY_PER_TENTH;
        $minimumScore = $config?->minimum_score ?? self::MINIMUM_SCORE;

        // Calculate base score
        $score = $this->calculateBaseScore($question, $selectedAnswerIds, $baseScore);
        
        if ($score === 0) {
            return 0; // Wrong answer gets no points
        }

        // Apply time penalty
        $score = $this->applyTimePenalty($score, $responseTime, $timePenalty);

        // Apply streak bonus if participant provided
        if ($participant) {
            $score = $this->applyStreakBonus($score, $participant);
        }

        // Apply perfect score bonus if applicable
        if ($this->isPerfectAnswer($question, $selectedAnswerIds)) {
            $score = $this->applyPerfectScoreBonus($score, $config);
        }

        // Handle multiple choice scoring
        if ($question->type === 'multiple_choice') {
            $score = $this->calculateMultipleChoiceScore($question, $selectedAnswerIds, $score);
        }

        // Ensure minimum score
        return max($minimumScore, (int) $score);
    }

    /**
     * Calculate base score for correctness
     */
    protected function calculateBaseScore(Question $question, array $selectedAnswerIds, int $baseScore): int
    {
        $correctAnswers = $question->answers()->where('is_correct', true)->pluck('id')->toArray();
        
        // For single choice questions
        if ($question->type === 'single_choice') {
            return in_array($selectedAnswerIds[0] ?? null, $correctAnswers) ? $baseScore : 0;
        }

        // For multiple choice questions - need exact match for full points
        if (count(array_diff($selectedAnswerIds, $correctAnswers)) === 0 && 
            count(array_diff($correctAnswers, $selectedAnswerIds)) === 0) {
            return $baseScore;
        }

        return 0;
    }

    /**
     * Apply time penalty (-10 points per 0.1 second after 5 seconds)
     */
    protected function applyTimePenalty(int $score, float $responseTime, float $penaltyRate): int
    {
        if ($responseTime <= 5.0) {
            return $score; // No penalty for fast responses
        }

        $penaltyTime = $responseTime - 5.0;
        $penaltyPoints = $penaltyTime * $penaltyRate * 10; // *10 for tenths of seconds
        
        return $score - (int) $penaltyPoints;
    }

    /**
     * Calculate partial score for multiple choice questions
     */
    protected function calculateMultipleChoiceScore(Question $question, array $selectedAnswerIds, int $fullScore): int
    {
        $correctAnswers = $question->answers()->where('is_correct', true)->pluck('id')->toArray();
        $incorrectAnswers = $question->answers()->where('is_correct', false)->pluck('id')->toArray();
        
        $correctSelected = count(array_intersect($selectedAnswerIds, $correctAnswers));
        $incorrectSelected = count(array_intersect($selectedAnswerIds, $incorrectAnswers));
        $totalCorrect = count($correctAnswers);
        
        if ($totalCorrect === 0) {
            return 0;
        }

        // Calculate percentage score
        $correctPercentage = $correctSelected / $totalCorrect;
        
        // Penalize incorrect selections
        $penalty = $incorrectSelected * 0.2; // 20% penalty per wrong selection
        $finalPercentage = max(0, $correctPercentage - $penalty);
        
        return (int) ($fullScore * $finalPercentage);
    }

    /**
     * Apply streak bonus for consecutive correct answers
     */
    protected function applyStreakBonus(int $score, Participant $participant): int
    {
        $streak = $this->getCurrentStreak($participant);
        
        if ($streak <= 1) {
            return $score;
        }

        $bonusMultiplier = min(0.5, ($streak - 1) * self::STREAK_BONUS_MULTIPLIER); // Max 50% bonus
        $bonus = $score * $bonusMultiplier;
        
        return $score + (int) $bonus;
    }

    /**
     * Apply perfect score bonus
     */
    protected function applyPerfectScoreBonus(int $score, ?ScoringConfiguration $config = null): int
    {
        $bonus = $config?->perfect_score_bonus ?? self::PERFECT_SCORE_BONUS;
        return $score + $bonus;
    }

    /**
     * Check if answer is perfect (all correct, none incorrect selected)
     */
    protected function isPerfectAnswer(Question $question, array $selectedAnswerIds): bool
    {
        $correctAnswers = $question->answers()->where('is_correct', true)->pluck('id')->toArray();
        
        return count(array_diff($selectedAnswerIds, $correctAnswers)) === 0 && 
               count(array_diff($correctAnswers, $selectedAnswerIds)) === 0;
    }

    /**
     * Get current streak of correct answers for participant
     */
    protected function getCurrentStreak(Participant $participant): int
    {
        $recentAnswers = $participant->answers()
            ->orderBy('submitted_at', 'desc')
            ->limit(10)
            ->get();

        $streak = 0;
        foreach ($recentAnswers as $answer) {
            if ($answer->score > 0) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }

    /**
     * Calculate leaderboard positions and update rankings
     */
    public function updateLeaderboard(array $participants): array
    {
        // Sort participants by score (desc) and then by response time (asc)
        usort($participants, function($a, $b) {
            if ($a['score'] === $b['score']) {
                return $a['avg_response_time'] <=> $b['avg_response_time'];
            }
            return $b['score'] <=> $a['score'];
        });

        // Assign positions
        $leaderboard = [];
        $position = 1;
        
        foreach ($participants as $index => $participant) {
            // Handle ties - same score gets same position
            if ($index > 0 && $participants[$index - 1]['score'] !== $participant['score']) {
                $position = $index + 1;
            }
            
            $leaderboard[] = array_merge($participant, [
                'position' => $position,
                'position_change' => $this->calculatePositionChange($participant, $position),
            ]);
        }

        return $leaderboard;
    }

    /**
     * Calculate position change for animations
     */
    protected function calculatePositionChange(array $participant, int $newPosition): int
    {
        $oldPosition = $participant['previous_position'] ?? $newPosition;
        return $oldPosition - $newPosition; // Positive = moved up, negative = moved down
    }

    /**
     * Get scoring statistics for analytics
     */
    public function getSessionScoringStats(array $participants): array
    {
        if (empty($participants)) {
            return [
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'score_distribution' => [],
                'perfect_scores' => 0,
            ];
        }

        $scores = array_column($participants, 'score');
        
        return [
            'average_score' => round(array_sum($scores) / count($scores), 2),
            'highest_score' => max($scores),
            'lowest_score' => min($scores),
            'score_distribution' => $this->getScoreDistribution($scores),
            'perfect_scores' => count(array_filter($participants, function($p) {
                return isset($p['perfect_answers']) && $p['perfect_answers'] > 0;
            })),
        ];
    }

    /**
     * Get score distribution for analytics
     */
    protected function getScoreDistribution(array $scores): array
    {
        $ranges = [
            '0-1000' => 0,
            '1001-2000' => 0,
            '2001-3000' => 0,
            '3001-4000' => 0,
            '4000+' => 0,
        ];

        foreach ($scores as $score) {
            if ($score <= 1000) {
                $ranges['0-1000']++;
            } elseif ($score <= 2000) {
                $ranges['1001-2000']++;
            } elseif ($score <= 3000) {
                $ranges['2001-3000']++;
            } elseif ($score <= 4000) {
                $ranges['3001-4000']++;
            } else {
                $ranges['4000+']++;
            }
        }

        return $ranges;
    }
}