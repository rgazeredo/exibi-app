<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('player_groups', function (Blueprint $table) {
            $table->jsonb('config')->nullable()->default('{"orientation": "landscape", "update_interval_minutes": 15, "volume": 100, "brightness": 100}');
        });
    }

    public function down(): void
    {
        Schema::table('player_groups', function (Blueprint $table) {
            $table->dropColumn('config');
        });
    }
};
