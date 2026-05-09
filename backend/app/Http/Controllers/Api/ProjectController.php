<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\ProjectDeepDive;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::query()->notArchived();

        if ($status = $request->string('status')->value()) {
            $query->status($status);
        }

        if ($stack = $request->string('stack')->value()) {
            $query->where('stack', 'like', "%{$stack}%");
        }

        if ($search = $request->string('q')->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('path', 'like', "%{$search}%");
            });
        }

        $sort = $request->string('sort', 'days_since_commit')->value();
        $direction = $request->boolean('desc') ? 'desc' : 'asc';
        $query->orderBy($sort, $direction);

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function show(Project $project)
    {
        return response()->json($project);
    }

    public function deepDive(Project $project, ProjectDeepDive $service)
    {
        return response()->json($service->gather($project));
    }
}
