<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BattleRoyaleSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'max_players',
        'elimination_interval',
        'status',
        'current_round',
        'started_at',
        'ended_at',
        'creator_id',
        'quiz_pool',
    ];

    protected $casts = [
        'max_players' => 'integer',
        'elimination_interval' => 'integer',
        'current_round' => 'integer',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'quiz_pool' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($session) {
            $session->current_round = 1;
        });
    }

    /**
     * Get the creator of this Battle Royale session.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'creator_id');
    }

    /**
     * Get the participants in this Battle Royale session.
     */
    public function participants(): HasMany
    {
        return $this->hasMany(BattleRoyaleParticipant::class, 'session_id');
    }

    /**
     * Get active (non-eliminated) participants.
     */
    public function activeParticipants(): HasMany
    {
        return $this->hasMany(BattleRoyaleParticipant::class, 'session_id')
            ->whereNull('eliminated_at');
    }

    /**
     * Get eliminated participants.
     */
    public function eliminatedParticipants(): HasMany
    {
        return $this->hasMany(BattleRoyaleParticipant::class, 'session_id')
            ->whereNotNull('eliminated_at');
    }

    /**
     * Check if session is full.
     */
    public function isFull(): bool
    {
        return $this->participants()->count() >= $this->max_players;
    }

    /**
     * Check if session can start.
     */
    public function canStart(): bool
    {
        return $this->status === 'waiting' && 
               $this->participants()->count() >= 4; // Minimum players
    }

    /**
     * Start the Battle Royale session.
     */
    public function start(): void
    {
        $this->update([
            'status' => 'active',
            'started_at' => now(),
        ]);
    }

    /**
     * End the Battle Royale session.
     */
    public function end(): void
    {
        $this->update([
            'status' => 'finished',
            'ended_at' => now(),
        ]);
    }

    /**
     * Get the winner of the Battle Royale.
     */
    public function getWinner()
    {
        if ($this->status !== 'finished') {
            return null;
        }

        return $this->activeParticipants()
            ->orderBy('score', 'desc')
            ->first();
    }

    /**
     * Process elimination round.
     */
    public function processElimination(int $eliminationCount = null): array
    {
        $activeParticipants = $this->activeParticipants()
            ->orderBy('score', 'asc')
            ->get();

        if ($eliminationCount === null) {
            // Calculate elimination count based on percentage
            $eliminationCount = max(1, floor($activeParticipants->count() * 0.25));
        }

        $eliminated = [];
        
        for ($i = 0; $i < $eliminationCount && $i < $activeParticipants->count(); $i++) {
            $participant = $activeParticipants[$i];
            $participant->eliminate($this->current_round);
            $eliminated[] = $participant;
        }

        // Check if we have a winner
        $remaining = $this->activeParticipants()->count();
        if ($remaining <= 1) {
            $this->end();
        } else {
            $this->increment('current_round');
        }

        return $eliminated;
    }

    /**
     * Get elimination countdown.
     */
    public function getEliminationCountdown(): int
    {
        if ($this->status !== 'active') {
            return 0;
        }

        $roundStartTime = $this->started_at->addSeconds(
            ($this->current_round - 1) * $this->elimination_interval
        );

        $nextEliminationTime = $roundStartTime->addSeconds($this->elimination_interval);
        
        return max(0, $nextEliminationTime->diffInSeconds(now()));
    }

    /**
     * Get session statistics.
     */
    public function getStats(): array
    {
        return [
            'total_participants' => $this->participants()->count(),
            'active_participants' => $this->activeParticipants()->count(),
            'eliminated_participants' => $this->eliminatedParticipants()->count(),
            'current_round' => $this->current_round,
            'elimination_countdown' => $this->getEliminationCountdown(),
            'duration_minutes' => $this->started_at ? 
                $this->started_at->diffInMinutes($this->ended_at ?? now()) : 0,
        ];
    }

    /**
     * Get final ranking.
     */
    public function getFinalRanking()
    {
        return $this->participants()
            ->orderByRaw('eliminated_at IS NULL DESC') // Active participants first
            ->orderBy('score', 'desc')
            ->orderBy('eliminated_at', 'desc') // Later eliminations rank higher
            ->get()
            ->map(function ($participant, $index) {
                $participant->final_position = $index + 1;
                return $participant;
            });
    }

    /**
     * Generate session code.
     */
    public function generateCode(): string
    {
        return 'BR-' . strtoupper(Str::random(6));
    }

    /**
     * Get join URL.
     */
    public function getJoinUrlAttribute(): string
    {
        return url("/battle-royale/join/{$this->id}");
    }

    /**
     * Scope: Active sessions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Waiting sessions.
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    /**
     * Scope: Finished sessions.
     */
    public function scopeFinished($query)
    {
        return $query->where('status', 'finished');
    }

    /**
     * Scope: Sessions with available slots.
     */
    public function scopeJoinable($query)
    {
        return $query->where('status', 'waiting')
            ->whereRaw('(SELECT COUNT(*) FROM battle_royale_participants WHERE session_id = battle_royale_sessions.id) < max_players');
    }
}