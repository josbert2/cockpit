<?php

namespace App\Models;

use App\Concerns\HasProperties;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasProperties;

    public const STATUS_HOT = 'HOT';
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_PAUSED = 'PAUSED';
    public const STATUS_IDLE = 'IDLE';
    public const STATUS_STALE = 'STALE';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'last_commit_at' => 'datetime',
            'last_scanned_at' => 'datetime',
            'commits_30d' => 'integer',
            'days_since_commit' => 'integer',
            'pinned' => 'boolean',
            'archived' => 'boolean',
        ];
    }

    public function scopeNotArchived(Builder $query): void
    {
        $query->where('archived', false);
    }

    public function scopeStatus(Builder $query, string $status): void
    {
        $query->where('status', strtoupper($status));
    }

    public function scopeHot(Builder $query): void
    {
        $query->where('status', self::STATUS_HOT);
    }
}
