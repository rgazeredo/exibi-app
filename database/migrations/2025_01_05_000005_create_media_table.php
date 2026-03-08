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
        Schema::create('media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['video', 'image']);
            $table->string('title');
            $table->string('filename');
            $table->string('path', 500);
            $table->string('url', 500)->nullable();
            $table->string('mime_type', 100);
            $table->bigInteger('size_bytes');
            $table->integer('duration_seconds')->nullable(); // For videos
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('thumbnail_path', 500)->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
