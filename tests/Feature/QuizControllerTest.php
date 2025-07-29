<?php

use App\Models\Quiz;
use App\Models\User;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->presenter = User::factory()->create();
    $this->presenter->role = 'presenter';
    $this->presenter->save();
});

test('authenticated user can view quiz index', function () {
    $quizzes = Quiz::factory(3)->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->get(route('quiz.index'));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('quiz/index')
        ->has('quizzes.data', 3)
    );
});

test('presenter can create a quiz', function () {
    $quizData = [
        'title' => 'Test Quiz',
        'description' => 'A test quiz description',
        'duration' => 30,
        'max_participants' => 50,
        'is_public' => true
    ];

    $response = $this->actingAs($this->presenter)
        ->post(route('quiz.store'), $quizData);

    $response->assertRedirect();
    $this->assertDatabaseHas('quizzes', [
        'title' => 'Test Quiz',
        'user_id' => $this->presenter->id
    ]);
});

test('only presenter can create quiz', function () {
    $quizData = [
        'title' => 'Test Quiz',
        'description' => 'A test quiz description'
    ];

    $response = $this->actingAs($this->user)
        ->post(route('quiz.store'), $quizData);

    $response->assertForbidden();
});

test('presenter can update their own quiz', function () {
    $quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);

    $updateData = [
        'title' => 'Updated Quiz Title',
        'description' => 'Updated description'
    ];

    $response = $this->actingAs($this->presenter)
        ->put(route('quiz.update', $quiz), $updateData);

    $response->assertRedirect();
    $this->assertDatabaseHas('quizzes', [
        'id' => $quiz->id,
        'title' => 'Updated Quiz Title'
    ]);
});

test('presenter cannot update another users quiz', function () {
    $otherUser = User::factory()->create();
    $quiz = Quiz::factory()->create(['user_id' => $otherUser->id]);

    $updateData = ['title' => 'Hacked Title'];

    $response = $this->actingAs($this->presenter)
        ->put(route('quiz.update', $quiz), $updateData);

    $response->assertForbidden();
});

test('presenter can delete their own quiz', function () {
    $quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);

    $response = $this->actingAs($this->presenter)
        ->delete(route('quiz.destroy', $quiz));

    $response->assertRedirect();
    $this->assertSoftDeleted('quizzes', ['id' => $quiz->id]);
});

test('quiz validation rules work correctly', function () {
    $invalidData = [
        'title' => '', // Required
        'duration' => -5, // Must be positive
        'max_participants' => 0 // Must be at least 1
    ];

    $response = $this->actingAs($this->presenter)
        ->post(route('quiz.store'), $invalidData);

    $response->assertSessionHasErrors(['title', 'duration', 'max_participants']);
});

test('quiz with questions can be viewed', function () {
    $quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
    $question = Question::factory()->create(['quiz_id' => $quiz->id]);
    Answer::factory(4)->create(['question_id' => $question->id]);

    $response = $this->actingAs($this->presenter)
        ->get(route('quiz.show', $quiz));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('quiz/show')
        ->has('quiz')
        ->has('quiz.questions', 1)
    );
});

test('public quiz can be accessed by guest', function () {
    $quiz = Quiz::factory()->create(['is_public' => true]);

    $response = $this->get(route('quiz.show', $quiz));

    $response->assertOk();
});

test('private quiz cannot be accessed by guest', function () {
    $quiz = Quiz::factory()->create(['is_public' => false]);

    $response = $this->get(route('quiz.show', $quiz));

    $response->assertForbidden();
});