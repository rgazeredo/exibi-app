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
        Schema::create('system_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('player_id')->constrained()->cascadeOnDelete();

            // Event identification
            $table->string('event_type', 50); // APP_BOOT, APP_CRASH, PLAYBACK_ERROR, etc.
            $table->string('severity', 20)->default('info'); // debug, info, warning, error, critical
            $table->text('message');

            // Error details
            $table->string('error_code', 100)->nullable();
            $table->string('error_class', 255)->nullable();
            $table->text('stack_trace')->nullable();

            // Context
            $table->string('component', 100)->nullable(); // MainActivity, VideoManager, etc.
            $table->string('action', 255)->nullable();
            $table->foreignUuid('media_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('playlist_id')->nullable()->constrained()->nullOnDelete();

            // Device info
            $table->string('device_id', 100)->nullable();
            $table->string('app_version', 50)->nullable();
            $table->string('network_type', 20)->nullable();
            $table->integer('memory_free_mb')->nullable();
            $table->integer('storage_free_mb')->nullable();

            // Extra data
            $table->jsonb('extra_data')->nullable();

            // Timestamps
            $table->timestamp('event_timestamp'); // When the event occurred
            $table->timestamps();

            // Indexes
            $table->index(['tenant_id', 'created_at']);
            $table->index(['player_id', 'created_at']);
            $table->index('event_type');
            $table->index('severity');
            $table->index('event_timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_events');
    }
};
