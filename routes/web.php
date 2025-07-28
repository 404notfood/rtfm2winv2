<?php

use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizSessionController;
use App\Http\Controllers\ThemeController;
use App\Http\Controllers\BattleRoyaleController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Broadcasting Authentication Routes
Broadcast::routes(['middleware' => ['web', 'auth']]);

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Dashboard (supports all user types including guests)
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Active sessions - for participants to join
Route::get('/sessions/active', [QuizSessionController::class, 'activeSessions'])->name('sessions.active');

// Quiz routes
Route::prefix('quiz')->name('quiz.')->group(function () {
    Route::get('/', [QuizController::class, 'index'])->name('index');
    Route::get('/create', [QuizController::class, 'create'])->name('create')->middleware('auth');
    Route::post('/', [QuizController::class, 'store'])->name('store')->middleware('auth');
    
    // Specific routes first (before dynamic {id})
    Route::get('/{id}/play', [QuizController::class, 'play'])->name('play');
    Route::get('/{id}/analytics', [QuizController::class, 'analytics'])->name('analytics')->middleware('auth');
    Route::get('/{id}/edit', [QuizController::class, 'edit'])->name('edit')->middleware('auth');
    Route::put('/{id}', [QuizController::class, 'update'])->name('update')->middleware('auth');
    Route::delete('/{id}', [QuizController::class, 'destroy'])->name('destroy')->middleware('auth');
    Route::post('/{id}/duplicate', [QuizController::class, 'duplicate'])->name('duplicate')->middleware('auth');
    Route::post('/{id}/regenerate-link', [QuizController::class, 'regenerateLink'])->name('regenerate-link')->middleware('auth');
    
    // Dynamic {id} route last
    Route::get('/{id}', [QuizController::class, 'show'])->name('show');
    
    // Question management routes
    Route::prefix('{quiz}/questions')->name('questions.')->middleware('auth')->group(function () {
        Route::get('/', [QuestionController::class, 'index'])->name('index');
        Route::get('/create', [QuestionController::class, 'create'])->name('create');
        Route::post('/', [QuestionController::class, 'store'])->name('store');
        Route::get('/{question}', [QuestionController::class, 'show'])->name('show');
        Route::get('/{question}/edit', [QuestionController::class, 'edit'])->name('edit');
        Route::put('/{question}', [QuestionController::class, 'update'])->name('update');
        Route::delete('/{question}', [QuestionController::class, 'destroy'])->name('destroy');
        Route::post('/{question}/duplicate', [QuestionController::class, 'duplicate'])->name('duplicate');
        Route::post('/reorder', [QuestionController::class, 'reorder'])->name('reorder');
        Route::post('/import', [QuestionController::class, 'import'])->name('import');
    });
    
    // Quiz session routes
    Route::prefix('session')->name('session.')->group(function () {
        Route::post('/{quizId}/create', [QuizSessionController::class, 'create'])->name('create')->middleware('auth');
        Route::get('/{code}/waiting-room', [QuizSessionController::class, 'waitingRoom'])->name('waiting-room');
        Route::get('/{code}/play', [QuizSessionController::class, 'play'])->name('play');
        Route::post('/{code}/start', [QuizSessionController::class, 'start'])->name('start')->middleware('auth');
        
        // Rate limited answer submission to prevent cheating
        Route::middleware('throttle:quiz_answers,30,1')->group(function () {
            Route::post('/{code}/answer', [QuizSessionController::class, 'submitAnswer'])->name('submit-answer');
        });
        
        Route::post('/{code}/next-question', [QuizSessionController::class, 'nextQuestion'])->name('next-question')->middleware('auth');
        Route::get('/{code}/results', [QuizSessionController::class, 'results'])->name('results');
        Route::post('/{code}/end', [QuizSessionController::class, 'end'])->name('end')->middleware('auth');
        Route::get('/{code}/leaderboard', [QuizSessionController::class, 'leaderboard'])->name('leaderboard');
        Route::get('/{code}/export-pdf', [QuizSessionController::class, 'exportPdf'])->name('export-pdf');
    });
});

