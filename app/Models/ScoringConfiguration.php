<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScoringConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'base_points',
        'time_bonus_enabled',
        'time_bonus_multiplier',
        'streak_bonus_enabled',
        'streak_bonus_points',
        'penalty_enabled',
        'penalty_points',
        'perfect_score_bonus',
        'difficulty_multiplier',
        'custom_rules',
        'is_active'
    ];

    protected $casts = [
        'time_bonus_enabled' => 'boolean',
        'streak_bonus_enabled' => 'boolean',
        'penalty_enabled' => 'boolean',
        'is_active' => 'boolean',
        'time_bonus_multiplier' => 'decimal:2',
        'difficulty_multiplier' => 'decimal:2',
        'custom_rules' => 'array'
    ];

    /**
     * Get the quiz that owns this scoring configuration
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Calculate score for an answer
     */
    public function calculateScore(array $params): int
    {
        $baseScore = $params['is_correct'] ? $this->base_points : 0;
        
        if (!$params['is_correct'] || $baseScore === 0) {
            return $this->penalty_enabled ? -$this->penalty_points : 0;
        }

        $finalScore = $baseScore;

        // Apply time bonus
        if ($this->time_bonus_enabled && isset($params['response_time'], $params['time_limit'])) {
            $timeRatio = $params['response_time'] / $params['time_limit'];
            $timeBonus = $baseScore * $this->time_bonus_multiplier * (1 - $timeRatio);
            $finalScore += max(0, $timeBonus);
        }

        // Apply streak bonus
        if ($this->streak_bonus_enabled && isset($params['current_streak'])) {
            $streakBonus = $this->streak_bonus_points * $params['current_streak'];
            $finalScore += $streakBonus;
        }

        // Apply difficulty multiplier
        if ($this->difficulty_multiplier > 0) {
            $finalScore *= $this->difficulty_multiplier;
        }

        // Apply custom rules
        if (!empty($this->custom_rules)) {
            $finalScore = $this->applyCustomRules($finalScore, $params);
        }

        return max(0, (int) round($finalScore));
    }

    /**
     * Apply custom scoring rules
     */
    private function applyCustomRules(float $score, array $params): float
    {
        foreach ($this->custom_rules as $rule) {
            switch ($rule['type']) {
                case 'multiplier':
                    if ($this->evaluateCondition($rule['condition'], $params)) {
                        $score *= $rule['value'];
                    }
                    break;
                case 'bonus':
                    if ($this->evaluateCondition($rule['condition'], $params)) {
                        $score += $rule['value'];
                    }
                    break;
                case 'penalty':
                    if ($this->evaluateCondition($rule['condition'], $params)) {
                        $score -= $rule['value'];
                    }
                    break;
            }
        }

        return $score;
    }

    /**
     * Evaluate a custom rule condition
     */
    private function evaluateCondition(array $condition, array $params): bool
    {
        $field = $condition['field'];
        $operator = $condition['operator'];
        $value = $condition['value'];

        if (!isset($params[$field])) {
            return false;
        }

        return match($operator) {
            '=' => $params[$field] == $value,
            '>' => $params[$field] > $value,
            '<' => $params[$field] < $value,
            '>=' => $params[$field] >= $value,
            '<=' => $params[$field] <= $value,
            '!=' => $params[$field] != $value,
            default => false
        };
    }

    /**
     * Get default scoring configuration
     */
    public static function getDefault(): array
    {
        return [
            'base_points' => 100,
            'time_bonus_enabled' => true,
            'time_bonus_multiplier' => 0.5,
            'streak_bonus_enabled' => true,
            'streak_bonus_points' => 10,
            'penalty_enabled' => false,
            'penalty_points' => 0,
            'perfect_score_bonus' => 100,
            'difficulty_multiplier' => 1.0,
            'custom_rules' => [],
            'is_active' => true
        ];
    }
}