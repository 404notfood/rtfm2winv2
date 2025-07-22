<?php

namespace App\Events;

use App\Models\QuizSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public QuizSession $session;

    public function __construct(QuizSession $session)
    {
        $this->session = $session;
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
            'session_code' => $this->session->code,
            'quiz' => [
                'id' => $this->session->quiz->id,
                'title' => $this->session->quiz->title,
                'total_questions' => $this->session->quiz->questions()->count(),
            ],
            'participants_count' => $this->session->participants()->count(),
            'started_at' => $this->session->started_at,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'session.started';
    }
}