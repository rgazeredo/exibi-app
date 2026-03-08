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
        Schema::create('widgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();

            $table->string('widget_type', 50); // 'weather', 'lottery', 'news'
            $table->string('name');
            $table->jsonb('config'); // {city, state, theme, duration_seconds, lottery, category}

            // Regeneration settings
            $table->string('regeneration_cron', 50)->nullable(); // e.g., '0 * * * *' for hourly
            $table->timestamp('last_generated_at')->nullable();
            $table->timestamp('next_regeneration_at')->nullable();

            // Link to current generated video
            $table->foreignUuid('current_media_id')->nullable()->constrained('media')->nullOnDelete();

            // Generation status
            $table->string('status', 20)->default('pending'); // pending, generating, ready, error
            $table->text('last_error')->nullable();
            $table->string('generation_request_id')->nullable(); // ID from Widgets API for webhook correlation

            $table->timestamps();

            $table->index(['tenant_id', 'widget_type']);
            $table->index('next_regeneration_at');
            $table->index('generation_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widgets');
    }
};
