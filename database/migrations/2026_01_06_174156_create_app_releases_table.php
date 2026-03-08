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
        Schema::create('app_releases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version_name', 50);
            $table->unsignedInteger('version_code')->unique();
            $table->string('apk_path', 500);
            $table->unsignedBigInteger('apk_size_bytes')->default(0);
            $table->text('release_notes')->nullable();
            $table->boolean('force_update')->default(false);
            $table->unsignedInteger('min_version_code')->default(1);
            $table->boolean('is_active')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('is_active');
            $table->index('version_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_releases');
    }
};
