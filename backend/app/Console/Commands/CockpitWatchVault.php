<?php

namespace App\Console\Commands;

use App\Events\TasksMutated;
use App\Services\VaultTaskScanner;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class CockpitWatchVault extends Command
{
    protected $signature = 'cockpit:watch-vault
                            {--interval=5 : Segundos entre polls}';

    protected $description = 'Watcher del vault. Polea filesystem cada N segundos y dispara sync cuando ve cambios en .md.';

    private string $vaultRoot;
    private string $stampFile;       // se actualiza solo cuando hay cambios (usado por find -newer)
    private string $heartbeatFile;   // se actualiza CADA poll (proof of life para syncStatus)

    public function handle(VaultTaskScanner $scanner): int
    {
        $this->vaultRoot = rtrim(env('VAULT_ROOT', '/home/jos/vault'), '/');
        $stampDir = (getenv('HOME') ?: '/home/jos') . '/.cockpit';
        if (! is_dir($stampDir)) mkdir($stampDir, 0755, true);
        $this->stampFile = $stampDir . '/last-vault-watch';
        $this->heartbeatFile = $stampDir . '/vault-watcher-heartbeat';

        if (! file_exists($this->stampFile)) touch($this->stampFile);
        touch($this->heartbeatFile);

        $interval = max(2, (int) $this->option('interval'));

        $this->info("👀 Watching {$this->vaultRoot} cada {$interval}s · Ctrl+C para parar");

        // Graceful shutdown
        $running = true;
        if (function_exists('pcntl_signal')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGTERM, function () use (&$running) { $running = false; });
            pcntl_signal(SIGINT, function () use (&$running) { $running = false; });
        }

        while ($running) {
            $changed = $this->detectChangedFiles();

            if (! empty($changed)) {
                $count = count($changed);
                $first = array_slice($changed, 0, 3);
                $sample = implode(', ', array_map(fn ($p) => str_replace($this->vaultRoot . '/', '', $p), $first));
                $this->line(date('[H:i:s] ') . "→ {$count} archivo(s) cambiado(s) · {$sample}" . ($count > 3 ? '...' : ''));

                $start = microtime(true);
                $result = $scanner->scan();
                $elapsed = round(microtime(true) - $start, 2);

                $this->line(sprintf(
                    '   ✓ sync %d tasks (%d nuevas, %d actualizadas, %d canceladas) en %ss',
                    $result['upserted'], $result['created'], $result['updated'], $result['deleted'], $elapsed
                ));

                broadcast(new TasksMutated('vault.synced'))->toOthers();

                touch($this->stampFile);
            }

            // Heartbeat siempre — proof of life para que syncStatus muestre "watcher activo"
            touch($this->heartbeatFile);

            sleep($interval);
        }

        $this->info("\n👋 Watcher detenido limpio");
        return self::SUCCESS;
    }

    private function detectChangedFiles(): array
    {
        $process = new Process([
            'find',
            $this->vaultRoot,
            '-name', '*.md',
            '-newer', $this->stampFile,
            '-type', 'f',
        ]);
        $process->setTimeout(30);
        $process->run();

        if (! $process->isSuccessful()) return [];

        $output = trim($process->getOutput());
        if ($output === '') return [];

        return array_filter(explode("\n", $output));
    }
}
