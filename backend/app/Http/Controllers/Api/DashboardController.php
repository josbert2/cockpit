<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Services\VaultInbox;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(VaultInbox $inbox)
    {
        $statusCounts = Project::query()
            ->where('archived', false)
            ->select('status', DB::raw('COUNT(*) as n'))
            ->groupBy('status')
            ->pluck('n', 'status')
            ->all();

        $tasksOpen = Task::open()->count();
        $tasksManualOpen = Task::open()->where('source', 'manual')->count();
        $tasksVaultOpen = Task::open()->where('source', 'vault')->count();
        $tasksToday = Task::query()->today()->count();
        $tasksDoneThisWeek = Task::query()
            ->where('status', Task::STATUS_DONE)
            ->where('completed_at', '>=', now()->subDays(7))
            ->count();

        $todayTasks = Task::query()
            ->with('project:id,name,status')
            ->today()
            ->byPriority()
            ->get();

        $hotProjects = Project::query()
            ->where('archived', false)
            ->where('status', Project::STATUS_HOT)
            ->orderBy('days_since_commit')
            ->limit(5)
            ->get();

        $inboxItems = collect($inbox->list())->take(3)->values();

        $tasksByProject = Task::query()
            ->open()
            ->whereNotNull('project_id')
            ->with('project:id,name,status')
            ->select('project_id', DB::raw('COUNT(*) as n'))
            ->groupBy('project_id')
            ->orderByDesc('n')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'project' => $row->project,
                'count' => (int) $row->n,
            ]);

        return response()->json([
            'project_status_counts' => [
                'HOT' => $statusCounts['HOT'] ?? 0,
                'ACTIVE' => $statusCounts['ACTIVE'] ?? 0,
                'PAUSED' => $statusCounts['PAUSED'] ?? 0,
                'IDLE' => $statusCounts['IDLE'] ?? 0,
                'STALE' => $statusCounts['STALE'] ?? 0,
            ],
            'tasks_open' => $tasksOpen,
            'tasks_manual_open' => $tasksManualOpen,
            'tasks_vault_open' => $tasksVaultOpen,
            'tasks_today_count' => $tasksToday,
            'tasks_done_this_week' => $tasksDoneThisWeek,
            'inbox_pending_count' => count($inbox->list()),
            'today_tasks' => $todayTasks,
            'hot_projects' => $hotProjects,
            'inbox_preview' => $inboxItems,
            'tasks_by_project' => $tasksByProject,
        ]);
    }
}
