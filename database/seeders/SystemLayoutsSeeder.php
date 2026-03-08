<?php

namespace Database\Seeders;

use App\Models\Layout;
use Illuminate\Database\Seeder;

class SystemLayoutsSeeder extends Seeder
{
    /**
     * Predefined system layouts
     */
    protected array $layouts = [
        [
            'name' => 'Tela Cheia',
            'description' => 'Conteúdo em tela cheia',
            'regions' => [
                ['name' => 'principal', 'x' => 0, 'y' => 0, 'w' => 100, 'h' => 100, 'main' => true],
            ],
        ],
        [
            'name' => 'L Esquerda',
            'description' => '3 regiões em formato L com área principal à esquerda',
            'regions' => [
                ['name' => 'principal', 'x' => 0, 'y' => 0, 'w' => 65, 'h' => 100, 'main' => true],
                ['name' => 'lateral_topo', 'x' => 65, 'y' => 0, 'w' => 35, 'h' => 50, 'main' => false],
                ['name' => 'lateral_baixo', 'x' => 65, 'y' => 50, 'w' => 35, 'h' => 50, 'main' => false],
            ],
        ],
        [
            'name' => 'L Direita',
            'description' => '3 regiões em formato L com área principal à direita',
            'regions' => [
                ['name' => 'lateral_topo', 'x' => 0, 'y' => 0, 'w' => 35, 'h' => 50, 'main' => false],
                ['name' => 'lateral_baixo', 'x' => 0, 'y' => 50, 'w' => 35, 'h' => 50, 'main' => false],
                ['name' => 'principal', 'x' => 35, 'y' => 0, 'w' => 65, 'h' => 100, 'main' => true],
            ],
        ],
        [
            'name' => 'Banner Superior',
            'description' => '2 regiões com banner no topo',
            'regions' => [
                ['name' => 'banner', 'x' => 0, 'y' => 0, 'w' => 100, 'h' => 15, 'main' => false],
                ['name' => 'principal', 'x' => 0, 'y' => 15, 'w' => 100, 'h' => 85, 'main' => true],
            ],
        ],
        [
            'name' => 'Banner Inferior',
            'description' => '2 regiões com banner embaixo',
            'regions' => [
                ['name' => 'principal', 'x' => 0, 'y' => 0, 'w' => 100, 'h' => 85, 'main' => true],
                ['name' => 'banner', 'x' => 0, 'y' => 85, 'w' => 100, 'h' => 15, 'main' => false],
            ],
        ],
        [
            'name' => 'Duas Colunas',
            'description' => '2 regiões lado a lado',
            'regions' => [
                ['name' => 'esquerda', 'x' => 0, 'y' => 0, 'w' => 50, 'h' => 100, 'main' => true],
                ['name' => 'direita', 'x' => 50, 'y' => 0, 'w' => 50, 'h' => 100, 'main' => false],
            ],
        ],
        [
            'name' => 'Barra Esquerda',
            'description' => 'Barra lateral à esquerda (20%) com área principal à direita (80%)',
            'regions' => [
                ['name' => 'barra', 'x' => 0, 'y' => 0, 'w' => 20, 'h' => 100, 'main' => false],
                ['name' => 'principal', 'x' => 20, 'y' => 0, 'w' => 80, 'h' => 100, 'main' => true],
            ],
        ],
        [
            'name' => 'Barra Direita',
            'description' => 'Barra lateral à direita (20%) com área principal à esquerda (80%)',
            'regions' => [
                ['name' => 'principal', 'x' => 0, 'y' => 0, 'w' => 80, 'h' => 100, 'main' => true],
                ['name' => 'barra', 'x' => 80, 'y' => 0, 'w' => 20, 'h' => 100, 'main' => false],
            ],
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->layouts as $layoutData) {
            // Check if layout already exists
            $existing = Layout::withoutGlobalScopes()
                ->whereNull('tenant_id')
                ->where('is_system', true)
                ->where('name', $layoutData['name'])
                ->first();

            if ($existing) {
                // Update existing layout
                $existing->update([
                    'description' => $layoutData['description'],
                ]);
                $layout = $existing;

                $this->command->info("Updated layout: {$layoutData['name']}");
            } else {
                // Create new layout
                $layout = Layout::create([
                    'tenant_id' => null,
                    'name' => $layoutData['name'],
                    'description' => $layoutData['description'],
                    'orientation' => 'landscape',
                    'is_system' => true,
                    'is_active' => true,
                ]);

                $this->command->info("Created layout: {$layoutData['name']}");
            }

            // Sync regions
            $this->syncRegions($layout, $layoutData['regions']);
        }

        $this->command->info('Created/updated '.count($this->layouts).' system layouts');
    }

    /**
     * Sync regions for a layout
     */
    protected function syncRegions(Layout $layout, array $regions): void
    {
        // Get existing region names
        $existingRegions = $layout->regions()->pluck('name')->toArray();
        $newRegionNames = array_column($regions, 'name');

        // Delete regions that no longer exist
        $layout->regions()
            ->whereNotIn('name', $newRegionNames)
            ->delete();

        // Create or update regions
        foreach ($regions as $position => $regionData) {
            $layout->regions()->updateOrCreate(
                ['name' => $regionData['name']],
                [
                    'position' => $position,
                    'x_percent' => $regionData['x'],
                    'y_percent' => $regionData['y'],
                    'width_percent' => $regionData['w'],
                    'height_percent' => $regionData['h'],
                    'is_main' => $regionData['main'],
                ]
            );
        }
    }
}
