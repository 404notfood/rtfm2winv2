<?php

use App\Services\BattleRoyaleService;
use App\Models\BattleRoyaleSession;
use App\Models\BattleRoyaleParticipant;
use App\Models\Quiz;
use App\Models\User;
use App\Models\Question;
use App\Models\Answer;
use App\Events\ParticipantEliminated;
use App\Events\BattleRoyaleEnded;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->battleRoyaleService = new BattleRoyaleService();
    $this->presenter = User::factory()->create(['role' => 'presenter']);
    $this->quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
});

test('battle royale service can create session', function () {
    $sessionData = [
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id,
        'max_participants' => 20,
        'lives_per_participant' => 3,
        'elimination_threshold' => 2
    ];

    $session = $this->battleRoyaleService->createSession($sessionData);

    expect($session)->toBeInstanceOf(BattleRoyaleSession::class);
    expect($session->quiz_id)->toBe($this->quiz->id);
    expect($session->max_participants)->toBe(20);
    expect($session->lives_per_participant)->toBe(3);
});

test('battle royale service validates session data', function () {
    $invalidData = [
        'quiz_id' => 999, // Non-existent quiz
        'max_participants' => 0, // Invalid count
        'lives_per_participant' => -1 // Invalid lives
    ];

    expect(fn() => $this->battleRoyaleService->createSession($invalidData))
        ->toThrow(InvalidArgumentException::class);
});

test('battle royale service can add participant', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting',
        'lives_per_participant' => 3
    ]);

    $user = User::factory()->create();
    $participant = $this->battleRoyaleService->addParticipant($session, $user, 'Test Warrior');

    expect($participant)->toBeInstanceOf(BattleRoyaleParticipant::class);
    expect($participant->lives_remaining)->toBe(3);
    expect($participant->name)->toBe('Test Warrior');
    expect($participant->is_eliminated)->toBeFalse();
});

test('battle royale service prevents joining full session', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'max_participants' => 2,
        'status' => 'waiting'
    ]);

    // Fill the session
    BattleRoyaleParticipant::factory(2)->create([
        'battle_royale_session_id' => $session->id
    ]);

    $user = User::factory()->create();

    expect(fn() => $this->battleRoyaleService->addParticipant($session, $user, 'Late Player'))
        ->toThrow(InvalidArgumentException::class, 'Session is full');
});

test('battle royale service can start session', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting'
    ]);

    // Add minimum participants
    BattleRoyaleParticipant::factory(3)->create([
        'battle_royale_session_id' => $session->id
    ]);

    $this->battleRoyaleService->startSession($session);

    expect($session->status)->toBe('active');
    expect($session->started_at)->not->toBeNull();
});

test('battle royale service requires minimum participants to start', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting'
    ]);

    // Only one participant
    BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id
    ]);

    expect(fn() => $this->battleRoyaleService->startSession($session))
        ->toThrow(InvalidArgumentException::class, 'Need at least 2 participants');
});

test('battle royale service processes correct answer', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'lives_remaining' => 2,
        'score' => 0
    ]);

    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);
    $correctAnswer = Answer::factory()->create([
        'question_id' => $question->id,
        'is_correct' => true
    ]);

    $result = $this->battleRoyaleService->processAnswer($session, $participant, $question, $correctAnswer);

    expect($result['is_correct'])->toBeTrue();
    expect($participant->fresh()->lives_remaining)->toBe(2); // Unchanged
    expect($participant->fresh()->score)->toBeGreaterThan(0);
});

test('battle royale service processes wrong answer', function () {
    Event::fake();
    
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'lives_remaining' => 2
    ]);

    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);
    $wrongAnswer = Answer::factory()->create([
        'question_id' => $question->id,
        'is_correct' => false
    ]);

    $result = $this->battleRoyaleService->processAnswer($session, $participant, $question, $wrongAnswer);

    expect($result['is_correct'])->toBeFalse();
    expect($participant->fresh()->lives_remaining)->toBe(1);
});

