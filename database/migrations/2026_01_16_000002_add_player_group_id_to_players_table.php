<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->foreignUuid('player_group_id')
                ->nullable()
                ->after('tenant_id')
                ->constrained('player_groups')
                ->nullOnDelete();

            $table->index('player_group_id');
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropForeign(['player_group_id']);
            $table->dropIndex(['player_group_id']);
            $table->dropColumn('player_group_id');
        });
    }
};
