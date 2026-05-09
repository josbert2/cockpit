<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\PropertyDefinition;
use App\Models\PropertyValue;
use App\Models\Task;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function definitions(Request $request)
    {
        $entity = $request->string('entity')->value() ?: 'task';

        $defs = PropertyDefinition::forEntity($entity)->get();
        return response()->json(['data' => $defs]);
    }

    public function storeDefinition(Request $request)
    {
        $data = $request->validate([
            'entity_type' => 'required|in:task,project',
            'name' => 'required|string|max:64',
            'type' => 'required|in:' . implode(',', PropertyDefinition::VALID_TYPES),
            'config' => 'nullable|array',
            'order' => 'nullable|integer',
        ]);

        $def = PropertyDefinition::create($data);
        return response()->json($def, 201);
    }

    public function updateDefinition(Request $request, PropertyDefinition $definition)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:64',
            'type' => 'sometimes|in:' . implode(',', PropertyDefinition::VALID_TYPES),
            'config' => 'nullable|array',
            'order' => 'nullable|integer',
            'archived' => 'sometimes|boolean',
        ]);
        $definition->fill($data)->save();
        return response()->json($definition);
    }

    public function destroyDefinition(PropertyDefinition $definition)
    {
        $definition->delete();
        return response()->noContent();
    }

    public function getValues(Request $request, string $entityType, int $entityId)
    {
        $entity = $this->resolveEntity($entityType, $entityId);
        if (! $entity) {
            return response()->json(['error' => 'not found'], 404);
        }
        return response()->json(['data' => $entity->getProperties()]);
    }

    public function setValue(Request $request, string $entityType, int $entityId)
    {
        $data = $request->validate([
            'definition_id' => 'required|exists:property_definitions,id',
            'value' => 'nullable',
        ]);

        $entity = $this->resolveEntity($entityType, $entityId);
        if (! $entity) {
            return response()->json(['error' => 'not found'], 404);
        }

        $value = $entity->setProperty($data['definition_id'], $data['value'] ?? null);
        return response()->json($value);
    }

    private function resolveEntity(string $type, int $id)
    {
        return match ($type) {
            'task' => Task::find($id),
            'project' => Project::find($id),
            default => null,
        };
    }
}
