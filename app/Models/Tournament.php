<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'quiz_id',
        'creator_id',
        'type',
        'status',
        'max_participants',
        'current_round',
        'registration_start',
        'registration_end',
        'tournament_start',
        'started_at',
        'ended_at',
        'is_public',
        'entry_fee',
        'prize_pool',
        'rules',
    ];

    protected $casts = [
        'max_participants' => 'integer',
        'current_round' => 'integer',
        'registration_start' => 'datetime',
        'registration_end' => 'datetime',
        'tournament_start' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'is_public' => 'boolean',
        'entry_fee' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($tournament) {
            $tournament->status = 'upcoming';
            $tournament->current_round = 0;
        });
    }

    /**
     * Get the creator of this tournament.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the quiz used for this tournament.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the participants in this tournament.
     */
    public function participants(): HasMany
    {
        return $this->hasMany(TournamentParticipant::class);
    }

    /**
     * Get the matches in this tournament.
     */
    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class);
    }

    /**
     * Check if tournament is full.
     */
    public function isFull(): bool
    {
        return $this->participants()->count() >= $this->max_participants;
    }

    /**
     * Check if user can join tournament.
     */
    public function canJoin(User $user): bool
    {
        return $this->status === 'upcoming' &&
               $this->registration_end > now() &&
               !$this->isFull() &&
               !$this->participants()->where('user_id', $user->id)->exists();
    }

    /**
     * Check if tournament can start.
     */
    public function canStart(): bool
    {
        return $this->status === 'upcoming' &&
               $this->participants()->count() >= 4 &&
               $this->tournament_start <= now();
    }

    /**
     * Get final ranking of participants.
     */
    public function getFinalRanking()
    {
        return $this->participants()
            ->with('user')
            ->withCount([
                'wonMatches as wins',
                'lostMatches as losses'
            ])
            ->get()
            ->sortByDesc('wins')
            ->values();
    }

    /**
     * Generate join URL.
     */
    public function getJoinUrlAttribute(): string
    {
        return url("/tournaments/{$this->id}/join");
    }

    /**
     * Get tournament duration.
     */
    public function getDurationAttribute(): ?int
    {
        if ($this->started_at && $this->ended_at) {
            return $this->started_at->diffInMinutes($this->ended_at);
        }
        return null;
    }

    /**
     * Get tournament progress percentage.
     */
    public function getProgressAttribute(): float
    {
        if ($this->status === 'upcoming') return 0;
        if ($this->status === 'completed') return 100;

        $totalRounds = $this->calculateTotalRounds();
        if ($totalRounds === 0) return 0;

        return min(100, ($this->current_round / $totalRounds) * 100);
    }

    /**
     * Calculate total rounds needed for tournament type.
     */
    private function calculateTotalRounds(): int
    {
        $participantCount = $this->participants()->count();
        
        if ($this->type === 'single_elimination') {
            return $participantCount > 0 ? ceil(log($participantCount, 2)) : 0;
        } elseif ($this->type === 'double_elimination') {
            return $participantCount > 0 ? ceil(log($participantCount, 2)) * 2 : 0;
        } elseif ($this->type === 'round_robin') {
            return 1; // Un seul "round" avec tous les matches
        }

        return 0;
    }

    /**
     * Scope: Active tournaments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Upcoming tournaments.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    /**
     * Scope: Completed tournaments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Public tournaments.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope: Joinable tournaments.
     */
    public function scopeJoinable($query)
    {
        return $query->where('status', 'upcoming')
            ->where('registration_end', '>', now())
            ->whereRaw('(SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = tournaments.id) < max_participants');
    }
}