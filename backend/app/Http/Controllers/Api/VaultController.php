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
        $lastSync = Task::where('source', 'vault')->max('vault_synced_at');
        $watcherStamp = (getenv('HOME') ?: '/home/jos') . '/.cockpit/last-vault-watch';
        $watcherActive = file_exists($watcherStamp)
            && (time() - filemtime($watcherStamp)) < 300; // < 5min ⇒ activo

        return response()->json([
            'last_sync_at' => $lastSync,
            'watcher_active' => $watcherActive,
            'watcher_stamp_age_s' => file_exists($watcherStamp)
                ? time() - filemtime($watcherStamp)
                : null,
            'vault_open_count' => Task::open()->where('source', 'vault')->count(),
        ]);
    }
}
