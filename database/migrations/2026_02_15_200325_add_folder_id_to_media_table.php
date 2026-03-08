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
            $table->foreignUuid('folder_id')
                ->nullable()
                ->after('tenant_id')
                ->constrained('media_folders')
                ->nullOnDelete();

            $table->index(['tenant_id', 'folder_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropIndex(['tenant_id', 'folder_id']);
            $table->dropColumn('folder_id');
        });
    }
};
