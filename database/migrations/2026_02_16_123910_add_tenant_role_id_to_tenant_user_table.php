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
        Schema::table('tenant_user', function (Blueprint $table) {
            // Adiciona tenant_role_id como nullable inicialmente
            // O seeder vai preencher e depois podemos tornar NOT NULL
            $table->uuid('tenant_role_id')->nullable()->after('user_id');

            $table->foreign('tenant_role_id')
                ->references('id')
                ->on('tenant_roles')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_user', function (Blueprint $table) {
            $table->dropForeign(['tenant_role_id']);
            $table->dropColumn('tenant_role_id');
        });
    }
};
