<?php

namespace App\Console\Commands;

use App\Services\RepoScanner;
use Illuminate\Console\Command;

class CockpitScan extends Command
{
    protected $signature = 'cockpit:scan {--root= : Override the scan root}';

    protected $description = 'Escanea ~/root/ (o el override) y upserts proyectos en la DB.';

    public function handle(RepoScanner $scanner): int
    {
        if ($override = $this->option('root')) {
            $scanner->roots = [$override];
        }

        $this->info('Escaneando ' . implode(', ', $scanner->roots) . '...');
        $start = microtime(true);
        $result = $scanner->scan();
        $elapsed = round(microtime(true) - $start, 2);

        $this->info(sprintf(
            '✓ %d proyectos upserted en %ss',
            $result['count'],
            $elapsed
        ));

        return self::SUCCESS;
    }
}