// Public join routes (for QR codes and links) - Rate limited to prevent spam
Route::middleware('throttle:quiz_join,10,1')->group(function () {
    Route::get('/join/{code}', [QuizSessionController::class, 'join'])->name('join');
    Route::post('/join/{code}', [QuizSessionController::class, 'storeParticipant'])->name('join.store');
});

// Theme management routes
Route::prefix('themes')->name('themes.')->group(function () {
    Route::get('/', [ThemeController::class, 'index'])->name('index');
    Route::post('/apply', [ThemeController::class, 'apply'])->name('apply');
    Route::get('/editor/{id?}', [ThemeController::class, 'editor'])->name('editor')->middleware('auth');
    Route::post('/', [ThemeController::class, 'store'])->name('store')->middleware('auth');
    Route::put('/{id}', [ThemeController::class, 'update'])->name('update')->middleware('auth');
    Route::delete('/{id}', [ThemeController::class, 'destroy'])->name('destroy')->middleware('auth');
    Route::post('/{id}/duplicate', [ThemeController::class, 'duplicate'])->name('duplicate')->middleware('auth');
    Route::get('/{id}/export', [ThemeController::class, 'export'])->name('export')->middleware('auth');
    Route::post('/import', [ThemeController::class, 'import'])->name('import')->middleware('auth');
    Route::post('/preview', [ThemeController::class, 'preview'])->name('preview');
});

// Battle Royale routes
Route::prefix('battle-royale')->name('battle-royale.')->group(function () {
    Route::get('/', [BattleRoyaleController::class, 'index'])->name('index');
    Route::get('/create', [BattleRoyaleController::class, 'create'])->name('create')->middleware('auth');
    Route::post('/', [BattleRoyaleController::class, 'store'])->name('store')->middleware('auth');
    Route::get('/{code}/waiting-room', [BattleRoyaleController::class, 'waitingRoom'])->name('waiting-room');
    // Rate limited Battle Royale joining
    Route::middleware('throttle:battle_royale_join,5,1')->group(function () {
        Route::get('/join/{code}', [BattleRoyaleController::class, 'join'])->name('join');
        Route::post('/join/{code}', [BattleRoyaleController::class, 'storeParticipant'])->name('join.store');
    });
    Route::post('/{code}/start', [BattleRoyaleController::class, 'start'])->name('start')->middleware('auth');
    Route::get('/{code}/arena', [BattleRoyaleController::class, 'arena'])->name('arena');
    Route::post('/{code}/answer', [BattleRoyaleController::class, 'submitAnswer'])->name('submit-answer');
    Route::post('/{code}/elimination', [BattleRoyaleController::class, 'processElimination'])->name('elimination');
    Route::get('/{code}/results', [BattleRoyaleController::class, 'results'])->name('results');
    Route::post('/{code}/end', [BattleRoyaleController::class, 'end'])->name('end')->middleware('auth');
    Route::get('/{code}/eliminated', [BattleRoyaleController::class, 'elimination'])->name('eliminated');
});

// Achievement routes
Route::prefix('achievements')->name('achievements.')->middleware('auth')->group(function () {
    Route::get('/', [AchievementController::class, 'index'])->name('index');
    Route::get('/badges', [AchievementController::class, 'badges'])->name('badges');
    Route::get('/trophies', [AchievementController::class, 'trophies'])->name('trophies');
    Route::get('/leaderboard', [AchievementController::class, 'leaderboard'])->name('leaderboard');
    Route::get('/{id}', [AchievementController::class, 'show'])->name('show');
    Route::post('/showcase', [AchievementController::class, 'updateShowcase'])->name('update-showcase');
});

