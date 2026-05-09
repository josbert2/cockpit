<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Symfony\Component\Yaml\Yaml;

class VaultInbox
{
    private string $vaultRoot;
    private string $inboxPath;

    public function __construct()
    {
        $this->vaultRoot = rtrim(env('VAULT_ROOT', '/home/jos/vault'), '/');
        $this->inboxPath = $this->vaultRoot . '/_inbox';
    }

    public function list(): array
    {
        if (! is_dir($this->inboxPath)) {
            return [];
        }

        $files = glob($this->inboxPath . '/*.md');
        sort($files);

        return array_map(fn ($f) => $this->parse($f), $files);
    }

    public function find(string $slug): ?array
    {
        $path = $this->pathForSlug($slug);
        return file_exists($path) ? $this->parse($path) : null;
    }

    public function moveToProject(string $slug, string $project, string $type = 'note'): array
    {
        $src = $this->pathForSlug($slug);
        if (! file_exists($src)) {
            throw new \RuntimeException("Captura no encontrada: {$slug}");
        }

        $folder = match ($type) {
            'decision' => 'decisions',
            'feature' => 'features',
            'bug' => 'bugs',
            default => '',
        };

        $projectDir = $this->vaultRoot . '/01-Projects/' . $project;
        if (! is_dir($projectDir)) {
            throw new \RuntimeException("Proyecto no existe: {$project}");
        }

        $dstDir = $folder ? "{$projectDir}/{$folder}" : $projectDir;
        if (! is_dir($dstDir)) {
            mkdir($dstDir, 0755, true);
        }

        $dst = "{$dstDir}/{$slug}.md";
        $this->writeUpdated($src, $dst, [
            'type' => $type,
            'project' => $project,
            'updated' => Carbon::now()->toDateString(),
        ]);

        return ['from' => $src, 'to' => $dst];
    }

    public function archive(string $slug): array
    {
        $src = $this->pathForSlug($slug);
        if (! file_exists($src)) {
            throw new \RuntimeException("Captura no encontrada: {$slug}");
        }

        $year = date('Y');
        $dstDir = $this->vaultRoot . "/04-Archive/{$year}/_inbox";
        if (! is_dir($dstDir)) {
            mkdir($dstDir, 0755, true);
        }

        $dst = "{$dstDir}/{$slug}.md";
        $this->writeUpdated($src, $dst, [
            'status' => 'archived',
            'updated' => Carbon::now()->toDateString(),
        ]);

        return ['from' => $src, 'to' => $dst];
    }

    public function delete(string $slug): void
    {
        $src = $this->pathForSlug($slug);
        if (! file_exists($src)) {
            throw new \RuntimeException("Captura no encontrada: {$slug}");
        }
        unlink($src);
    }

    private function parse(string $path): array
    {
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
            'slug' => pathinfo($path, PATHINFO_FILENAME),
            'path' => $path,
            'frontmatter' => $frontmatter,
            'body' => $body,
            'word_count' => str_word_count(strip_tags($body)),
            'modified_at' => Carbon::createFromTimestamp(filemtime($path))->toIso8601String(),
        ];
    }

    private function pathForSlug(string $slug): string
    {
        $clean = preg_replace('/[^a-zA-Z0-9_-]/', '', $slug);
        return "{$this->inboxPath}/{$clean}.md";
    }

    private function writeUpdated(string $src, string $dst, array $newFields): void
    {
        $content = file_get_contents($src);
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

        $frontmatter = array_merge($frontmatter, $newFields);
        $newContent = "---\n" . Yaml::dump($frontmatter, 4, 2) . "---\n\n" . $body;

        file_put_contents($dst, $newContent);
        if ($src !== $dst) {
            unlink($src);
        }
    }
}
