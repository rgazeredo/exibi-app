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
        Schema::create('player_group_layouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_group_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('layout_id')->constrained()->cascadeOnDelete();

            // Scheduling fields (same pattern as playlist_items)
            $table->string('schedule_type', 20)->default('always'); // always, date_range, recurring
            $table->timestamp('starts_at')->nullable(); // For date_range
            $table->timestamp('ends_at')->nullable(); // For date_range
            $table->jsonb('day_schedules')->nullable(); // For recurring: [{"days": [1,2,3,4,5], "time_start": "08:00", "time_end": "18:00"}]

            // Priority and default settings
            $table->integer('priority')->default(0); // Lower number = higher priority (0 is highest)
            $table->boolean('is_default')->default(false); // Fallback when no schedule matches

            // Layout configuration
            $table->boolean('regions_overlay')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index(['player_group_id', 'is_active']);
            $table->index(['player_group_id', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_group_layouts');
    }
};
