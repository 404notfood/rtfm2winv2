<?php

use App\Models\Tournament;
use App\Models\TournamentParticipant;
use App\Models\TournamentMatch;
use App\Models\Quiz;
use App\Models\User;
use App\Events\TournamentStarted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create();
    $this->admin->role = 'admin';
    $this->admin->save();

    $this->presenter = User::factory()->create();
    $this->presenter->role = 'presenter';
    $this->presenter->save();

    $this->user = User::factory()->create();
    
    $this->quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
});

test('admin can create tournament', function () {
    $tournamentData = [
        'name' => 'Spring Championship',
        'description' => 'Annual spring tournament',
        'quiz_id' => $this->quiz->id,
        'max_participants' => 16,
        'tournament_type' => 'single_elimination',
        'registration_start' => now()->addDay(),
        'registration_end' => now()->addDays(7),
        'start_date' => now()->addDays(10)
    ];

    $response = $this->actingAs($this->admin)
        ->post(route('tournaments.store'), $tournamentData);

    $response->assertRedirect();
    $this->assertDatabaseHas('tournaments', [
        'name' => 'Spring Championship',
        'quiz_id' => $this->quiz->id,
        'created_by' => $this->admin->id
    ]);
});

test('presenter can create tournament for their quiz', function () {
    $tournamentData = [
        'name' => 'My Quiz Tournament',
        'quiz_id' => $this->quiz->id,
        'max_participants' => 8,
        'tournament_type' => 'round_robin'
    ];

    $response = $this->actingAs($this->presenter)
        ->post(route('tournaments.store'), $tournamentData);

    $response->assertRedirect();
    $this->assertDatabaseHas('tournaments', [
        'name' => 'My Quiz Tournament',
        'created_by' => $this->presenter->id
    ]);
});

test('regular user cannot create tournament', function () {
    $tournamentData = [
        'name' => 'Unauthorized Tournament',
        'quiz_id' => $this->quiz->id
    ];

    $response = $this->actingAs($this->user)
        ->post(route('tournaments.store'), $tournamentData);

    $response->assertForbidden();
});

test('user can register for open tournament', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'registration_open',
        'max_participants' => 16,
        'registration_start' => now()->subDay(),
        'registration_end' => now()->addDay()
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('tournaments.register', $tournament));

    $response->assertRedirect();
    $this->assertDatabaseHas('tournament_participants', [
        'tournament_id' => $tournament->id,
        'user_id' => $this->user->id,
        'status' => 'registered'
    ]);
});

test('user cannot register for closed tournament', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'completed'
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('tournaments.register', $tournament));

    $response->assertForbidden();
});

test('tournament cannot exceed max participants', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'registration_open',
        'max_participants' => 2
    ]);

    // Fill up the tournament
    TournamentParticipant::factory(2)->create([
        'tournament_id' => $tournament->id
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('tournaments.register', $tournament));

    $response->assertSessionHasErrors(['tournament']);
});

test('user cannot register twice for same tournament', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'registration_open'
    ]);

    // First registration
    TournamentParticipant::factory()->create([
        'tournament_id' => $tournament->id,
        'user_id' => $this->user->id
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('tournaments.register', $tournament));

    $response->assertSessionHasErrors(['registration']);
});

test('admin can start tournament with enough participants', function () {
    Event::fake();
    
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'registration_closed',
        'tournament_type' => 'single_elimination'
    ]);

    // Add enough participants for single elimination (power of 2)
    TournamentParticipant::factory(4)->create([
        'tournament_id' => $tournament->id,
        'status' => 'confirmed'
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('tournaments.start', $tournament));

    $response->assertRedirect();
    $this->assertDatabaseHas('tournaments', [
        'id' => $tournament->id,
        'status' => 'active'
    ]);

    Event::assertDispatched(TournamentStarted::class);
});

test('tournament generates correct bracket for single elimination', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'tournament_type' => 'single_elimination',
        'status' => 'registration_closed'
    ]);

    $participants = TournamentParticipant::factory(4)->create([
        'tournament_id' => $tournament->id,
        'status' => 'confirmed'
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('tournaments.start', $tournament));

    // Should create 2 first round matches (4 participants / 2)
    $this->assertDatabaseCount('tournament_matches', 2);
    
    $matches = TournamentMatch::where('tournament_id', $tournament->id)
        ->where('round', 1)
        ->get();

    expect($matches)->toHaveCount(2);
    expect($matches->first()->participant1_id)->not->toBeNull();
    expect($matches->first()->participant2_id)->not->toBeNull();
});

test('tournament match result updates bracket', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'tournament_type' => 'single_elimination',
        'status' => 'active'
    ]);

    $participant1 = TournamentParticipant::factory()->create([
        'tournament_id' => $tournament->id
    ]);
    $participant2 = TournamentParticipant::factory()->create([
        'tournament_id' => $tournament->id
    ]);

    $match = TournamentMatch::factory()->create([
        'tournament_id' => $tournament->id,
        'participant1_id' => $participant1->id,
        'participant2_id' => $participant2->id,
        'round' => 1,
        'status' => 'scheduled'
    ]);

    $response = $this->actingAs($this->admin)
        ->put(route('tournaments.match-result', $match), [
            'winner_id' => $participant1->id,
            'participant1_score' => 100,
            'participant2_score' => 80
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('tournament_matches', [
        'id' => $match->id,
        'winner_id' => $participant1->id,
        'status' => 'completed'
    ]);
});

test('round robin generates all possible matches', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'tournament_type' => 'round_robin',
        'status' => 'registration_closed'
    ]);

    // Create 4 participants - should generate 6 matches (4 * 3 / 2)
    TournamentParticipant::factory(4)->create([
        'tournament_id' => $tournament->id,
        'status' => 'confirmed'
    ]);

    $this->actingAs($this->admin)
        ->post(route('tournaments.start', $tournament));

    $this->assertDatabaseCount('tournament_matches', 6);
});

test('tournament leaderboard shows correct rankings', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'completed'
    ]);

    $participants = TournamentParticipant::factory(3)->create([
        'tournament_id' => $tournament->id
    ]);

    // Create completed matches with different scores
    TournamentMatch::factory()->create([
        'tournament_id' => $tournament->id,
        'participant1_id' => $participants[0]->id,
        'participant2_id' => $participants[1]->id,
        'winner_id' => $participants[0]->id,
        'participant1_score' => 100,
        'participant2_score' => 80,
        'status' => 'completed'
    ]);

    $response = $this->get(route('tournaments.leaderboard', $tournament));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('tournaments/leaderboard')
        ->has('tournament')
        ->has('participants', 3)
    );
});

test('user can withdraw from tournament before start', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'registration_open'
    ]);

    $participant = TournamentParticipant::factory()->create([
        'tournament_id' => $tournament->id,
        'user_id' => $this->user->id,
        'status' => 'registered'
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('tournaments.withdraw', $tournament));

    $response->assertRedirect();
    $this->assertDatabaseMissing('tournament_participants', [
        'id' => $participant->id
    ]);
});

test('user cannot withdraw from active tournament', function () {
    $tournament = Tournament::factory()->create([
        'quiz_id' => $this->quiz->id,
        'status' => 'active'
    ]);

    TournamentParticipant::factory()->create([
        'tournament_id' => $tournament->id,
        'user_id' => $this->user->id
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('tournaments.withdraw', $tournament));

    $response->assertForbidden();
});