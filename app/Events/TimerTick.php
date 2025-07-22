<?php

namespace App\Events;

use App\Models\QuizSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TimerTick implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public QuizSession $session;
    public int $remainingSeconds;
    public int $questionIndex;

    public function __construct(QuizSession $session, int $remainingSeconds, int $questionIndex)
    {
        $this->session = $session;
        $this->remainingSeconds = $remainingSeconds;
        $this->questionIndex = $questionIndex;
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
            'remaining_seconds' => $this->remainingSeconds,
            'question_index' => $this->questionIndex,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'timer.tick';
    }
}