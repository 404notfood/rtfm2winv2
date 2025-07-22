<?php

namespace App\Events;

use App\Models\QuizSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaderboardUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public QuizSession $session;
    public array $leaderboard;

    public function __construct(QuizSession $session, array $leaderboard)
    {
        $this->session = $session;
        $this->leaderboard = $leaderboard;
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
            'leaderboard' => $this->leaderboard,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'leaderboard.updated';
    }
}