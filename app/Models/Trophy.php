<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trophy extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'type',
        'tier',
        'requirements',
        'slug',
        'is_active',
        'rarity',
        'category',
        'points'
    ];

    protected $casts = [
        'requirements' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Users who have earned this trophy.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_trophies')
                    ->withTimestamps();
    }
}