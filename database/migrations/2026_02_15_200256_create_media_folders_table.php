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
        Schema::create('media_folders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->string('name');
            $table->string('slug');
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'parent_id']);
            $table->unique(['tenant_id', 'parent_id', 'slug']);
        });

        // Add self-referential foreign key after table creation
        Schema::table('media_folders', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('media_folders')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_folders');
    }
};
