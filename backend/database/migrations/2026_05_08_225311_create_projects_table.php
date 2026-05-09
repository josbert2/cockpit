<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('path')->unique();
            $table->string('name')->index();
            $table->string('status', 16)->index();
            $table->timestamp('last_commit_at')->nullable()->index();
            $table->string('last_commit_msg', 255)->nullable();
            $table->unsignedInteger('commits_30d')->default(0);
            $table->string('stack')->nullable();
            $table->unsignedInteger('days_since_commit')->default(0)->index();
            $table->text('notes')->nullable();
            $table->boolean('pinned')->default(false);
            $table->boolean('archived')->default(false)->index();
            $table->timestamp('last_scanned_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