test('battle royale service eliminates participant on last life', function () {
    Event::fake();
    
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'lives_remaining' => 1
    ]);

    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);
    $wrongAnswer = Answer::factory()->create([
        'question_id' => $question->id,
        'is_correct' => false
    ]);

    $this->battleRoyaleService->processAnswer($session, $participant, $question, $wrongAnswer);

    expect($participant->fresh()->lives_remaining)->toBe(0);
    expect($participant->fresh()->is_eliminated)->toBeTrue();
    expect($participant->fresh()->eliminated_at)->not->toBeNull();

    Event::assertDispatched(ParticipantEliminated::class);
});

test('battle royale service checks for winner', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $winner = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => false
    ]);

    // Create eliminated participants
    BattleRoyaleParticipant::factory(3)->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => true
    ]);

    $result = $this->battleRoyaleService->checkForWinner($session);

    expect($result['has_winner'])->toBeTrue();
    expect($result['winner']->id)->toBe($winner->id);
});

test('battle royale service ends session when winner found', function () {
    Event::fake();
    
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $winner = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => false
    ]);

    BattleRoyaleParticipant::factory(2)->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => true
    ]);

    $this->battleRoyaleService->endSession($session, $winner);

    expect($session->status)->toBe('ended');
    expect($session->winner_id)->toBe($winner->id);
    expect($session->ended_at)->not->toBeNull();

    Event::assertDispatched(BattleRoyaleEnded::class);
});

test('battle royale service calculates elimination stats', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'ended'
    ]);

    // Create participants with different elimination rounds
    BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => true,
        'elimination_round' => 1
    ]);
    BattleRoyaleParticipant::factory(2)->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => true,
        'elimination_round' => 2
    ]);
    BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => false, // Winner
        'final_position' => 1
    ]);

    $stats = $this->battleRoyaleService->getSessionStatistics($session);

    expect($stats)->toHaveKeys([
        'total_participants',
        'elimination_by_round',
        'average_survival_time',
        'winner'
    ]);
    expect($stats['total_participants'])->toBe(4);
});

test('battle royale service can get leaderboard', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'ended'
    ]);

    $winner = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'score' => 100,
        'final_position' => 1,
        'name' => 'Champion'
    ]);

    $runnerUp = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'score' => 80,
        'final_position' => 2,
        'name' => 'Runner Up'
    ]);

    $leaderboard = $this->battleRoyaleService->getLeaderboard($session);

    expect($leaderboard)->toHaveCount(2);
    expect($leaderboard->first()->name)->toBe('Champion');
    expect($leaderboard->first()->final_position)->toBe(1);
});

test('battle royale service handles time-based elimination', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active',
        'time_per_question' => 30 // 30 seconds
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'lives_remaining' => 2
    ]);

    // Simulate timeout (no answer within time limit)
    $result = $this->battleRoyaleService->handleTimeout($session, $participant);

    expect($result['timed_out'])->toBeTrue();
    expect($participant->fresh()->lives_remaining)->toBe(1);
});

test('battle royale service can pause and resume session', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $this->battleRoyaleService->pauseSession($session);
    expect($session->status)->toBe('paused');

    $this->battleRoyaleService->resumeSession($session);
    expect($session->status)->toBe('active');
});

test('battle royale service assigns final positions correctly', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'ended'
    ]);

    $participants = BattleRoyaleParticipant::factory(4)->create([
        'battle_royale_session_id' => $session->id,
        'score' => fn() => rand(50, 100)
    ]);

    $this->battleRoyaleService->assignFinalPositions($session);

    $rankedParticipants = $session->participants()
        ->orderBy('final_position')
        ->get();

    expect($rankedParticipants->first()->final_position)->toBe(1);
    expect($rankedParticipants->last()->final_position)->toBe(4);
});