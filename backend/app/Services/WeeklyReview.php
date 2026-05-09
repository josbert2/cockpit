<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;

class WeeklyReview
{
    private string $vaultRoot;

    public function __construct()
    {
        $this->vaultRoot = rtrim(env('VAULT_ROOT', '/home/jos/vault'), '/');
    }

    public function gather(?int $year = null, ?int $week = null): array
    {
        $now = Carbon::now();
        $year ??= (int) $now->isoFormat('GGGG');
        $week ??= (int) $now->isoFormat('W');

        $start = Carbon::now()->setISODate($year, $week)->startOfDay();
        $end = $start->copy()->addDays(7)->subSecond();

        return [
            'year' => $year,
            'week' => $week,
            'start' => $start->toIso8601String(),
            'end' => $end->toIso8601String(),
            'label' => $start->format('d M') . ' – ' . $end->format('d M, Y'),

            'tasks_done' => $this->tasksDone($start, $end),
            'tasks_done_by_project' => $this->tasksDoneByProject($start, $end),
            'tasks_carry_over' => $this->tasksCarryOver($end),
            'tasks_today_pending' => $this->todayTasksPending(),

            'commits_total' => $this->commitsTotal($start, $end),
            'commits_by_repo' => $this->commitsByRepo($start, $end),
            'commits_by_day' => $this->commitsByDay($start, $end),

            'inbox_pending' => $this->inboxPending(),

            'top_tags' => $this->topTags($start, $end),

            'hot_projects' => $this->hotProjects(),
        ];
    }

    public function generateMarkdown(int $year, int $week, array $data = null): string
    {
        $data ??= $this->gather($year, $week);

        $lines = [];
        $lines[] = "---";
        $lines[] = "id: {$year}-W" . str_pad((string)$week, 2, '0', STR_PAD_LEFT);
        $lines[] = "type: weekly";
        $lines[] = "status: done";
        $lines[] = "year: {$year}";
        $lines[] = "week: {$week}";
        $lines[] = "created: " . Carbon::now()->toDateString();
        $lines[] = "tags: [tipo/weekly]";
        $lines[] = "---";
        $lines[] = "";
        $lines[] = "# Weekly Review — Semana {$week} de {$year}";
        $lines[] = "";
        $lines[] = "> {$data['label']}. Generado por cockpit.";
        $lines[] = "";

        $lines[] = "## ✅ Hecho esta semana";
        $lines[] = "";
        $lines[] = "**{$data['tasks_done']} tareas cerradas** · **{$data['commits_total']} commits** total";
        $lines[] = "";

        if (! empty($data['tasks_done_by_project'])) {
            $lines[] = "### Por proyecto";
            $lines[] = "";
            foreach ($data['tasks_done_by_project'] as $row) {
                $name = $row['project']['name'] ?? '—';
                $n = $row['count'];
                $lines[] = "- **{$name}** — {$n} tarea" . ($n === 1 ? '' : 's');
            }
            $lines[] = "";
        }

        if (! empty($data['commits_by_repo'])) {
            $lines[] = "### Commits por repo";
            $lines[] = "";
            foreach ($data['commits_by_repo'] as $row) {
                $lines[] = "- **{$row['name']}** — {$row['count']} commits";
            }
            $lines[] = "";
        }

        $lines[] = "## ⏭ Carry over a la próxima semana";
        $lines[] = "";
        if (empty($data['tasks_carry_over'])) {
            $lines[] = "_Nada quedó pendiente con due esta semana._";
        } else {
            foreach ($data['tasks_carry_over'] as $t) {
                $proj = $t['project']['name'] ?? '—';
                $lines[] = "- [ ] **[{$t['priority']}]** {$t['title']} _(proyecto: {$proj})_";
            }
        }
        $lines[] = "";

        $lines[] = "## 🔥 Proyectos calientes al cierre";
        $lines[] = "";
        if (empty($data['hot_projects'])) {
            $lines[] = "_Ninguno._";
        } else {
            foreach ($data['hot_projects'] as $p) {
                $lines[] = "- **{$p['name']}** — {$p['commits_30d']} commits últimos 30d";
            }
        }
        $lines[] = "";

        $lines[] = "## 📥 Inbox";
        $lines[] = "";
        $count = count($data['inbox_pending']);
        if ($count === 0) {
            $lines[] = "Inbox limpio ✨";
        } else {
            $lines[] = "**{$count} captura" . ($count === 1 ? '' : 's') . " pendiente** de procesar.";
            $lines[] = "";
            foreach ($data['inbox_pending'] as $i) {
                $lines[] = "- " . ($i['frontmatter']['type'] ?? 'note') . " · " . str_replace(['_', '-'], ' ', $i['slug']);
            }
        }
        $lines[] = "";

        if (! empty($data['top_tags'])) {
            $lines[] = "## 🏷 Tags más usados";
            $lines[] = "";
            foreach ($data['top_tags'] as $row) {
                $lines[] = "- `#{$row['tag']}` — {$row['count']}×";
            }
            $lines[] = "";
        }

        $lines[] = "## 🎯 Foco para la semana siguiente";
        $lines[] = "";
        $lines[] = "_Completar a mano cuando hagas el ritual del domingo._";
        $lines[] = "";
        $lines[] = "1. ";
        $lines[] = "2. ";
        $lines[] = "3. ";
        $lines[] = "";

        return implode("\n", $lines);
    }

