<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\User;
use App\Models\League;
use App\Events\AchievementEarned;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;

class AchievementService
{
    /**
     * Calculate user's progress towards an achievement.
     */
    public function calculateProgress(User $user, Achievement $achievement): int
    {
        $requirements = $achievement->requirements;
        
        // Ensure requirements is an array (handle cases where it might be stored as JSON string)
        if (is_string($requirements)) {
            $requirements = json_decode($requirements, true) ?? [];
        }
        
        $slug = $achievement->slug;
        
        // Handle different achievement types
        switch ($achievement->category) {
            case 'creator':
                return $this->calculateCreatorProgress($user, $slug, $requirements);
            case 'player':
                return $this->calculatePlayerProgress($user, $slug, $requirements);
            case 'achievement':
                return $this->calculateAchievementProgress($user, $slug, $requirements);
            case 'social':
                return $this->calculateSocialProgress($user, $slug, $requirements);
            default:
                return 0;
        }
    }
    
    /**
     * Calculate creator achievement progress.
     */
    private function calculateCreatorProgress(User $user, string $slug, array $requirements): int
    {
        $quizCount = $user->quizzes()->count();
        
        if (str_contains($slug, 'quiz_creator_')) {
            $targetCount = (int) str_replace('quiz_creator_', '', $slug);
            return min(100, round(($quizCount / $targetCount) * 100));
        }
        
        if ($slug === 'popular_quiz_creator') {
            $popularQuizzes = $user->quizzes()
                ->whereHas('sessions', function($query) {
                    $query->selectRaw('COUNT(DISTINCT participant_id) as participant_count')
                          ->having('participant_count', '>=', 100);
                })
                ->count();
            return $popularQuizzes > 0 ? 100 : 0;
        }
        
        return 0;
    }
    
    /**
     * Calculate player achievement progress.
     */
    private function calculatePlayerProgress(User $user, string $slug, array $requirements): int
    {
        $sessionsCount = $user->quizSessions()->where('status', 'completed')->count();
        
        if (str_contains($slug, 'quiz_player_')) {
            $targetCount = (int) str_replace('quiz_player_', '', $slug);
            return min(100, round(($sessionsCount / $targetCount) * 100));
        }
        
        if ($slug === 'category_explorer') {
            $categoriesPlayed = $user->quizSessions()
                ->join('quizzes', 'quiz_sessions.quiz_id', '=', 'quizzes.id')
                ->distinct('quizzes.category')
                ->count();
            return min(100, round(($categoriesPlayed / 5) * 100));
        }
        
        return 0;
    }
    
    /**
     * Calculate achievement category progress.
     */
    private function calculateAchievementProgress(User $user, string $slug, array $requirements): int
    {
        $totalPoints = $user->userAchievements()
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->sum('achievements.points');
            
        if (str_contains($slug, 'points_')) {
            $targetPoints = (int) str_replace('points_', '', $slug);
            return min(100, round(($totalPoints / $targetPoints) * 100));
        }
        
        if (str_contains($slug, 'perfectionist_')) {
            $perfectScores = $user->quizSessions()->where('score_percentage', 100)->count();
            $targetCount = (int) str_replace('perfectionist_', '', $slug);
            return min(100, round(($perfectScores / $targetCount) * 100));
        }
        
        return 0;
    }
    
    /**
     * Calculate social achievement progress.
     */
    private function calculateSocialProgress(User $user, string $slug, array $requirements): int
    {
        if ($slug === 'social_butterfly') {
            $friendCount = count($user->friends ?? []);
            return min(100, round(($friendCount / 10) * 100));
        }
        
        return 0;
    }
    
    /**
     * Get user's current league.
     */
    public function getCurrentLeague(User $user): ?array
    {
        $totalPoints = $user->userAchievements()
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->sum('achievements.points');
            
        // Define league tiers
        $leagues = [
            ['name' => 'Bronze', 'min_points' => 0, 'max_points' => 999, 'color' => '#CD7F32'],
            ['name' => 'Silver', 'min_points' => 1000, 'max_points' => 2999, 'color' => '#C0C0C0'],
            ['name' => 'Gold', 'min_points' => 3000, 'max_points' => 7499, 'color' => '#FFD700'],
            ['name' => 'Platinum', 'min_points' => 7500, 'max_points' => 14999, 'color' => '#E5E4E2'],
            ['name' => 'Diamond', 'min_points' => 15000, 'max_points' => 29999, 'color' => '#B9F2FF'],
            ['name' => 'Master', 'min_points' => 30000, 'max_points' => 49999, 'color' => '#FF6347'],
            ['name' => 'Grandmaster', 'min_points' => 50000, 'max_points' => PHP_INT_MAX, 'color' => '#8A2BE2'],
        ];
        
        foreach ($leagues as $league) {
            if ($totalPoints >= $league['min_points'] && $totalPoints <= $league['max_points']) {
                return [
                    'name' => $league['name'],
                    'color' => $league['color'],
                    'current_points' => $totalPoints,
                    'min_points' => $league['min_points'],
                    'max_points' => $league['max_points'] === PHP_INT_MAX ? null : $league['max_points'],
                    'progress' => $league['max_points'] === PHP_INT_MAX ? 100 : 
                        round((($totalPoints - $league['min_points']) / ($league['max_points'] - $league['min_points'])) * 100, 1),
                ];
            }
        }
        
        return $leagues[0]; // Default to Bronze
    }
    
