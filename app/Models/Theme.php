<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Theme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_default',
        'is_active',
        'is_user_selectable',
        'primary_color',
        'secondary_color',
        'accent_color',
        'text_color',
        'background_color',
        'card_color',
        'is_dark',
        'font_family',
        'border_radius',
        'css_variables',
        'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'is_user_selectable' => 'boolean',
        'is_dark' => 'boolean',
        'border_radius' => 'integer',
        'css_variables' => 'array',
    ];

    /**
     * Get the user who created this theme (for custom themes).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get users who have selected this theme.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_themes')
            ->withTimestamps();
    }

    /**
     * Get seasonal theme configurations.
     */
    public function seasonalThemes(): HasMany
    {
        return $this->hasMany(SeasonalTheme::class);
    }

    /**
     * Check if this is a system theme.
     */
    public function isSystemTheme(): bool
    {
        return is_null($this->created_by);
    }

    /**
     * Check if this is a custom user theme.
     */
    public function isCustomTheme(): bool
    {
        return !is_null($this->created_by);
    }

    /**
     * Get the complete CSS variables array.
     */
    public function getCssVariablesAttribute($value): array
    {
        $decoded = json_decode($value, true) ?? [];
        
        // Merge with default values from individual color fields
        $defaults = [
            '--color-primary' => $this->primary_color ?? '#3B82F6',
            '--color-secondary' => $this->secondary_color ?? '#10B981',
            '--color-accent' => $this->accent_color ?? '#8B5CF6',
            '--color-text' => $this->text_color ?? '#1E293B',
            '--color-background' => $this->background_color ?? '#FFFFFF',
            '--color-card' => $this->card_color ?? '#F8FAFC',
            '--font-family' => $this->font_family ?? 'Inter, sans-serif',
            '--border-radius' => $this->border_radius . 'px' ?? '8px',
        ];
        
        return array_merge($defaults, $decoded);
    }

    /**
     * Generate CSS string from variables.
     */
    public function generateCss(): string
    {
        $css = ":root {\n";
        
        foreach ($this->css_variables as $property => $value) {
            $css .= "  {$property}: {$value};\n";
        }
        
        $css .= "}";
        
        return $css;
    }

    /**
     * Duplicate this theme for a user.
     */
    public function duplicateForUser(User $user, string $newName): self
    {
        return static::create([
            'name' => $newName,
            'code' => $this->code . '_' . $user->id . '_' . time(),
            'description' => "Basé sur " . $this->name,
            'is_default' => false,
            'is_active' => true,
            'is_user_selectable' => true,
            'primary_color' => $this->primary_color,
            'secondary_color' => $this->secondary_color,
            'accent_color' => $this->accent_color,
            'text_color' => $this->text_color,
            'background_color' => $this->background_color,
            'card_color' => $this->card_color,
            'is_dark' => $this->is_dark,
            'font_family' => $this->font_family,
            'border_radius' => $this->border_radius,
            'css_variables' => $this->css_variables,
            'created_by' => $user->id,
        ]);
    }

    /**
     * Apply this theme to a user.
     */
    public function applyToUser(User $user): void
    {
        // Remove existing theme associations
        $user->themes()->detach();
        
        // Apply this theme
        $user->themes()->attach($this->id, ['applied_at' => now()]);
    }

    /**
     * Export theme configuration.
     */
    public function export(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'is_dark' => $this->is_dark,
            'font_family' => $this->font_family,
            'border_radius' => $this->border_radius,
            'css_variables' => $this->css_variables,
            'exported_at' => now()->toISOString(),
            'version' => '1.0',
        ];
    }

    /**
     * Import theme configuration.
     */
    public static function import(array $config, User $user, string $name): self
    {
        return static::create([
            'name' => $name,
            'code' => 'imported_' . $user->id . '_' . time(),
            'description' => $config['description'] ?? 'Thème importé',
            'is_default' => false,
            'is_active' => true,
            'is_user_selectable' => true,
            'is_dark' => $config['is_dark'] ?? false,
            'font_family' => $config['font_family'] ?? 'Inter, sans-serif',
            'border_radius' => $config['border_radius'] ?? 8,
            'css_variables' => $config['css_variables'] ?? [],
            'created_by' => $user->id,
        ]);
    }

    /**
     * Scope: System themes only.
     */
    public function scopeSystem($query)
    {
        return $query->whereNull('created_by');
    }

    /**
     * Scope: Custom themes only.
     */
    public function scopeCustom($query)
    {
        return $query->whereNotNull('created_by');
    }

    /**
     * Scope: Active themes only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: User selectable themes.
     */
    public function scopeUserSelectable($query)
    {
        return $query->where('is_user_selectable', true);
    }

    /**
     * Scope: Default theme.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope: Dark themes.
     */
    public function scopeDark($query)
    {
        return $query->where('is_dark', true);
    }

    /**
     * Scope: Light themes.
     */
    public function scopeLight($query)
    {
        return $query->where('is_dark', false);
    }
}