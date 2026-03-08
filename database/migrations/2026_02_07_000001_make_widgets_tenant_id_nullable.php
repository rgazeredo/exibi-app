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
        Schema::table('widgets', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['tenant_id']);

            // Make tenant_id nullable for global widgets
            $table->uuid('tenant_id')->nullable()->change();

            // Re-add foreign key with nullOnDelete
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('widgets', function (Blueprint $table) {
            // Drop the nullable foreign key
            $table->dropForeign(['tenant_id']);

            // Make tenant_id required again
            $table->uuid('tenant_id')->nullable(false)->change();

            // Re-add the original foreign key constraint
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();
        });
    }
};
