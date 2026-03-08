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
        Schema::table('media', function (Blueprint $table) {
            // SHA-256 hash for file integrity verification (64 hex characters)
            $table->string('sha256_hash', 64)->nullable()->after('size_bytes');
            $table->index('sha256_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex(['sha256_hash']);
            $table->dropColumn('sha256_hash');
        });
    }
};
