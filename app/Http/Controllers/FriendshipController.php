<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FriendshipController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $friends = $user->friends()
            ->with(['avatar'])
            ->withPivot('created_at as friendship_date')
            ->get();

        $pendingRequests = Friendship::where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user')
            ->get();

        $sentRequests = Friendship::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('friend')
            ->get();

        return Inertia::render('friends/index', [
            'friends' => $friends,
            'pendingRequests' => $pendingRequests,
            'sentRequests' => $sentRequests,
        ]);
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2|max:50',
        ]);

        $user = Auth::user();
        $query = $validated['query'];

        $users = User::where('id', '!=', $user->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%");
            })
            ->where('is_suspended', false)
            ->select('id', 'name', 'email', 'avatar')
            ->limit(10)
            ->get()
            ->map(function ($searchUser) use ($user) {
                $searchUser->friendship_status = $this->getFriendshipStatus($user, $searchUser);
                return $searchUser;
            });

        return response()->json(['users' => $users]);
    }

    public function sendRequest(User $friend)
    {
        $user = Auth::user();

        if ($user->id === $friend->id) {
            return back()->withErrors(['friend' => 'Vous ne pouvez pas vous envoyer une demande d\'ami.']);
        }

        // Vérifier si une relation existe déjà
        $existingFriendship = Friendship::where(function ($query) use ($user, $friend) {
            $query->where('user_id', $user->id)->where('friend_id', $friend->id);
        })->orWhere(function ($query) use ($user, $friend) {
            $query->where('user_id', $friend->id)->where('friend_id', $user->id);
        })->first();

        if ($existingFriendship) {
            if ($existingFriendship->status === 'accepted') {
                return back()->withErrors(['friend' => 'Vous êtes déjà amis.']);
            } elseif ($existingFriendship->status === 'pending') {
                return back()->withErrors(['friend' => 'Une demande d\'ami est déjà en cours.']);
            } elseif ($existingFriendship->status === 'blocked') {
                return back()->withErrors(['friend' => 'Impossible d\'envoyer une demande à cet utilisateur.']);
            }
        }

        DB::transaction(function () use ($user, $friend) {
            // Créer la demande d'ami
            Friendship::create([
                'user_id' => $user->id,
                'friend_id' => $friend->id,
                'status' => 'pending',
            ]);

            // Créer la notification
            Notification::create([
                'user_id' => $friend->id,
                'type' => 'friend_request',
                'title' => 'Nouvelle demande d\'ami',
                'message' => "{$user->name} vous a envoyé une demande d'ami.",
                'data' => [
                    'sender_id' => $user->id,
                    'sender_name' => $user->name,
                    'sender_avatar' => $user->avatar,
                ],
            ]);
        });

        return back()->with('success', 'Demande d\'ami envoyée.');
    }

    public function acceptRequest(User $sender)
    {
        $user = Auth::user();

        $friendship = Friendship::where('user_id', $sender->id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return back()->withErrors(['friend' => 'Demande d\'ami introuvable.']);
        }

        DB::transaction(function () use ($friendship, $user, $sender) {
            // Accepter la demande
            $friendship->update(['status' => 'accepted']);

            // Créer la relation inverse
            Friendship::create([
                'user_id' => $user->id,
                'friend_id' => $sender->id,
                'status' => 'accepted',
            ]);

            // Notifier l'expéditeur
            Notification::create([
                'user_id' => $sender->id,
                'type' => 'friend_request_accepted',
                'title' => 'Demande d\'ami acceptée',
                'message' => "{$user->name} a accepté votre demande d'ami.",
                'data' => [
                    'accepter_id' => $user->id,
                    'accepter_name' => $user->name,
                    'accepter_avatar' => $user->avatar,
                ],
            ]);
        });

        return back()->with('success', 'Demande d\'ami acceptée.');
    }

    public function rejectRequest(User $sender)
    {
        $user = Auth::user();

        $friendship = Friendship::where('user_id', $sender->id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return back()->withErrors(['friend' => 'Demande d\'ami introuvable.']);
        }

        $friendship->delete();

        return back()->with('success', 'Demande d\'ami rejetée.');
    }

    public function removeFriend(User $friend)
    {
        $user = Auth::user();

        DB::transaction(function () use ($user, $friend) {
            // Supprimer les deux relations
            Friendship::where(function ($query) use ($user, $friend) {
                $query->where('user_id', $user->id)->where('friend_id', $friend->id);
            })->orWhere(function ($query) use ($user, $friend) {
                $query->where('user_id', $friend->id)->where('friend_id', $user->id);
            })->delete();
        });

        return back()->with('success', 'Ami supprimé.');
    }

    public function blockUser(User $userToBlock)
    {
        $user = Auth::user();

        if ($user->id === $userToBlock->id) {
            return back()->withErrors(['user' => 'Vous ne pouvez pas vous bloquer vous-même.']);
        }

        DB::transaction(function () use ($user, $userToBlock) {
            // Supprimer toute relation existante
            Friendship::where(function ($query) use ($user, $userToBlock) {
                $query->where('user_id', $user->id)->where('friend_id', $userToBlock->id);
            })->orWhere(function ($query) use ($user, $userToBlock) {
                $query->where('user_id', $userToBlock->id)->where('friend_id', $user->id);
            })->delete();

            // Créer le blocage
            Friendship::create([
                'user_id' => $user->id,
                'friend_id' => $userToBlock->id,
                'status' => 'blocked',
            ]);
        });

        return back()->with('success', 'Utilisateur bloqué.');
    }

    public function unblockUser(User $userToUnblock)
    {
        $user = Auth::user();

        Friendship::where('user_id', $user->id)
            ->where('friend_id', $userToUnblock->id)
            ->where('status', 'blocked')
            ->delete();

        return back()->with('success', 'Utilisateur débloqué.');
    }

    public function getBlockedUsers()
    {
        $user = Auth::user();

        $blockedUsers = Friendship::where('user_id', $user->id)
            ->where('status', 'blocked')
            ->with('friend:id,name,email,avatar')
            ->get()
            ->pluck('friend');

        return Inertia::render('friends/blocked', [
            'blockedUsers' => $blockedUsers,
        ]);
    }

    public function getFriendsForInvite()
    {
        $user = Auth::user();

        $friends = $user->friends()
            ->select('id', 'name', 'email', 'avatar')
            ->get();

        return response()->json(['friends' => $friends]);
    }

    public function inviteToQuiz(Request $request)
    {
        $validated = $request->validate([
            'friend_ids' => 'required|array',
            'friend_ids.*' => 'exists:users,id',
            'quiz_session_id' => 'required|exists:quiz_sessions,id',
            'message' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $quizSession = \App\Models\QuizSession::findOrFail($validated['quiz_session_id']);

        // Vérifier que l'utilisateur peut inviter à ce quiz
        if ($quizSession->presenter_id !== $user->id && !$user->isAdmin()) {
            return back()->withErrors(['quiz' => 'Vous ne pouvez pas inviter à ce quiz.']);
        }

        foreach ($validated['friend_ids'] as $friendId) {
            // Vérifier que c'est bien un ami
            if (!$user->friends()->where('id', $friendId)->exists()) {
                continue;
            }

            Notification::create([
                'user_id' => $friendId,
                'type' => 'quiz_invitation',
                'title' => 'Invitation à un quiz',
                'message' => $validated['message'] ?? "{$user->name} vous invite à participer à un quiz : {$quizSession->quiz->title}",
                'data' => [
                    'quiz_session_id' => $quizSession->id,
                    'quiz_title' => $quizSession->quiz->title,
                    'quiz_code' => $quizSession->code,
                    'inviter_name' => $user->name,
                ],
            ]);
        }

        return back()->with('success', 'Invitations envoyées à vos amis.');
    }

    private function getFriendshipStatus(User $user, User $otherUser): string
    {
        $friendship = Friendship::where(function ($query) use ($user, $otherUser) {
            $query->where('user_id', $user->id)->where('friend_id', $otherUser->id);
        })->orWhere(function ($query) use ($user, $otherUser) {
            $query->where('user_id', $otherUser->id)->where('friend_id', $user->id);
        })->first();

        if (!$friendship) {
            return 'none';
        }

        if ($friendship->status === 'accepted') {
            return 'friends';
        }

        if ($friendship->status === 'blocked') {
            return $friendship->user_id === $user->id ? 'blocked_by_you' : 'blocked_by_them';
        }

        if ($friendship->status === 'pending') {
            return $friendship->user_id === $user->id ? 'request_sent' : 'request_received';
        }

        return 'none';
    }
}