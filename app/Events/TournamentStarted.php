<?php

namespace App\Events;

use App\Models\Tournament;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TournamentStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Tournament $tournament;

    public function __construct(Tournament $tournament)
    {
        $this->tournament = $tournament;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('tournament.' . $this->tournament->id),
            new Channel('tournaments'), // Public channel for general notifications
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'tournament' => [
                'id' => $this->tournament->id,
                'title' => $this->tournament->title,
                'type' => $this->tournament->type,
                'participants_count' => $this->tournament->participants()->count(),
                'current_round' => $this->tournament->current_round,
                'started_at' => $this->tournament->started_at,
            ],
            'message' => 'Le tournoi a commencé !',
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'tournament.started';
    }
}