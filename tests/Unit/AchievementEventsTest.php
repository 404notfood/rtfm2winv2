<?php

use App\Events\AchievementEarned;
use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->achievement = Achievement::factory()->create([
        'name' => 'First Quiz Master',
        'description' => 'Create your first quiz',
        'xp_reward' => 100,
        'badge_icon' => 'trophy'
    ]);
});

test('achievement earned event is dispatched when user earns achievement', function () {
    Event::fake();

    event(new AchievementEarned($this->user, $this->achievement));

    Event::assertDispatched(AchievementEarned::class, function ($event) {
        return $event->user->id === $this->user->id && 
               $event->achievement->id === $this->achievement->id;
    });
});

test('achievement earned event contains user and achievement data', function () {
    $event = new AchievementEarned($this->user, $this->achievement);

    expect($event->user)->toBeInstanceOf(User::class);
    expect($event->achievement)->toBeInstanceOf(Achievement::class);
    expect($event->user->id)->toBe($this->user->id);
    expect($event->achievement->name)->toBe('First Quiz Master');
});

test('achievement earned event broadcasts to user channel', function () {
    $event = new AchievementEarned($this->user, $this->achievement);

    $channels = $event->broadcastOn();

    expect($channels)->toHaveCount(1);
    expect($channels[0]->name)->toBe("user.{$this->user->id}");
});

test('achievement earned event broadcasts achievement details', function () {
    $event = new AchievementEarned($this->user, $this->achievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('achievement');
    expect($broadcastData)->toHaveKey('user');
    expect($broadcastData)->toHaveKey('xp_earned');
    expect($broadcastData)->toHaveKey('timestamp');

    expect($broadcastData['achievement']['name'])->toBe('First Quiz Master');
    expect($broadcastData['xp_earned'])->toBe(100);
});

test('achievement earned event includes progress data', function () {
    // Create some existing achievements for the user
    $existingAchievements = Achievement::factory(3)->create();
    foreach ($existingAchievements as $achievement) {
        UserAchievement::factory()->create([
            'user_id' => $this->user->id,
            'achievement_id' => $achievement->id
        ]);
    }

    $event = new AchievementEarned($this->user, $this->achievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('user_stats');
    expect($broadcastData['user_stats'])->toHaveKey('total_achievements');
    expect($broadcastData['user_stats'])->toHaveKey('total_xp');
});

test('achievement earned event shows rarity information', function () {
    // Create achievement with rarity
    $rareAchievement = Achievement::factory()->create([
        'name' => 'Legendary Quiz Master',
        'rarity' => 'legendary',
        'completion_rate' => 0.05 // 5% of users have this
    ]);

    $event = new AchievementEarned($this->user, $rareAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['achievement'])->toHaveKey('rarity');
    expect($broadcastData['achievement'])->toHaveKey('completion_rate');
    expect($broadcastData['achievement']['rarity'])->toBe('legendary');
});

test('achievement earned event can trigger celebration effects', function () {
    $epicAchievement = Achievement::factory()->create([
        'name' => 'Epic Milestone',
        'rarity' => 'epic',
        'celebration_effect' => 'fireworks'
    ]);

    $event = new AchievementEarned($this->user, $epicAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('celebration');
    expect($broadcastData['celebration']['effect'])->toBe('fireworks');
});

test('achievement earned event includes streak information', function () {
    $streakAchievement = Achievement::factory()->create([
        'name' => '7 Day Streak',
        'achievement_type' => 'streak',
        'requirement_value' => 7
    ]);

    $event = new AchievementEarned($this->user, $streakAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['achievement'])->toHaveKey('achievement_type');
    expect($broadcastData['achievement']['achievement_type'])->toBe('streak');
});

test('achievement earned event shows progress towards next milestone', function () {
    // Create a series of related achievements
    $currentAchievement = Achievement::factory()->create([
        'name' => 'Quiz Creator I',
        'requirement_value' => 1,
        'series' => 'quiz_creator'
    ]);

    $nextAchievement = Achievement::factory()->create([
        'name' => 'Quiz Creator II',
        'requirement_value' => 5,
        'series' => 'quiz_creator'
    ]);

    $event = new AchievementEarned($this->user, $currentAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('next_milestone');
});

test('achievement earned event can be queued', function () {
    $event = new AchievementEarned($this->user, $this->achievement);

    expect($event->shouldQueue())->toBeTrue();
});

test('rare achievement events are not queued for immediate notification', function () {
    $legendaryAchievement = Achievement::factory()->create([
        'rarity' => 'legendary'
    ]);

    $event = new AchievementEarned($this->user, $legendaryAchievement);

    // Legendary achievements should be immediate
    expect($event->shouldQueue())->toBeFalse();
});

test('achievement earned event includes social sharing data', function () {
    $shareableAchievement = Achievement::factory()->create([
        'name' => 'Quiz Perfectionist',
        'is_shareable' => true,
        'share_message' => 'I just achieved Quiz Perfectionist!'
    ]);

    $event = new AchievementEarned($this->user, $shareableAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('sharing');
    expect($broadcastData['sharing']['enabled'])->toBeTrue();
    expect($broadcastData['sharing']['message'])->toBe('I just achieved Quiz Perfectionist!');
});

test('achievement earned event tracks earning timestamp', function () {
    $event = new AchievementEarned($this->user, $this->achievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData)->toHaveKey('earned_at');
    expect($broadcastData['earned_at'])->not->toBeNull();
});

test('achievement earned event includes badge visualization data', function () {
    $badgeAchievement = Achievement::factory()->create([
        'badge_icon' => 'star',
        'badge_color' => '#FFD700',
        'badge_animation' => 'pulse'
    ]);

    $event = new AchievementEarned($this->user, $badgeAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['achievement'])->toHaveKey('badge_icon');
    expect($broadcastData['achievement'])->toHaveKey('badge_color');
    expect($broadcastData['achievement'])->toHaveKey('badge_animation');
});

test('achievement earned event shows category information', function () {
    $categoryAchievement = Achievement::factory()->create([
        'category' => 'quiz_mastery',
        'subcategory' => 'creation'
    ]);

    $event = new AchievementEarned($this->user, $categoryAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['achievement'])->toHaveKey('category');
    expect($broadcastData['achievement'])->toHaveKey('subcategory');
    expect($broadcastData['achievement']['category'])->toBe('quiz_mastery');
});

test('achievement earned event includes unlock conditions for context', function () {
    $conditionalAchievement = Achievement::factory()->create([
        'unlock_conditions' => [
            'quizzes_created' => 10,
            'total_participants' => 100,
            'average_rating' => 4.5
        ]
    ]);

    $event = new AchievementEarned($this->user, $conditionalAchievement);

    $broadcastData = $event->broadcastWith();

    expect($broadcastData['achievement'])->toHaveKey('unlock_conditions');
    expect($broadcastData['achievement']['unlock_conditions'])->toHaveKey('quizzes_created');
});