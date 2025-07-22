<?php

namespace App\Events;

use App\Models\BattleRoyaleSession;
use App\Models\BattleRoyaleParticipant;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParticipantEliminated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public BattleRoyaleSession $session;
    public BattleRoyaleParticipant $participant;

    public function __construct(BattleRoyaleSession $session, BattleRoyaleParticipant $participant)
    {
        $this->session = $session;
        $this->participant = $participant;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('battle-royale-session.' . $this->session->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'participant' => [
                'id' => $this->participant->id,
                'pseudo' => $this->participant->pseudo,
                'final_position' => $this->participant->position,
                'eliminated_round' => $this->participant->eliminated_round,
                'score' => $this->participant->score,
            ],
            'remaining_participants' => $this->session->activeParticipants()->count(),
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'participant.eliminated';
    }
}