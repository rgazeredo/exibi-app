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
        Schema::create('pending_player_activations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('activation_code', 7)->unique(); // Format: XXX-XXX
            $table->string('device_id')->nullable(); // Unique identifier from device
            $table->jsonb('device_info')->nullable(); // Device details (model, OS, etc.)
            $table->foreignUuid('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUuid('player_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('api_token', 64)->nullable();
            $table->timestamp('claimed_at')->nullable(); // When admin claimed the code
            $table->timestamp('activated_at')->nullable(); // When device received the token
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('activation_code');
            $table->index('device_id');
            $table->index(['tenant_id', 'activation_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_player_activations');
    }
};
