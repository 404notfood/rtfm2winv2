<?php
// Test simple pour vérifier si la route play existe
echo "Test des routes Laravel\n";
echo "========================\n";

// Simuler une requête vers /quiz/1/play
$routes = [
    '/quiz/1/play',
    '/quiz/1',
    '/quiz/1/analytics',
];

foreach ($routes as $route) {
    echo "Route: $route\n";
    
    // Utiliser curl pour tester
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://rtfm2win.ovh" . $route);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_NOBODY, true); // HEAD request only
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Status: $httpCode\n";
    echo "---\n";
}
?>