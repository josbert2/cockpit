<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('source', 16)->default('manual')->index()->after('id'); // manual | vault
            $table->string('vault_path')->nullable()->after('notes');
            $table->unsignedInteger('vault_line')->nullable()->after('vault_path');
            $table->string('vault_hash', 64)->nullable()->after('vault_line');
            $table->timestamp('vault_synced_at')->nullable()->after('vault_hash');
            $table->index('vault_hash');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['vault_hash']);
            $table->dropColumn(['source', 'vault_path', 'vault_line', 'vault_hash', 'vault_synced_at']);
        });
    }
};
