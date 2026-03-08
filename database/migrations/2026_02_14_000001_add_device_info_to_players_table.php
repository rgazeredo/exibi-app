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
            $table->string('device_id')->nullable()->after('description');
            $table->string('mac_address', 17)->nullable()->after('device_id');
            $table->jsonb('device_info')->nullable()->after('mac_address');

            $table->index('device_id');
            $table->index('mac_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropIndex(['device_id']);
            $table->dropIndex(['mac_address']);
            $table->dropColumn(['device_id', 'mac_address', 'device_info']);
        });
    }
};
