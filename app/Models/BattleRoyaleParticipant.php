<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BattleRoyaleParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'battle_royale_session_id',
        'user_id',
        'pseudo',
        'score',
        'is_eliminated',
        'eliminated_at',
        'eliminated_round',
        'position',
        'streak',
        'health',
        'power_ups',
        'is_online',
        'avatar_url',
        'metadata'
    ];

    protected $casts = [
        'is_eliminated' => 'boolean',
        'is_online' => 'boolean',
        'eliminated_at' => 'datetime',
        'power_ups' => 'array',
        'metadata' => 'array'
    ];

    /**
     * Get the battle royale session this participant belongs to
     */
    public function battleRoyaleSession(): BelongsTo
    {
        return $this->belongsTo(BattleRoyaleSession::class);
    }

    /**
     * Get the user this participant represents (if not guest)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active (non-eliminated) participants
     */
    public function scopeActive($query)
    {
        return $query->where('is_eliminated', false);
    }

    /**
     * Scope for eliminated participants
     */
    public function scopeEliminated($query)
    {
        return $query->where('is_eliminated', true);
    }

    /**
     * Scope for online participants
     */
    public function scopeOnline($query)
    {
        return $query->where('is_online', true);
    }

    /**
     * Eliminate this participant
     */
    public function eliminate(int $round): void
    {
        $this->update([
            'is_eliminated' => true,
            'eliminated_at' => now(),
            'eliminated_round' => $round,
            'position' => $this->calculateFinalPosition()
        ]);
    }

    /**
     * Calculate final position based on elimination order
     */
    private function calculateFinalPosition(): int
    {
        // Count how many participants are still active + 1
        return $this->battleRoyaleSession
            ->participants()
            ->active()
            ->count() + 1;
    }

    /**
     * Add points and update streak
     */
    public function addScore(int $points, bool $isCorrect = true): void
    {
        $this->increment('score', $points);
        
        if ($isCorrect) {
            $this->increment('streak');
        } else {
            $this->update(['streak' => 0]);
        }
    }

    /**
     * Use a power-up
     */
    public function usePowerUp(string $powerUpType): bool
    {
        $powerUps = $this->power_ups ?? [];
        
        if (!isset($powerUps[$powerUpType]) || $powerUps[$powerUpType] <= 0) {
            return false;
        }

        $powerUps[$powerUpType]--;
        $this->update(['power_ups' => $powerUps]);
        
        return true;
    }

    /**
     * Add a power-up
     */
    public function addPowerUp(string $powerUpType, int $quantity = 1): void
    {
        $powerUps = $this->power_ups ?? [];
        $powerUps[$powerUpType] = ($powerUps[$powerUpType] ?? 0) + $quantity;
        $this->update(['power_ups' => $powerUps]);
    }

    /**
     * Check if participant has a specific power-up
     */
    public function hasPowerUp(string $powerUpType): bool
    {
        $powerUps = $this->power_ups ?? [];
        return isset($powerUps[$powerUpType]) && $powerUps[$powerUpType] > 0;
    }

    /**
     * Reduce health (if health system is enabled)
     */
    public function takeDamage(int $damage): bool
    {
        if ($this->health <= 0) {
            return false; // Already eliminated
        }

        $newHealth = max(0, $this->health - $damage);
        $this->update(['health' => $newHealth]);

        // Auto-eliminate if health reaches 0
        if ($newHealth <= 0) {
            $this->eliminate($this->battleRoyaleSession->current_round);
            return true; // Eliminated
        }

        return false; // Still alive
    }

    /**
     * Heal participant
     */
    public function heal(int $amount): void
    {
        $maxHealth = 100; // Could be configurable
        $newHealth = min($maxHealth, $this->health + $amount);
        $this->update(['health' => $newHealth]);
    }

    /**
     * Update online status
     */
    public function updateOnlineStatus(bool $isOnline): void
    {
        $this->update([
            'is_online' => $isOnline,
            'metadata' => array_merge($this->metadata ?? [], [
                'last_seen' => now()->toISOString()
            ])
        ]);
    }

    /**
     * Get participant stats for display
     */
    public function getStatsAttribute(): array
    {
        return [
            'score' => $this->score,
            'streak' => $this->streak,
            'health' => $this->health,
            'power_ups_count' => array_sum($this->power_ups ?? []),
            'is_eliminated' => $this->is_eliminated,
            'position' => $this->position,
            'eliminated_round' => $this->eliminated_round
        ];
    }

    /**
     * Get leaderboard data for this participant
     */
    public function getLeaderboardData(): array
    {
        return [
            'id' => $this->id,
            'pseudo' => $this->pseudo,
            'score' => $this->score,
            'streak' => $this->streak,
            'health' => $this->health,
            'is_eliminated' => $this->is_eliminated,
            'position' => $this->position,
            'avatar_url' => $this->avatar_url,
            'is_current_user' => false, // This should be set by the controller
            'power_ups' => $this->power_ups ?? []
        ];
    }
}