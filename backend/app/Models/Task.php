<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    public const STATUS_TODO = 'todo';
    public const STATUS_DOING = 'doing';
    public const STATUS_DONE = 'done';
    public const STATUS_CANCELED = 'canceled';

    public const PRIORITY_URGENT = 'urgent';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_MED = 'med';
    public const PRIORITY_LOW = 'low';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'due_date' => 'date',
            'today' => 'boolean',
            'today_slot' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function scopeOpen(Builder $query): void
    {
        $query->whereIn('status', [self::STATUS_TODO, self::STATUS_DOING]);
    }

    public function scopeToday(Builder $query): void
    {
        $query->where('today', true)->orderBy('today_slot');
    }

    public function scopeByPriority(Builder $query): void
    {
        $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'med', 'low')");
    }
}
