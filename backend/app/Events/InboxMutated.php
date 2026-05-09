<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class InboxMutated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $action,
        public ?string $slug = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('inbox')];
    }

    public function broadcastAs(): string
    {
        return 'inbox.mutated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'slug' => $this->slug,
        ];
    }
}
