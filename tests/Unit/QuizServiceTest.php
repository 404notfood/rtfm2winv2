<?php

use App\Services\QuizService;
use App\Models\Quiz;
use App\Models\User;
use App\Models\Question;
use App\Models\Answer;
use App\Models\QuizSession;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->quizService = new QuizService();
    $this->user = User::factory()->create();
    $this->presenter = User::factory()->create(['role' => 'presenter']);
});

test('quiz service can create quiz with questions', function () {
    $quizData = [
        'title' => 'Service Test Quiz',
        'description' => 'Quiz created by service',
        'duration' => 30,
        'user_id' => $this->presenter->id,
        'questions' => [
            [
                'question_text' => 'What is 2+2?',
                'question_type' => 'single_choice',
                'points' => 10,
                'answers' => [
                    ['answer_text' => '3', 'is_correct' => false],
                    ['answer_text' => '4', 'is_correct' => true],
                    ['answer_text' => '5', 'is_correct' => false],
                ]
            ]
        ]
    ];

    $quiz = $this->quizService->createQuiz($quizData);

    expect($quiz)->toBeInstanceOf(Quiz::class);
    expect($quiz->title)->toBe('Service Test Quiz');
    expect($quiz->questions)->toHaveCount(1);
    expect($quiz->questions->first()->answers)->toHaveCount(3);
});

test('quiz service validates quiz data before creation', function () {
    $invalidData = [
        'title' => '', // Required
        'questions' => [] // Must have at least one question
    ];

    expect(fn() => $this->quizService->createQuiz($invalidData))
        ->toThrow(InvalidArgumentException::class);
});

test('quiz service can duplicate quiz with all relations', function () {
    $originalQuiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
    $question = Question::factory()->create(['quiz_id' => $originalQuiz->id]);
    Answer::factory(4)->create(['question_id' => $question->id]);

    $duplicatedQuiz = $this->quizService->duplicateQuiz($originalQuiz);

    expect($duplicatedQuiz->id)->not->toBe($originalQuiz->id);
    expect($duplicatedQuiz->title)->toContain('Copy of');
    expect($duplicatedQuiz->questions)->toHaveCount(1);
    expect($duplicatedQuiz->questions->first()->answers)->toHaveCount(4);
});

test('quiz service calculates quiz statistics', function () {
    $quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
    
    // Create sessions with participants
    $session1 = QuizSession::factory()->create([
        'quiz_id' => $quiz->id,
        'status' => 'ended'
    ]);
    $session2 = QuizSession::factory()->create([
        'quiz_id' => $quiz->id,
        'status' => 'ended'
    ]);

    $stats = $this->quizService->getQuizStatistics($quiz);

    expect($stats)->toHaveKeys([
        'total_sessions',
        'total_participants',
        'average_score',
        'completion_rate',
        'popular_questions'
    ]);
    expect($stats['total_sessions'])->toBe(2);
});

test('quiz service can publish quiz', function () {
    $quiz = Quiz::factory()->create([
        'user_id' => $this->presenter->id,
        'is_published' => false
    ]);

    $this->quizService->publishQuiz($quiz);

    expect($quiz->is_published)->toBeTrue();
    expect($quiz->published_at)->not->toBeNull();
});

test('quiz service validates quiz before publishing', function () {
    $quizWithoutQuestions = Quiz::factory()->create([
        'user_id' => $this->presenter->id,
        'is_published' => false
    ]);

    expect(fn() => $this->quizService->publishQuiz($quizWithoutQuestions))
        ->toThrow(InvalidArgumentException::class, 'Quiz must have at least one question');
});

test('quiz service can unpublish quiz', function () {
    $quiz = Quiz::factory()->create([
        'user_id' => $this->presenter->id,
        'is_published' => true,
        'published_at' => now()
    ]);

    $this->quizService->unpublishQuiz($quiz);

    expect($quiz->is_published)->toBeFalse();
    expect($quiz->published_at)->toBeNull();
});

test('quiz service generates unique quiz link', function () {
    $quiz = Quiz::factory()->create([
        'user_id' => $this->presenter->id,
        'unique_link' => null
    ]);

    $link = $this->quizService->generateUniqueLink($quiz);

    expect($link)->not->toBeEmpty();
    expect($quiz->unique_link)->toBe($link);
});

test('quiz service can search quizzes by title', function () {
    Quiz::factory()->create(['title' => 'Math Quiz Advanced']);
    Quiz::factory()->create(['title' => 'Science Quiz Basic']);
    Quiz::factory()->create(['title' => 'Advanced Physics']);

    $results = $this->quizService->searchQuizzes('Advanced');

    expect($results)->toHaveCount(2);
    expect($results->pluck('title'))->toContain('Math Quiz Advanced');
    expect($results->pluck('title'))->toContain('Advanced Physics');
});

