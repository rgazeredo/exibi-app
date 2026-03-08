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
        Schema::create('player_heartbeats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_id')->constrained()->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable(); // IPv6 compatible
            $table->string('app_version', 50)->nullable();
            $table->jsonb('system_info')->nullable(); // OS version, device model, etc.
            $table->jsonb('status')->nullable(); // Current playback status, memory, storage, etc.
            $table->timestamp('created_at')->useCurrent();

            // Indexes for querying recent heartbeats
            $table->index(['player_id', 'created_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_heartbeats');
    }
};
