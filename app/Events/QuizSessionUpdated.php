<?php

namespace App\Events;

use App\Models\QuizSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Événement diffusé lors des mises à jour de session de quiz.
 * Implémente les principes POO d'encapsulation et de responsabilité unique.
 */
class QuizSessionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Session de quiz mise à jour.
     * Propriété publique pour la sérialisation, mais encapsulée via les méthodes.
     */
    public QuizSession $session;

    /**
     * Type de mise à jour (question_changed, participant_joined, etc.)
     */
    public string $updateType;

    /**
     * Données additionnelles de la mise à jour.
     */
    public array $data;

    /**
     * Create a new event instance.
     *
     * @param QuizSession $session
     * @param string $updateType
     * @param array $data
     */
    public function __construct(QuizSession $session, string $updateType, array $data = [])
    {
        $this->session = $session;
        $this->updateType = $updateType;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('quiz-session.' . $this->session->id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'session_code' => $this->session->code,
            'status' => $this->session->status,
            'current_question_index' => $this->session->current_question_index,
            'update_type' => $this->updateType,
            'data' => $this->data,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'session.updated';
    }
} 