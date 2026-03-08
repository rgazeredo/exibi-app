<?php

namespace Database\Seeders;

use App\Models\Widget;
use Illuminate\Database\Seeder;

class GlobalWidgetsSeeder extends Seeder
{
    /**
     * Lotteries available in the system
     */
    protected array $lotteries = [
        'megasena' => 'Mega-Sena',
        'lotofacil' => 'Lotofácil',
        'quina' => 'Quina',
        'lotomania' => 'Lotomania',
        'timemania' => 'Timemania',
        'duplasena' => 'Dupla Sena',
        'diadesorte' => 'Dia de Sorte',
        'supersete' => 'Super Sete',
        'maismilionaria' => '+Milionária',
    ];

    /**
     * News categories available in the system
     */
    protected array $newsCategories = [
        'economia' => 'Economia',
        'tecnologia' => 'Tecnologia',
        'esportes' => 'Esportes',
        'politica' => 'Política',
        'entretenimento' => 'Entretenimento',
        'saude' => 'Saúde',
        'ciencia' => 'Ciência',
    ];

    /**
     * Orientations for widgets
     */
    protected array $orientations = ['landscape', 'portrait'];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createLotteryWidgets();
        $this->createNewsWidgets();
    }

    /**
     * Create lottery widgets for all combinations
     * 9 lotteries × 2 orientations = 18 widgets
     */
    protected function createLotteryWidgets(): void
    {
        foreach ($this->lotteries as $lotteryKey => $lotteryLabel) {
            foreach ($this->orientations as $orientation) {
                $orientationLabel = $orientation === 'landscape' ? 'Paisagem' : 'Retrato';

                // Check if widget already exists
                $existing = Widget::withoutGlobalScopes()
                    ->whereNull('tenant_id')
                    ->where('widget_type', Widget::TYPE_LOTTERY)
                    ->whereJsonContains('config->lottery', $lotteryKey)
                    ->whereJsonContains('config->orientation', $orientation)
                    ->first();

                if ($existing) {
                    $existing->update([
                        'name' => "{$lotteryLabel} - {$orientationLabel}",
                        'regeneration_cron' => Widget::LOTTERY_CRON,
                    ]);
                } else {
                    Widget::withoutGlobalScopes()->create([
                        'tenant_id' => null,
                        'widget_type' => Widget::TYPE_LOTTERY,
                        'name' => "{$lotteryLabel} - {$orientationLabel}",
                        'config' => [
                            'lottery' => $lotteryKey,
                            'orientation' => $orientation,
                        ],
                        'regeneration_cron' => Widget::LOTTERY_CRON,
                        'status' => Widget::STATUS_PENDING,
                    ]);
                }
            }
        }

        $this->command->info('Created/updated '.(count($this->lotteries) * count($this->orientations)).' lottery widgets');
    }

    /**
     * Create news widgets for all combinations
     * 7 categories × 2 orientations = 14 widgets
     */
    protected function createNewsWidgets(): void
    {
        foreach ($this->newsCategories as $categoryKey => $categoryLabel) {
            foreach ($this->orientations as $orientation) {
                $orientationLabel = $orientation === 'landscape' ? 'Paisagem' : 'Retrato';

                // Check if widget already exists
                $existing = Widget::withoutGlobalScopes()
                    ->whereNull('tenant_id')
                    ->where('widget_type', Widget::TYPE_NEWS)
                    ->whereJsonContains('config->category', $categoryKey)
                    ->whereJsonContains('config->orientation', $orientation)
                    ->first();

                if ($existing) {
                    $existing->update([
                        'name' => "Notícias {$categoryLabel} - {$orientationLabel}",
                        'regeneration_cron' => Widget::NEWS_CRON,
                    ]);
                } else {
                    Widget::withoutGlobalScopes()->create([
                        'tenant_id' => null,
                        'widget_type' => Widget::TYPE_NEWS,
                        'name' => "Notícias {$categoryLabel} - {$orientationLabel}",
                        'config' => [
                            'category' => $categoryKey,
                            'orientation' => $orientation,
                        ],
                        'regeneration_cron' => Widget::NEWS_CRON,
                        'status' => Widget::STATUS_PENDING,
                    ]);
                }
            }
        }

        $this->command->info('Created/updated '.(count($this->newsCategories) * count($this->orientations)).' news widgets');
    }
}
