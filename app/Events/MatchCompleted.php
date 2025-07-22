<?php

namespace App\Events;

use App\Models\Tournament;
use App\Models\TournamentMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Tournament $tournament;
    public TournamentMatch $match;

    public function __construct(Tournament $tournament, TournamentMatch $match)
    {
        $this->tournament = $tournament;
        $this->match = $match;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('tournament.' . $this->tournament->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'tournament_id' => $this->tournament->id,
            'match' => [
                'id' => $this->match->id,
                'round' => $this->match->round,
                'match_order' => $this->match->match_order,
                'participant1' => [
                    'id' => $this->match->participant1->id,
                    'user' => [
                        'name' => $this->match->participant1->user->name,
                        'avatar_url' => $this->match->participant1->user->avatar_url,
                    ],
                ],
                'participant2' => [
                    'id' => $this->match->participant2->id,
                    'user' => [
                        'name' => $this->match->participant2->user->name,
                        'avatar_url' => $this->match->participant2->user->avatar_url,
                    ],
                ],
                'winner' => [
                    'id' => $this->match->winner->id,
                    'user' => [
                        'name' => $this->match->winner->user->name,
                        'avatar_url' => $this->match->winner->user->avatar_url,
                    ],
                ],
                'score1' => $this->match->score1,
                'score2' => $this->match->score2,
                'completed_at' => $this->match->completed_at,
            ],
            'message' => "Match terminé : {$this->match->winner->user->name} a gagné !",
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'match.completed';
    }
}