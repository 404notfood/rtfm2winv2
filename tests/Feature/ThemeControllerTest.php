<?php

use App\Models\Theme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->admin->role = 'admin';
    $this->admin->save();
});

test('user can view available themes', function () {
    Theme::factory(3)->create(['is_active' => true]);

    $response = $this->actingAs($this->user)
        ->get(route('themes.index'));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('themes/index')
        ->has('themes', 3)
    );
});

test('user can create custom theme', function () {
    $themeData = [
        'name' => 'My Custom Theme',
        'description' => 'A beautiful custom theme',
        'css_variables' => [
            '--primary-color' => '#3b82f6',
            '--secondary-color' => '#8b5cf6',
            '--background-color' => '#ffffff',
            '--text-color' => '#1f2937'
        ],
        'is_public' => false
    ];

    $response = $this->actingAs($this->user)
        ->post(route('themes.store'), $themeData);

    $response->assertRedirect();
    $this->assertDatabaseHas('themes', [
        'name' => 'My Custom Theme',
        'user_id' => $this->user->id,
        'is_public' => false
    ]);
});

test('user can make theme public', function () {
    $theme = Theme::factory()->create([
        'user_id' => $this->user->id,
        'is_public' => false
    ]);

    $response = $this->actingAs($this->user)
        ->put(route('themes.update', $theme), [
            'name' => $theme->name,
            'description' => $theme->description,
            'css_variables' => $theme->css_variables,
            'is_public' => true
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('themes', [
        'id' => $theme->id,
        'is_public' => true
    ]);
});

test('user can only edit their own themes', function () {
    $otherUser = User::factory()->create();
    $theme = Theme::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($this->user)
        ->put(route('themes.update', $theme), [
            'name' => 'Hacked Theme'
        ]);

    $response->assertForbidden();
});

test('user can preview theme before saving', function () {
    $previewData = [
        'css_variables' => [
            '--primary-color' => '#ff0000',
            '--background-color' => '#000000'
        ]
    ];

    $response = $this->actingAs($this->user)
        ->post(route('themes.preview'), $previewData);

    $response->assertOk();
    $response->assertJson([
        'preview_url' => true,
        'css_content' => true
    ]);
});

test('theme validation prevents invalid css', function () {
    $invalidThemeData = [
        'name' => '',
        'css_variables' => [
            '--invalid-property' => 'javascript:alert(1)', // XSS attempt
            '--color' => 'not-a-valid-color'
        ]
    ];

    $response = $this->actingAs($this->user)
        ->post(route('themes.store'), $invalidThemeData);

    $response->assertSessionHasErrors(['name', 'css_variables']);
});

test('user can apply theme to their account', function () {
    $theme = Theme::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->user)
        ->post(route('themes.apply', $theme));

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'current_theme_id' => $theme->id
    ]);
});

test('user can share theme with community', function () {
    $theme = Theme::factory()->create([
        'user_id' => $this->user->id,
        'is_public' => true
    ]);

    $response = $this->get(route('themes.show', $theme));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('themes/show')
        ->has('theme')
        ->where('theme.id', $theme->id)
    );
});

test('admin can manage all themes', function () {
    $userTheme = Theme::factory()->create([
        'user_id' => $this->user->id,
        'is_public' => true
    ]);

    $response = $this->actingAs($this->admin)
        ->put(route('themes.update', $userTheme), [
            'name' => $userTheme->name,
            'description' => 'Admin updated description',
            'css_variables' => $userTheme->css_variables,
            'is_active' => false // Admin deactivating theme
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('themes', [
        'id' => $userTheme->id,
        'description' => 'Admin updated description',
        'is_active' => false
    ]);
});

test('admin can delete inappropriate themes', function () {
    $inappropriateTheme = Theme::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Inappropriate Theme'
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('themes.destroy', $inappropriateTheme));

    $response->assertRedirect();
    $this->assertSoftDeleted('themes', [
        'id' => $inappropriateTheme->id
    ]);
});

test('theme editor shows real-time preview', function () {
    $response = $this->actingAs($this->user)
        ->get(route('themes.editor'));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('themes/editor')
        ->has('systemThemes')
        ->has('userThemes')
    );
});

test('theme export includes all necessary data', function () {
    $theme = Theme::factory()->create([
        'user_id' => $this->user->id,
        'is_public' => true
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('themes.export', $theme));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/json');
    
    $exportData = $response->json();
    expect($exportData)->toHaveKeys([
        'name', 'description', 'css_variables', 'version'
    ]);
});

test('user can import theme from file', function () {
    $importData = [
        'theme_file' => [
            'name' => 'Imported Theme',
            'description' => 'Theme imported from file',
            'css_variables' => [
                '--primary-color' => '#4f46e5',
                '--background' => '#f9fafb'
            ],
            'version' => '1.0'
        ]
    ];

    $response = $this->actingAs($this->user)
        ->post(route('themes.import'), $importData);

    $response->assertRedirect();
    $this->assertDatabaseHas('themes', [
        'name' => 'Imported Theme',
        'user_id' => $this->user->id
    ]);
});

test('duplicate theme names are handled correctly', function () {
    Theme::factory()->create([
        'name' => 'Duplicate Name',
        'user_id' => $this->user->id
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('themes.store'), [
            'name' => 'Duplicate Name',
            'css_variables' => ['--color' => '#000000']
        ]);

    $response->assertSessionHasErrors(['name']);
});

test('theme css generation is secure', function () {
    $maliciousTheme = Theme::factory()->create([
        'css_variables' => [
            '--background' => 'url("javascript:alert(1)")',
            '--color' => 'expression(alert(1))'
        ]
    ]);

    $response = $this->get(route('themes.css', $maliciousTheme));

    $css = $response->getContent();
    expect($css)->not->toContain('javascript:');
    expect($css)->not->toContain('expression(');
});