<?php

namespace App\Http\Controllers\Api;

use App\Events\InboxMutated;
use App\Http\Controllers\Controller;
use App\Services\VaultInbox;
use Illuminate\Http\Request;

class InboxController extends Controller
{
    public function __construct(private VaultInbox $inbox) {}

    public function index()
    {
        return response()->json(['data' => $this->inbox->list()]);
    }

    public function show(string $slug)
    {
        $item = $this->inbox->find($slug);
        if (! $item) {
            return response()->json(['error' => 'not found'], 404);
        }
        return response()->json($item);
    }

    public function move(Request $request, string $slug)
    {
        $data = $request->validate([
            'project' => 'required|string',
            'type' => 'nullable|in:note,decision,feature,bug,idea',
        ]);

        $result = $this->inbox->moveToProject($slug, $data['project'], $data['type'] ?? 'note');
        broadcast(new InboxMutated('moved', $slug))->toOthers();
        return response()->json($result);
    }

    public function archive(string $slug)
    {
        $result = $this->inbox->archive($slug);
        broadcast(new InboxMutated('archived', $slug))->toOthers();
        return response()->json($result);
    }

    public function destroy(string $slug)
    {
        $this->inbox->delete($slug);
        broadcast(new InboxMutated('deleted', $slug))->toOthers();
        return response()->noContent();
    }
}
