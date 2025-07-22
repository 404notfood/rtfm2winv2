<?php

namespace App\Events;

use App\Models\User;
use App\Models\Achievement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AchievementEarned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $user;
    public Achievement $achievement;

    public function __construct(User $user, Achievement $achievement)
    {
        $this->user = $user;
        $this->achievement = $achievement;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
            new Channel('achievements'), // Public channel for global notifications
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar_url' => $this->user->avatar_url,
            ],
            'achievement' => [
                'id' => $this->achievement->id,
                'name' => $this->achievement->name,
                'description' => $this->achievement->description,
                'icon' => $this->achievement->icon,
                'rarity' => $this->achievement->rarity,
                'points' => $this->achievement->points,
                'category' => $this->achievement->category,
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'achievement.earned';
    }
}