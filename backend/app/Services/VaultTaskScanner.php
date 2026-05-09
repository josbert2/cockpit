<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Symfony\Component\Yaml\Yaml;

class VaultTaskScanner
{
    private string $vaultRoot;

    /**
     * Carpetas a NO escanear.
     */
    private array $excluded = [
        '_inbox',
        '_templates',
        '04-Archive',
        '.obsidian',
        '.git',
        'graphify-out',
        'node_modules',
    ];

    /**
     * Mínimo de caracteres para que una TODO sea considerada válida.
     */
    private int $minLength = 4;

    public function __construct()
    {
        $this->vaultRoot = rtrim(env('VAULT_ROOT', '/home/jos/vault'), '/');
    }

    public function scan(): array
    {
        $upserted = 0;
        $created = 0;
        $updated = 0;
        $hashesFound = [];

        foreach ($this->iterateMarkdownFiles() as $file) {
            $relativePath = ltrim(str_replace($this->vaultRoot, '', $file), '/');
            $project = $this->inferProject($file);

            foreach ($this->extractTodos($file) as $todo) {
                $hashesFound[] = $todo['hash'];
                $task = Task::where('vault_hash', $todo['hash'])->first();

                $payload = [
                    'source' => 'vault',
                    'title' => $todo['text'],
                    'project_id' => $project?->id,
                    'priority' => $todo['priority'],
                    'tags' => $todo['tags'],
                    'status' => $todo['done'] ? Task::STATUS_DONE : Task::STATUS_TODO,
                    'completed_at' => $todo['done'] ? now() : null,
                    'vault_path' => $relativePath,
                    'vault_line' => $todo['line'],
                    'vault_hash' => $todo['hash'],
                    'vault_synced_at' => now(),
                ];

                if ($task) {
                    $task->fill($payload)->save();
                    $updated++;
                } else {
                    Task::create($payload);
                    $created++;
                }
                $upserted++;
            }
        }

        $deleted = $this->markMissingAsCanceled($hashesFound);

        return compact('upserted', 'created', 'updated', 'deleted');
    }

    private function iterateMarkdownFiles(): iterable
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveCallbackFilterIterator(
                new \RecursiveDirectoryIterator($this->vaultRoot, \FilesystemIterator::SKIP_DOTS),
                function ($current, $key, $iterator) {
                    $name = $current->getFilename();
                    if (in_array($name, $this->excluded, true)) {
                        return false;
                    }
                    return true;
                }
            )
        );

        foreach ($iterator as $file) {
            if (! $file->isFile()) continue;
            if (! str_ends_with($file->getFilename(), '.md')) continue;
            yield $file->getPathname();
        }
    }

    private function extractTodos(string $file): array
    {
        $content = file_get_contents($file);
        if ($content === false) return [];

        // Strip frontmatter
        $body = $content;
        if (preg_match('/^---\s*\n.*?\n---\s*\n(.*)$/s', $content, $m)) {
            $body = $m[1];
        }

        $todos = [];
        $lines = explode("\n", $content);
        foreach ($lines as $i => $line) {
            if (! preg_match('/^\s*[-*+]\s*\[\s*([xX ])\s*\]\s*(.*)$/u', $line, $m)) {
                continue;
            }
            $done = strtolower(trim($m[1])) === 'x';
            $text = trim($m[2]);
            if (mb_strlen($text) < $this->minLength) continue;

            $tags = [];
            if (preg_match_all('/#([\p{L}0-9_\/-]+)/u', $text, $tagMatches)) {
                $tags = array_values(array_unique($tagMatches[1] ?? []));
            }

            $priority = $this->inferPriority($tags, $text);

            $hash = hash('sha256', "{$file}:" . ($i + 1) . ":{$text}");

            $todos[] = [
                'line' => $i + 1,
                'text' => mb_substr($text, 0, 255),
                'done' => $done,
                'tags' => $tags,
                'priority' => $priority,
                'hash' => $hash,
            ];
        }

        return $todos;
    }

    private function inferProject(string $file): ?Project
    {
        // Si el archivo está en 01-Projects/<x>/..., el proyecto es <x>
        $rel = str_replace($this->vaultRoot, '', $file);
        if (preg_match('#^/01-Projects/([^/]+)/#', $rel, $m)) {
            return Project::where('name', $m[1])->first();
        }
        return null;
    }

    private function inferPriority(array $tags, string $text): string
    {
        $lower = strtolower($text);
        if (in_array('urgente', $tags, true) || str_contains($lower, '!urgent')) return Task::PRIORITY_URGENT;
        if (in_array('hoy', $tags, true)) return Task::PRIORITY_HIGH;
        if (in_array('despues', $tags, true) || in_array('después', $tags, true)) return Task::PRIORITY_LOW;
        return Task::PRIORITY_MED;
    }

    private function markMissingAsCanceled(array $foundHashes): int
    {
        if (empty($foundHashes)) {
            return 0;
        }

        return Task::where('source', 'vault')
            ->whereNotIn('vault_hash', $foundHashes)
            ->whereNotIn('status', [Task::STATUS_CANCELED])
            ->update([
                'status' => Task::STATUS_CANCELED,
                'today' => false,
                'today_slot' => null,
            ]);
    }
}
