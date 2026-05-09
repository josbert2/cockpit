<?php

namespace App\Services;

use App\Models\Project;
use Carbon\Carbon;
use Symfony\Component\Process\Process;

class RepoScanner
{
    /**
     * Roots a escanear. Configurable a futuro vía .env.
     */
    public array $roots = [
        '/home/jos/root',
    ];

    public int $maxDepth = 4;

    public function scan(): array
    {
        $found = [];
        $upserted = 0;

        foreach ($this->roots as $root) {
            if (! is_dir($root)) {
                continue;
            }
            foreach ($this->findGitRepos($root) as $repo) {
                $meta = $this->collectMeta($repo);
                if ($meta === null) {
                    continue;
                }
                Project::updateOrCreate(
                    ['path' => $meta['path']],
                    array_merge($meta, ['last_scanned_at' => now()])
                );
                $found[] = $meta['path'];
                $upserted++;
            }
        }

        return [
            'count' => $upserted,
            'paths' => $found,
        ];
    }

    private function findGitRepos(string $root): iterable
    {
        $process = new Process([
            'find',
            $root,
            '-maxdepth', (string) $this->maxDepth,
            '-name', '.git',
            '-type', 'd',
        ]);
        $process->setTimeout(60);
        $process->run();

        $output = trim($process->getOutput());
        if ($output === '') {
            return [];
        }

        foreach (explode("\n", $output) as $gitDir) {
            yield dirname($gitDir);
        }
    }

    private function collectMeta(string $repo): ?array
    {
        $lastIso = $this->git($repo, ['log', '-1', '--format=%cI']);
        if ($lastIso === null || $lastIso === '') {
            return null;
        }

        $lastMsg = $this->git($repo, ['log', '-1', '--format=%s']) ?? '';
        $lastMsg = mb_substr($lastMsg, 0, 200);

        $log30d = $this->git($repo, [
            'log', '--since=30 days ago', '--oneline',
        ]) ?? '';
        $commits30d = $log30d === '' ? 0 : substr_count($log30d, "\n") + 1;

        $lastCommitAt = Carbon::parse($lastIso);
        $days = (int) $lastCommitAt->diffInDays(now());

        return [
            'path' => $repo,
            'name' => basename($repo),
            'status' => $this->inferStatus($days),
            'last_commit_at' => $lastCommitAt,
            'last_commit_msg' => $lastMsg,
            'commits_30d' => $commits30d,
            'stack' => $this->inferStack($repo),
            'days_since_commit' => $days,
        ];
    }

    private function git(string $repo, array $args): ?string
    {
        $process = new Process(array_merge(['git', '-C', $repo], $args));
        $process->setTimeout(15);
        $process->run();
        if (! $process->isSuccessful()) {
            return null;
        }
        return rtrim($process->getOutput(), "\n");
    }

    private function inferStatus(int $days): string
    {
        return match (true) {
            $days <= 7 => Project::STATUS_HOT,
            $days <= 30 => Project::STATUS_ACTIVE,
            $days <= 90 => Project::STATUS_PAUSED,
            $days <= 365 => Project::STATUS_IDLE,
            default => Project::STATUS_STALE,
        };
    }

    private function inferStack(string $repo): ?string
    {
        $stack = [];
        $checks = [
            'composer.json' => 'php',
            'artisan' => 'laravel',
            'symfony.lock' => 'symfony',
            'package.json' => 'node',
            'next.config.js' => 'next',
            'next.config.mjs' => 'next',
            'next.config.ts' => 'next',
            'astro.config.mjs' => 'astro',
            'vite.config.js' => 'vite',
            'vite.config.ts' => 'vite',
            'Cargo.toml' => 'rust',
            'go.mod' => 'go',
            'pubspec.yaml' => 'flutter',
            'requirements.txt' => 'py',
            'pyproject.toml' => 'py',
        ];
        foreach ($checks as $file => $tag) {
            if (is_file($repo . '/' . $file)) {
                if (! in_array($tag, $stack, true)) {
                    $stack[] = $tag;
                }
            }
        }
        if (is_dir($repo . '/src-tauri')) {
            $stack[] = 'tauri';
        }
        return $stack ? implode(' ', $stack) : null;
    }
}
