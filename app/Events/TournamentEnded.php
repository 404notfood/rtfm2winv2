<?php

namespace App\Events;

use App\Models\Tournament;
use App\Models\TournamentParticipant;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TournamentEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Tournament $tournament;
    public ?TournamentParticipant $winner;

    public function __construct(Tournament $tournament, ?TournamentParticipant $winner = null)
    {
        $this->tournament = $tournament;
        $this->winner = $winner;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('tournament.' . $this->tournament->id),
            new Channel('tournaments'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'tournament' => [
                'id' => $this->tournament->id,
                'title' => $this->tournament->title,
                'type' => $this->tournament->type,
                'ended_at' => $this->tournament->ended_at,
                'duration' => $this->tournament->started_at ? 
                    $this->tournament->started_at->diffForHumans($this->tournament->ended_at) : null,
            ],
            'winner' => $this->winner ? [
                'id' => $this->winner->id,
                'user' => [
                    'id' => $this->winner->user->id,
                    'name' => $this->winner->user->name,
                    'avatar_url' => $this->winner->user->avatar_url,
                ],
            ] : null,
            'message' => $this->winner ? 
                "🏆 {$this->winner->user->name} a remporté le tournoi !" : 
                'Le tournoi est terminé !',
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'tournament.ended';
    }
}