<?php

namespace App\Events;

use App\Models\CustomNotification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NotificationCreated implements ShouldBroadcast
{
    public $notification;

    public function __construct(CustomNotification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn()
    {
        return new Channel('user.' . $this->notification->user_id);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->notification->id,
            'message' => $this->notification->message,
            'type' => $this->notification->type,
            'data' => $this->notification->data,
            'is_read' => $this->notification->is_read,
            'created_at' => $this->notification->created_at->toIso8601String(),
        ];
    }
}
