<?php

use Illuminate\Support\Facades\Route;

// Test route simple sans CSRF ni session
Route::get('/test-server', function () {
    return response()->json([
        'status' => 'OK',
        'time' => now(),
        'app_url' => config('app.url'),
        'session_driver' => config('session.driver'),
        'csrf_token' => csrf_token(),
    ]);
});

// Test route POST sans CSRF
Route::post('/test-post', function () {
    return response()->json([
        'status' => 'POST OK',
        'data' => request()->all(),
    ]);
})->withoutMiddleware(['csrf']);