<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\Badge;
use App\Models\Trophy;
use App\Models\UserAchievement;
use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizSession;
use App\Services\AchievementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    protected AchievementService $achievementService;

    public function __construct(AchievementService $achievementService)
    {
        $this->achievementService = $achievementService;
    }
    /**
     * Display user's achievements page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login')
                ->with('message', 'Vous devez être connecté pour voir vos achievements.');
        }

        // Load user's earned achievements
        $earnedAchievements = $user->userAchievements()
            ->with('achievement')
            ->orderBy('earned_at', 'desc')
            ->get()
            ->map(function($userAchievement) {
                return [
                    'id' => $userAchievement->achievement->id,
                    'name' => $userAchievement->achievement->name,
                    'description' => $userAchievement->achievement->description,
                    'icon' => $userAchievement->achievement->icon,
                    'rarity' => $userAchievement->achievement->rarity,
                    'points' => $userAchievement->achievement->points,
                    'category' => $userAchievement->achievement->category,
                    'earned_at' => $userAchievement->earned_at,
                    'progress' => 100, // Completed
                ];
            });
            
        // Load available achievements not yet earned
        $earnedIds = $earnedAchievements->pluck('id');
        $availableAchievements = Achievement::whereNotIn('id', $earnedIds)
            ->where('is_active', true)
            ->get()
            ->map(function($achievement) use ($user) {
                $progress = $this->achievementService->calculateProgress($user, $achievement);
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'rarity' => $achievement->rarity,
                    'points' => $achievement->points,
                    'category' => $achievement->category,
                    'progress' => $progress,
                    'requirements' => $achievement->requirements,
                ];
            });
            
        // Load user badges and trophies
        $badges = Badge::whereIn('id', $user->badges ?? [])
            ->get()
            ->map(function($badge) {
                return [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'category' => $badge->category,
                    'rarity' => $badge->rarity,
                ];
            });
            
        $trophies = Trophy::whereIn('id', $user->trophies ?? [])
            ->get()
            ->map(function($trophy) {
                return [
                    'id' => $trophy->id,
                    'name' => $trophy->name,
                    'description' => $trophy->description,
                    'icon' => $trophy->icon,
                    'type' => $trophy->type,
                    'tier' => $trophy->tier,
                ];
            });
        
        // Calculate statistics
        $totalEarned = $earnedAchievements->count();
        $totalAvailable = $earnedAchievements->count() + $availableAchievements->count();
        $completionPercentage = $totalAvailable > 0 ? round(($totalEarned / $totalAvailable) * 100, 1) : 0;
        $totalPoints = $earnedAchievements->sum('points');
        $currentLeague = $this->achievementService->getCurrentLeague($user);
        
        $stats = [
            'total_earned' => $totalEarned,
            'total_available' => $totalAvailable,
            'completion_percentage' => $completionPercentage,
            'total_points' => $totalPoints,
            'current_league' => $currentLeague,
            'rank' => $this->achievementService->getUserRank($user),
        ];
        
        return Inertia::render('achievements/index', [
            'earnedAchievements' => $earnedAchievements,
            'availableAchievements' => $availableAchievements,
            'badges' => $badges,
            'trophies' => $trophies,
            'stats' => $stats,
            'categories' => ['creator', 'player', 'achievement', 'social'],
        ]);
    }

    /**
     * Display achievement details.
     */
    public function show(string $id): Response
    {
        $achievement = Achievement::findOrFail($id);
        $user = request()->user();
        
        // Check if user has earned this achievement
        $userAchievement = $user ? $user->userAchievements()
            ->where('achievement_id', $achievement->id)
            ->first() : null;
            
        $userProgress = $user ? $this->achievementService->calculateProgress($user, $achievement) : 0;
        
        // Get recent earners (last 10)
        $recentEarners = UserAchievement::where('achievement_id', $achievement->id)
            ->with('user')
            ->orderBy('earned_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($userAchievement) {
                return [
                    'user' => [
                        'id' => $userAchievement->user->id,
                        'name' => $userAchievement->user->name,
                        'avatar' => $userAchievement->user->avatar_url,
                    ],
                    'earned_at' => $userAchievement->earned_at,
                ];
            });
            
        // Get global statistics
        $totalEarners = UserAchievement::where('achievement_id', $achievement->id)->count();
        $totalUsers = User::count();
        $earnRate = $totalUsers > 0 ? round(($totalEarners / $totalUsers) * 100, 2) : 0;
        
        return Inertia::render('achievements/show', [
            'achievement' => [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon' => $achievement->icon,
                'rarity' => $achievement->rarity,
                'points' => $achievement->points,
                'category' => $achievement->category,
                'requirements' => $achievement->requirements,
                'total_earners' => $totalEarners,
                'earn_rate' => $earnRate,
            ],
            'userProgress' => $userProgress,
            'userEarned' => $userAchievement ? [
                'earned_at' => $userAchievement->earned_at,
            ] : null,
            'recentEarners' => $recentEarners,
        ]);
    }

    /**
     * Display badges collection.
     */
    public function badges(Request $request): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Load user badges by category
        $userBadgeIds = $user->badges ?? [];
        $earnedBadges = Badge::whereIn('id', $userBadgeIds)->get();
        $availableBadges = Badge::whereNotIn('id', $userBadgeIds)->where('is_active', true)->get();
        
        $badges = [
            'creator' => [
                'earned' => $earnedBadges->where('category', 'creator')->values(),
                'available' => $availableBadges->where('category', 'creator')->values(),
            ],
            'player' => [
                'earned' => $earnedBadges->where('category', 'player')->values(),
                'available' => $availableBadges->where('category', 'player')->values(),
            ],
            'achievement' => [
                'earned' => $earnedBadges->where('category', 'achievement')->values(),
                'available' => $availableBadges->where('category', 'achievement')->values(),
            ],
            'social' => [
                'earned' => $earnedBadges->where('category', 'social')->values(),
                'available' => $availableBadges->where('category', 'social')->values(),
            ],
        ];
        
        return Inertia::render('achievements/badges', [
            'badges' => $badges,
            'user' => $user,
            'stats' => [
                'total_earned' => $earnedBadges->count(),
                'total_available' => $earnedBadges->count() + $availableBadges->count(),
            ],
        ]);
    }

    /**
     * Display trophies collection.
     */
    public function trophies(Request $request): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Load user trophies
        $userTrophyIds = $user->trophies ?? [];
        $trophies = Trophy::whereIn('id', $userTrophyIds)
            ->orderBy('tier', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($trophy) {
                return [
                    'id' => $trophy->id,
                    'name' => $trophy->name,
                    'description' => $trophy->description,
                    'icon' => $trophy->icon,
                    'type' => $trophy->type,
                    'tier' => $trophy->tier,
                    'requirements' => $trophy->requirements,
                ];
            });
            
        // Load showcase trophies (user's selected ones)
        $showcaseIds = $user->trophy_showcase ?? [];
        $showcaseTrophies = $trophies->whereIn('id', $showcaseIds)->take(6);
        
        return Inertia::render('achievements/trophies', [
            'trophies' => $trophies,
            'showcaseTrophies' => $showcaseTrophies,
            'user' => $user,
            'stats' => [
                'total_trophies' => $trophies->count(),
                'gold_trophies' => $trophies->where('tier', 'gold')->count(),
                'silver_trophies' => $trophies->where('tier', 'silver')->count(),
                'bronze_trophies' => $trophies->where('tier', 'bronze')->count(),
            ],
        ]);
    }

    /**
     * Display leaderboard for achievements.
     */
    public function leaderboard(Request $request): Response
    {
        $filters = $request->only(['period', 'category']);
        $period = $filters['period'] ?? 'all_time';
        $category = $filters['category'] ?? 'all';
        $user = $request->user();
        
        // Build leaderboard query
        $query = User::select('users.*')
            ->selectRaw('COALESCE(SUM(achievements.points), 0) as total_points')
            ->selectRaw('COUNT(user_achievements.id) as total_achievements')
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
        
        $leaderboard = $query->orderByDesc('total_points')
            ->orderByDesc('total_achievements')
            ->limit(50)
            ->get()
            ->map(function($user, $index) {
                return [
                    'rank' => $index + 1,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar_url' => $user->avatar_url,
                    ],
                    'total_points' => $user->total_points,
                    'total_achievements' => $user->total_achievements,
                    'current_league' => $this->achievementService->getCurrentLeague($user),
                ];
            });
            
        // Get current user's rank
        $userRank = null;
        if ($user) {
            $userRank = $this->achievementService->getUserRank($user, $period, $category);
        }
        
        return Inertia::render('achievements/leaderboard', [
            'leaderboard' => $leaderboard,
            'userRank' => $userRank,
            'filters' => $filters,
            'periods' => [
                'all_time' => 'Tous les temps',
                'this_month' => 'Ce mois',
                'this_week' => 'Cette semaine',
            ],
            'categories' => [
                'all' => 'Toutes',
                'creator' => 'Créateur',
                'player' => 'Joueur',
                'achievement' => 'Achievements',
                'social' => 'Social',
            ],
        ]);
    }

    /**
     * Update user's trophy showcase.
     */
    public function updateShowcase(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'trophy_ids' => 'required|array|max:6', // Max 6 trophies in showcase
            'trophy_ids.*' => 'integer',
        ]);

        $user = $request->user();
        
        // Validate user owns these trophies
        $userTrophyIds = $user->trophies ?? [];
        foreach ($validated['trophy_ids'] as $trophyId) {
            if (!in_array($trophyId, $userTrophyIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne possédez pas ce trophée.'
                ], 422);
            }
        }
        
        // Update user's trophy showcase
        $user->update(['trophy_showcase' => $validated['trophy_ids']]);
        
        return response()->json([
            'success' => true,
            'message' => 'Vitrine mise à jour avec succès !'
        ]);
    }

    /**
     * Check and award achievements for user actions.
     * This method is called by other controllers.
     */
    public function checkAchievements($userId, $action, $data = []): array
    {
        $awardedAchievements = [];
        
        try {
            switch ($action) {
                case 'quiz_created':
                    $awardedAchievements = array_merge($awardedAchievements, $this->checkQuizCreatorAchievements($userId, $data));
                    break;
                case 'quiz_completed':
                    $awardedAchievements = array_merge($awardedAchievements, $this->checkQuizPlayerAchievements($userId, $data));
                    break;
                case 'perfect_score':
                    $awardedAchievements = array_merge($awardedAchievements, $this->checkPerfectScoreAchievements($userId, $data));
                    break;
                case 'speed_completion':
                    $awardedAchievements = array_merge($awardedAchievements, $this->checkSpeedAchievements($userId, $data));
                    break;
                case 'social_action':
                    $awardedAchievements = array_merge($awardedAchievements, $this->checkSocialAchievements($userId, $data));
                    break;
                case 'battle_royale_win':
                    $awardedAchievements = array_merge($awardedAchievements, $this->checkBattleRoyaleAchievements($userId, $data));
                    break;
                case 'streak_achieved':
                    $awardedAchievements = array_merge($awardedAchievements, $this->checkStreakAchievements($userId, $data));
                    break;
            }
            
            // Check for milestone achievements
            $awardedAchievements = array_merge($awardedAchievements, $this->checkMilestoneAchievements($userId));
            
        } catch (\Exception $e) {
            \Log::error('Error checking achievements for user ' . $userId . ': ' . $e->getMessage());
        }
        
        return $awardedAchievements;
    }

    /**
     * Check quiz creator achievements.
     */
    private function checkQuizCreatorAchievements($userId, $data): array
    {
        $awarded = [];
        $user = User::find($userId);
        $quizCount = Quiz::where('user_id', $userId)->count();
        
        // First quiz created
        if ($quizCount === 1) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'first_quiz_creator');
        }
        
        // Multiple quiz milestones
        $milestones = [5 => 'quiz_creator_5', 10 => 'quiz_creator_10', 25 => 'quiz_creator_25', 50 => 'quiz_creator_50', 100 => 'quiz_creator_100'];
        foreach ($milestones as $count => $slug) {
            if ($quizCount === $count) {
                $awarded[] = $this->awardAchievementBySlug($userId, $slug);
            }
        }
        
        // Popular quiz creator (quiz with 100+ players)
        if (isset($data['quiz_id'])) {
            $quiz = Quiz::find($data['quiz_id']);
            if ($quiz) {
                $participantCount = QuizSession::where('quiz_id', $quiz->id)
                    ->distinct('participant_id')
                    ->count();
                    
                if ($participantCount >= 100) {
                    $awarded[] = $this->awardAchievementBySlug($userId, 'popular_quiz_creator');
                }
            }
        }
        
        return array_filter($awarded);
    }

    /**
     * Check quiz player achievements.
     */
    private function checkQuizPlayerAchievements($userId, $data): array
    {
        $awarded = [];
        $user = User::find($userId);
        
        // Count total quizzes played
        $quizzesPlayed = QuizSession::where('user_id', $userId)
            ->where('status', 'completed')
            ->count();
        
        // First quiz played
        if ($quizzesPlayed === 1) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'first_quiz_player');
        }
        
        // Quiz playing milestones
        $milestones = [10 => 'quiz_player_10', 25 => 'quiz_player_25', 50 => 'quiz_player_50', 100 => 'quiz_player_100', 250 => 'quiz_player_250'];
        foreach ($milestones as $count => $slug) {
            if ($quizzesPlayed === $count) {
                $awarded[] = $this->awardAchievementBySlug($userId, $slug);
            }
        }
        
        // Category explorer (played quizzes in different categories)
        $categoriesPlayed = QuizSession::where('user_id', $userId)
            ->join('quizzes', 'quiz_sessions.quiz_id', '=', 'quizzes.id')
            ->distinct('quizzes.category')
            ->count();
            
        if ($categoriesPlayed >= 5) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'category_explorer');
        }
        
        return array_filter($awarded);
    }

    /**
     * Check perfect score achievements.
     */
    private function checkPerfectScoreAchievements($userId, $data): array
    {
        $awarded = [];
        $user = User::find($userId);
        
        // Count perfect scores
        $perfectScores = QuizSession::where('user_id', $userId)
            ->where('score_percentage', 100)
            ->count();
        
        // First perfect score
        if ($perfectScores === 1) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'first_perfect_score');
        }
        
        // Perfect score milestones
        $milestones = [5 => 'perfectionist_5', 10 => 'perfectionist_10', 25 => 'perfectionist_25'];
        foreach ($milestones as $count => $slug) {
            if ($perfectScores === $count) {
                $awarded[] = $this->awardAchievementBySlug($userId, $slug);
            }
        }
        
        // Perfect score streak
        if (isset($data['streak']) && $data['streak'] >= 5) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'perfect_streak');
        }
        
        return array_filter($awarded);
    }

    /**
     * Check speed achievements.
     */
    private function checkSpeedAchievements($userId, $data): array
    {
        $awarded = [];
        
        // Lightning fast completion (under 30 seconds total)
        if (isset($data['total_time']) && $data['total_time'] < 30) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'lightning_fast');
        }
        
        // Speed demon (average response time under 2 seconds)
        if (isset($data['average_response_time']) && $data['average_response_time'] < 2.0) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'speed_demon');
        }
        
        // Quick draw (first to answer correctly in session)
        if (isset($data['first_correct']) && $data['first_correct'] === true) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'quick_draw');
        }
        
        return array_filter($awarded);
    }

    /**
     * Check social achievements.
     */
    private function checkSocialAchievements($userId, $data): array
    {
        $awarded = [];
        $user = User::find($userId);
        
        // Friend invitations
        if (isset($data['action']) && $data['action'] === 'friend_invited') {
            $friendCount = count($user->friends ?? []);
            if ($friendCount === 1) {
                $awarded[] = $this->awardAchievementBySlug($userId, 'first_friend');
            } elseif ($friendCount === 10) {
                $awarded[] = $this->awardAchievementBySlug($userId, 'social_butterfly');
            }
        }
        
        // Quiz sharing
        if (isset($data['action']) && $data['action'] === 'quiz_shared') {
            $awarded[] = $this->awardAchievementBySlug($userId, 'quiz_sharer');
        }
        
        return array_filter($awarded);
    }

    /**
     * Check Battle Royale achievements.
     */
    private function checkBattleRoyaleAchievements($userId, $data): array
    {
        $awarded = [];
        
        // Battle Royale winner
        if (isset($data['position']) && $data['position'] === 1) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'battle_royale_winner');
            
            // Count total wins
            $wins = $user->battle_royale_wins ?? 0;
            if ($wins === 5) {
                $awarded[] = $this->awardAchievementBySlug($userId, 'battle_royale_champion');
            }
        }
        
        // Survivor (reached final 3)
        if (isset($data['position']) && $data['position'] <= 3) {
            $awarded[] = $this->awardAchievementBySlug($userId, 'battle_royale_survivor');
        }
        
        return array_filter($awarded);
    }
    
    /**
     * Check streak achievements.
     */
    private function checkStreakAchievements($userId, $data): array
    {
        $awarded = [];
        
        if (isset($data['streak'])) {
            $streak = $data['streak'];
            
            if ($streak === 5) {
                $awarded[] = $this->awardAchievementBySlug($userId, 'streak_5');
            } elseif ($streak === 10) {
                $awarded[] = $this->awardAchievementBySlug($userId, 'streak_10');
            } elseif ($streak === 25) {
                $awarded[] = $this->awardAchievementBySlug($userId, 'streak_25');
            }
        }
        
        return array_filter($awarded);
    }
    
    /**
     * Check milestone achievements based on overall user stats.
     */
    private function checkMilestoneAchievements($userId): array
    {
        $awarded = [];
        $user = User::find($userId);
        
        // Total points milestone
        $totalPoints = UserAchievement::where('user_id', $userId)
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->sum('achievements.points');
            
        $pointMilestones = [1000 => 'points_1000', 5000 => 'points_5000', 10000 => 'points_10000'];
        foreach ($pointMilestones as $points => $slug) {
            if ($totalPoints >= $points && !$this->hasAchievement($userId, $slug)) {
                $awarded[] = $this->awardAchievementBySlug($userId, $slug);
            }
        }
        
        return array_filter($awarded);
    }
    
    /**
     * Award achievement to user by slug.
     */
    private function awardAchievementBySlug($userId, $slug): ?array
    {
        $achievement = Achievement::where('slug', $slug)->first();
        if (!$achievement) {
            return null;
        }
        
        return $this->awardAchievement($userId, $achievement->id);
    }
    
    /**
     * Award achievement to user.
     */
    private function awardAchievement($userId, $achievementId): ?array
    {
        // Check if user already has this achievement
        if ($this->hasAchievement($userId, $achievementId)) {
            return null;
        }
        
        $achievement = Achievement::find($achievementId);
        $user = User::find($userId);
        
        if (!$achievement || !$user) {
            return null;
        }
        
        DB::beginTransaction();
        try {
            // Award the achievement
            UserAchievement::create([
                'user_id' => $userId,
                'achievement_id' => $achievementId,
                'earned_at' => now(),
                'metadata' => [],
            ]);
            
            // Award associated badges and trophies
            $this->awardAssociatedRewards($userId, $achievement);
            
            // Update user league if necessary
            $this->achievementService->updateUserLeague($user);
            
            DB::commit();
            
            // Send notification and broadcast event
            $this->achievementService->notifyAchievementEarned($user, $achievement);
            
            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon' => $achievement->icon,
                'points' => $achievement->points,
                'rarity' => $achievement->rarity,
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error awarding achievement: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Check if user has achievement.
     */
    private function hasAchievement($userId, $achievementIdOrSlug): bool
    {
        if (is_numeric($achievementIdOrSlug)) {
            return UserAchievement::where('user_id', $userId)
                ->where('achievement_id', $achievementIdOrSlug)
                ->exists();
        }
        
        return UserAchievement::where('user_id', $userId)
            ->whereHas('achievement', function($query) use ($achievementIdOrSlug) {
                $query->where('slug', $achievementIdOrSlug);
            })
            ->exists();
    }
    
    /**
     * Award associated badges and trophies.
     */
    private function awardAssociatedRewards($userId, Achievement $achievement): void
    {
        $user = User::find($userId);
        
        // Award badges based on achievement category and rarity
        if ($achievement->category === 'creator' && $achievement->rarity === 'legendary') {
            $badge = Badge::where('slug', 'legendary_creator')->first();
            if ($badge) {
                $userBadges = $user->badges ?? [];
                if (!in_array($badge->id, $userBadges)) {
                    $userBadges[] = $badge->id;
                    $user->update(['badges' => $userBadges]);
                }
            }
        }
        
        // Award trophies for milestone achievements
        if (str_contains($achievement->slug, '_100')) {
            $trophy = Trophy::where('slug', 'centurion')->first();
            if ($trophy) {
                $userTrophies = $user->trophies ?? [];
                if (!in_array($trophy->id, $userTrophies)) {
                    $userTrophies[] = $trophy->id;
                    $user->update(['trophies' => $userTrophies]);
                }
            }
        }
    }
}