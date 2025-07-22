<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TournamentParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'user_id',
        'joined_at',
        'eliminated_at',
        'final_position',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'eliminated_at' => 'datetime',
        'final_position' => 'integer',
    ];

    /**
     * Get the tournament this participant belongs to.
     */
    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    /**
     * Get the user who is participating.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get matches where this participant is player 1.
     */
    public function matchesAsPlayer1(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'participant1_id');
    }

    /**
     * Get matches where this participant is player 2.
     */
    public function matchesAsPlayer2(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'participant2_id');
    }

    /**
     * Get all matches for this participant.
     */
    public function matches()
    {
        return TournamentMatch::where('participant1_id', $this->id)
            ->orWhere('participant2_id', $this->id);
    }

    /**
     * Get matches won by this participant.
     */
    public function wonMatches()
    {
        return TournamentMatch::where('winner_id', $this->id);
    }

    /**
     * Get matches lost by this participant.
     */
    public function lostMatches()
    {
        return TournamentMatch::where(function ($query) {
            $query->where('participant1_id', $this->id)
                  ->orWhere('participant2_id', $this->id);
        })->where('winner_id', '!=', $this->id)
          ->whereNotNull('winner_id');
    }

    /**
     * Check if participant is eliminated.
     */
    public function isEliminated(): bool
    {
        return !is_null($this->eliminated_at);
    }

    /**
     * Eliminate this participant.
     */
    public function eliminate(): void
    {
        $this->update(['eliminated_at' => now()]);
    }

    /**
     * Get participant statistics.
     */
    public function getStats(): array
    {
        $totalMatches = $this->matches()->count();
        $wonMatches = $this->wonMatches()->count();
        $lostMatches = $this->lostMatches()->count();

        return [
            'total_matches' => $totalMatches,
            'wins' => $wonMatches,
            'losses' => $lostMatches,
            'win_rate' => $totalMatches > 0 ? round(($wonMatches / $totalMatches) * 100, 1) : 0,
            'is_eliminated' => $this->isEliminated(),
            'final_position' => $this->final_position,
        ];
    }

    /**
     * Scope: Active participants (not eliminated).
     */
    public function scopeActive($query)
    {
        return $query->whereNull('eliminated_at');
    }

    /**
     * Scope: Eliminated participants.
     */
    public function scopeEliminated($query)
    {
        return $query->whereNotNull('eliminated_at');
    }
}