<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
            if (empty($tag->color)) {
                $tag->color = '#3B82F6';
            }
        });

        static::updating(function ($tag) {
            if ($tag->isDirty('name')) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    /**
     * Get the user who created this tag.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the quizzes that have this tag.
     */
    public function quizzes(): BelongsToMany
    {
        return $this->belongsToMany(Quiz::class, 'quiz_tags')
            ->withTimestamps();
    }

    /**
     * Check if tag is system tag (created by admin).
     */
    public function isSystemTag(): bool
    {
        return is_null($this->created_by);
    }

    /**
     * Check if tag is user-created.
     */
    public function isUserTag(): bool
    {
        return !is_null($this->created_by);
    }

    /**
     * Get tag usage count.
     */
    public function getUsageCountAttribute(): int
    {
        return $this->quizzes()->count();
    }

    /**
     * Get tag color in different formats.
     */
    public function getColorVariantsAttribute(): array
    {
        $color = $this->color;
        
        return [
            'hex' => $color,
            'rgb' => $this->hexToRgb($color),
            'hsl' => $this->hexToHsl($color),
            'light' => $this->lightenColor($color, 0.9),
            'dark' => $this->darkenColor($color, 0.1),
        ];
    }

    /**
     * Get route key name.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get URL for this tag.
     */
    public function getUrlAttribute(): string
    {
        return route('tags.show', $this->slug);
    }

    /**
     * Convert hex color to RGB.
     */
    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        
        return [
            'r' => hexdec(substr($hex, 0, 2)),
            'g' => hexdec(substr($hex, 2, 2)),
            'b' => hexdec(substr($hex, 4, 2)),
        ];
    }

    /**
     * Convert hex color to HSL.
     */
    private function hexToHsl(string $hex): array
    {
        $rgb = $this->hexToRgb($hex);
        $r = $rgb['r'] / 255;
        $g = $rgb['g'] / 255;
        $b = $rgb['b'] / 255;

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $diff = $max - $min;

        // Lightness
        $l = ($max + $min) / 2;

        if ($diff === 0) {
            $h = $s = 0;
        } else {
            // Saturation
            $s = $l > 0.5 ? $diff / (2 - $max - $min) : $diff / ($max + $min);

            // Hue
            switch ($max) {
                case $r:
                    $h = (($g - $b) / $diff) + ($g < $b ? 6 : 0);
                    break;
                case $g:
                    $h = ($b - $r) / $diff + 2;
                    break;
                case $b:
                    $h = ($r - $g) / $diff + 4;
                    break;
            }
            $h /= 6;
        }

        return [
            'h' => round($h * 360),
            's' => round($s * 100),
            'l' => round($l * 100),
        ];
    }

    /**
     * Lighten a color.
     */
    private function lightenColor(string $hex, float $percent): string
    {
        $rgb = $this->hexToRgb($hex);
        
        $rgb['r'] = min(255, round($rgb['r'] + (255 - $rgb['r']) * $percent));
        $rgb['g'] = min(255, round($rgb['g'] + (255 - $rgb['g']) * $percent));
        $rgb['b'] = min(255, round($rgb['b'] + (255 - $rgb['b']) * $percent));
        
        return sprintf('#%02x%02x%02x', $rgb['r'], $rgb['g'], $rgb['b']);
    }

    /**
     * Darken a color.
     */
    private function darkenColor(string $hex, float $percent): string
    {
        $rgb = $this->hexToRgb($hex);
        
        $rgb['r'] = max(0, round($rgb['r'] * (1 - $percent)));
        $rgb['g'] = max(0, round($rgb['g'] * (1 - $percent)));
        $rgb['b'] = max(0, round($rgb['b'] * (1 - $percent)));
        
        return sprintf('#%02x%02x%02x', $rgb['r'], $rgb['g'], $rgb['b']);
    }

    /**
     * Find or create a tag by name.
     */
    public static function findOrCreateByName(string $name, User $creator = null): self
    {
        $slug = Str::slug($name);
        
        $tag = static::where('slug', $slug)->first();
        
        if (!$tag) {
            $tag = static::create([
                'name' => $name,
                'slug' => $slug,
                'is_active' => true,
                'created_by' => $creator?->id,
            ]);
        }
        
        return $tag;
    }

    /**
     * Get popular tags.
     */
    public static function popular(int $limit = 10)
    {
        return static::withCount('quizzes')
            ->where('is_active', true)
            ->having('quizzes_count', '>', 0)
            ->orderBy('quizzes_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get trending tags (recently used).
     */
    public static function trending(int $days = 30, int $limit = 10)
    {
        return static::whereHas('quizzes', function ($query) use ($days) {
            $query->where('created_at', '>=', now()->subDays($days));
        })
        ->withCount(['quizzes' => function ($query) use ($days) {
            $query->where('created_at', '>=', now()->subDays($days));
        }])
        ->where('is_active', true)
        ->orderBy('quizzes_count', 'desc')
        ->limit($limit)
        ->get();
    }

    /**
     * Search tags by name.
     */
    public static function search(string $query, int $limit = 20)
    {
        return static::where('name', 'LIKE', "%{$query}%")
            ->where('is_active', true)
            ->withCount('quizzes')
            ->orderBy('quizzes_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Scope: Active tags.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: System tags.
     */
    public function scopeSystem($query)
    {
        return $query->whereNull('created_by');
    }

    /**
     * Scope: User tags.
     */
    public function scopeUser($query)
    {
        return $query->whereNotNull('created_by');
    }

    /**
     * Scope: Popular tags.
     */
    public function scopePopular($query, int $minUsage = 1)
    {
        return $query->withCount('quizzes')
            ->having('quizzes_count', '>=', $minUsage)
            ->orderBy('quizzes_count', 'desc');
    }

    /**
     * Scope: Recent tags.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: Tags by color.
     */
    public function scopeByColor($query, string $color)
    {
        return $query->where('color', $color);
    }

    /**
     * Scope: Tags created by user.
     */
    public function scopeCreatedBy($query, User $user)
    {
        return $query->where('created_by', $user->id);
    }
}