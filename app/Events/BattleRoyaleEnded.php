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

class BattleRoyaleEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public BattleRoyaleSession $session;
    public ?BattleRoyaleParticipant $winner;

    public function __construct(BattleRoyaleSession $session, ?BattleRoyaleParticipant $winner = null)
    {
        $this->session = $session;
        $this->winner = $winner;
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
            'session_name' => $this->session->name,
            'ended_at' => $this->session->ended_at,
            'total_rounds' => $this->session->current_round,
            'winner' => $this->winner ? [
                'id' => $this->winner->id,
                'pseudo' => $this->winner->pseudo,
                'score' => $this->winner->score,
                'avatar_url' => $this->winner->avatar_url,
            ] : null,
            'final_stats' => [
                'total_participants' => $this->session->participants()->count(),
                'duration_minutes' => $this->session->started_at ? 
                    $this->session->started_at->diffInMinutes($this->session->ended_at) : 0,
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'battle-royale.ended';
    }
}