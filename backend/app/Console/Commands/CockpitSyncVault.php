<?php

namespace App\Console\Commands;

use App\Events\TasksMutated;
use App\Services\VaultTaskScanner;
use Illuminate\Console\Command;

class CockpitSyncVault extends Command
{
    protected $signature = 'cockpit:sync-vault';

    protected $description = 'Escanea el vault buscando "- [ ]" y los upserts como tasks (source=vault).';

    public function handle(VaultTaskScanner $scanner): int
    {
        $start = microtime(true);
        $result = $scanner->scan();
        $elapsed = round(microtime(true) - $start, 2);

        $this->info(sprintf(
            '✓ %d tasks vault sync (%d nuevas, %d actualizadas, %d canceladas) en %ss',
            $result['upserted'],
            $result['created'],
            $result['updated'],
            $result['deleted'],
            $elapsed
        ));

        broadcast(new TasksMutated('vault.synced'))->toOthers();

        return self::SUCCESS;
    }
}
