<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    use HasFactory;

    protected $table = 'friendships';

    protected $fillable = [
        'user_id',
        'friend_id',
        'status',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_BLOCKED = 'blocked';
    const STATUS_DECLINED = 'declined';

    /**
     * Get the user who initiated the friendship.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the friend user.
     */
    public function friend(): BelongsTo
    {
        return $this->belongsTo(User::class, 'friend_id');
    }

    /**
     * Check if friendship is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if friendship is accepted.
     */
    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    /**
     * Check if friendship is blocked.
     */
    public function isBlocked(): bool
    {
        return $this->status === self::STATUS_BLOCKED;
    }

    /**
     * Check if friendship is declined.
     */
    public function isDeclined(): bool
    {
        return $this->status === self::STATUS_DECLINED;
    }

    /**
     * Accept the friendship request.
     */
    public function accept(): void
    {
        $this->update(['status' => self::STATUS_ACCEPTED]);
        
        // Create reverse friendship
        static::updateOrCreate([
            'user_id' => $this->friend_id,
            'friend_id' => $this->user_id,
        ], [
            'status' => self::STATUS_ACCEPTED,
        ]);
    }

    /**
     * Decline the friendship request.
     */
    public function decline(): void
    {
        $this->update(['status' => self::STATUS_DECLINED]);
    }

    /**
     * Block the user.
     */
    public function block(): void
    {
        $this->update(['status' => self::STATUS_BLOCKED]);
        
        // Remove reverse friendship if exists
        static::where('user_id', $this->friend_id)
            ->where('friend_id', $this->user_id)
            ->delete();
    }

    /**
     * Get friendship between two users.
     */
    public static function between(User $user1, User $user2)
    {
        return static::where(function ($query) use ($user1, $user2) {
            $query->where('user_id', $user1->id)->where('friend_id', $user2->id);
        })->orWhere(function ($query) use ($user1, $user2) {
            $query->where('user_id', $user2->id)->where('friend_id', $user1->id);
        })->first();
    }

    /**
     * Check if two users are friends.
     */
    public static function areFriends(User $user1, User $user2): bool
    {
        $friendship = static::between($user1, $user2);
        return $friendship && $friendship->isAccepted();
    }

    /**
     * Check if user has blocked another user.
     */
    public static function hasBlocked(User $user, User $blockedUser): bool
    {
        return static::where('user_id', $user->id)
            ->where('friend_id', $blockedUser->id)
            ->where('status', self::STATUS_BLOCKED)
            ->exists();
    }

    /**
     * Get friendship status between two users.
     */
    public static function getStatus(User $user1, User $user2): ?string
    {
        $friendship = static::between($user1, $user2);
        return $friendship ? $friendship->status : null;
    }

    /**
     * Send friend request.
     */
    public static function sendRequest(User $sender, User $receiver): self
    {
        // Check if friendship already exists
        $existing = static::between($sender, $receiver);
        
        if ($existing) {
            if ($existing->isBlocked()) {
                throw new \Exception('Cannot send friend request to blocked user.');
            }
            if ($existing->isPending()) {
                throw new \Exception('Friend request already pending.');
            }
            if ($existing->isAccepted()) {
                throw new \Exception('Users are already friends.');
            }
        }

        $friendship = static::create([
            'user_id' => $sender->id,
            'friend_id' => $receiver->id,
            'status' => self::STATUS_PENDING,
        ]);

        // Create notification
        Notification::friendRequest($receiver, $sender);

        return $friendship;
    }

    /**
     * Remove friendship.
     */
    public static function removeFriendship(User $user1, User $user2): bool
    {
        $deleted = static::where(function ($query) use ($user1, $user2) {
            $query->where('user_id', $user1->id)->where('friend_id', $user2->id);
        })->orWhere(function ($query) use ($user1, $user2) {
            $query->where('user_id', $user2->id)->where('friend_id', $user1->id);
        })->delete();

        return $deleted > 0;
    }

    /**
     * Get mutual friends between two users.
     */
    public static function getMutualFriends(User $user1, User $user2)
    {
        $user1Friends = $user1->friends()->pluck('id');
        $user2Friends = $user2->friends()->pluck('id');
        
        $mutualFriendIds = $user1Friends->intersect($user2Friends);
        
        return User::whereIn('id', $mutualFriendIds)->get();
    }

    /**
     * Scope: Pending friendships.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Accepted friendships.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }

    /**
     * Scope: Blocked friendships.
     */
    public function scopeBlocked($query)
    {
        return $query->where('status', self::STATUS_BLOCKED);
    }

    /**
     * Scope: Recent friendships.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: Friendships for user.
     */
    public function scopeForUser($query, User $user)
    {
        return $query->where('user_id', $user->id)
            ->orWhere('friend_id', $user->id);
    }

    /**
     * Scope: Friend requests received by user.
     */
    public function scopeReceivedBy($query, User $user)
    {
        return $query->where('friend_id', $user->id)
            ->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Friend requests sent by user.
     */
    public function scopeSentBy($query, User $user)
    {
        return $query->where('user_id', $user->id)
            ->where('status', self::STATUS_PENDING);
    }
}