    public function writeToVault(int $year, int $week, string $content): string
    {
        $weekStr = str_pad((string) $week, 2, '0', STR_PAD_LEFT);
        $dir = "{$this->vaultRoot}/_weekly/{$year}";
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $path = "{$dir}/{$year}-W{$weekStr}.md";
        file_put_contents($path, $content);
        return $path;
    }

    public function listExisting(): array
    {
        $dir = "{$this->vaultRoot}/_weekly";
        if (! is_dir($dir)) return [];

        $rows = [];
        foreach (glob("{$dir}/*/*.md") as $path) {
            if (preg_match('/(\d{4})-W(\d{2})\.md$/', basename($path), $m)) {
                $rows[] = [
                    'year' => (int) $m[1],
                    'week' => (int) $m[2],
                    'path' => str_replace($this->vaultRoot . '/', '', $path),
                    'modified_at' => Carbon::createFromTimestamp(filemtime($path))->toIso8601String(),
                ];
            }
        }
        usort($rows, fn ($a, $b) => $b['year'] === $a['year']
            ? $b['week'] <=> $a['week']
            : $b['year'] <=> $a['year']);

        return $rows;
    }

    private function tasksDone(Carbon $start, Carbon $end): int
    {
        return Task::query()
            ->where('status', Task::STATUS_DONE)
            ->whereBetween('completed_at', [$start, $end])
            ->count();
    }

    private function tasksDoneByProject(Carbon $start, Carbon $end): array
    {
        return Task::query()
            ->where('status', Task::STATUS_DONE)
            ->whereBetween('completed_at', [$start, $end])
            ->whereNotNull('project_id')
            ->with('project:id,name,status')
            ->select('project_id', DB::raw('COUNT(*) as n'))
            ->groupBy('project_id')
            ->orderByDesc('n')
            ->get()
            ->map(fn ($row) => [
                'project' => $row->project,
                'count' => (int) $row->n,
            ])
            ->all();
    }

