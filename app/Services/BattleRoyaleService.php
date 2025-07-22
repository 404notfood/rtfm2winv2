<?php

namespace App\Services;

use App\Models\BattleRoyaleSession;
use App\Models\BattleRoyaleParticipant;
use App\Models\Quiz;
use App\Models\Question;
use App\Events\ParticipantEliminated;
use App\Events\EliminationRound;
use App\Events\BattleRoyaleStarted;
use App\Events\BattleRoyaleEnded;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class BattleRoyaleService
{
    /**
     * Process elimination round - eliminate bottom performers
     */
    public function processEliminationRound(BattleRoyaleSession $session): array
    {
        $activeParticipants = $session->activeParticipants()
            ->orderBy('score', 'asc')
            ->orderBy('updated_at', 'asc') // Earlier answers get eliminated first on ties
            ->get();

        $totalActive = $activeParticipants->count();

        if ($totalActive <= 1) {
            // Game over - we have a winner
            $session->end();
            $winner = $activeParticipants->first();
            
            broadcast(new BattleRoyaleEnded($session, $winner))->toOthers();
            
            return [
                'eliminated' => [],
                'remaining' => $totalActive,
                'game_over' => true,
                'winner' => $winner
            ];
        }

        // Calculate how many to eliminate
        $eliminationCandidates = $this->calculateEliminationCandidates($session, $activeParticipants);
        
        $eliminated = [];
        foreach ($eliminationCandidates as $participant) {
            $participant->eliminate($session->current_round);
            $eliminated[] = $participant;
            
            // Broadcast individual elimination
            broadcast(new ParticipantEliminated($session, $participant))->toOthers();
        }

        // Move to next round
        $session->increment('current_round');
        
        // Broadcast elimination round results
        $remainingCount = $totalActive - count($eliminated);
        broadcast(new EliminationRound($session, $eliminated, $remainingCount))->toOthers();

        return [
            'eliminated' => $eliminated,
            'remaining' => $remainingCount,
            'game_over' => false,
            'next_round' => $session->current_round
        ];
    }

    /**
     * Calculate which participants should be eliminated
     */
    public function calculateEliminationCandidates(BattleRoyaleSession $session, Collection $activeParticipants): Collection
    {
        $totalActive = $activeParticipants->count();
        
        // Dynamic elimination based on remaining participants
        if ($totalActive > 16) {
            $eliminationCount = max(1, floor($totalActive * 0.3)); // 30% elimination
        } elseif ($totalActive > 8) {
            $eliminationCount = max(1, floor($totalActive * 0.25)); // 25% elimination
        } elseif ($totalActive > 4) {
            $eliminationCount = max(1, floor($totalActive * 0.2)); // 20% elimination
        } else {
            $eliminationCount = 1; // Eliminate 1 at a time in final rounds
        }

        // Special rules for final rounds
        if ($totalActive == 3) {
            $eliminationCount = 1; // Final 3 -> Final 2
        } elseif ($totalActive == 2) {
            $eliminationCount = 0; // No elimination, let them compete for final win
        }

        return $activeParticipants->take($eliminationCount);
    }

    /**
     * Eliminate participants based on performance and special conditions
     */
    public function eliminateParticipants(BattleRoyaleSession $session, Collection $participants): array
    {
        $eliminated = [];
        
        foreach ($participants as $participant) {
            // Check for special elimination conditions
            if ($this->shouldForceEliminate($participant)) {
                $participant->eliminate($session->current_round);
                $eliminated[] = $participant;
            }
        }

        return $eliminated;
    }

    /**
     * Check if participant should be force eliminated (disconnected, inactive, etc.)
     */
    private function shouldForceEliminate(BattleRoyaleParticipant $participant): bool
    {
        // Eliminate if offline for too long
        if (!$participant->is_online && 
            $participant->metadata && 
            isset($participant->metadata['last_seen'])) {
            
            $lastSeen = \Carbon\Carbon::parse($participant->metadata['last_seen']);
            if ($lastSeen->diffInMinutes(now()) > 3) { // 3 minutes timeout
                return true;
            }
        }

        // Eliminate if health is 0 (if health system enabled)
        if ($participant->health <= 0) {
            return true;
        }

        return false;
    }

    /**
     * Check win condition - return winner if found
     */
    public function checkWinCondition(BattleRoyaleSession $session): ?BattleRoyaleParticipant
    {
        $activeParticipants = $session->activeParticipants()->get();
        
        if ($activeParticipants->count() === 1) {
            $winner = $activeParticipants->first();
            $session->end();
            return $winner;
        }

        return null;
    }

    /**
     * Generate elimination statistics and insights
     */
    public function generateEliminationStats(BattleRoyaleSession $session): array
    {
        $allParticipants = $session->participants()->get();
        $eliminated = $session->eliminatedParticipants()->get();
        $active = $session->activeParticipants()->get();

        return [
            'total_participants' => $allParticipants->count(),
            'eliminated_count' => $eliminated->count(),
            'active_count' => $active->count(),
            'current_round' => $session->current_round,
            'elimination_rate' => $allParticipants->count() > 0 ? 
                round(($eliminated->count() / $allParticipants->count()) * 100, 2) : 0,
            'average_elimination_round' => $eliminated->avg('eliminated_round') ?? 0,
            'fastest_elimination' => $eliminated->min('eliminated_round') ?? 0,
            'elimination_countdown' => $session->getEliminationCountdown(),
            'round_duration' => $session->elimination_interval,
        ];
    }

    /**
     * Apply Battle Royale specific scoring with power-ups and health
     */
    public function calculateBattleRoyaleScore(
        Question $question, 
        array $selectedAnswerIds, 
        float $responseTime,
        BattleRoyaleParticipant $participant
    ): array {
        // Base scoring from ScoringService
        $scoringService = app(ScoringService::class);
        $baseScore = $scoringService->calculateScore($question, $selectedAnswerIds, $responseTime);

        // Battle Royale multipliers
        $multiplier = 1.0;
        $healthGain = 0;
        $powerUpsGained = [];

        // Streak bonus multiplier
        if ($participant->streak >= 3) {
            $multiplier += 0.1 * ($participant->streak - 2); // +10% per streak after 2
        }

        // Power-up effects
        if ($participant->hasPowerUp('double_points')) {
            $multiplier *= 2;
            $participant->usePowerUp('double_points');
        }

        if ($participant->hasPowerUp('time_freeze') && $responseTime < 5) {
            $multiplier += 0.5; // 50% bonus for fast answers with time freeze
        }

        // Health system
        if ($baseScore > 0) {
            $healthGain = min(10, floor($baseScore / 100)); // Gain health for correct answers
            
            // Chance to gain power-ups on correct answers
            if (rand(1, 100) <= 15) { // 15% chance
                $powerUpTypes = ['double_points', 'shield', 'time_freeze', 'health_boost'];
                $powerUpsGained[] = $powerUpTypes[array_rand($powerUpTypes)];
            }
        } else {
            // Wrong answer penalties in Battle Royale
            $participant->takeDamage(5); // Lose health for wrong answers
        }

        $finalScore = (int) ($baseScore * $multiplier);

        return [
            'score' => $finalScore,
            'base_score' => $baseScore,
            'multiplier' => $multiplier,
            'health_gain' => $healthGain,
            'power_ups_gained' => $powerUpsGained,
            'is_correct' => $baseScore > 0,
        ];
    }

    /**
     * Get next random question for Battle Royale
     */
    public function getNextQuestion(BattleRoyaleSession $session, array $quizPool): ?Question
    {
        // Get questions from quiz pool
        $questions = Question::whereIn('quiz_id', $quizPool)
            ->with('answers')
            ->get();

        if ($questions->isEmpty()) {
            return null;
        }

        // For now, return random question
        // TODO: Implement smarter question selection based on difficulty, previous questions
        return $questions->random();
    }

    /**
     * Apply power-up effects
     */
    public function applyPowerUp(BattleRoyaleParticipant $participant, string $powerUpType): array
    {
        if (!$participant->hasPowerUp($powerUpType)) {
            return ['success' => false, 'message' => 'Power-up not available'];
        }

        $effects = [];

        switch ($powerUpType) {
            case 'shield':
                // Protection from next elimination
                $metadata = $participant->metadata ?? [];
                $metadata['shield_active'] = true;
                $participant->update(['metadata' => $metadata]);
                $effects[] = 'Protected from next elimination';
                break;

            case 'health_boost':
                $participant->heal(25);
                $effects[] = 'Restored 25 health points';
                break;

            case 'double_points':
                // This is handled in score calculation
                $effects[] = 'Next correct answer worth double points';
                break;

            case 'time_freeze':
                // This is handled in score calculation
                $effects[] = 'Extra time bonus for next question';
                break;

            default:
                return ['success' => false, 'message' => 'Unknown power-up type'];
        }

        $participant->usePowerUp($powerUpType);

        return [
            'success' => true,
            'effects' => $effects,
            'remaining' => $participant->power_ups[$powerUpType] ?? 0
        ];
    }

    /**
     * Check for automatic eliminations (health, timeout, etc.)
     */
    public function checkAutomaticEliminations(BattleRoyaleSession $session): array
    {
        $eliminated = [];
        $activeParticipants = $session->activeParticipants()->get();

        foreach ($activeParticipants as $participant) {
            if ($this->shouldForceEliminate($participant)) {
                $participant->eliminate($session->current_round);
                $eliminated[] = $participant;
                
                broadcast(new ParticipantEliminated($session, $participant))->toOthers();
            }
        }

        return $eliminated;
    }

    /**
     * Get Battle Royale leaderboard with real-time data and Redis caching
     */
    public function getBattleRoyaleLeaderboard(BattleRoyaleSession $session): Collection
    {
        $cacheKey = "battle_royale_leaderboard_{$session->id}_{$session->current_round}";
        
        return Cache::remember($cacheKey, 3, function () use ($session) {
            return $session->participants()
                ->orderByRaw('is_eliminated ASC') // Active participants first
                ->orderBy('score', 'DESC')
                ->orderBy('eliminated_at', 'DESC') // Later eliminations rank higher
                ->get()
                ->map(function ($participant, $index) {
                    $data = $participant->getLeaderboardData();
                    $data['current_position'] = $index + 1;
                    return $data;
                });
        });
    }
    
    /**
     * Invalidate Battle Royale caches when participants are eliminated
     */
    public function invalidateLeaderboardCache(BattleRoyaleSession $session): void
    {
        $cacheKey = "battle_royale_leaderboard_{$session->id}_{$session->current_round}";
        Cache::forget($cacheKey);
        
        // Also invalidate general session caches
        Cache::forget("session_stats_{$session->id}");
        Cache::forget("active_participants_{$session->id}");
    }

    /**
     * Generate a random avatar URL for participants.
     */
    public function generateRandomAvatar(): string
    {
        $avatarStyles = ['avataaars', 'bottts', 'identicon', 'gridy', 'micah'];
        $style = $avatarStyles[array_rand($avatarStyles)];
        $seed = Str::random(10);
        
        return "https://api.dicebear.com/7.x/{$style}/svg?seed={$seed}";
    }
    
    /**
     * Initialize a new round with questions for the session.
     */
    public function initializeRound(BattleRoyaleSession $session): void
    {
        // Get random questions from the quiz pool
        $questionsPerRound = 3; // Default
        $quizIds = is_array($session->quiz_pool) ? $session->quiz_pool : json_decode($session->quiz_pool, true);
        
        // For now, we'll just mark that the round is initialized
        // In a full implementation, you'd select random questions from the quiz pool
        $session->update([
            'round_initialized_at' => now(),
        ]);
    }
    
    /**
     * Get the current question for the active round.
     */
    public function getCurrentQuestion(BattleRoyaleSession $session): ?array
    {
        // This would normally fetch the current question for the round
        // For now, return a placeholder structure
        if ($session->status !== 'active') {
            return null;
        }
        
        return [
            'id' => 1,
            'question' => 'Question d\'exemple pour le round ' . $session->current_round,
            'answers' => [
                ['id' => 1, 'text' => 'Réponse A'],
                ['id' => 2, 'text' => 'Réponse B'],
                ['id' => 3, 'text' => 'Réponse C'],
                ['id' => 4, 'text' => 'Réponse D'],
            ],
            'time_limit' => 30,
            'round' => $session->current_round,
        ];
    }
    
    /**
     * Get the current leaderboard for the session.
     */
    public function getLeaderboard(BattleRoyaleSession $session): array
    {
        return $session->participants()
            ->where('status', '!=', 'eliminated')
            ->orderByDesc('score')
            ->get()
            ->map(function($participant, $index) {
                return [
                    'position' => $index + 1,
                    'pseudo' => $participant->pseudo,
                    'score' => $participant->score,
                    'health' => $participant->health,
                    'avatar_url' => $participant->avatar_url,
                    'is_active' => $participant->status === 'active',
                ];
            })
            ->toArray();
    }
    
    /**
     * Calculate simple Battle Royale score for demo purposes.
     */
    public function calculateSimpleBattleRoyaleScore(int $questionId, array $answerIds, float $responseTime, $participant): array
    {
        // Base Battle Royale scoring (higher than regular quiz)
        $baseScore = 5000;
        $timePenalty = $responseTime * 15; // Higher penalty for slow responses
        
        // For demo purposes, assume answer is correct 70% of the time
        $isCorrect = rand(1, 100) <= 70;
        
        if (!$isCorrect) {
            return [
                'points' => 0,
                'is_correct' => false,
                'breakdown' => [
                    'base_score' => 0,
                    'time_penalty' => 0,
                    'battle_royale_bonus' => 0,
                ],
            ];
        }
        
        // Battle Royale survival bonus
        $survivalBonus = $participant->health > 50 ? 1000 : 500;
        
        $finalScore = max(100, $baseScore - $timePenalty + $survivalBonus);
        
        return [
            'points' => round($finalScore),
            'is_correct' => true,
            'breakdown' => [
                'base_score' => $baseScore,
                'time_penalty' => -$timePenalty,
                'survival_bonus' => $survivalBonus,
            ],
        ];
    }
    
    /**
     * Store participant answer for Battle Royale.
     */
    public function storeParticipantAnswer($participant, int $questionId, array $answerIds, float $responseTime): void
    {
        // In a full implementation, you'd store this in a participant_answers table
        // For now, we'll just log it or store it in the participant model
    }
    
    /**
     * Update leaderboard position for a participant.
     */
    public function updateLeaderboardPosition($participant): int
    {
        $session = $participant->battleRoyaleSession;
        
        $betterParticipants = $session->participants()
            ->where('status', '!=', 'eliminated')
            ->where('score', '>', $participant->score)
            ->count();
            
        return $betterParticipants + 1;
    }
    
    /**
     * Check if participant should be eliminated based on health and performance.
     */
    public function checkElimination($participant, BattleRoyaleSession $session): bool
    {
        // Eliminate if health reaches 0
        if ($participant->health <= 0) {
            return true;
        }
        
        // Eliminate if consistently poor performance (bottom 10% for multiple rounds)
        $activeParticipants = $session->activeParticipants()->count();
        $position = $this->updateLeaderboardPosition($participant);
        
        // If in bottom 20% and health below 30%, eliminate
        if ($position > ($activeParticipants * 0.8) && $participant->health < 30) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Perform an elimination round.
     */
    public function performEliminationRound(BattleRoyaleSession $session): array
    {
        $activeParticipants = $session->activeParticipants()->get();
        $totalActive = $activeParticipants->count();
        
        if ($totalActive <= 1) {
            return ['eliminated' => []];
        }
        
        // Calculate elimination percentage based on round
        $eliminationPercentage = $this->calculateEliminationPercentage($session->current_round, $totalActive);
        $eliminateCount = max(1, floor($totalActive * $eliminationPercentage / 100));
        
        // Get bottom performers (by score and health)
        $toEliminate = $activeParticipants
            ->sortBy(function($participant) {
                // Sort by combined score and health (lower is worse)
                return $participant->score + ($participant->health * 10);
            })
            ->take($eliminateCount);
            
        $eliminated = [];
        foreach ($toEliminate as $participant) {
            $participant->update([
                'status' => 'eliminated',
                'eliminated_round' => $session->current_round,
                'position' => $totalActive - count($eliminated),
            ]);
            $eliminated[] = $participant;
        }
        
        return ['eliminated' => $eliminated];
    }
    
    /**
     * Calculate final rankings and positions for all participants.
     */
    public function calculateFinalRankings(BattleRoyaleSession $session): void
    {
        $participants = $session->participants()
            ->orderByDesc('score')
            ->orderBy('eliminated_round', 'desc')
            ->get();
            
        $position = 1;
        foreach ($participants as $participant) {
            $participant->update(['position' => $position]);
            $position++;
        }
    }
    
    /**
     * Calculate elimination percentage based on round and remaining participants.
     */
    private function calculateEliminationPercentage(int $round, int $totalActive): float
    {
        // Dynamic elimination based on remaining participants
        if ($totalActive > 16) {
            return 30; // 30% elimination for large groups
        } elseif ($totalActive > 8) {
            return 25; // 25% elimination for medium groups
        } elseif ($totalActive > 4) {
            return 20; // 20% elimination for smaller groups
        } else {
            return 25; // Eliminate 1 at a time in final rounds (25% of 4 = 1)
        }
    }
}