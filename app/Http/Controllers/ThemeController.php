<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ThemeController extends Controller
{
    /**
     * Display theme management page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Load system themes
        $systemThemes = Theme::where('is_system', true)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        // Load user custom themes if logged in
        $userThemes = collect();
        if ($user) {
            $userThemes = $user->customThemes()
                ->orderBy('created_at', 'desc')
                ->get();
        }

        // Get current theme
        $currentTheme = $user ? $user->currentTheme : session('current_theme_data', null);
        
        return Inertia::render('themes/index', [
            'systemThemes' => $systemThemes,
            'userThemes' => $userThemes,
            'currentTheme' => $currentTheme,
            'canCreateCustom' => $user && $user->role !== 'guest',
        ]);
    }

    /**
     * Apply a theme for the current user.
     */
    public function apply(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme_id' => 'required|integer',
            'theme_type' => 'required|in:system,custom',
        ]);

        $user = $request->user();
        
        if ($user) {
            // TODO: Update user's current theme
            // Update user_themes table
        } else {
            // Store in session for guests
            session(['current_theme' => $validated['theme_id']]);
        }

        return back()->with('success', 'Thème appliqué avec succès !');
    }

    /**
     * Show theme editor.
     */
    public function editor(Request $request, ?string $id = null): Response
    {
        $user = $request->user();
        
        if (!$user || $user->role === 'guest') {
            abort(403, 'Vous devez être connecté pour créer des thèmes personnalisés.');
        }

        $theme = null;
        if ($id) {
            // TODO: Load existing custom theme
        }

        // Default CSS variables for editor
        $defaultVariables = [
            '--bg-primary' => '#ffffff',
            '--bg-secondary' => '#f8fafc',
            '--text-primary' => '#1e293b',
            '--text-secondary' => '#64748b',
            '--accent-primary' => '#3b82f6',
            '--accent-secondary' => '#10b981',
            '--border-color' => '#e2e8f0',
            '--quiz-correct' => '#10b981',
            '--quiz-incorrect' => '#ef4444',
            '--leaderboard-gold' => '#fbbf24',
            '--leaderboard-silver' => '#94a3b8',
            '--leaderboard-bronze' => '#fb7185',
        ];

        return Inertia::render('themes/editor', [
            'theme' => $theme,
            'defaultVariables' => $defaultVariables,
            'cssVariableCategories' => [
                'Couleurs de base' => ['--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary'],
                'Couleurs accent' => ['--accent-primary', '--accent-secondary', '--border-color'],
                'Couleurs quiz' => ['--quiz-correct', '--quiz-incorrect'],
                'Couleurs classement' => ['--leaderboard-gold', '--leaderboard-silver', '--leaderboard-bronze'],
            ],
        ]);
    }

    /**
     * Store a new custom theme.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'css_variables' => 'required|array',
            'is_public' => 'boolean',
        ]);

        $user = $request->user();
        
        if (!$user || $user->role === 'guest') {
            abort(403);
        }

        // Validate CSS variables
        $this->validateCssVariables($validated['css_variables']);

        // Create custom theme
        $customTheme = $user->customThemes()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'css_variables' => $validated['css_variables'],
            'is_public' => $validated['is_public'] ?? false,
            'slug' => Str::slug($validated['name'] . '-' . $user->id),
        ]);
        
        return redirect()->route('themes.index')
            ->with('success', 'Thème personnalisé créé avec succès !');
    }

    /**
     * Update an existing custom theme.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'css_variables' => 'required|array',
            'is_public' => 'boolean',
        ]);

        // TODO: Update custom theme (check ownership)
        
        return redirect()->route('themes.index')
            ->with('success', 'Thème mis à jour avec succès !');
    }

    /**
     * Delete a custom theme.
     */
    public function destroy(string $id): RedirectResponse
    {
        // TODO: Delete custom theme (check ownership)
        
        return redirect()->route('themes.index')
            ->with('success', 'Thème supprimé avec succès !');
    }

    /**
     * Duplicate a theme (system or custom).
     */
    public function duplicate(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'theme_type' => 'required|in:system,custom',
        ]);

        // TODO: Clone theme as custom theme for user
        
        return redirect()->route('themes.editor')
            ->with('success', 'Thème dupliqué pour modification !');
    }

    /**
     * Export theme configuration.
     */
    public function export(string $id): Response
    {
        // TODO: Export theme as JSON file
        $theme = null; // TODO: Load theme
        
        return response()->json($theme)
            ->header('Content-Disposition', 'attachment; filename="theme-export.json"');
    }

    /**
     * Import theme configuration.
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme_file' => 'required|file|mimes:json',
            'theme_name' => 'required|string|max:100',
        ]);

        // TODO: Parse JSON file and create custom theme
        
        return redirect()->route('themes.index')
            ->with('success', 'Thème importé avec succès !');
    }

    /**
     * Preview theme in real-time.
     */
    public function preview(Request $request): Response
    {
        $validated = $request->validate([
            'css_variables' => 'required|array',
        ]);

        // Return preview components with theme applied
        return response()->json([
            'preview_html' => view('themes.preview', [
                'cssVariables' => $validated['css_variables']
            ])->render()
        ]);
    }

    /**
     * Validate CSS variables format and values.
     */
    private function validateCssVariables(array $cssVariables): void
    {
        foreach ($cssVariables as $variable => $value) {
            // Validate variable name format (must start with --)
            if (!str_starts_with($variable, '--')) {
                throw new \InvalidArgumentException("Invalid CSS variable name: {$variable}");
            }

            // Validate color values (hex, rgb, hsl)
            if (!$this->isValidCssValue($value)) {
                throw new \InvalidArgumentException("Invalid CSS value for {$variable}: {$value}");
            }
        }
    }

    /**
     * Check if a CSS value is valid.
     */
    private function isValidCssValue(string $value): bool
    {
        // Allow hex colors
        if (preg_match('/^#([a-f0-9]{3}|[a-f0-9]{6})$/i', $value)) {
            return true;
        }

        // Allow rgb/rgba values
        if (preg_match('/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/i', $value)) {
            return true;
        }

        // Allow hsl/hsla values
        if (preg_match('/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/i', $value)) {
            return true;
        }

        // Allow CSS keywords
        $cssKeywords = ['transparent', 'inherit', 'initial', 'unset', 'currentColor'];
        if (in_array(strtolower($value), array_map('strtolower', $cssKeywords))) {
            return true;
        }

        // Allow named colors (basic validation)
        $namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white', 'gray', 'grey'];
        if (in_array(strtolower($value), $namedColors)) {
            return true;
        }

        return false;
    }
}