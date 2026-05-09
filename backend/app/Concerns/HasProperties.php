<?php

namespace App\Concerns;

use App\Models\PropertyDefinition;
use App\Models\PropertyValue;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Trait para modelos con properties dinámicas estilo Notion.
 * El entity_type usado en DB es el nombre lowercase del modelo (task, project).
 */
trait HasProperties
{
    public function entityKey(): string
    {
        return strtolower(class_basename($this));
    }

    public function propertyValues(): MorphMany
    {
        return $this->morphMany(PropertyValue::class, 'entity', 'entity_type', 'entity_id', 'id');
    }

    public function getProperties(): array
    {
        $defs = PropertyDefinition::forEntity($this->entityKey())->get();
        $values = PropertyValue::where('entity_type', $this->entityKey())
            ->where('entity_id', $this->id)
            ->get()
            ->keyBy('property_definition_id');

        return $defs->map(function (PropertyDefinition $def) use ($values) {
            $value = $values->get($def->id);
            return [
                'definition' => $def,
                'value' => $value?->value,
            ];
        })->values()->all();
    }

    public function setProperty(int $definitionId, mixed $value): PropertyValue
    {
        return PropertyValue::updateOrCreate(
            [
                'property_definition_id' => $definitionId,
                'entity_id' => $this->id,
            ],
            [
                'entity_type' => $this->entityKey(),
                'value' => $value,
            ]
        );
    }
}
