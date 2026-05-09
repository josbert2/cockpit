<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WeeklyReview;
use Carbon\Carbon;
use Illuminate\Http\Request;

class WeeklyController extends Controller
{
    public function summary(Request $request, WeeklyReview $service)
    {
        $year = $request->integer('year') ?: (int) Carbon::now()->isoFormat('GGGG');
        $week = $request->integer('week') ?: (int) Carbon::now()->isoFormat('W');

        return response()->json($service->gather($year, $week));
    }

    public function generate(Request $request, WeeklyReview $service)
    {
        $year = $request->integer('year') ?: (int) Carbon::now()->isoFormat('GGGG');
        $week = $request->integer('week') ?: (int) Carbon::now()->isoFormat('W');

        $data = $service->gather($year, $week);
        $md = $service->generateMarkdown($year, $week, $data);
        $path = $service->writeToVault($year, $week, $md);

        return response()->json([
            'path' => $path,
            'preview' => $md,
            'year' => $year,
            'week' => $week,
        ]);
    }

    public function listExisting(WeeklyReview $service)
    {
        return response()->json(['data' => $service->listExisting()]);
    }
}
