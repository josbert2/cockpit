<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PropertyDefinition extends Model
{
    public const TYPE_TEXT = 'text';
    public const TYPE_NUMBER = 'number';
    public const TYPE_CHECKBOX = 'checkbox';
    public const TYPE_SELECT = 'select';
    public const TYPE_MULTI_SELECT = 'multi_select';
    public const TYPE_DATE = 'date';
    public const TYPE_URL = 'url';
    public const TYPE_STATUS = 'status';

    public const VALID_TYPES = [
        self::TYPE_TEXT,
        self::TYPE_NUMBER,
        self::TYPE_CHECKBOX,
        self::TYPE_SELECT,
        self::TYPE_MULTI_SELECT,
        self::TYPE_DATE,
        self::TYPE_URL,
        self::TYPE_STATUS,
    ];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'archived' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function values(): HasMany
    {
        return $this->hasMany(PropertyValue::class);
    }

    public function scopeForEntity(Builder $q, string $type): void
    {
        $q->where('entity_type', $type)->where('archived', false)->orderBy('order')->orderBy('id');
    }
}
