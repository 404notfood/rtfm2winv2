<?php

use App\Models\User;
use App\Models\Quiz;
use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\Theme;
use App\Models\Friendship;
use App\Models\League;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user has many quizzes', function () {
    $user = User::factory()->create();
    Quiz::factory(3)->create(['user_id' => $user->id]);

    expect($user->quizzes)->toHaveCount(3);
    expect($user->quizzes->first())->toBeInstanceOf(Quiz::class);
});

test('user has many achievements', function () {
    $user = User::factory()->create();
    $achievements = Achievement::factory(2)->create();
    
    foreach ($achievements as $achievement) {
        UserAchievement::factory()->create([
            'user_id' => $user->id,
            'achievement_id' => $achievement->id
        ]);
    }

    expect($user->achievements)->toHaveCount(2);
    expect($user->achievements->first())->toBeInstanceOf(Achievement::class);
});

test('user can have current theme', function () {
    $theme = Theme::factory()->create();
    $user = User::factory()->create(['current_theme_id' => $theme->id]);

    expect($user->currentTheme)->toBeInstanceOf(Theme::class);
    expect($user->currentTheme->id)->toBe($theme->id);
});

test('user belongs to league', function () {
    $league = League::factory()->create();
    $user = User::factory()->create(['current_league_id' => $league->id]);

    expect($user->currentLeague)->toBeInstanceOf(League::class);
    expect($user->currentLeague->id)->toBe($league->id);
});

test('user can check if they have role', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $presenter = User::factory()->create(['role' => 'presenter']);
    $user = User::factory()->create(['role' => 'user']);

    expect($admin->hasRole('admin'))->toBeTrue();
    expect($admin->hasRole('presenter'))->toBeFalse();
    
    expect($presenter->hasRole('presenter'))->toBeTrue();
    expect($presenter->hasRole('admin'))->toBeFalse();
    
    expect($user->hasRole('user'))->toBeTrue();
});

test('user can check if they are admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user']);

    expect($admin->isAdmin())->toBeTrue();
    expect($user->isAdmin())->toBeFalse();
});

test('user can check if they are presenter', function () {
    $presenter = User::factory()->create(['role' => 'presenter']);
    $user = User::factory()->create(['role' => 'user']);

    expect($presenter->isPresenter())->toBeTrue();
    expect($user->isPresenter())->toBeFalse();
});

test('user calculates total experience points', function () {
    $user = User::factory()->create();
    $achievements = Achievement::factory(3)->create([
        'xp_reward' => 100
    ]);
    
    foreach ($achievements as $achievement) {
        UserAchievement::factory()->create([
            'user_id' => $user->id,
            'achievement_id' => $achievement->id
        ]);
    }

    expect($user->getTotalXP())->toBe(300);
});

test('user can get display name', function () {
    $userWithNickname = User::factory()->create([
        'name' => 'John Doe',
        'nickname' => 'Johnny'
    ]);
    
    $userWithoutNickname = User::factory()->create([
        'name' => 'Jane Doe',
        'nickname' => null
    ]);

    expect($userWithNickname->getDisplayName())->toBe('Johnny');
    expect($userWithoutNickname->getDisplayName())->toBe('Jane Doe');
});

test('user can get initials', function () {
    $user = User::factory()->create(['name' => 'John Doe Smith']);

    expect($user->getInitials())->toBe('JDS');
});

test('user can get initials from single name', function () {
    $user = User::factory()->create(['name' => 'Madonna']);

    expect($user->getInitials())->toBe('M');
});

test('user has friendships relationship', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    
    Friendship::factory()->create([
        'user_id' => $user1->id,
        'friend_id' => $user2->id,
        'status' => 'accepted'
    ]);

    expect($user1->friendships)->toHaveCount(1);
    expect($user1->friendships->first())->toBeInstanceOf(Friendship::class);
});

test('user can check if they are friends with another user', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $user3 = User::factory()->create();
    
    Friendship::factory()->create([
        'user_id' => $user1->id,
        'friend_id' => $user2->id,
        'status' => 'accepted'
    ]);

    expect($user1->isFriendsWith($user2))->toBeTrue();
    expect($user1->isFriendsWith($user3))->toBeFalse();
});

test('user can get friends list', function () {
    $user = User::factory()->create();
    $friend1 = User::factory()->create();
    $friend2 = User::factory()->create();
    
    Friendship::factory()->create([
        'user_id' => $user->id,
        'friend_id' => $friend1->id,
        'status' => 'accepted'
    ]);
    
    Friendship::factory()->create([
        'user_id' => $friend2->id,
        'friend_id' => $user->id,
        'status' => 'accepted'
    ]);

    $friends = $user->getFriends();

    expect($friends)->toHaveCount(2);
    expect($friends->pluck('id'))->toContain($friend1->id, $friend2->id);
});

test('user scope filters by role', function () {
    User::factory(2)->create(['role' => 'admin']);
    User::factory(3)->create(['role' => 'presenter']);
    User::factory(5)->create(['role' => 'user']);

    expect(User::withRole('admin')->count())->toBe(2);
    expect(User::withRole('presenter')->count())->toBe(3);
    expect(User::withRole('user')->count())->toBe(5);
});

test('user scope filters active users', function () {
    User::factory(3)->create(['is_active' => true]);
    User::factory(2)->create(['is_active' => false]);

    expect(User::active()->count())->toBe(3);
});

test('user can be suspended', function () {
    $user = User::factory()->create(['is_active' => true]);

    $user->suspend();

    expect($user->is_active)->toBeFalse();
    expect($user->suspended_at)->not->toBeNull();
});

test('user can be unsuspended', function () {
    $user = User::factory()->create([
        'is_active' => false,
        'suspended_at' => now()
    ]);

    $user->unsuspend();

    expect($user->is_active)->toBeTrue();
    expect($user->suspended_at)->toBeNull();
});

test('user avatar returns default when none set', function () {
    $user = User::factory()->create(['avatar' => null]);

    expect($user->getAvatarUrl())->toContain('default');
});

test('user avatar returns custom when set', function () {
    $user = User::factory()->create(['avatar' => 'custom-avatar.jpg']);

    expect($user->getAvatarUrl())->toContain('custom-avatar.jpg');
});

test('user can check if achievement is earned', function () {
    $user = User::factory()->create();
    $achievement = Achievement::factory()->create();
    
    UserAchievement::factory()->create([
        'user_id' => $user->id,
        'achievement_id' => $achievement->id
    ]);

    expect($user->hasAchievement($achievement))->toBeTrue();
});

test('user can award achievement', function () {
    $user = User::factory()->create();
    $achievement = Achievement::factory()->create();

    $user->awardAchievement($achievement);

    expect($user->hasAchievement($achievement))->toBeTrue();
    $this->assertDatabaseHas('user_achievements', [
        'user_id' => $user->id,
        'achievement_id' => $achievement->id
    ]);
});

test('user cannot award same achievement twice', function () {
    $user = User::factory()->create();
    $achievement = Achievement::factory()->create();

    $user->awardAchievement($achievement);
    $user->awardAchievement($achievement); // Attempt duplicate

    expect(UserAchievement::where('user_id', $user->id)
        ->where('achievement_id', $achievement->id)
        ->count())->toBe(1);
});

test('user can get quiz statistics', function () {
    $user = User::factory()->create();
    $quizzes = Quiz::factory(3)->create(['user_id' => $user->id]);

    $stats = $user->getQuizStatistics();

    expect($stats['total_quizzes'])->toBe(3);
    expect($stats)->toHaveKeys([
        'total_quizzes',
        'published_quizzes',
        'total_sessions',
        'total_participants'
    ]);
});