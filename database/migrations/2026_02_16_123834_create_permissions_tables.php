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
        // Permissões disponíveis (seeder global)
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('module', 50);
            $table->string('action', 50);
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['module', 'action']);
        });

        // Papéis por tenant
        Schema::create('tenant_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name', 100);
            $table->string('slug', 50);
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_deletable')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'slug']);
        });

        // Permissões atribuídas a cada papel
        Schema::create('tenant_role_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_role_id');
            $table->uuid('permission_id');
            $table->timestamps();

            $table->foreign('tenant_role_id')->references('id')->on('tenant_roles')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
            $table->unique(['tenant_role_id', 'permission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_role_permissions');
        Schema::dropIfExists('tenant_roles');
        Schema::dropIfExists('permissions');
    }
};
