<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    /**
     * Determine whether the user can view the quiz.
     */
    public function view(?User $user, Quiz $quiz): bool
    {
        // Anyone can view quizzes
        return true;
    }

    /**
     * Determine whether the user can create quizzes.
     */
    public function create(User $user): bool
    {
        // Authenticated users can create quizzes
        return true;
    }

    /**
     * Determine whether the user can update the quiz.
     */
    public function update(User $user, Quiz $quiz): bool
    {
        // Only the creator or admin can update
        return $user->id === $quiz->creator_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the quiz.
     */
    public function delete(User $user, Quiz $quiz): bool
    {
        // Only the creator or admin can delete
        return $user->id === $quiz->creator_id || $user->isAdmin();
    }
}