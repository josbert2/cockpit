<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('property_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type', 32)->index(); // task | project
            $table->string('name');
            $table->string('type', 32);                  // text|number|checkbox|select|multi_select|date|url|status
            $table->json('config')->nullable();          // ej: select options
            $table->unsignedInteger('order')->default(0);
            $table->boolean('archived')->default(false);
            $table->timestamps();
            $table->unique(['entity_type', 'name']);
        });

        Schema::create('property_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_definition_id')->constrained('property_definitions')->cascadeOnDelete();
            $table->string('entity_type', 32)->index();
            $table->unsignedBigInteger('entity_id')->index();
            $table->json('value')->nullable();
            $table->timestamps();
            $table->unique(['property_definition_id', 'entity_id'], 'pv_def_entity_unique');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_values');
        Schema::dropIfExists('property_definitions');
    }
};
