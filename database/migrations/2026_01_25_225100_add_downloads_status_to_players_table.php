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
        Schema::table('players', function (Blueprint $table) {
            $table->jsonb('downloads_status')->nullable()->after('config');
            // Estrutura esperada:
            // {
            //   "updated_at": "2024-01-25T12:00:00Z",
            //   "total_size_mb": 1500,
            //   "downloaded_media_ids": ["uuid1", "uuid2"],
            //   "pending_media_ids": ["uuid3"],
            //   "download_progress": {"uuid3": 0.45}
            // }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn('downloads_status');
        });
    }
};
