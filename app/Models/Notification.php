<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
        'expires_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user this notification belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Mark notification as unread.
     */
    public function markAsUnread(): void
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Check if notification is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at < now();
    }

    /**
     * Get notification icon based on type.
     */
    public function getIconAttribute(): string
    {
        return match($this->type) {
            'friend_request' => 'user-plus',
            'friend_request_accepted' => 'user-check',
            'quiz_invitation' => 'brain',
            'quiz_result' => 'trophy',
            'achievement' => 'award',
            'tournament_invitation' => 'sword',
            'tournament_update' => 'trophy',
            'battle_royale_invite' => 'crosshair',
            'system' => 'settings',
            'warning' => 'alert-triangle',
            'error' => 'x-circle',
            'success' => 'check-circle',
            default => 'bell'
        };
    }

    /**
     * Get notification color based on type.
     */
    public function getColorAttribute(): string
    {
        return match($this->type) {
            'friend_request', 'friend_request_accepted' => 'blue',
            'quiz_invitation', 'quiz_result' => 'purple',
            'achievement' => 'yellow',
            'tournament_invitation', 'tournament_update' => 'green',
            'battle_royale_invite' => 'red',
            'success' => 'green',
            'warning' => 'yellow',
            'error' => 'red',
            'system' => 'gray',
            default => 'blue'
        };
    }

    /**
     * Get formatted time ago.
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Create a friend request notification.
     */
    public static function friendRequest(User $recipient, User $sender): self
    {
        return static::create([
            'user_id' => $recipient->id,
            'type' => 'friend_request',
            'title' => 'Nouvelle demande d\'ami',
            'message' => "{$sender->name} vous a envoyé une demande d'ami.",
            'data' => [
                'sender_id' => $sender->id,
                'sender_name' => $sender->name,
                'sender_avatar' => $sender->avatar,
                'action_url' => route('friends.index'),
            ],
        ]);
    }

    /**
     * Create a quiz invitation notification.
     */
    public static function quizInvitation(User $recipient, User $inviter, $quizSession): self
    {
        return static::create([
            'user_id' => $recipient->id,
            'type' => 'quiz_invitation',
            'title' => 'Invitation à un quiz',
            'message' => "{$inviter->name} vous invite à participer au quiz \"{$quizSession->quiz->title}\".",
            'data' => [
                'inviter_id' => $inviter->id,
                'inviter_name' => $inviter->name,
                'quiz_session_id' => $quizSession->id,
                'quiz_title' => $quizSession->quiz->title,
                'quiz_code' => $quizSession->code,
                'action_url' => route('quiz.join', $quizSession->code),
            ],
            'expires_at' => now()->addHours(2), // Expire après 2h
        ]);
    }

    /**
     * Create an achievement notification.
     */
    public static function achievement(User $recipient, $badge): self
    {
        return static::create([
            'user_id' => $recipient->id,
            'type' => 'achievement',
            'title' => 'Nouveau badge obtenu !',
            'message' => "Félicitations ! Vous avez obtenu le badge \"{$badge->name}\".",
            'data' => [
                'badge_id' => $badge->id,
                'badge_name' => $badge->name,
                'badge_description' => $badge->description,
                'badge_icon' => $badge->icon,
                'action_url' => route('achievements.index'),
            ],
        ]);
    }

    /**
     * Create a tournament invitation notification.
     */
    public static function tournamentInvitation(User $recipient, User $inviter, Tournament $tournament): self
    {
        return static::create([
            'user_id' => $recipient->id,
            'type' => 'tournament_invitation',
            'title' => 'Invitation à un tournoi',
            'message' => "{$inviter->name} vous invite au tournoi \"{$tournament->title}\".",
            'data' => [
                'inviter_id' => $inviter->id,
                'inviter_name' => $inviter->name,
                'tournament_id' => $tournament->id,
                'tournament_title' => $tournament->title,
                'action_url' => route('tournaments.show', $tournament),
            ],
            'expires_at' => $tournament->registration_end,
        ]);
    }

    /**
     * Create a system notification.
     */
    public static function system(User $recipient, string $title, string $message, array $data = []): self
    {
        return static::create([
            'user_id' => $recipient->id,
            'type' => 'system',
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Scope: Unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope: Read notifications.
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope: Recent notifications.
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: Non-expired notifications.
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Scope: Notifications by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Clean up expired notifications.
     */
    public static function cleanupExpired(): int
    {
        return static::where('expires_at', '<', now())->delete();
    }
}