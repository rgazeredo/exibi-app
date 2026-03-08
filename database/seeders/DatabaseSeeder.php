<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin from environment variables
        $email = env('SUPER_ADMIN_EMAIL', 'admin@exibi.com.br');
        $name = env('SUPER_ADMIN_NAME', 'Super Admin');
        $password = env('SUPER_ADMIN_PASSWORD', 'changeme123');

        User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'email_verified_at' => now(),
                'is_super_admin' => true,
            ]
        );

        $this->command->info("Super Admin created: {$email}");

        // Run system seeders
        $this->call([
            SystemLayoutsSeeder::class,
            // GlobalWidgetsSeeder::class,
            PermissionsSeeder::class,
            DefaultRolesSeeder::class,
        ]);
    }
}
