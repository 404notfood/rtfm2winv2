<?php

use App\Models\Quiz;
use App\Models\User;
use App\Models\Question;
use App\Models\QuizSession;
use App\Models\QuizAnalytic;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('quiz belongs to user', function () {
    $quiz = Quiz::factory()->create(['user_id' => $this->user->id]);

    expect($quiz->user)->toBeInstanceOf(User::class);
    expect($quiz->user->id)->toBe($this->user->id);
});

test('quiz has many questions', function () {
    $quiz = Quiz::factory()->create();
    Question::factory(3)->create(['quiz_id' => $quiz->id]);

    expect($quiz->questions)->toHaveCount(3);
    expect($quiz->questions->first())->toBeInstanceOf(Question::class);
});

test('quiz has many sessions', function () {
    $quiz = Quiz::factory()->create();
    QuizSession::factory(2)->create(['quiz_id' => $quiz->id]);

    expect($quiz->sessions)->toHaveCount(2);
    expect($quiz->sessions->first())->toBeInstanceOf(QuizSession::class);
});

test('quiz can generate unique link', function () {
    $quiz = Quiz::factory()->create(['unique_link' => null]);

    $quiz->generateUniqueLink();

    expect($quiz->unique_link)->not->toBeEmpty();
    expect($quiz->unique_link)->toHaveLength(10);
});

test('quiz unique link is truly unique', function () {
    $quiz1 = Quiz::factory()->create();
    $quiz1->generateUniqueLink();

    $quiz2 = Quiz::factory()->create();
    $quiz2->generateUniqueLink();

    expect($quiz1->unique_link)->not->toBe($quiz2->unique_link);
});

test('quiz can check if user is owner', function () {
    $quiz = Quiz::factory()->create(['user_id' => $this->user->id]);
    $otherUser = User::factory()->create();

    expect($quiz->isOwnedBy($this->user))->toBeTrue();
    expect($quiz->isOwnedBy($otherUser))->toBeFalse();
});

test('quiz calculates total points correctly', function () {
    $quiz = Quiz::factory()->create();
    
    // Create questions with different point values
    Question::factory()->create(['quiz_id' => $quiz->id, 'points' => 10]);
    Question::factory()->create(['quiz_id' => $quiz->id, 'points' => 20]);
    Question::factory()->create(['quiz_id' => $quiz->id, 'points' => 15]);

    expect($quiz->getTotalPoints())->toBe(45);
});

test('quiz can check if it is published', function () {
    $publishedQuiz = Quiz::factory()->create(['is_published' => true]);
    $draftQuiz = Quiz::factory()->create(['is_published' => false]);

    expect($publishedQuiz->isPublished())->toBeTrue();
    expect($draftQuiz->isPublished())->toBeFalse();
});

test('quiz can check if it is public', function () {
    $publicQuiz = Quiz::factory()->create(['is_public' => true]);
    $privateQuiz = Quiz::factory()->create(['is_public' => false]);

    expect($publicQuiz->isPublic())->toBeTrue();
    expect($privateQuiz->isPublic())->toBeFalse();
});

test('quiz scope filters by user', function () {
    $user1Quizzes = Quiz::factory(2)->create(['user_id' => $this->user->id]);
    $user2 = User::factory()->create();
    Quiz::factory(3)->create(['user_id' => $user2->id]);

    $userQuizzes = Quiz::byUser($this->user->id)->get();

    expect($userQuizzes)->toHaveCount(2);
    expect($userQuizzes->pluck('user_id')->unique()->first())->toBe($this->user->id);
});

test('quiz scope filters published only', function () {
    Quiz::factory(2)->create(['is_published' => true]);
    Quiz::factory(3)->create(['is_published' => false]);

    $publishedQuizzes = Quiz::published()->get();

    expect($publishedQuizzes)->toHaveCount(2);
    expect($publishedQuizzes->every('is_published'))->toBeTrue();
});

test('quiz scope filters public only', function () {
    Quiz::factory(3)->create(['is_public' => true]);
    Quiz::factory(2)->create(['is_public' => false]);

    $publicQuizzes = Quiz::public()->get();

    expect($publicQuizzes)->toHaveCount(3);
    expect($publicQuizzes->every('is_public'))->toBeTrue();
});

test('quiz can duplicate itself', function () {
    $originalQuiz = Quiz::factory()->create([
        'title' => 'Original Quiz',
        'user_id' => $this->user->id
    ]);

    // Add questions to original
    Question::factory(2)->create(['quiz_id' => $originalQuiz->id]);

    $duplicatedQuiz = $originalQuiz->duplicate();

    expect($duplicatedQuiz->title)->toBe('Copy of Original Quiz');
    expect($duplicatedQuiz->user_id)->toBe($this->user->id);
    expect($duplicatedQuiz->questions)->toHaveCount(2);
    expect($duplicatedQuiz->id)->not->toBe($originalQuiz->id);
});

test('quiz calculates average score from sessions', function () {
    $quiz = Quiz::factory()->create();
    
    // Create sessions with different average scores
    QuizSession::factory()->create([
        'quiz_id' => $quiz->id,
        'average_score' => 85
    ]);
    QuizSession::factory()->create([
        'quiz_id' => $quiz->id,
        'average_score' => 75
    ]);

    expect($quiz->getAverageScore())->toBe(80.0);
});

test('quiz has analytics relationship', function () {
    $quiz = Quiz::factory()->create();
    QuizAnalytic::factory()->create(['quiz_id' => $quiz->id]);

    expect($quiz->analytics)->toBeInstanceOf(QuizAnalytic::class);
});

test('quiz validates required fields', function () {
    $quiz = new Quiz();

    expect($quiz->isValid())->toBeFalse();

    $quiz->title = 'Valid Title';
    $quiz->user_id = $this->user->id;

    expect($quiz->isValid())->toBeTrue();
});

test('quiz title must be unique for user', function () {
    Quiz::factory()->create([
        'title' => 'Unique Title',
        'user_id' => $this->user->id
    ]);

    $duplicateQuiz = Quiz::factory()->make([
        'title' => 'Unique Title',
        'user_id' => $this->user->id
    ]);

    expect($duplicateQuiz->isValid())->toBeFalse();
});

test('quiz can be soft deleted', function () {
    $quiz = Quiz::factory()->create();

    $quiz->delete();

    expect($quiz->trashed())->toBeTrue();
    expect(Quiz::count())->toBe(0);
    expect(Quiz::withTrashed()->count())->toBe(1);
});

test('quiz generates qr code on creation', function () {
    $quiz = Quiz::factory()->create();

    expect($quiz->qr_code)->not->toBeNull();
    expect($quiz->qr_code)->toContain('data:image/png;base64');
});