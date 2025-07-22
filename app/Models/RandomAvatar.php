<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RandomAvatar extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'avatar_url',
        'category',
        'style',
        'tags',
        'is_active',
        'metadata'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_active' => 'boolean',
        'metadata' => 'array'
    ];

    /**
     * Avatar categories
     */
    const CATEGORY_ANIMALS = 'animals';
    const CATEGORY_CHARACTERS = 'characters';
    const CATEGORY_ABSTRACT = 'abstract';
    const CATEGORY_ROBOTS = 'robots';
    const CATEGORY_MONSTERS = 'monsters';
    const CATEGORY_FANTASY = 'fantasy';

    /**
     * Avatar styles
     */
    const STYLE_CUTE = 'cute';
    const STYLE_SERIOUS = 'serious';
    const STYLE_FUNNY = 'funny';
    const STYLE_ELEGANT = 'elegant';
    const STYLE_PUNK = 'punk';
    const STYLE_RETRO = 'retro';

    /**
     * Scope for active avatars
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope by style
     */
    public function scopeByStyle($query, string $style)
    {
        return $query->where('style', $style);
    }

    /**
     * Get a random avatar
     */
    public static function getRandom(?string $category = null, ?string $style = null): ?self
    {
        $query = static::active();

        if ($category) {
            $query->byCategory($category);
        }

        if ($style) {
            $query->byStyle($style);
        }

        return $query->inRandomOrder()->first();
    }

    /**
     * Get multiple random avatars
     */
    public static function getRandomMultiple(int $count, ?string $category = null, ?string $style = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = static::active();

        if ($category) {
            $query->byCategory($category);
        }

        if ($style) {
            $query->byStyle($style);
        }

        return $query->inRandomOrder()->limit($count)->get();
    }

    /**
     * Get random avatar for anonymous user
     */
    public static function getForAnonymous(): string
    {
        $avatar = static::getRandom();
        
        if ($avatar) {
            return $avatar->avatar_url;
        }

        // Fallback to generated avatar
        return static::generateFallbackAvatar();
    }

    /**
     * Generate a fallback avatar using external service
     */
    public static function generateFallbackAvatar(): string
    {
        $styles = ['avataaars', 'bottts', 'identicon', 'jdenticon', 'gridy'];
        $style = $styles[array_rand($styles)];
        $seed = uniqid();
        
        return "https://api.dicebear.com/7.x/{$style}/svg?seed={$seed}";
    }

    /**
     * Generate avatar with specific parameters
     */
    public static function generateWithParams(array $params): string
    {
        $style = $params['style'] ?? 'avataaars';
        $seed = $params['seed'] ?? uniqid();
        $background = $params['background'] ?? '';
        
        $url = "https://api.dicebear.com/7.x/{$style}/svg?seed={$seed}";
        
        if ($background) {
            $url .= "&backgroundColor={$background}";
        }

        return $url;
    }

    /**
     * Create default random avatars
     */
    public static function createDefaults(): void
    {
        $avatars = [
            // Animals
            [
                'name' => 'Chat mignon',
                'category' => self::CATEGORY_ANIMALS,
                'style' => self::STYLE_CUTE,
                'tags' => ['chat', 'mignon', 'animal'],
                'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=cat1'
            ],
            [
                'name' => 'Chien joyeux',
                'category' => self::CATEGORY_ANIMALS,
                'style' => self::STYLE_FUNNY,
                'tags' => ['chien', 'joyeux', 'animal'],
                'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=dog1'
            ],
            
            // Characters
            [
                'name' => 'Robot futuriste',
                'category' => self::CATEGORY_ROBOTS,
                'style' => self::STYLE_SERIOUS,
                'tags' => ['robot', 'futuriste', 'technologie'],
                'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=robot1'
            ],
            [
                'name' => 'Robot coloré',
                'category' => self::CATEGORY_ROBOTS,
                'style' => self::STYLE_FUNNY,
                'tags' => ['robot', 'coloré', 'amusant'],
                'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=robot2'
            ],
            
            // Abstract
            [
                'name' => 'Géométrique',
                'category' => self::CATEGORY_ABSTRACT,
                'style' => self::STYLE_ELEGANT,
                'tags' => ['géométrique', 'moderne', 'abstrait'],
                'avatar_url' => 'https://api.dicebear.com/7.x/identicon/svg?seed=geo1'
            ],
            
            // Fantasy
            [
                'name' => 'Magicien',
                'category' => self::CATEGORY_FANTASY,
                'style' => self::STYLE_RETRO,
                'tags' => ['magicien', 'fantasy', 'mystique'],
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard1'
            ]
        ];

        foreach ($avatars as $avatarData) {
            static::updateOrCreate(
                ['name' => $avatarData['name']],
                array_merge($avatarData, ['is_active' => true])
            );
        }
    }

    /**
     * Get available categories
     */
    public static function getCategories(): array
    {
        return [
            self::CATEGORY_ANIMALS => 'Animaux',
            self::CATEGORY_CHARACTERS => 'Personnages',
            self::CATEGORY_ABSTRACT => 'Abstrait',
            self::CATEGORY_ROBOTS => 'Robots',
            self::CATEGORY_MONSTERS => 'Monstres',
            self::CATEGORY_FANTASY => 'Fantasy'
        ];
    }

    /**
     * Get available styles
     */
    public static function getStyles(): array
    {
        return [
            self::STYLE_CUTE => 'Mignon',
            self::STYLE_SERIOUS => 'Sérieux',
            self::STYLE_FUNNY => 'Amusant',
            self::STYLE_ELEGANT => 'Élégant',
            self::STYLE_PUNK => 'Punk',
            self::STYLE_RETRO => 'Rétro'
        ];
    }

    /**
     * Search avatars by tags
     */
    public static function searchByTags(array $tags): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()
            ->where(function ($query) use ($tags) {
                foreach ($tags as $tag) {
                    $query->orWhereJsonContains('tags', $tag);
                }
            })
            ->get();
    }
}