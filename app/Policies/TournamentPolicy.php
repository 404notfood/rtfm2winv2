<?php

namespace App\Policies;

use App\Models\Tournament;
use App\Models\User;

class TournamentPolicy
{
    /**
     * Determine whether the user can view the tournament.
     */
    public function view(?User $user, Tournament $tournament): bool
    {
        // Anyone can view public tournaments
        if ($tournament->is_public) {
            return true;
        }
        
        // Private tournaments only for creator and participants
        if ($user) {
            return $user->id === $tournament->creator_id || 
                   $tournament->participants()->where('user_id', $user->id)->exists() ||
                   $user->isAdmin();
        }
        
        return false;
    }

    /**
     * Determine whether the user can create tournaments.
     */
    public function create(User $user): bool
    {
        // Only presenters and admins can create tournaments
        return in_array($user->role, ['presenter', 'admin']);
    }

    /**
     * Determine whether the user can update the tournament.
     */
    public function update(User $user, Tournament $tournament): bool
    {
        // Only the creator or admin can update
        return $user->id === $tournament->creator_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the tournament.
     */
    public function delete(User $user, Tournament $tournament): bool
    {
        // Only the creator or admin can delete
        return $user->id === $tournament->creator_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can join the tournament.
     */
    public function join(User $user, Tournament $tournament): bool
    {
        // Can't join own tournament
        if ($user->id === $tournament->creator_id) {
            return false;
        }

        // Tournament must be open for registration
        if ($tournament->status !== 'upcoming') {
            return false;
        }

        // Check if registration is still open
        if (now()->isAfter($tournament->registration_end)) {
            return false;
        }

        // Check if tournament is full
        if ($tournament->participants()->count() >= $tournament->max_participants) {
            return false;
        }

        // Check if user is already registered
        if ($tournament->participants()->where('user_id', $user->id)->exists()) {
            return false;
        }

        return true;
    }
} 