<?php

namespace App\Events;

use App\Models\QuizSession;
use App\Models\Question;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnswersRevealed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public QuizSession $session;
    public Question $question;
    public array $participantStats;

    public function __construct(QuizSession $session, Question $question, array $participantStats = [])
    {
        $this->session = $session;
        $this->question = $question;
        $this->participantStats = $participantStats;
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
            'question' => [
                'id' => $this->question->id,
                'text' => $this->question->text,
                'correct_answers' => $this->question->answers()->where('is_correct', true)->get()->map(function($answer) {
                    return [
                        'id' => $answer->id,
                        'text' => $answer->text,
                    ];
                }),
                'all_answers' => $this->question->answers->map(function($answer) {
                    return [
                        'id' => $answer->id,
                        'text' => $answer->text,
                        'is_correct' => $answer->is_correct,
                    ];
                }),
            ],
            'participant_stats' => $this->participantStats,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'answers.revealed';
    }
}