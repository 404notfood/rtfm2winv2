<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\ParticipantAnswer;
use App\Models\User;
use App\Models\Badge;
use App\Models\Tournament;
use App\Models\BattleRoyaleSession;
use App\Models\AuditLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the application dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return $this->guestDashboard();
        }

        return match ($user->role) {
            'admin' => $this->adminDashboard($user),
            'presenter' => $this->presenterDashboard($user),
            default => $this->userDashboard($user),
        };
    }

    /**
     * Dashboard for guest users.
     */
    private function guestDashboard(): Response
    {
        // TODO: Load recent public quizzes, trending topics
        $publicQuizzes = collect(); // TODO: Implement
        $recentSessions = collect(); // TODO: Implement
        
        return Inertia::render('dashboard/guest', [
            'publicQuizzes' => $publicQuizzes,
            'recentSessions' => $recentSessions,
            'joinUrl' => url('/join'),
        ]);
    }

    /**
     * Dashboard for regular users.
     */
    private function userDashboard($user): Response
    {
        // Calculer les statistiques de l'utilisateur
        $participations = Participant::where('user_id', $user->id)->get();
        $totalParticipations = $participations->count();
        $totalScore = $participations->sum('score');
        $averageScore = $totalParticipations > 0 ? round($totalScore / $totalParticipations, 1) : 0;
        
        $stats = [
            'quizzes_played' => $totalParticipations,
            'total_score' => $totalScore,
            'average_score' => $averageScore,
            'best_position' => $participations->min('final_position') ?? null,
            'current_streak' => 0, // TODO: Calculate streak
        ];
        
        // Participations récentes avec optimisation N+1
        $recentParticipations = Participant::where('user_id', $user->id)
            ->with([
                'quiz_session:id,quiz_id,code,status,created_at',
                'quiz_session.quiz:id,title,description,creator_id',
                'quiz_session.quiz.creator:id,name,avatar'
            ])
            ->orderBy('joined_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($participation) {
                return [
                    'id' => $participation->id,
                    'quiz_title' => $participation->quiz_session->quiz->title ?? 'Quiz supprimé',
                    'score' => $participation->score,
                    'position' => $participation->final_position ?? null,
                    'completed_at' => $participation->joined_at,
                ];
            });
        
        // Badges/achievements récents
        $achievements = Badge::limit(3)->get();
        
        // Quiz recommandés avec optimisation N+1
        $recommendedQuizzes = Quiz::where('status', 'active')
            ->whereNotIn('id', function($query) use ($user) {
                $query->select('quiz_id')
                    ->from('quiz_sessions')
                    ->join('participants', 'quiz_sessions.id', '=', 'participants.quiz_session_id')
                    ->where('participants.user_id', $user->id);
            })
            ->with([
                'creator:id,name,avatar',
                'tags:id,name,color',
                'sessions' => function($query) {
                    $query->select('id,quiz_id,status,participants_count')
                          ->where('status', 'completed')
                          ->latest()
                          ->limit(3);
                }
            ])
            ->withCount(['questions', 'sessions'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentParticipations' => $recentParticipations,
            'achievements' => $achievements,
            'recommendedQuizzes' => $recommendedQuizzes,
        ]);
    }

    /**
     * Dashboard for presenters.
     */
    private function presenterDashboard($user): Response
    {
        // Calculer les statistiques du présentateur
        $myQuizzes = Quiz::where('creator_id', $user->id)->get();
        $totalQuizzes = $myQuizzes->count();
        
        // Sessions créées par ce présentateur
        $quizIds = $myQuizzes->pluck('id');
        $mySessions = QuizSession::whereIn('quiz_id', $quizIds)->get();
        $totalSessions = $mySessions->count();
        
        // Participants total
        $totalParticipants = Participant::whereIn('quiz_session_id', $mySessions->pluck('id'))->count();
        $averageParticipants = $totalSessions > 0 ? round($totalParticipants / $totalSessions, 1) : 0;
        
        // Quiz le plus populaire
        $mostPopularQuiz = $myQuizzes->map(function ($quiz) {
            $participantCount = Participant::whereHas('quiz_session', function ($query) use ($quiz) {
                $query->where('quiz_id', $quiz->id);
            })->count();
            $quiz->participant_count = $participantCount;
            return $quiz;
        })->sortByDesc('participant_count')->first();
        
        $stats = [
            'quizzes_created' => $totalQuizzes,
            'total_participants' => $totalParticipants,
            'total_views' => $mySessions->sum('participants_count') ?? 0,
            'avg_score' => 87.5, // TODO: Calculate real average score
        ];
        
        // Quiz récents avec statistiques
        $recentQuizzes = Quiz::where('creator_id', $user->id)
            ->withCount(['questions'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($quiz) {
                $participantCount = Participant::whereHas('quiz_session', function ($query) use ($quiz) {
                    $query->where('quiz_id', $quiz->id);
                })->count();
                
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'created_at' => $quiz->created_at,
                    'questions_count' => $quiz->questions_count,
                    'category' => $quiz->category,
                    'status' => $quiz->status,
                    'participants_count' => $participantCount,
                ];
            });
        
        // Trophées récents (badges)
        $recentTrophies = Badge::limit(3)->get()->map(function ($badge) {
            return [
                'id' => $badge->id,
                'name' => $badge->name,
                'description' => $badge->description,
                'awarded_at' => now()->subDays(rand(1, 30)), // Mock date
            ];
        });
        
        // Activité récente
        $recentActivity = [
            [
                'type' => 'quiz_created',
                'description' => 'Nouveau quiz "' . ($recentQuizzes->first()['title'] ?? 'JavaScript Avancé') . '" créé',
                'time' => 'Il y a 2 heures',
                'icon' => '✏️'
            ],
            [
                'type' => 'participant_joined',
                'description' => rand(5, 25) . ' nouveaux participants cette semaine',
                'time' => 'Il y a 4 heures',
                'icon' => '👥'
            ],
            [
                'type' => 'trophy_earned',
                'description' => 'Trophée "Créateur Populaire" obtenu',
                'time' => 'Il y a 1 jour',
                'icon' => '🏆'
            ]
        ];
        
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentQuizzes' => $recentQuizzes,
            'recentTrophies' => $recentTrophies,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Dashboard for administrators.
     */
    private function adminDashboard($user): Response
    {
        // Calculate global statistics with caching
        $globalStats = Cache::remember('admin_stats', 300, function () {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();
            
            $totalUsers = User::count();
            $usersThisMonth = User::where('created_at', '>=', $thisMonth)->count();
            $usersLastMonth = User::where('created_at', '>=', $lastMonth)
                ->where('created_at', '<', $thisMonth)->count();
            
            $totalQuizzes = Quiz::count();
            $quizzesThisMonth = Quiz::where('created_at', '>=', $thisMonth)->count();
            $quizzesLastMonth = Quiz::where('created_at', '>=', $lastMonth)
                ->where('created_at', '<', $thisMonth)->count();
                
            $totalSessions = QuizSession::count();
            $sessionsToday = QuizSession::whereDate('created_at', $today)->count();
            $activeSessions = QuizSession::where('status', 'active')->count();
            
            return [
                'total_users' => $totalUsers,
                'total_quizzes' => $totalQuizzes,
                'total_sessions' => $totalSessions,
                'active_sessions' => $activeSessions,
                'sessions_today' => $sessionsToday,
                'users_growth' => $usersLastMonth > 0 ? 
                    round((($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100, 1) : 100,
                'quizzes_growth' => $quizzesLastMonth > 0 ? 
                    round((($quizzesThisMonth - $quizzesLastMonth) / $quizzesLastMonth) * 100, 1) : 100,
            ];
        });

        // User growth chart data (last 30 days)
        $userGrowth = Cache::remember('user_growth_chart', 600, function () {
            $dates = collect();
            for ($i = 29; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $count = User::whereDate('created_at', $date->toDateString())->count();
                $dates->push([
                    'date' => $date->format('Y-m-d'),
                    'count' => $count,
                    'label' => $date->format('j M')
                ]);
            }
            return $dates;
        });

        // Popular quizzes
        $popularQuizzes = Quiz::withCount(['sessions' => function($query) {
                $query->where('created_at', '>=', Carbon::now()->subDays(30));
            }])
            ->with(['creator:id,name,avatar'])
            ->where('status', 'active')
            ->orderBy('sessions_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'creator' => [
                        'name' => $quiz->creator->name,
                        'avatar' => $quiz->creator->avatar
                    ],
                    'sessions_count' => $quiz->sessions_count,
                    'participants_count' => $quiz->sessions->sum('participants_count') ?? 0,
                    'average_score' => $quiz->sessions->avg('average_score') ?? 0,
                    'created_at' => $quiz->created_at,
                    'status' => $quiz->status
                ];
            });

        // Recent users (last 10 registered)
        $recentUsers = User::with(['achievements' => function($query) {
                $query->limit(3);
            }])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'last_login_at' => $user->last_login_at,
                    'quiz_count' => $user->quizzes_count ?? 0,
                    'session_count' => $user->participations_count ?? 0
                ];
            });

        // System alerts (last 24 hours)
        $systemAlerts = AuditLog::where('created_at', '>=', Carbon::now()->subDay())
            ->whereIn('action', ['user_banned', 'quiz_reported', 'system_error', 'security_alert'])
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                $priority = $this->getAlertPriority($log->action);
                $type = $this->getAlertType($log->action);
                
                return [
                    'id' => $log->id,
                    'type' => $type,
                    'title' => $this->getAlertTitle($log->action),
                    'message' => $this->getAlertMessage($log),
                    'timestamp' => $log->created_at,
                    'is_resolved' => false,
                    'priority' => $priority
                ];
            });

        // Moderation queue
        $moderationQueue = collect()
            ->merge($this->getReportedQuizzes())
            ->merge($this->getReportedUsers())
            ->merge($this->getPendingContent())
            ->sortByDesc('created_at')
            ->take(10)
            ->values();
            
        // System health check
        $systemHealth = $this->getSystemHealth();
        
        return Inertia::render('admin/dashboard', [
            'globalStats' => $globalStats,
            'userGrowth' => $userGrowth,
            'popularQuizzes' => $popularQuizzes,
            'recentUsers' => $recentUsers,
            'systemAlerts' => $systemAlerts,
            'moderationQueue' => $moderationQueue,
            'systemHealth' => $systemHealth,
        ]);
    }

    /**
     * Get dashboard statistics for API.
     */
    public function stats(Request $request): Response
    {
        $user = $request->user();
        
        // TODO: Return JSON stats based on user role
        $stats = [];
        
        return response()->json($stats);
    }

    /**
     * Get recent activity for dashboard.
     */
    public function activity(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $activities = match ($user->role) {
            'admin' => $this->getAdminActivity(),
            'presenter' => $this->getPresenterActivity($user),
            default => $this->getUserActivity($user),
        };
        
        return response()->json($activities);
    }

    // Helper methods for admin dashboard analytics

    private function getAlertPriority(string $action): string
    {
        return match ($action) {
            'user_banned', 'security_alert' => 'critical',
            'quiz_reported' => 'high',
            'system_error' => 'medium',
            default => 'low'
        };
    }

    private function getAlertType(string $action): string
    {
        return match ($action) {
            'user_banned', 'quiz_reported' => 'warning',
            'security_alert', 'system_error' => 'error',
            default => 'info'
        };
    }

    private function getAlertTitle(string $action): string
    {
        return match ($action) {
            'user_banned' => 'Utilisateur banni',
            'quiz_reported' => 'Quiz signalé',
            'security_alert' => 'Alerte de sécurité',
            'system_error' => 'Erreur système',
            default => 'Notification système'
        };
    }

    private function getAlertMessage(AuditLog $log): string
    {
        $user = $log->user ? $log->user->name : 'Système';
        
        return match ($log->action) {
            'user_banned' => "L'utilisateur {$user} a été banni du système",
            'quiz_reported' => "Un quiz a été signalé comme inapproprié",
            'security_alert' => "Tentative d'accès non autorisé détectée",
            'system_error' => "Erreur système détectée dans {$log->target_type}",
            default => "Action {$log->action} effectuée par {$user}"
        };
    }

    private function getReportedQuizzes(): \Illuminate\Support\Collection
    {
        return Quiz::where('is_reported', true)
            ->with(['creator:id,name', 'reports'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'type' => 'quiz',
                    'title' => $quiz->title,
                    'reporter' => $quiz->reports->first()?->reporter_name ?? 'Anonyme',
                    'reason' => $quiz->reports->first()?->reason ?? 'Contenu inapproprié',
                    'created_at' => $quiz->updated_at,
                    'priority' => 'medium'
                ];
            });
    }

    private function getReportedUsers(): \Illuminate\Support\Collection
    {
        return User::where('is_reported', true)
            ->with('reports')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'type' => 'user',
                    'title' => "Utilisateur: {$user->name}",
                    'reporter' => $user->reports->first()?->reporter_name ?? 'Anonyme',
                    'reason' => $user->reports->first()?->reason ?? 'Comportement inapproprié',
                    'created_at' => $user->updated_at,
                    'priority' => 'high'
                ];
            });
    }

    private function getPendingContent(): \Illuminate\Support\Collection
    {
        // Quiz en attente d'approbation
        return Quiz::where('status', 'pending')
            ->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'type' => 'pending',
                    'title' => "Quiz: {$quiz->title}",
                    'reporter' => $quiz->creator->name,
                    'reason' => 'En attente d\'approbation',
                    'created_at' => $quiz->created_at,
                    'priority' => 'low'
                ];
            });
    }

    private function getSystemHealth(): array
    {
        // Simuler une vérification de santé système
        $status = 'healthy';
        $uptime = 72; // heures
        $responseTime = rand(100, 500); // ms
        $errorRate = rand(0, 3); // %
        $activeConnections = rand(50, 200);

        // Déterminer le statut basé sur les métriques
        if ($responseTime > 1000 || $errorRate > 5) {
            $status = 'critical';
        } elseif ($responseTime > 500 || $errorRate > 2) {
            $status = 'warning';
        }

        return [
            'status' => $status,
            'uptime' => $uptime,
            'response_time' => $responseTime,
            'error_rate' => $errorRate,
            'active_connections' => $activeConnections
        ];
    }

    private function getAdminActivity(): \Illuminate\Support\Collection
    {
        return AuditLog::with('user:id,name')
            ->where('created_at', '>=', Carbon::now()->subHours(24))
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'user' => $log->user?->name ?? 'Système',
                    'target' => $log->target_type,
                    'timestamp' => $log->created_at,
                    'description' => "Action {$log->action} sur {$log->target_type} #{$log->target_id}"
                ];
            });
    }

    private function getPresenterActivity(User $user): \Illuminate\Support\Collection
    {
        return collect()
            ->merge($user->quizzes()->latest()->limit(5)->get()->map(function ($quiz) {
                return [
                    'type' => 'quiz_created',
                    'description' => "Quiz '{$quiz->title}' créé",
                    'timestamp' => $quiz->created_at
                ];
            }))
            ->merge($user->quizSessions()->latest()->limit(5)->get()->map(function ($session) {
                return [
                    'type' => 'session_started',
                    'description' => "Session de quiz démarrée",
                    'timestamp' => $session->created_at
                ];
            }))
            ->sortByDesc('timestamp')
            ->take(10)
            ->values();
    }

    private function getUserActivity(User $user): \Illuminate\Support\Collection
    {
        return Participant::where('user_id', $user->id)
            ->with('quizSession.quiz')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($participation) {
                return [
                    'type' => 'quiz_participation',
                    'description' => "Participation au quiz '{$participation->quizSession->quiz->title}'",
                    'score' => $participation->score,
                    'timestamp' => $participation->joined_at
                ];
            });
    }
}