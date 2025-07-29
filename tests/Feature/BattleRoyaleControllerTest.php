<?php

use App\Models\BattleRoyaleSession;
use App\Models\BattleRoyaleParticipant;
use App\Models\Quiz;
use App\Models\User;
use App\Models\Question;
use App\Models\Answer;
use App\Events\BattleRoyaleStarted;
use App\Events\ParticipantEliminated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->presenter = User::factory()->create();
    $this->presenter->role = 'presenter';
    $this->presenter->save();

    $this->user = User::factory()->create();
    
    $this->quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
    $this->question = Question::factory()->create(['quiz_id' => $this->quiz->id]);
    Answer::factory(4)->create(['question_id' => $this->question->id]);
});

test('presenter can create battle royale session', function () {
    $response = $this->actingAs($this->presenter)
        ->post(route('battle-royale.store'), [
            'quiz_id' => $this->quiz->id,
            'session_code' => 'BR123',
            'max_participants' => 20,
            'lives_per_participant' => 3,
            'elimination_threshold' => 2
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('battle_royale_sessions', [
        'quiz_id' => $this->quiz->id,
        'session_code' => 'BR123',
        'presenter_id' => $this->presenter->id,
        'max_participants' => 20,
        'lives_per_participant' => 3
    ]);
});

test('participants can join battle royale session', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting',
        'lives_per_participant' => 3
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('battle-royale.join', $session), [
            'participant_name' => 'Warrior Player'
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('battle_royale_participants', [
        'battle_royale_session_id' => $session->id,
        'user_id' => $this->user->id,
        'name' => 'Warrior Player',
        'lives_remaining' => 3,
        'is_eliminated' => false
    ]);
});

test('session cannot exceed max participants', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'max_participants' => 2,
        'status' => 'waiting'
    ]);

    // Fill up the session
    BattleRoyaleParticipant::factory(2)->create([
        'battle_royale_session_id' => $session->id
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('battle-royale.join', $session), [
            'participant_name' => 'Too Late'
        ]);

    $response->assertForbidden();
});

test('presenter can start battle royale', function () {
    Event::fake();
    
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id,
        'status' => 'waiting'
    ]);

    // Add some participants
    BattleRoyaleParticipant::factory(3)->create([
        'battle_royale_session_id' => $session->id
    ]);

    $response = $this->actingAs($this->presenter)
        ->post(route('battle-royale.start', $session));

    $response->assertOk();
    $this->assertDatabaseHas('battle_royale_sessions', [
        'id' => $session->id,
        'status' => 'active'
    ]);

    Event::assertDispatched(BattleRoyaleStarted::class);
});

test('battle royale needs minimum participants to start', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id,
        'status' => 'waiting'
    ]);

    // Only one participant (need at least 2)
    BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id
    ]);

    $response = $this->actingAs($this->presenter)
        ->post(route('battle-royale.start', $session));

    $response->assertSessionHasErrors(['participants']);
});

test('participant loses life on wrong answer', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active',
        'lives_per_participant' => 3
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'user_id' => $this->user->id,
        'lives_remaining' => 3
    ]);

    $wrongAnswer = Answer::factory()->create([
        'question_id' => $this->question->id,
        'is_correct' => false
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('battle-royale.answer', $session), [
            'question_id' => $this->question->id,
            'answer_id' => $wrongAnswer->id
        ]);

    $response->assertOk();
    $this->assertDatabaseHas('battle_royale_participants', [
        'id' => $participant->id,
        'lives_remaining' => 2
    ]);
});

test('participant gets eliminated when lives reach zero', function () {
    Event::fake();
    
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'user_id' => $this->user->id,
        'lives_remaining' => 1
    ]);

    $wrongAnswer = Answer::factory()->create([
        'question_id' => $this->question->id,
        'is_correct' => false
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('battle-royale.answer', $session), [
            'question_id' => $this->question->id,
            'answer_id' => $wrongAnswer->id
        ]);

    $response->assertOk();
    $this->assertDatabaseHas('battle_royale_participants', [
        'id' => $participant->id,
        'lives_remaining' => 0,
        'is_eliminated' => true
    ]);

    Event::assertDispatched(ParticipantEliminated::class);
});

test('correct answer maintains lives', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'user_id' => $this->user->id,
        'lives_remaining' => 2
    ]);

    $correctAnswer = Answer::factory()->create([
        'question_id' => $this->question->id,
        'is_correct' => true
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('battle-royale.answer', $session), [
            'question_id' => $this->question->id,
            'answer_id' => $correctAnswer->id
        ]);

    $response->assertOk();
    $this->assertDatabaseHas('battle_royale_participants', [
        'id' => $participant->id,
        'lives_remaining' => 2, // Unchanged
        'score' => 10 // Points for correct answer
    ]);
});

test('eliminated participant cannot answer', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    $participant = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'user_id' => $this->user->id,
        'is_eliminated' => true
    ]);

    $answer = Answer::factory()->create(['question_id' => $this->question->id]);

    $response = $this->actingAs($this->user)
        ->post(route('battle-royale.answer', $session), [
            'question_id' => $this->question->id,
            'answer_id' => $answer->id
        ]);

    $response->assertForbidden();
});

test('session ends when only one participant remains', function () {
    $session = BattleRoyaleSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    // Create participants - all but one eliminated
    $winner = BattleRoyaleParticipant::factory()->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => false
    ]);

    BattleRoyaleParticipant::factory(3)->create([
        'battle_royale_session_id' => $session->id,
        'is_eliminated' => true
    ]);

    // Simulate automatic session end check
    $response = $this->actingAs($this->presenter)
        ->get(route('battle-royale.check-winner', $session));

    $response->assertOk();
    $this->assertDatabaseHas('battle_royale_sessions', [
        'id' => $session->id,
        'status' => 'ended',
        'winner_id' => $winner->id
    ]);
});