// Tournament routes
Route::prefix('tournaments')->name('tournaments.')->group(function () {
    Route::get('/', [TournamentController::class, 'index'])->name('index');
    Route::get('/create', [TournamentController::class, 'create'])->name('create')->middleware('auth');
    Route::post('/', [TournamentController::class, 'store'])->name('store')->middleware('auth');
    Route::get('/{tournament}', [TournamentController::class, 'show'])->name('show');
    Route::get('/{tournament}/edit', [TournamentController::class, 'edit'])->name('edit')->middleware('auth');
    Route::put('/{tournament}', [TournamentController::class, 'update'])->name('update')->middleware('auth');
    Route::delete('/{tournament}', [TournamentController::class, 'destroy'])->name('destroy')->middleware('auth');
    Route::post('/{tournament}/join', [TournamentController::class, 'join'])->name('join')->middleware('auth');
    Route::delete('/{tournament}/leave', [TournamentController::class, 'leave'])->name('leave')->middleware('auth');
    Route::post('/{tournament}/start', [TournamentController::class, 'start'])->name('start')->middleware('auth');
    Route::post('/{tournament}/next-round', [TournamentController::class, 'nextRound'])->name('next-round')->middleware('auth');
    Route::post('/{tournament}/matches/{match}/result', [TournamentController::class, 'recordResult'])->name('record-result')->middleware('auth');
    Route::get('/{tournament}/bracket', [TournamentController::class, 'bracket'])->name('bracket');
    Route::get('/{tournament}/leaderboard', [TournamentController::class, 'leaderboard'])->name('leaderboard');
});

// Notification routes
Route::prefix('notifications')->name('notifications.')->middleware('auth')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('mark-read');
    Route::patch('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-action', [NotificationController::class, 'bulkAction'])->name('bulk-action');
    Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('unread-count');
    Route::get('/recent', [NotificationController::class, 'getRecent'])->name('recent');
    Route::put('/preferences', [NotificationController::class, 'updatePreferences'])->name('update-preferences');
});

// Friendship routes
Route::prefix('friends')->name('friends.')->middleware('auth')->group(function () {
    Route::get('/', [FriendshipController::class, 'index'])->name('index');
    Route::get('/search', [FriendshipController::class, 'search'])->name('search');
    Route::post('/{friend}/request', [FriendshipController::class, 'sendRequest'])->name('send-request');
    Route::post('/{sender}/accept', [FriendshipController::class, 'acceptRequest'])->name('accept-request');
    Route::post('/{sender}/reject', [FriendshipController::class, 'rejectRequest'])->name('reject-request');
    Route::delete('/{friend}/remove', [FriendshipController::class, 'removeFriend'])->name('remove');
    Route::post('/{user}/block', [FriendshipController::class, 'blockUser'])->name('block');
    Route::delete('/{user}/unblock', [FriendshipController::class, 'unblockUser'])->name('unblock');
    Route::get('/blocked', [FriendshipController::class, 'getBlockedUsers'])->name('blocked');
    Route::get('/for-invite', [FriendshipController::class, 'getFriendsForInvite'])->name('for-invite');
    Route::post('/invite-to-quiz', [FriendshipController::class, 'inviteToQuiz'])->name('invite-to-quiz');
});

// Tag routes
Route::prefix('tags')->name('tags.')->group(function () {
    Route::get('/', [TagController::class, 'index'])->name('index');
    Route::get('/create', [TagController::class, 'create'])->name('create')->middleware('auth');
    Route::post('/', [TagController::class, 'store'])->name('store')->middleware('auth');
    Route::get('/{tag}', [TagController::class, 'show'])->name('show');
    Route::get('/{tag}/edit', [TagController::class, 'edit'])->name('edit')->middleware('auth');
    Route::put('/{tag}', [TagController::class, 'update'])->name('update')->middleware('auth');
    Route::delete('/{tag}', [TagController::class, 'destroy'])->name('destroy')->middleware('auth');
    Route::get('/search', [TagController::class, 'search'])->name('search');
    Route::get('/popular', [TagController::class, 'popular'])->name('popular');
    Route::post('/{quiz}/attach', [TagController::class, 'attachToQuiz'])->name('attach-to-quiz')->middleware('auth');
    Route::delete('/{quiz}/{tag}/detach', [TagController::class, 'detachFromQuiz'])->name('detach-from-quiz')->middleware('auth');
    Route::get('/{tag}/quizzes', [TagController::class, 'getQuizzesByTag'])->name('get-quizzes');
    Route::post('/bulk-action', [TagController::class, 'bulkAction'])->name('bulk-action')->middleware('auth');
    Route::post('/merge', [TagController::class, 'merge'])->name('merge')->middleware('auth');
    Route::post('/suggest', [TagController::class, 'suggest'])->name('suggest');
});

