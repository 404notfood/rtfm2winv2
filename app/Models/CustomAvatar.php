<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomAvatar extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'avatar_data',
        'avatar_url',
        'is_active',
        'avatar_type',
        'style_options',
        'color_scheme',
        'accessories',
        'background',
        'metadata'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'avatar_data' => 'array',
        'style_options' => 'array',
        'color_scheme' => 'array',
        'accessories' => 'array',
        'background' => 'array',
        'metadata' => 'array'
    ];

    /**
     * Avatar types
     */
    const TYPE_UPLOAD = 'upload';
    const TYPE_GENERATED = 'generated';
    const TYPE_EMOJI = 'emoji';
    const TYPE_INITIALS = 'initials';
    const TYPE_IDENTICON = 'identicon';

    /**
     * Get the user that owns this avatar
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Set this avatar as active for the user
     */
    public function setAsActive(): void
    {
        // Deactivate all other avatars for this user
        static::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_active' => false]);

        // Activate this avatar
        $this->update(['is_active' => true]);

        // Update user's avatar_url
        $this->user->update(['avatar_url' => $this->avatar_url]);
    }

    /**
     * Generate avatar URL based on type and data
     */
    public function generateAvatarUrl(): string
    {
        return match($this->avatar_type) {
            self::TYPE_UPLOAD => $this->avatar_url ?? '/img/default-avatar.png',
            self::TYPE_GENERATED => $this->generateAvatarFromData(),
            self::TYPE_EMOJI => $this->generateEmojiAvatar(),
            self::TYPE_INITIALS => $this->generateInitialsAvatar(),
            self::TYPE_IDENTICON => $this->generateIdenticon(),
            default => '/img/default-avatar.png'
        };
    }

    /**
     * Generate avatar from stored data
     */
    private function generateAvatarFromData(): string
    {
        // This would integrate with an avatar generation service
        // For now, return a placeholder
        $hash = md5($this->user_id . serialize($this->avatar_data));
        return "https://api.dicebear.com/7.x/avataaars/svg?seed={$hash}";
    }

    /**
     * Generate emoji-based avatar
     */
    private function generateEmojiAvatar(): string
    {
        $emoji = $this->avatar_data['emoji'] ?? '😀';
        $background = $this->color_scheme['background'] ?? '#3B82F6';
        
        // Generate SVG with emoji
        $svg = $this->createEmojiSvg($emoji, $background);
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    /**
     * Generate initials-based avatar
     */
    private function generateInitialsAvatar(): string
    {
        $initials = $this->avatar_data['initials'] ?? strtoupper(substr($this->user->name, 0, 2));
        $background = $this->color_scheme['background'] ?? '#3B82F6';
        $textColor = $this->color_scheme['text'] ?? '#FFFFFF';
        
        $svg = $this->createInitialsSvg($initials, $background, $textColor);
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    /**
     * Generate identicon
     */
    private function generateIdenticon(): string
    {
        $hash = md5($this->user->email ?? $this->user->name);
        return "https://www.gravatar.com/avatar/{$hash}?d=identicon&s=200";
    }

    /**
     * Create emoji SVG
     */
    private function createEmojiSvg(string $emoji, string $background): string
    {
        return "
        <svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>
            <rect width='200' height='200' fill='{$background}' rx='100'/>
            <text x='100' y='120' font-size='80' text-anchor='middle' dominant-baseline='central'>{$emoji}</text>
        </svg>";
    }

    /**
     * Create initials SVG
     */
    private function createInitialsSvg(string $initials, string $background, string $textColor): string
    {
        return "
        <svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>
            <rect width='200' height='200' fill='{$background}' rx='100'/>
            <text x='100' y='100' font-size='60' font-family='Arial, sans-serif' font-weight='bold' 
                  text-anchor='middle' dominant-baseline='central' fill='{$textColor}'>{$initials}</text>
        </svg>";
    }

    /**
     * Create a custom avatar from configuration
     */
    public static function createFromConfig(User $user, array $config): self
    {
        $avatar = static::create([
            'user_id' => $user->id,
            'name' => $config['name'] ?? 'Mon Avatar',
            'avatar_type' => $config['type'] ?? self::TYPE_GENERATED,
            'avatar_data' => $config['data'] ?? [],
            'style_options' => $config['style_options'] ?? [],
            'color_scheme' => $config['color_scheme'] ?? [],
            'accessories' => $config['accessories'] ?? [],
            'background' => $config['background'] ?? [],
            'metadata' => $config['metadata'] ?? []
        ]);

        // Generate and save the avatar URL
        $avatar->update(['avatar_url' => $avatar->generateAvatarUrl()]);

        return $avatar;
    }

    /**
     * Get default avatar configurations
     */
    public static function getDefaultConfigs(): array
    {
        return [
            [
                'name' => 'Avatar par défaut',
                'type' => self::TYPE_INITIALS,
                'data' => [],
                'color_scheme' => ['background' => '#3B82F6', 'text' => '#FFFFFF']
            ],
            [
                'name' => 'Avatar emoji',
                'type' => self::TYPE_EMOJI,
                'data' => ['emoji' => '😀'],
                'color_scheme' => ['background' => '#10B981']
            ],
            [
                'name' => 'Identicon',
                'type' => self::TYPE_IDENTICON,
                'data' => [],
                'color_scheme' => []
            ]
        ];
    }

    /**
     * Get available color schemes
     */
    public static function getColorSchemes(): array
    {
        return [
            'blue' => ['background' => '#3B82F6', 'text' => '#FFFFFF'],
            'green' => ['background' => '#10B981', 'text' => '#FFFFFF'],
            'purple' => ['background' => '#8B5CF6', 'text' => '#FFFFFF'],
            'pink' => ['background' => '#EC4899', 'text' => '#FFFFFF'],
            'orange' => ['background' => '#F59E0B', 'text' => '#FFFFFF'],
            'red' => ['background' => '#EF4444', 'text' => '#FFFFFF'],
            'gray' => ['background' => '#6B7280', 'text' => '#FFFFFF'],
            'dark' => ['background' => '#1F2937', 'text' => '#FFFFFF']
        ];
    }
}