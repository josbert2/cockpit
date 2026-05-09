<?php

namespace App\Http\Controllers\Api;

use App\Events\TasksMutated;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\VaultTaskWriter;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query()->with('project:id,name,status');

        if ($request->boolean('today')) {
            $query->today();
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        } else {
            $query->open();
        }

        if ($projectId = $request->integer('project_id')) {
            $query->where('project_id', $projectId);
        }

        if ($source = $request->string('source')->value()) {
            $query->where('source', $source);
        }

        $query->byPriority()->latest('id');

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'priority' => 'nullable|in:urgent,high,med,low',
            'due_date' => 'nullable|date',
            'effort' => 'nullable|in:S,M,L',
            'energy' => 'nullable|in:deep,admin,creative',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $task = Task::create([
            'title' => $data['title'],
            'project_id' => $data['project_id'] ?? null,
            'priority' => $data['priority'] ?? 'med',
            'due_date' => $data['due_date'] ?? null,
            'effort' => $data['effort'] ?? null,
            'energy' => $data['energy'] ?? null,
            'tags' => $data['tags'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        broadcast(new TasksMutated('created', $task->id))->toOthers();

        return response()->json($task->load('project:id,name,status'), 201);
    }

    public function update(Request $request, Task $task, VaultTaskWriter $writer)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'priority' => 'sometimes|in:urgent,high,med,low',
            'status' => 'sometimes|in:todo,doing,done,canceled',
            'due_date' => 'nullable|date',
            'effort' => 'nullable|in:S,M,L',
            'energy' => 'nullable|in:deep,admin,creative',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $statusChanged = isset($data['status']) && $data['status'] !== $task->status;

        if (isset($data['status'])) {
            if ($data['status'] === 'doing' && ! $task->started_at) {
                $task->started_at = now();
            }
            if ($data['status'] === 'done' && ! $task->completed_at) {
                $task->completed_at = now();
                $task->today = false;
                $task->today_slot = null;
            }
            if (in_array($data['status'], ['todo', 'doing'], true) && $task->completed_at) {
                $task->completed_at = null;
            }
        }

        $task->fill($data)->save();

        // Bridge bidireccional: si es vault task y cambió status, escribimos el .md
        if ($statusChanged && $task->source === 'vault') {
            $done = in_array($task->status, [Task::STATUS_DONE, Task::STATUS_CANCELED], true);
            $writer->syncCheckbox($task, $done);
        }

        broadcast(new TasksMutated('updated', $task->id))->toOthers();

        return response()->json($task->load('project:id,name,status'));
    }

    public function destroy(Task $task)
    {
        $taskId = $task->id;
        $task->delete();
        broadcast(new TasksMutated('deleted', $taskId))->toOthers();
        return response()->noContent();
    }

    public function promoteToday(Request $request, Task $task)
    {
        $slot = $request->integer('slot');
        $slot = $slot >= 1 && $slot <= 3 ? $slot : $this->nextFreeSlot();

        if ($slot) {
            Task::where('today_slot', $slot)
                ->where('id', '!=', $task->id)
                ->update(['today' => false, 'today_slot' => null]);
        }

        $task->today = true;
        $task->today_slot = $slot;
        $task->save();

        broadcast(new TasksMutated('today.promoted', $task->id))->toOthers();

        return response()->json($task->load('project:id,name,status'));
    }

    public function removeFromToday(Task $task)
    {
        $task->today = false;
        $task->today_slot = null;
        $task->save();
        broadcast(new TasksMutated('today.removed', $task->id))->toOthers();
        return response()->json($task->load('project:id,name,status'));
    }

    public function complete(Task $task, VaultTaskWriter $writer)
    {
        $task->status = Task::STATUS_DONE;
        $task->completed_at = now();
        $task->today = false;
        $task->today_slot = null;
        $task->save();

        // Bridge bidireccional
        if ($task->source === 'vault') {
            $writer->syncCheckbox($task, true);
        }

        broadcast(new TasksMutated('completed', $task->id))->toOthers();
        return response()->json($task->load('project:id,name,status'));
    }

    private function nextFreeSlot(): ?int
    {
        $taken = Task::whereNotNull('today_slot')->pluck('today_slot')->all();
        foreach ([1, 2, 3] as $candidate) {
            if (! in_array($candidate, $taken, true)) {
                return $candidate;
            }
        }
        return null;
    }
}