// Export routes
Route::prefix('export')->name('export.')->middleware('auth')->group(function () {
    Route::get('/quiz-results/{session}', [ExportController::class, 'quizResults'])->name('quiz-results');
    Route::get('/quiz-structure/{quiz}', [ExportController::class, 'quizStructure'])->name('quiz-structure');
    Route::get('/user-statistics/{user}', [ExportController::class, 'userStatistics'])->name('user-statistics');
    Route::get('/tournament-results/{tournament}', [ExportController::class, 'tournamentResults'])->name('tournament-results');
    Route::get('/certificate/{session}/{participant}', [ExportController::class, 'certificate'])->name('certificate');
});

// Admin routes - Rate limited for security
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin', 'throttle:admin_actions'])->group(function () {
    Route::get('/dashboard', function () {
        return app(DashboardController::class)->index(request());
    })->name('dashboard');
    
    // Admin settings and content management
    Route::get('/settings', function () {
        return Inertia::render('admin/settings');
    })->name('settings');
    
    Route::get('/content', function () {
        return Inertia::render('admin/content');
    })->name('content');
    
    // User management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('index');
        Route::get('/{id}', [AdminUserController::class, 'show'])->name('show');
        Route::post('/{id}/role', [AdminUserController::class, 'updateRole'])->name('update-role');
        Route::post('/{id}/suspend', [AdminUserController::class, 'suspend'])->name('suspend');
        Route::post('/{id}/reactivate', [AdminUserController::class, 'reactivate'])->name('reactivate');
        Route::post('/{id}/ban', [AdminUserController::class, 'ban'])->name('ban');
        Route::delete('/{id}', [AdminUserController::class, 'destroy'])->name('destroy');
        // Bulk actions extra rate limited
        Route::middleware('throttle:admin_bulk,10,1')->group(function () {
            Route::post('/bulk-action', [AdminUserController::class, 'bulkAction'])->name('bulk-action');
        });
        Route::get('/export', [AdminUserController::class, 'export'])->name('export');
        Route::get('/{id}/activity-log', [AdminUserController::class, 'activityLog'])->name('activity-log');
        Route::post('/{id}/impersonate', [AdminUserController::class, 'impersonate'])->name('impersonate');
        Route::post('/stop-impersonation', [AdminUserController::class, 'stopImpersonation'])->name('stop-impersonation');
    });
    
    // Audit logs
    Route::prefix('audit-logs')->name('audit-logs.')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->name('index');
        Route::get('/dashboard', [AuditLogController::class, 'dashboard'])->name('dashboard');
        Route::get('/{auditLog}', [AuditLogController::class, 'show'])->name('show');
        Route::get('/export', [AuditLogController::class, 'export'])->name('export');
        Route::post('/cleanup', [AuditLogController::class, 'cleanup'])->name('cleanup');
        Route::post('/test-notification', [NotificationController::class, 'sendTestNotification'])->name('test-notification');
    });
});

// API routes for dashboard stats
Route::prefix('api')->middleware('auth')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('api.dashboard.stats');
    Route::get('/dashboard/activity', [DashboardController::class, 'activity'])->name('api.dashboard.activity');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
