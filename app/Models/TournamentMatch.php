<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'round',
        'match_order',
        'participant1_id',
        'participant2_id',
        'winner_id',
        'score1',
        'score2',
        'scheduled_at',
        'started_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'round' => 'integer',
        'match_order' => 'integer',
        'score1' => 'integer',
        'score2' => 'integer',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the tournament this match belongs to.
     */
    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    /**
     * Get the first participant.
     */
    public function participant1(): BelongsTo
    {
        return $this->belongsTo(TournamentParticipant::class, 'participant1_id');
    }

    /**
     * Get the second participant.
     */
    public function participant2(): BelongsTo
    {
        return $this->belongsTo(TournamentParticipant::class, 'participant2_id');
    }

    /**
     * Get the winner participant.
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(TournamentParticipant::class, 'winner_id');
    }

    /**
     * Get the loser participant.
     */
    public function getLoserAttribute(): ?TournamentParticipant
    {
        if (!$this->winner_id) return null;

        $loserId = $this->winner_id === $this->participant1_id 
            ? $this->participant2_id 
            : $this->participant1_id;

        return TournamentParticipant::find($loserId);
    }

    /**
     * Check if match is completed.
     */
    public function isCompleted(): bool
    {
        return !is_null($this->completed_at) && !is_null($this->winner_id);
    }

    /**
     * Check if match is in progress.
     */
    public function isInProgress(): bool
    {
        return !is_null($this->started_at) && is_null($this->completed_at);
    }

    /**
     * Check if match is scheduled.
     */
    public function isScheduled(): bool
    {
        return !is_null($this->scheduled_at) && is_null($this->started_at);
    }

    /**
     * Start the match.
     */
    public function start(): void
    {
        $this->update(['started_at' => now()]);
    }

    /**
     * Complete the match with a winner.
     */
    public function complete(int $winnerId, int $score1 = null, int $score2 = null): void
    {
        if (!in_array($winnerId, [$this->participant1_id, $this->participant2_id])) {
            throw new \InvalidArgumentException('Winner must be one of the participants.');
        }

        $this->update([
            'winner_id' => $winnerId,
            'score1' => $score1,
            'score2' => $score2,
            'completed_at' => now(),
        ]);
    }

    /**
     * Get match duration in minutes.
     */
    public function getDurationAttribute(): ?int
    {
        if ($this->started_at && $this->completed_at) {
            return $this->started_at->diffInMinutes($this->completed_at);
        }
        return null;
    }

    /**
     * Get match status.
     */
    public function getStatusAttribute(): string
    {
        if ($this->isCompleted()) return 'completed';
        if ($this->isInProgress()) return 'in_progress';
        if ($this->isScheduled()) return 'scheduled';
        return 'pending';
    }

    /**
     * Get formatted match name.
     */
    public function getNameAttribute(): string
    {
        $p1Name = $this->participant1->user->name ?? 'TBD';
        $p2Name = $this->participant2->user->name ?? 'TBD';
        
        return "{$p1Name} vs {$p2Name}";
    }

    /**
     * Get formatted score.
     */
    public function getFormattedScoreAttribute(): string
    {
        if (!$this->isCompleted()) return '-';
        
        return "{$this->score1} - {$this->score2}";
    }

    /**
     * Scope: Completed matches.
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at')->whereNotNull('winner_id');
    }

    /**
     * Scope: Pending matches.
     */
    public function scopePending($query)
    {
        return $query->whereNull('completed_at');
    }

    /**
     * Scope: Matches in specific round.
     */
    public function scopeInRound($query, int $round)
    {
        return $query->where('round', $round);
    }

    /**
     * Scope: Matches for specific participant.
     */
    public function scopeForParticipant($query, int $participantId)
    {
        return $query->where('participant1_id', $participantId)
            ->orWhere('participant2_id', $participantId);
    }
}