<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('player_layouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('layout_id')->constrained()->cascadeOnDelete();
            $table->string('schedule_type', 20)->default('always'); // always, date_range, recurring
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->jsonb('day_schedules')->nullable(); // For recurring schedules
            $table->integer('priority')->default(0); // Lower = higher priority
            $table->boolean('is_default')->default(false);
            $table->boolean('regions_overlay')->default(false);
            $table->string('scale_type', 20)->default('aspect'); // aspect, stretched
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['player_id', 'is_active']);
            $table->index(['player_id', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_layouts');
    }
};
