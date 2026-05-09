<?php

namespace App\Services;

use App\Models\Task;

class VaultTaskWriter
{
    private string $vaultRoot;

    public function __construct()
    {
        $this->vaultRoot = rtrim(env('VAULT_ROOT', '/home/jos/vault'), '/');
    }

    /**
     * Update el checkbox state en el archivo del vault correspondiente.
     * Devuelve true si tocó un archivo, false si no era vault task o no encontró la línea.
     */
    public function syncCheckbox(Task $task, bool $done): bool
    {
        if ($task->source !== 'vault' || ! $task->vault_path || ! $task->vault_line) {
            return false;
        }

        $absolutePath = $this->vaultRoot . '/' . ltrim($task->vault_path, '/');
        if (! file_exists($absolutePath) || ! is_writable($absolutePath)) {
            return false;
        }

        $lines = file($absolutePath, FILE_IGNORE_NEW_LINES);
        if ($lines === false) return false;

        $idx = $task->vault_line - 1;
        if (! isset($lines[$idx])) return false;

        $line = $lines[$idx];

        // Solo modificamos si la línea sigue siendo un checkbox
        if (! preg_match('/^(\s*[-*+]\s*\[)\s*([xX ])\s*(\].*)$/u', $line, $m)) {
            return false;
        }

        $currentDone = strtolower(trim($m[2])) === 'x';
        if ($currentDone === $done) {
            return true; // ya está en el estado deseado
        }

        $newCheckbox = $done ? 'x' : ' ';
        $lines[$idx] = $m[1] . $newCheckbox . $m[3];

        $newContent = implode("\n", $lines);
        // Preservar trailing newline si lo había
        $original = file_get_contents($absolutePath);
        if ($original !== false && str_ends_with($original, "\n")) {
            $newContent .= "\n";
        }

        return file_put_contents($absolutePath, $newContent) !== false;
    }
}
