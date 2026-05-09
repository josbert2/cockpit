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

// Dashboard
Route::get('/dashboard/summary', [\App\Http\Controllers\Api\DashboardController::class, 'summary']);

// Vault sync
Route::post('/vault/sync-tasks', [\App\Http\Controllers\Api\VaultController::class, 'syncTasks']);

// Properties (Notion-style)
Route::get('/properties/definitions', [\App\Http\Controllers\Api\PropertyController::class, 'definitions']);
Route::post('/properties/definitions', [\App\Http\Controllers\Api\PropertyController::class, 'storeDefinition']);
Route::patch('/properties/definitions/{definition}', [\App\Http\Controllers\Api\PropertyController::class, 'updateDefinition']);
Route::delete('/properties/definitions/{definition}', [\App\Http\Controllers\Api\PropertyController::class, 'destroyDefinition']);
Route::get('/properties/{entityType}/{entityId}', [\App\Http\Controllers\Api\PropertyController::class, 'getValues']);
Route::post('/properties/{entityType}/{entityId}', [\App\Http\Controllers\Api\PropertyController::class, 'setValue']);
