<?php

namespace App\Events;

use App\Models\BattleRoyaleSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EliminationRound implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public BattleRoyaleSession $session;
    public array $eliminatedParticipants;
    public int $remainingCount;

    public function __construct(BattleRoyaleSession $session, array $eliminatedParticipants, int $remainingCount)
    {
        $this->session = $session;
        $this->eliminatedParticipants = $eliminatedParticipants;
        $this->remainingCount = $remainingCount;
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
            'round' => $this->session->current_round,
            'eliminated_participants' => collect($this->eliminatedParticipants)->map(function($participant) {
                return [
                    'id' => $participant->id,
                    'pseudo' => $participant->pseudo,
                    'final_position' => $participant->position,
                    'score' => $participant->score,
                ];
            }),
            'remaining_count' => $this->remainingCount,
            'next_elimination_in' => $this->session->elimination_interval,
            'elimination_stats' => [
                'eliminated_this_round' => count($this->eliminatedParticipants),
                'elimination_percentage' => $this->remainingCount > 0 ? 
                    round((count($this->eliminatedParticipants) / ($this->remainingCount + count($this->eliminatedParticipants))) * 100, 1) : 0,
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'elimination.round';
    }
}