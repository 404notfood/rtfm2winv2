<?php

require_once 'vendor/autoload.php';

// Load Laravel configuration
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== QUIZ TABLE STRUCTURE ===\n";

// Check if quizzes table exists
if (Schema::hasTable('quizzes')) {
    echo "✅ Table 'quizzes' exists\n\n";
    
    // Get table columns
    $columns = Schema::getColumnListing('quizzes');
    echo "Columns in quizzes table:\n";
    foreach ($columns as $column) {
        echo "- $column\n";
    }
    
    echo "\n=== REQUIRED COLUMNS CHECK ===\n";
    $requiredColumns = [
        'id', 'title', 'description', 'creator_id', 'code', 'status',
        'allow_anonymous', 'join_code', 'time_per_question', 'base_points',
        'multiple_answers', 'time_penalty', 'divide_points_multiple',
        'unique_link', 'qr_code_path', 'created_at', 'updated_at'
    ];
    
    foreach ($requiredColumns as $required) {
        if (in_array($required, $columns)) {
            echo "✅ $required\n";
        } else {
            echo "❌ $required - MISSING\n";
        }
    }
    
    echo "\n=== TEST QUIZ CREATION ===\n";
    try {
        // Test creating a quiz record directly
        $quizData = [
            'title' => 'Test Quiz',
            'description' => 'Test description',
            'creator_id' => 1,
            'code' => 'TEST123',
            'status' => 'draft',
            'allow_anonymous' => true,
            'join_code' => 'JOIN123',
            'time_per_question' => 30,
            'base_points' => 1000,
            'multiple_answers' => false,
            'time_penalty' => 10,
            'divide_points_multiple' => true,
            'unique_link' => 'test-unique-link',
            'qr_code_path' => null,
        ];
        
        $id = DB::table('quizzes')->insertGetId($quizData);
        echo "✅ Test quiz created with ID: $id\n";
        
        // Clean up
        DB::table('quizzes')->where('id', $id)->delete();
        echo "✅ Test quiz deleted\n";
        
    } catch (Exception $e) {
        echo "❌ Failed to create test quiz: " . $e->getMessage() . "\n";
    }
    
} else {
    echo "❌ Table 'quizzes' does not exist\n";
}

echo "\n=== QUIZ COUNT ===\n";
try {
    $count = DB::table('quizzes')->count();
    echo "Current quiz count: $count\n";
} catch (Exception $e) {
    echo "Error counting quizzes: " . $e->getMessage() . "\n";
}