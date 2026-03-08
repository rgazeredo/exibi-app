<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop column first (this removes FK constraints)
        if (Schema::hasColumn('media', 'folder_id')) {
            DB::statement('ALTER TABLE media DROP COLUMN folder_id');
        }

        // Then drop table
        Schema::dropIfExists('media_folders');
    }

    public function down(): void
    {
        // Not reversible - data would be lost
    }
};