test('quiz service can filter quizzes by category', function () {
    Quiz::factory()->create(['category' => 'Mathematics']);
    Quiz::factory()->create(['category' => 'Science']);
    Quiz::factory(2)->create(['category' => 'Mathematics']);

    $mathQuizzes = $this->quizService->getQuizzesByCategory('Mathematics');

    expect($mathQuizzes)->toHaveCount(3);
});

test('quiz service can get popular quizzes', function () {
    $popularQuiz = Quiz::factory()->create(['play_count' => 100]);
    $normalQuiz = Quiz::factory()->create(['play_count' => 10]);
    $unpopularQuiz = Quiz::factory()->create(['play_count' => 1]);

    $popular = $this->quizService->getPopularQuizzes(2);

    expect($popular)->toHaveCount(2);
    expect($popular->first()->id)->toBe($popularQuiz->id);
});

test('quiz service can get recent quizzes', function () {
    $oldQuiz = Quiz::factory()->create(['created_at' => now()->subDays(10)]);
    $recentQuiz = Quiz::factory()->create(['created_at' => now()->subHour()]);

    $recent = $this->quizService->getRecentQuizzes(5);

    expect($recent->first()->id)->toBe($recentQuiz->id);
});

test('quiz service can validate quiz answers', function () {
    $quiz = Quiz::factory()->create();
    $question = Question::factory()->create(['quiz_id' => $quiz->id]);
    $correctAnswer = Answer::factory()->create([
        'question_id' => $question->id,
        'is_correct' => true
    ]);
    $wrongAnswer = Answer::factory()->create([
        'question_id' => $question->id,
        'is_correct' => false
    ]);

    $correctResult = $this->quizService->validateAnswer($question, $correctAnswer);
    $wrongResult = $this->quizService->validateAnswer($question, $wrongAnswer);

    expect($correctResult['is_correct'])->toBeTrue();
    expect($wrongResult['is_correct'])->toBeFalse();
});

test('quiz service calculates question difficulty', function () {
    $quiz = Quiz::factory()->create();
    $question = Question::factory()->create(['quiz_id' => $quiz->id]);

    // Simulate answer statistics
    $difficulty = $this->quizService->calculateQuestionDifficulty($question, [
        'total_attempts' => 100,
        'correct_attempts' => 30
    ]);

    expect($difficulty)->toBe('hard'); // 30% success rate = hard
});

test('quiz service can export quiz data', function () {
    $quiz = Quiz::factory()->create(['user_id' => $this->presenter->id]);
    $question = Question::factory()->create(['quiz_id' => $quiz->id]);
    Answer::factory(3)->create(['question_id' => $question->id]);

    $exportData = $this->quizService->exportQuizData($quiz);

    expect($exportData)->toHaveKeys([
        'quiz',
        'questions',
        'export_date',
        'version'
    ]);
    expect($exportData['questions'])->toHaveCount(1);
});

test('quiz service can import quiz data', function () {
    $importData = [
        'quiz' => [
            'title' => 'Imported Quiz',
            'description' => 'Quiz imported from data',
            'duration' => 25
        ],
        'questions' => [
            [
                'question_text' => 'Imported question?',
                'question_type' => 'single_choice',
                'answers' => [
                    ['answer_text' => 'Yes', 'is_correct' => true],
                    ['answer_text' => 'No', 'is_correct' => false]
                ]
            ]
        ]
    ];

    $quiz = $this->quizService->importQuizData($importData, $this->presenter->id);

    expect($quiz->title)->toBe('Imported Quiz');
    expect($quiz->questions)->toHaveCount(1);
    expect($quiz->questions->first()->answers)->toHaveCount(2);
});

test('quiz service can archive old quizzes', function () {
    $oldQuiz = Quiz::factory()->create([
        'user_id' => $this->presenter->id,
        'updated_at' => now()->subMonths(7)
    ]);
    $recentQuiz = Quiz::factory()->create([
        'user_id' => $this->presenter->id,
        'updated_at' => now()->subMonth()
    ]);

    $archivedCount = $this->quizService->archiveOldQuizzes(6); // 6 months

    expect($archivedCount)->toBe(1);
    expect($oldQuiz->fresh()->is_archived)->toBeTrue();
    expect($recentQuiz->fresh()->is_archived)->toBeFalse();
});