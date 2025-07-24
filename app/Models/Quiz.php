<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'code',
        'description',
        'creator_id',
        'category',
        'time_per_question',
        'multiple_answers',
        'status',
        'join_code',
        'unique_link',
        'qr_code_path',
        'allow_anonymous',
        'advanced_settings',
        'base_points',
        'time_penalty',
        'divide_points_multiple',
        'total_sessions',
        'total_participants',
        'average_score',
    ];

    protected $casts = [
        'multiple_answers' => 'boolean',
        'allow_anonymous' => 'boolean',
        'divide_points_multiple' => 'boolean',
        'advanced_settings' => 'array',
        'average_score' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($quiz) {
            if (empty($quiz->code)) {
                $quiz->code = strtoupper(Str::random(8));
            }
            if (empty($quiz->unique_link)) {
                $quiz->unique_link = 'quiz-' . Str::random(12);
            }
            if (empty($quiz->join_code)) {
                $quiz->join_code = strtoupper(Str::random(6));
            }
        });
    }

    /**
     * Get the user who created this quiz.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the questions for this quiz.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order_index');
    }

    /**
     * Get the quiz sessions for this quiz.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(QuizSession::class);
    }

    /**
     * Get the tags associated with this quiz.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /**
     * Get the analytics for this quiz.
     */
    public function analytics(): HasMany
    {
        return $this->hasMany(QuizAnalytic::class);
    }

    /**
     * Get the participants across all sessions.
     */
    public function participants(): HasManyThrough
    {
        return $this->hasManyThrough(Participant::class, QuizSession::class);
    }

    /**
     * Get achievements related to this quiz.
     */
    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'quiz_achievements')
            ->withTimestamps();
    }

    /**
     * Get the scoring configuration for this quiz.
     */
    public function scoringConfiguration()
    {
        return $this->hasOne(ScoringConfiguration::class);
    }

    /**
     * Check if user can edit this quiz.
     */
    public function canEdit(User $user): bool
    {
        return $user->id === $this->creator_id || $user->role === 'admin';
    }

    /**
     * Get the join URL for this quiz.
     */
    public function getJoinUrlAttribute(): string
    {
        return url("/join/{$this->join_code}");
    }

    /**
     * Get the QR code URL.
     */
    public function getQrCodeUrlAttribute(): ?string
    {
        return $this->qr_code_path ? asset($this->qr_code_path) : null;
    }

    /**
     * Scope: Only active quizzes.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Public quizzes.
     */
    public function scopePublic($query)
    {
        return $query->where('status', 'active')
                    ->where('allow_anonymous', true);
    }

    /**
     * Scope: Quizzes by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}