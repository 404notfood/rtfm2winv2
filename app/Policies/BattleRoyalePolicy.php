<?php

namespace App\Policies;

use App\Models\BattleRoyaleSession;
use App\Models\User;

class BattleRoyalePolicy
{
    /**
     * Determine whether the user can view the battle royale session.
     */
    public function view(?User $user, BattleRoyaleSession $session): bool
    {
        // Anyone can view sessions
        return true;
    }

    /**
     * Determine whether the user can create battle royale sessions.
     */
    public function create(User $user): bool
    {
        // Only presenters and admins can create battle royale sessions
        return in_array($user->role, ['presenter', 'admin']);
    }

    /**
     * Determine whether the user can update the battle royale session.
     */
    public function update(User $user, BattleRoyaleSession $session): bool
    {
        // Only the creator or admin can update
        return $user->id === $session->creator_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the battle royale session.
     */
    public function delete(User $user, BattleRoyaleSession $session): bool
    {
        // Only the creator or admin can delete
        return $user->id === $session->creator_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can start the battle royale session.
     */
    public function start(User $user, BattleRoyaleSession $session): bool
    {
        // Only the creator or admin can start
        return $user->id === $session->creator_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can join the battle royale session.
     */
    public function join(?User $user, BattleRoyaleSession $session): bool
    {
        // Session must be waiting for participants
        if ($session->status !== 'waiting') {
            return false;
        }

        // Check if session is full
        if ($session->participants()->count() >= $session->max_players) {
            return false;
        }

        return true;
    }
} 