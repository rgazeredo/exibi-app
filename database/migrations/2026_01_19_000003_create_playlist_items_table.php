<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('playlist_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('playlist_id')->constrained()->cascadeOnDelete();
            $table->string('item_type', 20); // 'media' or 'playlist'
            $table->uuid('item_id'); // References media or playlist
            $table->integer('position')->default(0);
            $table->integer('duration_override')->nullable(); // Only for media items
            $table->boolean('is_active')->default(true);
            $table->jsonb('settings')->nullable();
            // Prepared for future scheduling
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();

            $table->index(['playlist_id', 'position']);
            $table->index(['playlist_id', 'is_active']);
            $table->unique(['playlist_id', 'item_type', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playlist_items');
    }
};
