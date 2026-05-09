<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Symfony\Component\Process\Process;
use Symfony\Component\Yaml\Yaml;

class ProjectDeepDive
{
    private string $vaultRoot;

    public function __construct()
    {
        $this->vaultRoot = rtrim(env('VAULT_ROOT', '/home/jos/vault'), '/');
    }

    public function gather(Project $project): array
    {
        return [
            'project' => $project,
            'tasks' => $this->tasks($project),
            'task_stats' => $this->taskStats($project),
            'git' => $this->gitInfo($project->path),
            'activity' => $this->activityHeatmap($project->path),
            'vault' => $this->vaultContext($project->name),
        ];
    }

    private function tasks(Project $project): array
    {
        return Task::query()
            ->with('project:id,name,status')
            ->where('project_id', $project->id)
            ->orderByRaw("FIELD(status, 'doing', 'todo', 'done', 'canceled')")
            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'med', 'low')")
            ->limit(50)
            ->get()
            ->all();
    }

    private function taskStats(Project $project): array
    {
        $base = Task::where('project_id', $project->id);
        return [
            'total' => (clone $base)->count(),
            'open' => (clone $base)->open()->count(),
            'done' => (clone $base)->where('status', 'done')->count(),
            'today' => (clone $base)->where('today', true)->count(),
            'manual' => (clone $base)->where('source', 'manual')->count(),
            'vault' => (clone $base)->where('source', 'vault')->count(),
        ];
    }

    private function gitInfo(string $repoPath): array
    {
        if (! is_dir($repoPath . '/.git')) {
            return ['available' => false];
        }

        $commits = $this->git($repoPath, [
            'log', '-20', '--pretty=format:%H%x09%an%x09%cI%x09%s',
        ]) ?? '';

        $parsed = [];
        foreach (array_filter(explode("\n", $commits)) as $line) {
            $parts = explode("\t", $line, 4);
            if (count($parts) < 4) continue;
            $parsed[] = [
                'sha' => $parts[0],
                'short_sha' => substr($parts[0], 0, 7),
                'author' => $parts[1],
                'date' => $parts[2],
                'message' => $parts[3],
            ];
        }

        $branch = trim($this->git($repoPath, ['branch', '--show-current']) ?? '');
        $contributors = trim($this->git($repoPath, [
            'shortlog', '-sn', '--no-merges', '-30',
        ]) ?? '');

        return [
            'available' => true,
            'branch' => $branch ?: null,
            'commits' => $parsed,
            'contributors' => $this->parseContributors($contributors),
        ];
    }

    private function activityHeatmap(string $repoPath): array
    {
        if (! is_dir($repoPath . '/.git')) {
            return [];
        }

        $log = $this->git($repoPath, [
            'log', '--since=60 days ago', '--pretty=format:%cI',
        ]) ?? '';

        $byDay = [];
        foreach (array_filter(explode("\n", $log)) as $iso) {
            $day = substr($iso, 0, 10);
            $byDay[$day] = ($byDay[$day] ?? 0) + 1;
        }

        $days = [];
        for ($i = 59; $i >= 0; $i--) {
            $day = Carbon::now()->subDays($i)->toDateString();
            $days[] = [
                'date' => $day,
                'count' => $byDay[$day] ?? 0,
            ];
        }

        return $days;
    }

    private function parseContributors(string $output): array
    {
        $rows = [];
        foreach (array_filter(explode("\n", $output)) as $line) {
            if (preg_match('/^\s*(\d+)\s+(.+?)\s*$/', $line, $m)) {
                $rows[] = [
                    'commits' => (int) $m[1],
                    'name' => $m[2],
                ];
            }
        }
        return $rows;
    }

    private function vaultContext(string $projectName): array
    {
        $projectDir = $this->vaultRoot . '/01-Projects/' . $projectName;
        if (! is_dir($projectDir)) {
            return ['available' => false];
        }

        $readme = $this->readFile($projectDir . '/README.md');
        $claudeMd = $this->readFile($projectDir . '/CLAUDE.md');

        $folders = ['decisions', 'features', 'bugs', 'glossary', 'people', 'research'];
        $sections = [];
        foreach ($folders as $folder) {
            $path = "{$projectDir}/{$folder}";
            if (is_dir($path)) {
                $files = $this->listMdFiles($path);
                if (! empty($files)) {
                    $sections[$folder] = $files;
                }
            }
        }

        return [
            'available' => true,
            'project_dir' => $projectDir,
            'readme' => $readme,
            'claude_md' => $claudeMd,
            'sections' => $sections,
        ];
    }

    private function readFile(string $path): ?array
    {
        if (! file_exists($path)) return null;
        $content = file_get_contents($path);
        $frontmatter = [];
        $body = $content;
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $content, $m)) {
            try {
                $frontmatter = Yaml::parse($m[1]) ?? [];
            } catch (\Throwable) {
                $frontmatter = [];
            }
            $body = ltrim($m[2]);
        }
        return [
            'path' => $path,
            'frontmatter' => $frontmatter,
            'body' => $body,
        ];
    }

    private function listMdFiles(string $dir): array
    {
        $files = glob($dir . '/*.md');
        sort($files);
        $rows = [];
        foreach ($files as $f) {
            $title = pathinfo($f, PATHINFO_FILENAME);
            $content = file_get_contents($f);
            $frontmatter = [];
            $body = $content;
            if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $content, $m)) {
                try {
                    $frontmatter = Yaml::parse($m[1]) ?? [];
                } catch (\Throwable) {
                    $frontmatter = [];
                }
                $body = ltrim($m[2]);
            }
            // Title del primer h1, si no del filename
            if (preg_match('/^#\s+(.+)$/m', $body, $m)) {
                $title = trim($m[1]);
            }
            $rows[] = [
                'filename' => basename($f),
                'title' => $title,
                'frontmatter' => $frontmatter,
                'preview' => mb_substr(strip_tags($body), 0, 160),
                'modified_at' => Carbon::createFromTimestamp(filemtime($f))->toIso8601String(),
            ];
        }
        return $rows;
    }

    private function git(string $repo, array $args): ?string
    {
        $process = new Process(array_merge(['git', '-C', $repo], $args));
        $process->setTimeout(15);
        $process->run();
        return $process->isSuccessful() ? rtrim($process->getOutput(), "\n") : null;
    }
}
