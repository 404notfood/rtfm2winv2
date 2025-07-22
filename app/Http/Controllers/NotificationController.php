<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Auth::user()
            ->notifications()
            ->latest()
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => Auth::user()->notifications()->where('is_read', false)->count(),
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        $this->authorize('update', $notification);

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return back();
    }

    public function markAllAsRead()
    {
        Auth::user()
            ->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return back()->with('success', 'Toutes les notifications ont été marquées comme lues.');
    }

    public function destroy(Notification $notification)
    {
        $this->authorize('delete', $notification);

        $notification->delete();

        return back()->with('success', 'Notification supprimée.');
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:mark_read,delete',
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id',
        ]);

        $notifications = Auth::user()
            ->notifications()
            ->whereIn('id', $validated['notification_ids']);

        if ($validated['action'] === 'mark_read') {
            $notifications->update(['is_read' => true, 'read_at' => now()]);
            $message = 'Notifications marquées comme lues.';
        } else {
            $notifications->delete();
            $message = 'Notifications supprimées.';
        }

        return back()->with('success', $message);
    }

    public function getUnreadCount()
    {
        $count = Auth::user()->notifications()->where('is_read', false)->count();

        return response()->json(['count' => $count]);
    }

    public function getRecent()
    {
        $notifications = Auth::user()
            ->notifications()
            ->where('is_read', false)
            ->latest()
            ->limit(5)
            ->get();

        return response()->json(['notifications' => $notifications]);
    }

    public function updatePreferences(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'quiz_invitations' => 'boolean',
            'friend_requests' => 'boolean',
            'achievements' => 'boolean',
            'tournament_updates' => 'boolean',
            'battle_royale_invites' => 'boolean',
            'quiz_results' => 'boolean',
            'weekly_summary' => 'boolean',
        ]);

        $preferences = $user->preferences ?? [];
        $preferences['notifications'] = $validated;
        
        $user->update(['preferences' => $preferences]);

        return back()->with('success', 'Préférences de notification mises à jour.');
    }

    public function sendTestNotification(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|in:info,success,warning,error',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $userId = $validated['user_id'] ?? Auth::id();

        Notification::create([
            'user_id' => $userId,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'message' => $validated['message'],
            'data' => ['test' => true],
        ]);

        return back()->with('success', 'Notification de test envoyée.');
    }
}