    private function tasksCarryOver(Carbon $end): array
    {
        return Task::query()
            ->open()
            ->where(function ($q) use ($end) {
                $q->whereNotNull('due_date')
                    ->where('due_date', '<=', $end);
            })
            ->orWhere(function ($q) {
                $q->open()->where('priority', 'urgent');
            })
            ->with('project:id,name,status')
            ->byPriority()
            ->limit(20)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'priority' => $t->priority,
                'due_date' => $t->due_date?->toDateString(),
                'project' => $t->project,
            ])
            ->all();
    }

    private function todayTasksPending(): int
    {
        return Task::query()->today()->where('status', '!=', Task::STATUS_DONE)->count();
    }

    private function commitsTotal(Carbon $start, Carbon $end): int
    {
        $total = 0;
        foreach (Project::where('archived', false)->get() as $p) {
            $total += $this->countCommits($p->path, $start, $end);
        }
        return $total;
    }

    private function commitsByRepo(Carbon $start, Carbon $end): array
    {
        $rows = [];
        foreach (Project::where('archived', false)->get() as $p) {
            $count = $this->countCommits($p->path, $start, $end);
            if ($count > 0) {
                $rows[] = ['name' => $p->name, 'count' => $count];
            }
        }
        usort($rows, fn ($a, $b) => $b['count'] <=> $a['count']);
        return array_slice($rows, 0, 10);
    }

    private function commitsByDay(Carbon $start, Carbon $end): array
    {
        $byDay = [];
        for ($d = $start->copy(); $d <= $end; $d->addDay()) {
            $byDay[$d->toDateString()] = 0;
        }

        foreach (Project::where('archived', false)->get() as $p) {
            $log = $this->git($p->path, [
                'log',
                "--since={$start->toDateString()} 00:00",
                "--until={$end->toDateString()} 23:59",
                '--pretty=format:%cI',
            ]) ?? '';
            foreach (array_filter(explode("\n", $log)) as $iso) {
                $day = substr($iso, 0, 10);
                if (isset($byDay[$day])) {
                    $byDay[$day]++;
                }
            }
        }

        $rows = [];
        foreach ($byDay as $day => $count) {
            $rows[] = ['date' => $day, 'count' => $count];
        }
        return $rows;
    }

    private function countCommits(string $repo, Carbon $start, Carbon $end): int
    {
        if (! is_dir($repo . '/.git')) return 0;
        $output = $this->git($repo, [
            'rev-list', '--count',
            "--since={$start->toDateString()} 00:00",
            "--until={$end->toDateString()} 23:59",
            'HEAD',
        ]);
        return (int) trim($output ?? '0');
    }

    private function inboxPending(): array
    {
        $inboxPath = $this->vaultRoot . '/_inbox';
        if (! is_dir($inboxPath)) return [];
        $rows = [];
        foreach (glob("{$inboxPath}/*.md") as $f) {
            $slug = pathinfo($f, PATHINFO_FILENAME);
            $frontmatter = [];
            $content = file_get_contents($f);
            if (preg_match('/^---\s*\n(.*?)\n---/s', $content, $m)) {
                try {
                    $frontmatter = \Symfony\Component\Yaml\Yaml::parse($m[1]) ?? [];
                } catch (\Throwable) {
                }
            }
            $rows[] = ['slug' => $slug, 'frontmatter' => $frontmatter];
        }
        return $rows;
    }

    private function topTags(Carbon $start, Carbon $end): array
    {
        $counts = [];
        $tasks = Task::query()
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('completed_at', [$start, $end])
                    ->orWhereBetween('updated_at', [$start, $end]);
            })
            ->whereNotNull('tags')
            ->get();

        foreach ($tasks as $t) {
            foreach (($t->tags ?? []) as $tag) {
                $counts[$tag] = ($counts[$tag] ?? 0) + 1;
            }
        }
        arsort($counts);
        $rows = [];
        foreach (array_slice($counts, 0, 10, true) as $tag => $count) {
            $rows[] = ['tag' => $tag, 'count' => $count];
        }
        return $rows;
    }

    private function hotProjects(): array
    {
        return Project::query()
            ->where('archived', false)
            ->where('status', Project::STATUS_HOT)
            ->orderByDesc('commits_30d')
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'name' => $p->name,
                'commits_30d' => $p->commits_30d,
                'last_commit_at' => $p->last_commit_at?->toIso8601String(),
            ])
            ->all();
    }

    private function git(string $repo, array $args): ?string
    {
        $process = new Process(array_merge(['git', '-C', $repo], $args));
        $process->setTimeout(15);
        $process->run();
        return $process->isSuccessful() ? rtrim($process->getOutput(), "\n") : null;
    }
}
