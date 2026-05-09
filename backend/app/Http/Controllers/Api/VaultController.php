<?php

namespace App\Http\Controllers\Api;

use App\Events\TasksMutated;
use App\Http\Controllers\Controller;
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
}
