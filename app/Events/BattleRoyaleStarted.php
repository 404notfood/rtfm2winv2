<?php

namespace App\Events;

use App\Models\BattleRoyaleSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleRoyaleStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public BattleRoyaleSession $session;

    public function __construct(BattleRoyaleSession $session)
    {
        $this->session = $session;
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
            'participants_count' => $this->session->participants()->count(),
            'elimination_interval' => $this->session->elimination_interval,
            'current_round' => $this->session->current_round,
            'started_at' => $this->session->started_at,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'battle-royale.started';
    }
}