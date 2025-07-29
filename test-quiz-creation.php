<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use App\Services\QuizService;

// Get a user (admin user)
$user = User::where('role', 'admin')->first();

if (!$user) {
    echo "No admin user found!\n";
    exit(1);
}

echo "Using user: {$user->name} (ID: {$user->id})\n";

// Test quiz data
$quizData = [
    'title' => 'Test Quiz CSRF Fix',
    'description' => 'Test to see if CSRF fix worked',
    'is_active' => true,
    'is_public' => true,
    'time_per_question' => 30,
    'points_per_question' => 1000,
    'show_correct_answer' => true,
    'questions' => [
        [
            'text' => 'What is 2+2?',
            'type' => 'single',
            'points' => 1000,
            'answers' => [
                ['text' => '3', 'is_correct' => false],
                ['text' => '4', 'is_correct' => true],
                ['text' => '5', 'is_correct' => false],
            ]
        ]
    ]
];

try {
    $quizService = new QuizService();
    $quiz = $quizService->createQuiz($quizData, $user);
    
    echo "SUCCESS: Quiz created with ID: {$quiz->id}\n";
    echo "Quiz title: {$quiz->title}\n";
    echo "Quiz code: {$quiz->code}\n";
    echo "Questions count: " . $quiz->questions()->count() . "\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}