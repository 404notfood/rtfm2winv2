<?php

namespace App\Events;

use App\Models\QuizSession;
use App\Models\Participant;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParticipantJoined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public QuizSession $session;
    public Participant $participant;

    public function __construct(QuizSession $session, Participant $participant)
    {
        $this->session = $session;
        $this->participant = $participant;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('quiz-session.' . $this->session->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'participant' => [
                'id' => $this->participant->id,
                'nickname' => $this->participant->nickname,
                'avatar' => $this->participant->avatar,
                'joined_at' => $this->participant->joined_at,
            ],
            'total_participants' => $this->session->participants()->count(),
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'participant.joined';
    }
}