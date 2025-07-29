<?php

use App\Events\SessionStarted;
use App\Events\SessionEnded;
use App\Events\ParticipantJoined;
use App\Events\ParticipantLeft;
use App\Events\QuestionDisplayed;
use App\Events\AnswersRevealed;
use App\Events\LeaderboardUpdated;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\Quiz;
use App\Models\User;
use App\Models\Question;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->presenter = User::factory()->create(['role' => 'presenter']);
    $this->quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
    $this->session = QuizSession::factory()->create([
        'quiz_id' => $this->quiz->id,
        'presenter_id' => $this->presenter->id
    ]);
});

test('session started event is broadcasted when session starts', function () {
    Event::fake();

    event(new SessionStarted($this->session));

    Event::assertDispatched(SessionStarted::class, function ($event) {
        return $event->session->id === $this->session->id;
    });
});

test('session started event contains session data', function () {
    $event = new SessionStarted($this->session);

    expect($event->session)->toBeInstanceOf(QuizSession::class);
    expect($event->session->id)->toBe($this->session->id);
});

test('session started event broadcasts to correct channel', function () {
    $event = new SessionStarted($this->session);

    expect($event->broadcastOn())->toHaveCount(1);
    expect($event->broadcastOn()[0]->name)->toBe("quiz-session.{$this->session->id}");
});

test('participant joined event is dispatched', function () {
    Event::fake();

    $participant = Participant::factory()->create([
        'quiz_session_id' => $this->session->id
    ]);

    event(new ParticipantJoined($this->session, $participant));

    Event::assertDispatched(ParticipantJoined::class);
});

test('participant joined event contains participant data', function () {
    $participant = Participant::factory()->create([
        'quiz_session_id' => $this->session->id,
        'name' => 'Test Player'
    ]);

    $event = new ParticipantJoined($this->session, $participant);

    expect($event->session->id)->toBe($this->session->id);
    expect($event->participant->name)->toBe('Test Player');
});

test('participant left event is dispatched', function () {
    Event::fake();

    $participant = Participant::factory()->create([
        'quiz_session_id' => $this->session->id
    ]);

    event(new ParticipantLeft($this->session, $participant));

    Event::assertDispatched(ParticipantLeft::class);
});

test('question displayed event contains question data', function () {
    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);

    $event = new QuestionDisplayed($this->session, $question, 30);

    expect($event->session->id)->toBe($this->session->id);
    expect($event->question->id)->toBe($question->id);
    expect($event->timeLimit)->toBe(30);
});

test('question displayed event broadcasts with time limit', function () {
    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);

    $event = new QuestionDisplayed($this->session, $question, 45);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('time_limit');
    expect($broadcastData['time_limit'])->toBe(45);
    expect($broadcastData)->toHaveKey('question');
});

test('answers revealed event shows correct answers', function () {
    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);
    $correctAnswers = [1, 3]; // Answer IDs that are correct
    $statistics = [
        'total_responses' => 10,
        'correct_responses' => 7
    ];

    $event = new AnswersRevealed($this->session, $question, $correctAnswers, $statistics);

    expect($event->question->id)->toBe($question->id);
    expect($event->correctAnswers)->toBe($correctAnswers);
    expect($event->statistics['total_responses'])->toBe(10);
});

test('leaderboard updated event contains rankings', function () {
    $participant1 = Participant::factory()->create([
        'quiz_session_id' => $this->session->id,
        'score' => 100,
        'name' => 'Leader'
    ]);

    $participant2 = Participant::factory()->create([
        'quiz_session_id' => $this->session->id,
        'score' => 80,
        'name' => 'Second'
    ]);

    $leaderboard = collect([$participant1, $participant2]);

    $event = new LeaderboardUpdated($this->session, $leaderboard);

    expect($event->leaderboard)->toHaveCount(2);
    expect($event->leaderboard->first()->name)->toBe('Leader');
});

test('session ended event includes final results', function () {
    $results = [
        'total_participants' => 5,
        'average_score' => 75.5,
        'highest_score' => 95,
        'completion_rate' => 0.8
    ];

    $event = new SessionEnded($this->session, $results);

    expect($event->session->id)->toBe($this->session->id);
    expect($event->results['total_participants'])->toBe(5);
    expect($event->results['average_score'])->toBe(75.5);
});

test('events broadcast to presenter channel', function () {
    $event = new SessionStarted($this->session);

    $channels = $event->broadcastOn();
    $channelNames = array_map(fn($channel) => $channel->name, $channels);

    expect($channelNames)->toContain("quiz-session.{$this->session->id}");
});

test('events broadcast to participants channel', function () {
    $participant = Participant::factory()->create([
        'quiz_session_id' => $this->session->id
    ]);

    $event = new ParticipantJoined($this->session, $participant);

    $channels = $event->broadcastOn();
    $channelNames = array_map(fn($channel) => $channel->name, $channels);

    expect($channelNames)->toContain("quiz-session.{$this->session->id}");
});

test('events include session metadata', function () {
    $event = new SessionStarted($this->session);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('session');
    expect($broadcastData['session']['id'])->toBe($this->session->id);
    expect($broadcastData)->toHaveKey('timestamp');
});

test('question displayed event excludes correct answers from broadcast', function () {
    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);

    $event = new QuestionDisplayed($this->session, $question, 30);

    $broadcastData = $event->broadcastWith();

    // Should not contain answer correctness to prevent cheating
    expect($broadcastData['question'])->not->toHaveKey('correct_answer_id');
});

test('leaderboard updated event includes participant positions', function () {
    $participants = collect([
        (object)['id' => 1, 'name' => 'First', 'score' => 100, 'position' => 1],
        (object)['id' => 2, 'name' => 'Second', 'score' => 80, 'position' => 2],
        (object)['id' => 3, 'name' => 'Third', 'score' => 60, 'position' => 3]
    ]);

    $event = new LeaderboardUpdated($this->session, $participants);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['leaderboard'])->toHaveCount(3);
    expect($broadcastData['leaderboard'][0]['position'])->toBe(1);
    expect($broadcastData['leaderboard'][0]['name'])->toBe('First');
});

test('events can be queued for better performance', function () {
    $event = new SessionStarted($this->session);

    expect($event->shouldQueue())->toBeTrue();
});

test('high priority events are not queued', function () {
    $question = Question::factory()->create(['quiz_id' => $this->quiz->id]);
    $event = new QuestionDisplayed($this->session, $question, 30);

    // Question display should be immediate for timing
    expect($event->shouldQueue())->toBeFalse();
});

test('events include quiz information', function () {
    $event = new SessionStarted($this->session);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['quiz'])->toHaveKey('id');
    expect($broadcastData['quiz'])->toHaveKey('title');
    expect($broadcastData['quiz']['id'])->toBe($this->quiz->id);
});