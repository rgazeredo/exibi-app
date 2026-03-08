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
        Schema::create('playback_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('player_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('media_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('playlist_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_played_seconds')->nullable();
            $table->boolean('completed')->default(false);
            $table->jsonb('metadata')->nullable(); // Additional playback info (errors, skipped, etc.)
            $table->timestamps();

            // Indexes optimized for common queries
            $table->index(['tenant_id', 'created_at']);
            $table->index(['player_id', 'created_at']);
            $table->index(['media_id', 'created_at']);
            $table->index('started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playback_logs');
    }
};
