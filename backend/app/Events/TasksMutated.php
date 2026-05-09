<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TasksMutated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $action,
        public ?int $taskId = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('tasks')];
    }

    public function broadcastAs(): string
    {
        return 'tasks.mutated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'taskId' => $this->taskId,
        ];
    }
}
