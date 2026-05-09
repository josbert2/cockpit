<?php

use App\Http\Controllers\Api\InboxController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project}', [ProjectController::class, 'show']);

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::patch('/tasks/{task}', [TaskController::class, 'update']);
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
Route::post('/tasks/{task}/today', [TaskController::class, 'promoteToday']);
Route::delete('/tasks/{task}/today', [TaskController::class, 'removeFromToday']);
Route::post('/tasks/{task}/complete', [TaskController::class, 'complete']);

Route::get('/inbox', [InboxController::class, 'index']);
Route::get('/inbox/{slug}', [InboxController::class, 'show']);
Route::post('/inbox/{slug}/move', [InboxController::class, 'move']);
Route::post('/inbox/{slug}/archive', [InboxController::class, 'archive']);
Route::delete('/inbox/{slug}', [InboxController::class, 'destroy']);