    /**
     * Get user's rank in leaderboard.
     */
    public function getUserRank(User $user, string $period = 'all_time', string $category = 'all'): ?array
    {
        $cacheKey = "user_rank_{$user->id}_{$period}_{$category}";
        
        return Cache::remember($cacheKey, 300, function() use ($user, $period, $category) {
            $query = User::select('users.id')
                ->selectRaw('COALESCE(SUM(achievements.points), 0) as total_points')
                ->leftJoin('user_achievements', 'users.id', '=', 'user_achievements.user_id')
                ->leftJoin('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
                ->groupBy('users.id');
                
            // Apply period filter
            if ($period === 'this_month') {
                $query->where('user_achievements.earned_at', '>=', now()->startOfMonth());
            } elseif ($period === 'this_week') {
                $query->where('user_achievements.earned_at', '>=', now()->startOfWeek());
            }
            
            // Apply category filter
            if ($category !== 'all') {
                $query->where('achievements.category', $category);
            }
            
            $rankings = $query->orderByDesc('total_points')->get();
            
            $userRanking = $rankings->firstWhere('id', $user->id);
            if (!$userRanking) {
                return null;
            }
            
            $rank = $rankings->search(function($item) use ($user) {
                return $item->id === $user->id;
            }) + 1;
            
            return [
                'rank' => $rank,
                'total_users' => $rankings->count(),
                'total_points' => $userRanking->total_points,
                'percentile' => round((($rankings->count() - $rank + 1) / $rankings->count()) * 100, 1),
            ];
        });
    }
    
    /**
     * Update user's league based on total points.
     */
    public function updateUserLeague(User $user): void
    {
        $currentLeague = $this->getCurrentLeague($user);
        $user->update(['current_league' => $currentLeague['name']]);
    }
    
    /**
     * Send notification when achievement is earned.
     */
    public function notifyAchievementEarned(User $user, Achievement $achievement): void
    {
        try {
            // Broadcast real-time event
            broadcast(new AchievementEarned($user, $achievement))->toOthers();
            
            // You could also send email notifications, push notifications, etc.
            // Notification::send($user, new AchievementEarnedNotification($achievement));
            
        } catch (\Exception $e) {
            \Log::error('Error sending achievement notification: ' . $e->getMessage());
        }
    }
    
    /**
     * Get achievement statistics.
     */
    public function getAchievementStats(): array
    {
        return Cache::remember('achievement_stats', 3600, function() {
            $totalAchievements = Achievement::where('is_active', true)->count();
            $totalEarned = UserAchievement::count();
            $uniqueEarners = UserAchievement::distinct('user_id')->count();
            $totalUsers = User::count();
            
            $rareAchievements = Achievement::where('rarity', 'legendary')
                ->withCount('userAchievements')
                ->orderBy('user_achievements_count', 'asc')
                ->take(5)
                ->get();
                
            return [
                'total_achievements' => $totalAchievements,
                'total_earned' => $totalEarned,
                'unique_earners' => $uniqueEarners,
                'participation_rate' => $totalUsers > 0 ? round(($uniqueEarners / $totalUsers) * 100, 1) : 0,
                'average_per_user' => $uniqueEarners > 0 ? round($totalEarned / $uniqueEarners, 1) : 0,
                'rarest_achievements' => $rareAchievements,
            ];
        });
    }
    
    /**
     * Get trending achievements (most earned recently).
     */
    public function getTrendingAchievements(int $days = 7, int $limit = 10): array
    {
        return UserAchievement::where('earned_at', '>=', now()->subDays($days))
            ->selectRaw('achievement_id, COUNT(*) as earn_count')
            ->groupBy('achievement_id')
            ->orderByDesc('earn_count')
            ->with('achievement')
            ->limit($limit)
            ->get()
            ->map(function($item) {
                return [
                    'achievement' => $item->achievement,
                    'recent_earns' => $item->earn_count,
                ];
            })
            ->toArray();
    }
}