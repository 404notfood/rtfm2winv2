<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\Quiz;
use App\Models\Participant;
use App\Models\QuizSession;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role', 'status', 'sort']);
        
        $query = User::query();

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Apply role filter
        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            switch ($filters['status']) {
                case 'active':
                    $query->whereNull('suspended_at')->whereNull('banned_at');
                    break;
                case 'suspended':
                    $query->whereNotNull('suspended_at');
                    break;
                case 'banned':
                    $query->whereNotNull('banned_at');
                    break;
            }
        }

        // Apply sorting
        $sortField = $filters['sort'] ?? 'created_at';
        $sortDirection = str_starts_with($sortField, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sortField, '-');
        
        $users = $query->withCount(['quizzes', 'participations'])
            ->orderBy($sortField, $sortDirection)
            ->paginate(20)
            ->withQueryString();
        
        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $filters,
            'roles' => ['guest', 'user', 'presenter', 'admin'],
            'statuses' => ['active', 'suspended', 'banned'],
        ]);
    }

    /**
     * Show user details.
     */
    public function show(string $id): Response
    {
        $user = User::with(['achievements', 'customThemes'])->findOrFail($id);
        
        $stats = [
            'quizzes_created' => $user->quizzes()->count(),
            'quizzes_played' => $user->participations()->count(),
            'total_score' => $user->participations()->sum('score'),
            'sessions_hosted' => $user->quizSessions()->count(),
            'last_activity' => $user->last_login_at,
            'account_created' => $user->created_at,
            'achievements_count' => $user->achievements()->count(),
            'average_score' => $user->participations()->avg('score') ?? 0,
        ];
        
        $recentActivity = AuditLog::where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
            
        $achievements = $user->achievements()->with('achievement')->get();
        
        return Inertia::render('admin/users/show', [
            'user' => $user,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'achievements' => $achievements,
        ]);
    }

    /**
     * Update user role.
     */
    public function updateRole(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:guest,user,presenter,admin',
            'reason' => 'nullable|string|max:255',
        ]);

        $user = User::findOrFail($id);
        $oldRole = $user->role;
        
        $user->update(['role' => $validated['role']]);
        
        // Log admin action
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_role_updated',
            'target_type' => 'User',
            'target_id' => $user->id,
            'old_values' => ['role' => $oldRole],
            'new_values' => ['role' => $validated['role']],
            'metadata' => ['reason' => $validated['reason']],
            'ip_address' => request()->ip(),
        ]);
        
        return back()->with('success', 'Rôle utilisateur mis à jour avec succès !');
    }

    /**
     * Suspend a user.
     */
    public function suspend(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'duration' => 'nullable|integer|min:1|max:365', // days
        ]);

        // TODO: Suspend user
        // Send notification to user
        // Log admin action
        
        return back()->with('success', 'Utilisateur suspendu avec succès !');
    }

    /**
     * Reactivate a suspended user.
     */
    public function reactivate(string $id): RedirectResponse
    {
        // TODO: Reactivate user
        // Send notification to user
        // Log admin action
        
        return back()->with('success', 'Utilisateur réactivé avec succès !');
    }

    /**
     * Ban a user permanently.
     */
    public function ban(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        // TODO: Ban user permanently
        // Archive user data
        // Log admin action
        
        return back()->with('success', 'Utilisateur banni avec succès !');
    }

    /**
     * Delete a user and all associated data.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'confirmation' => 'required|string|in:DELETE',
            'reason' => 'required|string|max:500',
        ]);

        // TODO: Delete user with cascade
        // Archive important data first
        // Log admin action
        
        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur supprimé définitivement !');
    }

    /**
     * Bulk actions on multiple users.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:suspend,reactivate,delete,change_role',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer',
            'reason' => 'nullable|string|max:500',
            'new_role' => 'required_if:action,change_role|in:guest,user,presenter,admin',
        ]);

        $userIds = $validated['user_ids'];
        $count = count($userIds);
        $action = $validated['action'];
        $reason = $validated['reason'] ?? 'Action groupée';
        
        DB::transaction(function () use ($userIds, $action, $validated, $reason) {
            $users = User::whereIn('id', $userIds)->get();
            
            foreach ($users as $user) {
                switch ($action) {
                    case 'suspend':
                        $this->suspendUser($user, $reason);
                        break;
                    case 'reactivate':
                        $this->reactivateUser($user, $reason);
                        break;
                    case 'change_role':
                        $this->changeUserRole($user, $validated['new_role'], $reason);
                        break;
                    case 'delete':
                        $this->deleteUser($user, $reason);
                        break;
                }
            }
            
            // Log bulk action
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => "bulk_{$action}",
                'target_type' => 'User',
                'target_id' => null,
                'old_values' => null,
                'new_values' => ['user_ids' => $userIds],
                'metadata' => ['reason' => $reason, 'count' => count($userIds)],
                'ip_address' => request()->ip(),
            ]);
        });
        
        return back()->with('success', "Action appliquée à {$count} utilisateur(s) !");
    }

    /**
     * Export users data.
     */
    public function export(Request $request): Response
    {
        $validated = $request->validate([
            'format' => 'required|in:csv,xlsx,pdf',
            'filters' => 'nullable|array',
        ]);

        // TODO: Generate export file
        // Apply filters if provided
        
        return response()->download($filePath);
    }

    /**
     * Show user activity log.
     */
    public function activityLog(string $id): Response
    {
        // TODO: Load user activity history
        $activities = collect(); // TODO: Implement
        
        return Inertia::render('admin/users/activity-log', [
            'userId' => $id,
            'activities' => $activities,
        ]);
    }

    /**
     * Impersonate a user (for debugging).
     */
    public function impersonate(string $id): RedirectResponse
    {
        // TODO: Start impersonation session
        // Log admin action
        // Redirect to user dashboard
        
        return redirect()->route('dashboard')
            ->with('impersonating', true);
    }

    /**
     * Stop impersonating and return to admin.
     */
    public function stopImpersonation(): RedirectResponse
    {
        // TODO: End impersonation session
        // Return to admin dashboard
        
        return redirect()->route('admin.dashboard')
            ->with('success', 'Impersonation terminée');
    }

    // Private helper methods for bulk actions

    private function suspendUser(User $user, string $reason, ?int $duration = null): void
    {
        $suspendedUntil = $duration ? Carbon::now()->addDays($duration) : null;
        
        $user->update([
            'suspended_at' => Carbon::now(),
            'suspended_until' => $suspendedUntil,
            'suspension_reason' => $reason,
        ]);

        // TODO: Send notification to user about suspension
        // Notification::send($user, new UserSuspendedNotification($reason, $suspendedUntil));
    }

    private function reactivateUser(User $user, string $reason): void
    {
        $user->update([
            'suspended_at' => null,
            'suspended_until' => null,
            'suspension_reason' => null,
        ]);

        // TODO: Send notification to user about reactivation
        // Notification::send($user, new UserReactivatedNotification());
    }

    private function changeUserRole(User $user, string $newRole, string $reason): void
    {
        $oldRole = $user->role;
        $user->update(['role' => $newRole]);

        // Log individual role change
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_role_updated',
            'target_type' => 'User',
            'target_id' => $user->id,
            'old_values' => ['role' => $oldRole],
            'new_values' => ['role' => $newRole],
            'metadata' => ['reason' => $reason],
            'ip_address' => request()->ip(),
        ]);
    }

    private function deleteUser(User $user, string $reason): void
    {
        // Archive user data before deletion
        $this->archiveUserData($user);

        // Log deletion
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_deleted',
            'target_type' => 'User',
            'target_id' => $user->id,
            'old_values' => $user->toArray(),
            'new_values' => null,
            'metadata' => ['reason' => $reason],
            'ip_address' => request()->ip(),
        ]);

        // Soft delete user
        $user->delete();
    }

    private function archiveUserData(User $user): void
    {
        // Archive important data to separate table or export before deletion
        $archiveData = [
            'user_id' => $user->id,
            'user_data' => $user->toArray(),
            'quizzes_count' => $user->quizzes()->count(),
            'participations_count' => $user->participations()->count(),
            'archived_at' => Carbon::now(),
            'archived_by' => Auth::id(),
        ];

        // TODO: Store in archive table
        // ArchivedUser::create($archiveData);
    }

    // Additional helper methods for individual actions

    private function performSuspend(User $user, string $reason, ?int $duration = null): void
    {
        $this->suspendUser($user, $reason, $duration);
        
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_suspended',
            'target_type' => 'User',
            'target_id' => $user->id,
            'old_values' => ['suspended_at' => null],
            'new_values' => ['suspended_at' => Carbon::now()],
            'metadata' => ['reason' => $reason, 'duration' => $duration],
            'ip_address' => request()->ip(),
        ]);
    }

    private function performReactivate(User $user): void
    {
        $this->reactivateUser($user, 'Réactivation par administrateur');
        
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_reactivated',
            'target_type' => 'User',
            'target_id' => $user->id,
            'old_values' => ['suspended_at' => $user->suspended_at],
            'new_values' => ['suspended_at' => null],
            'metadata' => ['reactivated_by_admin' => true],
            'ip_address' => request()->ip(),
        ]);
    }

    private function performBan(User $user, string $reason): void
    {
        $user->update([
            'banned_at' => Carbon::now(),
            'ban_reason' => $reason,
        ]);

        // Terminate all active sessions
        DB::table('sessions')->where('user_id', $user->id)->delete();
        
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_banned',
            'target_type' => 'User',
            'target_id' => $user->id,
            'old_values' => ['banned_at' => null],
            'new_values' => ['banned_at' => Carbon::now()],
            'metadata' => ['reason' => $reason],
            'ip_address' => request()->ip(),
        ]);

        // TODO: Send notification about ban
        // Notification::send($user, new UserBannedNotification($reason));
    }

    // Update individual action methods to use helpers

    public function suspendWithHelper(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'duration' => 'nullable|integer|min:1|max:365',
        ]);

        $user = User::findOrFail($id);
        $this->performSuspend($user, $validated['reason'], $validated['duration']);

        return back()->with('success', 'Utilisateur suspendu avec succès !');
    }

    public function reactivateWithHelper(string $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $this->performReactivate($user);

        return back()->with('success', 'Utilisateur réactivé avec succès !');
    }

    public function banWithHelper(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user = User::findOrFail($id);
        $this->performBan($user, $validated['reason']);

        return back()->with('success', 'Utilisateur banni avec succès !');
    }
}