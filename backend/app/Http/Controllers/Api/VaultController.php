<?php

namespace App\Http\Controllers\Api;

use App\Events\TasksMutated;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\VaultTaskScanner;

class VaultController extends Controller
{
    public function syncTasks(VaultTaskScanner $scanner)
    {
        $start = microtime(true);
        $result = $scanner->scan();
        $elapsed = round(microtime(true) - $start, 2);

        broadcast(new TasksMutated('vault.synced'))->toOthers();

        return response()->json(array_merge($result, ['elapsed_s' => $elapsed]));
    }

    public function syncStatus()
    {
        $home = getenv('HOME') ?: '/home/jos';
        $heartbeatFile = $home . '/.cockpit/vault-watcher-heartbeat';
        $stampFile = $home . '/.cockpit/last-vault-watch';

        $lastSync = Task::where('source', 'vault')->max('vault_synced_at');
        $heartbeatAge = file_exists($heartbeatFile)
            ? time() - filemtime($heartbeatFile)
            : null;
        // Watcher activo si su heartbeat es <30s (poll interval máx 5s ⇒ 30s holgado)
        $watcherActive = $heartbeatAge !== null && $heartbeatAge < 30;
        $lastChangeAge = file_exists($stampFile)
            ? time() - filemtime($stampFile)
            : null;

        return response()->json([
            'last_sync_at' => $lastSync,
            'watcher_active' => $watcherActive,
            'watcher_heartbeat_age_s' => $heartbeatAge,
            'last_change_age_s' => $lastChangeAge,
            'vault_open_count' => Task::open()->where('source', 'vault')->count(),
        ]);
    }
}
