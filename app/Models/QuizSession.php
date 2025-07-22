<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class QuizSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'presenter_id',
        'code',
        'status',
        'current_question_index',
        'current_question_id',
        'session_type',
        'max_participants',
        'join_url',
        'qr_code_path',
        'settings',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'current_question_index' => 'integer',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($session) {
            if (empty($session->code)) {
                $session->code = strtoupper(Str::random(6));
            }
        });
    }

    /**
     * Get the quiz for this session.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the presenter (user) for this session.
     */
    public function presenter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'presenter_id');
    }

    /**
     * Get the participants in this session.
     */
    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    /**
     * Get the leaderboard entries for this session.
     */
    public function leaderboardEntries(): HasMany
    {
        return $this->hasMany(LeaderboardEntry::class);
    }

    /**
     * Get active participants.
     */
    public function activeParticipants(): HasMany
    {
        return $this->hasMany(Participant::class)->where('is_active', true);
    }

    /**
     * Get the current question for this session.
     */
    public function getCurrentQuestion()
    {
        // First try to get by current_question_id if set
        if ($this->current_question_id) {
            return Question::find($this->current_question_id);
        }
        
        // Otherwise get by index
        return $this->quiz
            ->questions()
            ->orderBy('order_index')
            ->skip($this->current_question_index ?? 0)
            ->first();
    }

    /**
     * Get participant for a specific user in this session.
     */
    public function getParticipantForUser(?User $user): ?Participant
    {
        if (!$user) {
            return null;
        }
        
        return $this->participants()->where('user_id', $user->id)->first();
    }

    /**
     * Check if the session can start.
     */
    public function canStart(): bool
    {
        return $this->status === 'waiting' && 
               $this->participants()->count() > 0 &&
               $this->quiz->questions()->count() > 0;
    }

    /**
     * Start the session with validations.
     */
    public function startSession(): bool
    {
        if (!$this->canStart()) {
            return false;
        }
        
        $this->update([
            'status' => 'active',
            'started_at' => now(),
            'current_question_index' => 0,
        ]);
        
        // Set current question ID to first question
        $firstQuestion = $this->quiz->questions()->orderBy('order_index')->first();
        if ($firstQuestion) {
            $this->update(['current_question_id' => $firstQuestion->id]);
        }
        
        return true;
    }

    /**
     * End the session properly.
     */
    public function endSession(): void
    {
        $this->update([
            'status' => 'completed',
            'ended_at' => now(),
        ]);
        
        // Final leaderboard update
        $this->calculateScores();
    }

    /**
     * Calculate and update all participant scores.
     */
    public function calculateScores(): void
    {
        foreach ($this->participants as $participant) {
            $totalScore = $participant->answers()
                ->sum('score');
            
            $participant->update(['score' => $totalScore]);
        }
        
        // Update leaderboard positions
        $this->updateLeaderboard();
    }

    /**
     * Move to the next question.
     */
    public function nextQuestion(): bool
    {
        $totalQuestions = $this->quiz->questions()->count();
        
        if ($this->current_question_index < $totalQuestions - 1) {
            $this->increment('current_question_index');
            return true;
        }
        
        return false; // No more questions
    }

    /**
     * Check if session is finished.
     */
    public function isFinished(): bool
    {
        return $this->status === 'finished' || 
               $this->current_question_index >= $this->quiz->questions()->count();
    }

    /**
     * Start the session.
     */
    public function start(): void
    {
        $this->update([
            'status' => 'active',
            'started_at' => now(),
            'current_question_index' => 0,
        ]);
    }

    /**
     * End the session.
     */
    public function end(): void
    {
        $this->update([
            'status' => 'finished',
            'ended_at' => now(),
        ]);
    }

    /**
     * Get session duration in minutes.
     */
    public function getDurationAttribute(): ?int
    {
        if (!$this->started_at) {
            return null;
        }
        
        $endTime = $this->ended_at ?: now();
        return $this->started_at->diffInMinutes($endTime);
    }

    /**
     * Get the join URL for this session.
     */
    public function getJoinUrlAttribute(): string
    {
        return url("/join/{$this->code}");
    }

    /**
     * Get leaderboard for this session.
     */
    public function getLeaderboard(int $limit = null)
    {
        $query = $this->leaderboardEntries()
            ->with('participant')
            ->orderBy('current_position');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query->get();
    }

    /**
     * Update leaderboard positions.
     */
    public function updateLeaderboard(): void
    {
        $entries = $this->leaderboardEntries()
            ->orderBy('total_score', 'desc')
            ->get();
            
        $position = 1;
        foreach ($entries as $entry) {
            $entry->update([
                'previous_position' => $entry->current_position,
                'current_position' => $position++,
            ]);
        }
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
}