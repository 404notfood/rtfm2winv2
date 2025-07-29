<?php

use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\User;
use App\Models\Question;
use App\Models\Answer;
use App\Events\SessionStarted;
use App\Events\ParticipantJoined;
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

test('presenter can create a quiz session', function () {
    $response = $this->actingAs($this->presenter)
        ->post(route('quiz-session.store'), [
            'quiz_id' => $this->quiz->id,
            'session_code' => 'TEST123'
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('quiz_sessions', [
        'quiz_id' => $this->quiz->id,
        'session_code' => 'TEST123',
        'presenter_id' => $this->presenter->id
    ]);
});

test('session code must be unique', function () {
    QuizSession::factory()->create(['session_code' => 'DUPLICATE']);

    $response = $this->actingAs($this->presenter)
        ->post(route('quiz-session.store'), [
            'quiz_id' => $this->quiz->id,
            'session_code' => 'DUPLICATE'
        ]);

    $response->assertSessionHasErrors(['session_code']);
});

test('participants can join active session', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting',
        'session_code' => 'JOIN123'
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('quiz-session.join', $session), [
            'participant_name' => 'Test Player'
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('participants', [
        'quiz_session_id' => $session->id,
        'user_id' => $this->user->id,
        'name' => 'Test Player'
    ]);
});

test('guest can join session with pseudonym', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting',
        'session_code' => 'GUEST123'
    ]);

    $response = $this->post(route('quiz-session.join', $session), [
        'participant_name' => 'Guest Player'
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('participants', [
        'quiz_session_id' => $session->id,
        'user_id' => null,
        'name' => 'Guest Player'
    ]);
});

test('participant joining triggers event', function () {
    Event::fake();
    
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting'
    ]);

    $this->actingAs($this->user)
        ->post(route('quiz-session.join', $session), [
            'participant_name' => 'Event Test'
        ]);

    Event::assertDispatched(ParticipantJoined::class);
});

test('presenter can start session', function () {
    Event::fake();
    
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id,
        'status' => 'waiting'
    ]);

    $response = $this->actingAs($this->presenter)
        ->post(route('quiz-session.start', $session));

    $response->assertOk();
    $this->assertDatabaseHas('quiz_sessions', [
        'id' => $session->id,
        'status' => 'active'
    ]);

    Event::assertDispatched(SessionStarted::class);
});

test('only session presenter can start session', function () {
    $otherPresenter = User::factory()->create();
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id,
        'status' => 'waiting'
    ]);

    $response = $this->actingAs($otherPresenter)
        ->post(route('quiz-session.start', $session));

    $response->assertForbidden();
});

test('participant cannot join ended session', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'ended'
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('quiz-session.join', $session), [
            'participant_name' => 'Late Player'
        ]);

    $response->assertForbidden();
});

test('participant can leave session', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'waiting'
    ]);

    $participant = Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'user_id' => $this->user->id
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('quiz-session.leave', $session));

    $response->assertOk();
    $this->assertDatabaseMissing('participants', [
        'id' => $participant->id
    ]);
});

test('session statistics are calculated correctly', function () {
    $session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'ended'
    ]);

    // Create participants with different scores
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 100
    ]);
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 80
    ]);
    Participant::factory()->create([
        'quiz_session_id' => $session->id,
        'score' => 60
    ]);

    $response = $this->actingAs($this->presenter)
        ->get(route('quiz-session.results', $session));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('quiz-session/results')
        ->has('session')
        ->has('participants', 3)
        ->where('statistics.average_score', 80)
        ->where('statistics.max_score', 100)
    );
});