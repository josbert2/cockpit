<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class ProjectsMutated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public string $action) {}

    public function broadcastOn(): array
    {
        return [new Channel('projects')];
    }

    public function broadcastAs(): string
    {
        return 'projects.mutated';
    }

    public function broadcastWith(): array
    {
        return ['action' => $this->action];
    }
}
