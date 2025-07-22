<?php

namespace App\Services;

use App\Models\Tournament;
use App\Models\TournamentParticipant;
use App\Models\TournamentMatch;
use App\Events\TournamentStarted;
use App\Events\MatchCompleted;
use App\Events\TournamentEnded;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TournamentService
{
    /**
     * Generate single elimination bracket.
     */
    public function generateSingleEliminationBracket(Tournament $tournament, Collection $participants): array
    {
        $participantCount = $participants->count();
        
        // Calculate the number of rounds needed
        $rounds = ceil(log($participantCount, 2));
        $nextPowerOfTwo = pow(2, $rounds);
        
        // Add byes if needed
        $byes = $nextPowerOfTwo - $participantCount;
        
        $bracket = [
            'rounds' => $rounds,
            'total_matches' => $nextPowerOfTwo - 1,
            'byes' => $byes,
            'structure' => $this->buildSingleEliminationStructure($participants, $rounds),
        ];
        
        return $bracket;
    }
    
    /**
     * Generate double elimination bracket.
     */
    public function generateDoubleEliminationBracket(Tournament $tournament, Collection $participants): array
    {
        $participantCount = $participants->count();
        
        // Winners bracket
        $winnersRounds = ceil(log($participantCount, 2));
        $winnersMatches = $this->buildSingleEliminationStructure($participants, $winnersRounds);
        
        // Losers bracket (more complex)
        $losersRounds = ($winnersRounds - 1) * 2;
        $losersStructure = $this->buildLosersbracket($participantCount, $winnersRounds);
        
        $bracket = [
            'type' => 'double_elimination',
            'winners_rounds' => $winnersRounds,
            'losers_rounds' => $losersRounds,
            'total_rounds' => $winnersRounds + $losersRounds + 1, // +1 for grand final
            'winners_bracket' => $winnersMatches,
            'losers_bracket' => $losersStructure,
            'grand_final' => ['round' => $winnersRounds + $losersRounds + 1, 'participants' => 2],
        ];
        
        return $bracket;
    }
    
    /**
     * Generate round robin schedule.
     */
    public function generateRoundRobinSchedule(Tournament $tournament, Collection $participants): array
    {
        $participantCount = $participants->count();
        $rounds = $participantCount % 2 === 0 ? $participantCount - 1 : $participantCount;
        $matchesPerRound = floor($participantCount / 2);
        $totalMatches = ($participantCount * ($participantCount - 1)) / 2;
        
        $schedule = [];
        $participantArray = $participants->toArray();
        
        // If odd number of participants, add a "bye"
        if ($participantCount % 2 === 1) {
            $participantArray[] = null; // Bye
            $participantCount++;
        }
        
        for ($round = 1; $round <= $rounds; $round++) {
            $roundMatches = [];
            
            for ($i = 0; $i < $matchesPerRound; $i++) {
                $home = $participantArray[$i];
                $away = $participantArray[$participantCount - 1 - $i];
                
                // Skip matches with bye
                if ($home && $away) {
                    $roundMatches[] = [
                        'round' => $round,
                        'match_order' => $i + 1,
                        'participant1' => $home,
                        'participant2' => $away,
                    ];
                }
            }
            
            $schedule["Round $round"] = $roundMatches;
            
            // Rotate participants (except the first one)
            $temp = $participantArray[1];
            for ($i = 1; $i < $participantCount - 1; $i++) {
                $participantArray[$i] = $participantArray[$i + 1];
            }
            $participantArray[$participantCount - 1] = $temp;
        }
        
        return [
            'type' => 'round_robin',
            'rounds' => $rounds,
            'matches_per_round' => $matchesPerRound,
            'total_matches' => $totalMatches,
            'schedule' => $schedule,
        ];
    }
    
    /**
     * Generate Swiss system pairings.
     */
    public function generateSwissSystemPairings(Tournament $tournament, Collection $participants, int $round): array
    {
        // Swiss system pairs players with similar scores
        $standings = $this->calculateSwissStandings($tournament, $participants);
        
        $pairings = [];
        $paired = [];
        
        foreach ($standings as $participant) {
            if (in_array($participant['id'], $paired)) {
                continue;
            }
            
            // Find best opponent with similar score who hasn't been played yet
            $opponent = $this->findSwissOpponent($participant, $standings, $paired, $tournament);
            
            if ($opponent) {
                $pairings[] = [
                    'round' => $round,
                    'participant1' => $participant,
                    'participant2' => $opponent,
                    'match_order' => count($pairings) + 1,
                ];
                
                $paired[] = $participant['id'];
                $paired[] = $opponent['id'];
            }
        }
        
        return $pairings;
    }
    
    /**
     * Calculate tournament seeding based on player rankings.
     */
    public function calculateSeeding(Collection $participants): Collection
    {
        // Sort by user rating/ranking if available, otherwise random
        return $participants->sortByDesc(function($participant) {
            return $participant->user->rating ?? rand(1000, 2000);
        })->values();
    }
    
    /**
     * Apply seeding to tournament bracket for balanced matches.
     */
    public function applySeedingToBracket(Collection $participants, string $bracketType): Collection
    {
        $seeded = $this->calculateSeeding($participants);
        
        if ($bracketType === 'single_elimination' || $bracketType === 'double_elimination') {
            // Traditional seeding: 1 vs lowest, 2 vs second lowest, etc.
            return $this->applyTraditionalSeeding($seeded);
        }
        
        return $seeded;
    }
    
    /**
     * Calculate tournament statistics and analytics.
     */
    public function calculateTournamentStats(Tournament $tournament): array
    {
        $participants = $tournament->participants()->with('user')->get();
        $matches = $tournament->matches()->with(['participant1.user', 'participant2.user', 'winner.user'])->get();
        
        $stats = [
            'participants_count' => $participants->count(),
            'matches_played' => $matches->where('completed_at', '!=', null)->count(),
            'matches_remaining' => $matches->where('completed_at', null)->count(),
            'current_round' => $tournament->current_round,
            'estimated_completion' => $this->estimateCompletionTime($tournament),
            'participant_stats' => $this->calculateParticipantStats($participants, $matches),
            'bracket_progress' => $this->calculateBracketProgress($tournament),
        ];
        
        if ($tournament->status === 'completed') {
            $stats['final_standings'] = $this->calculateFinalStandings($tournament);
            $stats['tournament_summary'] = $this->generateTournamentSummary($tournament);
        }
        
        return $stats;
    }
    
    /**
     * Handle match completion and update bracket.
     */
    public function processMatchCompletion(Tournament $tournament, TournamentMatch $match, int $winnerId, array $matchData = []): array
    {
        DB::beginTransaction();
        try {
            // Update match
            $match->update([
                'winner_id' => $winnerId,
                'score1' => $matchData['score1'] ?? null,
                'score2' => $matchData['score2'] ?? null,
                'completed_at' => now(),
                'match_data' => $matchData,
            ]);
            
            // Check if round is complete
            $roundComplete = $this->isRoundComplete($tournament, $match->round);
            
            $result = [
                'match_completed' => true,
                'round_complete' => $roundComplete,
                'tournament_complete' => false,
                'next_matches' => [],
            ];
            
            if ($roundComplete) {
                if ($this->isTournamentComplete($tournament)) {
                    // Tournament finished
                    $tournament->update([
                        'status' => 'completed',
                        'ended_at' => now(),
                    ]);
                    
                    $winner = $this->determineTournamentWinner($tournament);
                    
                    $result['tournament_complete'] = true;
                    $result['winner'] = $winner;
                    
                    broadcast(new TournamentEnded($tournament, $winner));
                } else {
                    // Generate next round
                    $nextMatches = $this->generateNextRoundMatches($tournament);
                    $result['next_matches'] = $nextMatches;
                    
                    $tournament->increment('current_round');
                }
            }
            
            // Broadcast match completion
            broadcast(new MatchCompleted($tournament, $match));
            
            DB::commit();
            return $result;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Build single elimination structure.
     */
    private function buildSingleEliminationStructure(Collection $participants, int $rounds): array
    {
        $structure = [];
        $currentRoundParticipants = $participants->count();
        
        for ($round = 1; $round <= $rounds; $round++) {
            $matchesInRound = floor($currentRoundParticipants / 2);
            $structure["Round $round"] = [
                'matches' => $matchesInRound,
                'participants' => $currentRoundParticipants,
            ];
            $currentRoundParticipants = $matchesInRound;
        }
        
        return $structure;
    }
    
    /**
     * Build losers bracket for double elimination.
     */
    private function buildLosersbracket(int $participantCount, int $winnersRounds): array
    {
        $losersStructure = [];
        
        // Losers bracket is more complex - alternates between losers from winners bracket
        // and winners from previous losers bracket rounds
        
        for ($round = 1; $round <= ($winnersRounds - 1) * 2; $round++) {
            $isEvenRound = $round % 2 === 0;
            
            if ($isEvenRound) {
                // Even rounds: survivors from previous losers round vs new losers from winners bracket
                $participants = floor($participantCount / pow(2, floor($round / 2) + 1));
            } else {
                // Odd rounds: only previous losers bracket survivors
                $participants = floor($participantCount / pow(2, floor($round / 2) + 1));
            }
            
            $losersStructure["Losers Round $round"] = [
                'matches' => floor($participants / 2),
                'participants' => $participants,
                'type' => $isEvenRound ? 'mixed' : 'survivors_only',
            ];
        }
        
        return $losersStructure;
    }
    
    /**
     * Calculate Swiss system standings.
     */
    private function calculateSwissStandings(Tournament $tournament, Collection $participants): array
    {
        $standings = [];
        
        foreach ($participants as $participant) {
            $matches = $tournament->matches()
                ->where(function($query) use ($participant) {
                    $query->where('participant1_id', $participant->id)
                          ->orWhere('participant2_id', $participant->id);
                })
                ->whereNotNull('winner_id')
                ->get();
                
            $wins = $matches->where('winner_id', $participant->id)->count();
            $losses = $matches->where('winner_id', '!=', $participant->id)->count();
            $score = $wins * 3 + $losses * 0; // 3 points for win, 0 for loss
            
            $standings[] = [
                'id' => $participant->id,
                'participant' => $participant,
                'wins' => $wins,
                'losses' => $losses,
                'score' => $score,
                'opponents' => $matches->pluck('participant1_id', 'participant2_id')
                    ->flatten()
                    ->filter(function($id) use ($participant) {
                        return $id !== $participant->id;
                    })
                    ->toArray(),
            ];
        }
        
        // Sort by score descending
        usort($standings, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        return $standings;
    }
    
    /**
     * Find Swiss system opponent.
     */
    private function findSwissOpponent(array $participant, array $standings, array $paired, Tournament $tournament): ?array
    {
        foreach ($standings as $potential) {
            if ($potential['id'] === $participant['id'] || in_array($potential['id'], $paired)) {
                continue;
            }
            
            // Check if they've played before
            if (!in_array($potential['id'], $participant['opponents'])) {
                return $potential;
            }
        }
        
        // If no unplayed opponent with similar score, find any unplayed opponent
        foreach ($standings as $potential) {
            if ($potential['id'] === $participant['id'] || in_array($potential['id'], $paired)) {
                continue;
            }
            return $potential;
        }
        
        return null;
    }
    
    /**
     * Apply traditional tournament seeding.
     */
    private function applyTraditionalSeeding(Collection $seeded): Collection
    {
        $count = $seeded->count();
        $paired = collect();
        
        // 1 vs last, 2 vs second-to-last, etc.
        for ($i = 0; $i < floor($count / 2); $i++) {
            $paired->push($seeded[$i]);
            $paired->push($seeded[$count - 1 - $i]);
        }
        
        return $paired;
    }
    
    /**
     * Calculate participant statistics.
     */
    private function calculateParticipantStats(Collection $participants, Collection $matches): array
    {
        $stats = [];
        
        foreach ($participants as $participant) {
            $participantMatches = $matches->filter(function($match) use ($participant) {
                return $match->participant1_id === $participant->id || 
                       $match->participant2_id === $participant->id;
            });
            
            $wins = $participantMatches->where('winner_id', $participant->id)->count();
            $losses = $participantMatches->where('winner_id', '!=', $participant->id)
                                      ->where('completed_at', '!=', null)->count();
            
            $stats[] = [
                'participant' => $participant,
                'wins' => $wins,
                'losses' => $losses,
                'win_rate' => $participantMatches->count() > 0 ? 
                    round(($wins / $participantMatches->count()) * 100, 1) : 0,
                'matches_played' => $participantMatches->where('completed_at', '!=', null)->count(),
            ];
        }
        
        return $stats;
    }
    
    /**
     * Calculate bracket progress percentage.
     */
    private function calculateBracketProgress(Tournament $tournament): float
    {
        $totalMatches = $tournament->matches()->count();
        $completedMatches = $tournament->matches()->whereNotNull('completed_at')->count();
        
        return $totalMatches > 0 ? round(($completedMatches / $totalMatches) * 100, 1) : 0;
    }
    
    /**
     * Check if round is complete.
     */
    private function isRoundComplete(Tournament $tournament, int $round): bool
    {
        return $tournament->matches()
            ->where('round', $round)
            ->whereNull('completed_at')
            ->count() === 0;
    }
    
    /**
     * Check if tournament is complete.
     */
    private function isTournamentComplete(Tournament $tournament): bool
    {
        if ($tournament->type === 'round_robin') {
            return $this->isRoundComplete($tournament, $tournament->current_round);
        }
        
        // For elimination tournaments, check if we have a winner
        $remainingParticipants = $tournament->matches()
            ->where('round', $tournament->current_round)
            ->whereNotNull('winner_id')
            ->count();
            
        return $remainingParticipants === 1;
    }
    
    /**
     * Determine tournament winner.
     */
    private function determineTournamentWinner(Tournament $tournament): ?TournamentParticipant
    {
        if ($tournament->type === 'round_robin') {
            // Winner is participant with most wins
            $standings = $this->calculateSwissStandings($tournament, $tournament->participants);
            return $standings[0]['participant'] ?? null;
        }
        
        // For elimination, winner is last match winner
        $finalMatch = $tournament->matches()
            ->where('round', $tournament->current_round)
            ->whereNotNull('winner_id')
            ->first();
            
        return $finalMatch ? TournamentParticipant::find($finalMatch->winner_id) : null;
    }
    
    /**
     * Generate next round matches.
     */
    private function generateNextRoundMatches(Tournament $tournament): array
    {
        $winners = $tournament->matches()
            ->where('round', $tournament->current_round)
            ->whereNotNull('winner_id')
            ->pluck('winner_id');
            
        $matches = [];
        for ($i = 0; $i < count($winners); $i += 2) {
            if (isset($winners[$i + 1])) {
                $match = $tournament->matches()->create([
                    'round' => $tournament->current_round + 1,
                    'match_order' => floor($i / 2) + 1,
                    'participant1_id' => $winners[$i],
                    'participant2_id' => $winners[$i + 1],
                ]);
                $matches[] = $match;
            }
        }
        
        return $matches;
    }
    
    /**
     * Estimate tournament completion time.
     */
    private function estimateCompletionTime(Tournament $tournament): array
    {
        $remainingMatches = $tournament->matches()->whereNull('completed_at')->count();
        $avgMatchDuration = 15; // minutes, configurable
        
        return [
            'remaining_matches' => $remainingMatches,
            'estimated_minutes' => $remainingMatches * $avgMatchDuration,
            'estimated_completion' => now()->addMinutes($remainingMatches * $avgMatchDuration),
        ];
    }
    
    /**
     * Calculate final standings.
     */
    private function calculateFinalStandings(Tournament $tournament): array
    {
        // Implementation depends on tournament type
        if ($tournament->type === 'round_robin') {
            return $this->calculateSwissStandings($tournament, $tournament->participants);
        }
        
        // For elimination tournaments, use bracket position
        return $this->calculateEliminationStandings($tournament);
    }
    
    /**
     * Calculate elimination tournament standings.
     */
    private function calculateEliminationStandings(Tournament $tournament): array
    {
        $participants = $tournament->participants()->with('user')->get();
        $standings = [];
        
        foreach ($participants as $participant) {
            $matches = $tournament->matches()
                ->where(function($query) use ($participant) {
                    $query->where('participant1_id', $participant->id)
                          ->orWhere('participant2_id', $participant->id);
                })
                ->whereNotNull('winner_id')
                ->get();
                
            $wins = $matches->where('winner_id', $participant->id)->count();
            $lastRound = $matches->max('round') ?? 0;
            
            $standings[] = [
                'participant' => $participant,
                'final_round' => $lastRound,
                'wins' => $wins,
                'eliminated_in_round' => $lastRound,
            ];
        }
        
        // Sort by final round reached (descending) then by wins
        usort($standings, function($a, $b) {
            if ($a['final_round'] === $b['final_round']) {
                return $b['wins'] <=> $a['wins'];
            }
            return $b['final_round'] <=> $a['final_round'];
        });
        
        return $standings;
    }
    
    /**
     * Generate tournament summary.
     */
    private function generateTournamentSummary(Tournament $tournament): array
    {
        $stats = $this->calculateTournamentStats($tournament);
        
        return [
            'duration' => $tournament->started_at->diff($tournament->ended_at),
            'total_matches' => $tournament->matches()->count(),
            'participants' => $tournament->participants()->count(),
            'type' => $tournament->type,
            'winner' => $this->determineTournamentWinner($tournament),
            'highlights' => $this->generateTournamentHighlights($tournament),
        ];
    }
    
    /**
     * Generate tournament highlights.
     */
    private function generateTournamentHighlights(Tournament $tournament): array
    {
        // Find interesting matches, upsets, etc.
        return [
            'closest_matches' => $this->findClosestMatches($tournament),
            'longest_matches' => $this->findLongestMatches($tournament),
            'most_dominant_wins' => $this->findMostDominantWins($tournament),
        ];
    }
    
    /**
     * Find closest matches.
     */
    private function findClosestMatches(Tournament $tournament): Collection
    {
        return $tournament->matches()
            ->whereNotNull('completed_at')
            ->whereNotNull('score1')
            ->whereNotNull('score2')
            ->get()
            ->sortBy(function($match) {
                return abs($match->score1 - $match->score2);
            })
            ->take(3);
    }
    
    /**
     * Find longest matches.
     */
    private function findLongestMatches(Tournament $tournament): Collection
    {
        return $tournament->matches()
            ->whereNotNull('completed_at')
            ->get()
            ->filter(function($match) {
                return $match->match_data && isset($match->match_data['duration']);
            })
            ->sortByDesc(function($match) {
                return $match->match_data['duration'];
            })
            ->take(3);
    }
    
    /**
     * Find most dominant wins.
     */
    private function findMostDominantWins(Tournament $tournament): Collection
    {
        return $tournament->matches()
            ->whereNotNull('completed_at')
            ->whereNotNull('score1')
            ->whereNotNull('score2')
            ->get()
            ->sortByDesc(function($match) {
                return abs($match->score1 - $match->score2);
            })
            ->take(3);
    }
}