<?php

use App\Models\QuizSession;
use App\Models\Quiz;
use App\Models\User;
use App\Models\Participant;
use App\Models\Question;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->presenter = User::factory()->create();
    $this->quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
});

test('quiz session belongs to quiz', function () {
    $session = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);

    expect($session->quiz)->toBeInstanceOf(Quiz::class);
    expect($session->quiz->id)->toBe($this->quiz->id);
});

test('quiz session belongs to presenter', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id
    ]);

    expect($session->presenter)->toBeInstanceOf(User::class);
    expect($session->presenter->id)->toBe($this->presenter->id);
});

test('quiz session has many participants', function () {
    $session = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);
    Participant::factory(3)->create(['quiz_session_id' => $session->id]);

    expect($session->participants)->toHaveCount(3);
    expect($session->participants->first())->toBeInstanceOf(Participant::class);
});

test('quiz session generates unique code', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'session_code' => null
    ]);

    $session->generateSessionCode();

    expect($session->session_code)->not->toBeEmpty();
    expect($session->session_code)->toHaveLength(6);
    expect($session->session_code)->toMatch('/^[A-Z0-9]+$/');
});

test('session code is unique across sessions', function () {
    $session1 = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);
    $session1->generateSessionCode();

    $session2 = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);
    $session2->generateSessionCode();

    expect($session1->session_code)->not->toBe($session2->session_code);
});

test('quiz session can check if active', function () {
    $activeSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);
    
    $waitingSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting'
    ]);

    expect($activeSession->isActive())->toBeTrue();
    expect($waitingSession->isActive())->toBeFalse();
});

test('quiz session can check if waiting', function () {
    $waitingSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting'
    ]);
    
    $activeSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    expect($waitingSession->isWaiting())->toBeTrue();
    expect($activeSession->isWaiting())->toBeFalse();
});

test('quiz session can check if ended', function () {
    $endedSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'ended'
    ]);
    
    $activeSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    expect($endedSession->isEnded())->toBeTrue();
    expect($activeSession->isEnded())->toBeFalse();
});

test('quiz session can start', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting',
        'started_at' => null
    ]);

    $session->start();

    expect($session->status)->toBe('active');
    expect($session->started_at)->not->toBeNull();
});

test('quiz session can end', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active',
        'ended_at' => null
    ]);

    $session->end();

    expect($session->status)->toBe('ended');
    expect($session->ended_at)->not->toBeNull();
});

test('quiz session calculates participant count', function () {
    $session = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);
    Participant::factory(5)->create(['quiz_session_id' => $session->id]);

    expect($session->getParticipantCount())->toBe(5);
});

test('quiz session can check if user can join', function () {
    $openSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting',
        'max_participants' => 10
    ]);
    
    Participant::factory(5)->create(['quiz_session_id' => $openSession->id]);

    expect($openSession->canUserJoin())->toBeTrue();
});

test('quiz session prevents joining when full', function () {
    $fullSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting',
        'max_participants' => 3
    ]);
    
    Participant::factory(3)->create(['quiz_session_id' => $fullSession->id]);

    expect($fullSession->canUserJoin())->toBeFalse();
});

test('quiz session prevents joining when ended', function () {
    $endedSession = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'ended'
    ]);

    expect($endedSession->canUserJoin())->toBeFalse();
});

test('quiz session calculates average score', function () {
    $session = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);
    
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 80
    ]);
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 90
    ]);
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 70
    ]);

    expect($session->getAverageScore())->toBe(80.0);
});

test('quiz session calculates highest score', function () {
    $session = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);
    
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 80
    ]);
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 95
    ]);
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 70
    ]);

    expect($session->getHighestScore())->toBe(95);
});

test('quiz session gets current question', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'current_question_index' => 0
    ]);
    
    $question = Question::factory()->create([
        'quiz_id' => $this->quiz->id,
        'order' => 1
    ]);

    expect($session->getCurrentQuestion())->toBeInstanceOf(Question::class);
    expect($session->getCurrentQuestion()->id)->toBe($question->id);
});

test('quiz session can advance to next question', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'current_question_index' => 0
    ]);

    Question::factory(3)->create(['quiz_id' => $this->quiz->id]);

    $session->nextQuestion();

    expect($session->current_question_index)->toBe(1);
});

test('quiz session knows when all questions are completed', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'current_question_index' => 2
    ]);

    Question::factory(3)->create(['quiz_id' => $this->quiz->id]);

    expect($session->hasMoreQuestions())->toBeFalse();
});

test('quiz session scope filters by status', function () {
    QuizSession::factory(2)->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting'
    ]);
    QuizSession::factory(3)->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    expect(QuizSession::withStatus('waiting')->count())->toBe(2);
    expect(QuizSession::withStatus('active')->count())->toBe(3);
});

test('quiz session gets leaderboard', function () {
    $session = QuizSession::factory()->create(['quiz_id' => $this->quiz->id]);
    
    $participant1 = Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 95,
        'name' => 'Top Player'
    ]);
    $participant2 = Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 85,
        'name' => 'Second Player'
    ]);

    $leaderboard = $session->getLeaderboard();

    expect($leaderboard)->toHaveCount(2);
    expect($leaderboard->first()->name)->toBe('Top Player');
    expect($leaderboard->first()->score)->toBe(95);
});

test('quiz session calculates duration', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'started_at' => now()->subMinutes(30),
        'ended_at' => now()
    ]);

    expect($session->getDuration())->toBe(30); // minutes
});