<?php

// Test direct MySQL connection
$host = '127.0.0.1';
$port = 3306;
$database = 'rtfm2win';
$username = 'root';
$password = '';

echo "Testing database connection...\n";
echo "Host: $host\n";
echo "Port: $port\n";
echo "Database: $database\n";
echo "Username: $username\n";
echo "Password: " . (empty($password) ? '(empty)' : '(set)') . "\n\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ SUCCESS: Database connection established!\n";
    
    // Test a simple query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '$database'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Tables found: " . $result['count'] . "\n";
    
    // Check if quizzes table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'quizzes'");
    if ($stmt->fetch()) {
        echo "✅ 'quizzes' table exists\n";
        
        // Check quizzes table structure
        $stmt = $pdo->query("DESCRIBE quizzes");
        echo "📋 Quizzes table columns:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  - {$row['Field']} ({$row['Type']})\n";
        }
    } else {
        echo "❌ 'quizzes' table does not exist\n";
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "\n🔧 Solutions to try:\n";
    echo "1. Check if MySQL is running\n";
    echo "2. Verify username/password\n";
    echo "3. Try 'localhost' instead of '127.0.0.1'\n";
    echo "4. Check MySQL user permissions\n";
    echo "5. On VPS: verify MySQL configuration\n";
}