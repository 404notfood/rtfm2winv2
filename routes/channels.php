<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\QuizSession;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privé pour les sessions de quiz
Broadcast::channel('quiz-session.{sessionId}', function ($user, $sessionId) {
    $session = QuizSession::find($sessionId);
    
    if (!$session) {
        return false;
    }
    
    // Vérifier si l'utilisateur est le créateur de la session
    if ($user && $session->created_by === $user->id) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => 'creator'];
    }
    
    // Vérifier si l'utilisateur est un participant
    $participant = $session->participants()->where('user_id', $user->id)->first();
    if ($participant) {
        return ['id' => $user->id, 'name' => $participant->nickname, 'role' => 'participant'];
    }
    
    // Autoriser les utilisateurs invités avec participant_id valide en session
    if (session('participant_id')) {
        $participant = $session->participants()->find(session('participant_id'));
        if ($participant) {
            return ['id' => $participant->id, 'name' => $participant->nickname, 'role' => 'guest'];
        }
    }
    
    return false;
});

// Canal de présence pour voir qui est connecté
Broadcast::channel('quiz-session-presence.{sessionId}', function ($user, $sessionId) {
    $session = QuizSession::find($sessionId);
    
    if (!$session) {
        return false;
    }
    
    // Vérifier si l'utilisateur est autorisé à rejoindre cette session
    if ($user && ($session->created_by === $user->id || $session->participants()->where('user_id', $user->id)->exists())) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'role' => $session->created_by === $user->id ? 'creator' : 'participant'
        ];
    }
    
    // Pour les invités
    if (session('participant_id')) {
        $participant = $session->participants()->find(session('participant_id'));
        if ($participant) {
            return [
                'id' => $participant->id,
                'name' => $participant->nickname,
                'role' => 'guest'
            ];
        }
    }
    
    return false;
});