<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'answer_text',
        'is_correct',
        'explanation',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    /**
     * Get the question that owns this answer.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get participant answers that selected this answer.
     */
    public function participantAnswers(): HasMany
    {
        return $this->hasMany(ParticipantAnswer::class);
    }

    /**
     * Get the selection count for this answer.
     */
    public function getSelectionCount(): int
    {
        return $this->participantAnswers()->count();
    }

    /**
     * Get the selection percentage for this answer within its question.
     */
    public function getSelectionPercentage(): float
    {
        $totalSelections = $this->question
            ->participantAnswers()
            ->count();
            
        if ($totalSelections === 0) {
            return 0;
        }
        
        return ($this->getSelectionCount() / $totalSelections) * 100;
    }

    /**
     * Scope: Only correct answers.
     */
    public function scopeCorrect($query)
    {
        return $query->where('is_correct', true);
    }

    /**
     * Scope: Only incorrect answers.
     */
    public function scopeIncorrect($query)
    {
        return $query->where('is_correct', false);
    }
}