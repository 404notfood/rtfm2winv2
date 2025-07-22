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

class QuestionDisplayed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public QuizSession $session;
    public Question $question;
    public int $timeLimit;

    public function __construct(QuizSession $session, Question $question, int $timeLimit = 30)
    {
        $this->session = $session;
        $this->question = $question;
        $this->timeLimit = $timeLimit;
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
                'answers' => $this->question->answers->map(function($answer) {
                    return [
                        'id' => $answer->id,
                        'text' => $answer->text,
                    ];
                }),
                'time_limit' => $this->timeLimit,
                'question_index' => $this->session->current_question_index,
                'total_questions' => $this->session->quiz->questions()->count(),
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'question.displayed';
    }
}