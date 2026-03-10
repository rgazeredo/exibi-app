<?php

namespace App\Jobs;

use App\Models\Widget;
use App\Services\WidgetsApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RegenerateWidgets implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(WidgetsApiService $widgetsService): void
    {
        if (! Schema::hasTable('widgets')) {
            return;
        }

        $currentHour = now()->hour;

        // Weather widgets should not regenerate between 22h and 04h
        $skipWeatherRegeneration = $currentHour >= 22 || $currentHour < 5;

        // Find widgets that need regeneration (use withoutGlobalScopes to include all widgets)
        $query = Widget::withoutGlobalScopes()
            ->where('is_active', true)
            ->where('status', '!=', Widget::STATUS_GENERATING)
            ->whereNotNull('regeneration_cron')
            ->where(function ($query) {
                $query->whereNull('next_regeneration_at')
                    ->orWhere('next_regeneration_at', '<=', now());
            });

        // Skip weather widgets if outside of allowed hours
        if ($skipWeatherRegeneration) {
            $query->where('widget_type', '!=', Widget::TYPE_WEATHER);
        }

        $widgets = $query->get();

        if ($widgets->isEmpty()) {
            return;
        }

        Log::info('Starting widget regeneration', [
            'count' => $widgets->count(),
            'current_hour' => $currentHour,
            'skip_weather' => $skipWeatherRegeneration,
        ]);

        foreach ($widgets as $widget) {
            $this->regenerateWidget($widget, $widgetsService);
        }
    }

    /**
     * Regenerate a single widget.
     */
    protected function regenerateWidget(Widget $widget, WidgetsApiService $widgetsService): void
    {
        try {
            // Update status to generating
            $widget->update([
                'status' => Widget::STATUS_GENERATING,
            ]);

            // Request generation from Widgets API
            $requestId = $widgetsService->requestGeneration($widget);

            if ($requestId) {
                $widget->update([
                    'generation_request_id' => $requestId,
                ]);

                Log::info('Widget regeneration requested', [
                    'widget_id' => $widget->id,
                    'request_id' => $requestId,
                ]);
            } else {
                // Failed to request generation
                $widget->update([
                    'status' => Widget::STATUS_ERROR,
                    'last_error' => 'Failed to request generation from Widgets API',
                ]);

                Log::warning('Failed to request widget regeneration', [
                    'widget_id' => $widget->id,
                ]);
            }
        } catch (\Exception $e) {
            $widget->update([
                'status' => Widget::STATUS_ERROR,
                'last_error' => $e->getMessage(),
            ]);

            Log::error('Widget regeneration exception', [
                'widget_id' => $widget->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
