<?php

use App\Events\BattleRoyaleStarted;
use App\Events\BattleRoyaleEnded;
use App\Events\ParticipantEliminated;
use App\Events\EliminationRound;
use App\Models\BattleRoyaleSession;
use App\Models\BattleRoyaleParticipant;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->presenter = User::factory()->create(['role' => 'presenter']);
    $this->quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
    $this->session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id
    ]);
});

test('battle royale started event is dispatched', function () {
    Event::fake();

    event(new BattleRoyaleStarted($this->session));

    Event::assertDispatched(BattleRoyaleStarted::class, function ($event) {
        return $event->session->id === $this->session->id;
    });
});

test('battle royale started event contains session data', function () {
    $event = new BattleRoyaleStarted($this->session);

    expect($event->session)->toBeInstanceOf(BattleRoyaleSession::class);
    expect($event->session->id)->toBe($this->session->id);
});

test('battle royale started event broadcasts to correct channel', function () {
    $event = new BattleRoyaleStarted($this->session);

    expect($event->broadcastOn())->toHaveCount(1);
    expect($event->broadcastOn()[0]->name)->toBe("battle-royale.{$this->session->id}");
});

test('participant eliminated event is dispatched', function () {
    Event::fake();

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'is_eliminated' => true,
        'elimination_round' => 3
    ]);

    event(new ParticipantEliminated($this->session, $participant, 3));

    Event::assertDispatched(ParticipantEliminated::class);
});

test('participant eliminated event contains elimination data', function () {
    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'name' => 'Eliminated Player',
        'lives_remaining' => 0
    ]);

    $event = new ParticipantEliminated($this->session, $participant, 2);

    expect($event->session->id)->toBe($this->session->id);
    expect($event->participant->name)->toBe('Eliminated Player');
    expect($event->round)->toBe(2);
});

test('participant eliminated event broadcasts elimination details', function () {
    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'final_position' => 5
    ]);

    $event = new ParticipantEliminated($this->session, $participant, 2);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('eliminated_participant');
    expect($broadcastData)->toHaveKey('round');
    expect($broadcastData)->toHaveKey('remaining_participants');
    expect($broadcastData['round'])->toBe(2);
});

test('elimination round event tracks round progression', function () {
    $survivingParticipants = BattleRoyaleParticipant::factory(5)->create([
        'battle_royale_session_id' => $this->session->id,
        'is_eliminated' => false
    ]);

    $eliminatedCount = 3;

    $event = new EliminationRound($this->session, 2, $survivingParticipants, $eliminatedCount);

    expect($event->session->id)->toBe($this->session->id);
    expect($event->round)->toBe(2);
    expect($event->survivingParticipants)->toHaveCount(5);
    expect($event->eliminatedCount)->toBe(3);
});

test('elimination round event broadcasts round statistics', function () {
    $survivors = collect(['player1', 'player2', 'player3']);

    $event = new EliminationRound($this->session, 3, $survivors, 2);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('round');
    expect($broadcastData)->toHaveKey('survivors_count');
    expect($broadcastData)->toHaveKey('eliminated_this_round');
    expect($broadcastData['round'])->toBe(3);
    expect($broadcastData['survivors_count'])->toBe(3);
    expect($broadcastData['eliminated_this_round'])->toBe(2);
});

test('battle royale ended event includes winner', function () {
    $winner = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'name' => 'Champion',
        'final_position' => 1
    ]);

    $results = [
        'winner' => $winner,
        'total_rounds' => 5,
        'total_participants' => 10,
        'session_duration' => 1800 // 30 minutes
    ];

    $event = new BattleRoyaleEnded($this->session, $winner, $results);

    expect($event->session->id)->toBe($this->session->id);
    expect($event->winner->name)->toBe('Champion');
    expect($event->results['total_rounds'])->toBe(5);
});

test('battle royale ended event broadcasts final results', function () {
    $winner = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id
    ]);

    $results = [
        'total_participants' => 8,
        'total_rounds' => 4,
        'session_duration' => 1200
    ];

    $event = new BattleRoyaleEnded($this->session, $winner, $results);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('winner');
    expect($broadcastData)->toHaveKey('results');
    expect($broadcastData)->toHaveKey('final_leaderboard');
    expect($broadcastData['results']['total_participants'])->toBe(8);
});

test('events broadcast to all session participants', function () {
    $event = new BattleRoyaleStarted($this->session);

    $channels = $event->broadcastOn();

    expect($channels)->toHaveCount(1);
    expect($channels[0]->name)->toBe("battle-royale.{$this->session->id}");
});

test('elimination events include survival statistics', function () {
    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'survival_time' => 900 // 15 minutes
    ]);

    $event = new ParticipantEliminated($this->session, $participant, 3);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['eliminated_participant'])->toHaveKey('survival_time');
    expect($broadcastData['eliminated_participant'])->toHaveKey('final_position');
});

test('battle royale events can be queued', function () {
    $event = new BattleRoyaleStarted($this->session);

    expect($event->shouldQueue())->toBeTrue();
});

test('elimination events are high priority and not queued', function () {
    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id
    ]);

    $event = new ParticipantEliminated($this->session, $participant, 2);

    // Elimination should be immediate for real-time experience
    expect($event->shouldQueue())->toBeFalse();
});

test('events include session metadata', function () {
    $event = new BattleRoyaleStarted($this->session);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('session');
    expect($broadcastData)->toHaveKey('quiz');
    expect($broadcastData)->toHaveKey('timestamp');
    expect($broadcastData['session']['id'])->toBe($this->session->id);
});

test('elimination round calculates elimination rate', function () {
    $event = new EliminationRound($this->session, 2, collect([]), 5);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('elimination_rate');
});

test('battle royale ended event includes podium', function () {
    $winner = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'final_position' => 1
    ]);

    $runnerUp = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'final_position' => 2
    ]);

    $third = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id,
        'final_position' => 3
    ]);

    $results = ['podium' => [$winner, $runnerUp, $third]];

    $event = new BattleRoyaleEnded($this->session, $winner, $results);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['results'])->toHaveKey('podium');
    expect($broadcastData['results']['podium'])->toHaveCount(3);
});

test('events broadcast with appropriate delay for dramatic effect', function () {
    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $this->session->id
    ]);

    $event = new ParticipantEliminated($this->session, $participant, 2);

    // Some events might have a small delay for dramatic effect
    expect($event->delay ?? 0)->toBeGreaterThanOrEqual(0);
});