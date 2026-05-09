<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->string('title');
            $table->text('notes')->nullable();
            $table->string('status', 16)->default('todo')->index();
            $table->string('priority', 16)->default('med')->index();
            $table->string('effort', 4)->nullable();
            $table->string('energy', 16)->nullable();
            $table->json('tags')->nullable();
            $table->date('due_date')->nullable()->index();
            $table->boolean('today')->default(false)->index();
            $table->unsignedTinyInteger('today_slot')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
