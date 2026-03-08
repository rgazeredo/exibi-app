<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('layout_regions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('layout_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->integer('position')->default(0);
            $table->decimal('x_percent', 5, 2);
            $table->decimal('y_percent', 5, 2);
            $table->decimal('width_percent', 5, 2);
            $table->decimal('height_percent', 5, 2);
            $table->boolean('is_main')->default(false);
            $table->timestamps();

            $table->index('layout_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('layout_regions');
    }
};
