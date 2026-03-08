<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Widget;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WidgetsApiService
{
    protected string $baseUrl;

    protected ?string $webhookUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.widgets.url', 'http://localhost:3000'), '/');
        $this->webhookUrl = config('services.widgets.webhook_url');
    }

    /**
     * Request video generation from Widgets API.
     *
     * @return string|null Request ID for tracking, null on failure
     */
    public function requestGeneration(Widget $widget): ?string
    {
        $endpoint = $this->getEndpointForWidget($widget);
        $payload = $this->buildPayload($widget);

        try {
            $url = "{$this->baseUrl}{$endpoint}";

            Log::info('Widget API request', [
                'url' => $url,
                'payload' => $payload,
            ]);

            $response = Http::timeout(120)
                ->get($url, $payload);

            if ($response->successful()) {
                $data = $response->json();

                // If the response contains immediate video URL (sync generation),
                // create the media and update widget right away
                if (isset($data['url'])) {
                    $this->handleImmediateResponse($widget, $data);

                    return $widget->id;
                }

                // For async generation (background processing), return success
                // The webhook will be called when the video is ready
                if (isset($data['success']) && $data['success'] === true) {
                    Log::info('Widget generation request accepted', [
                        'widget_id' => $widget->id,
                        'message' => $data['message'] ?? 'Processing in background',
                    ]);

                    return $widget->id;
                }

                // Fallback for other success responses
                return $data['request_id'] ?? $widget->id;
            }

            Log::error('Widget generation request failed', [
                'widget_id' => $widget->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Widget generation request exception', [
                'widget_id' => $widget->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Handle immediate response from Widgets API (when video is generated synchronously).
     */
    protected function handleImmediateResponse(Widget $widget, array $data): void
    {
        $media = $this->createMediaFromUrl($widget, $data['url'], $data);

        // Delete old media if exists
        $oldMediaId = $widget->current_media_id;

        $widget->update([
            'current_media_id' => $media->id,
            'status' => Widget::STATUS_READY,
            'last_generated_at' => now(),
            'next_regeneration_at' => $widget->calculateNextRegeneration(),
            'last_error' => null,
        ]);

        // Clean up old media
        if ($oldMediaId) {
            Media::find($oldMediaId)?->delete();
        }
    }

    /**
     * Create a Media entry from an external URL (no download).
     */
    public function createMediaFromUrl(Widget $widget, string $videoUrl, array $metadata = []): Media
    {
        $fileName = basename(parse_url($videoUrl, PHP_URL_PATH));
        $title = $this->generateMediaTitle($widget, $metadata);

        return Media::create([
            'tenant_id' => $widget->tenant_id,
            'type' => 'video',
            'title' => $title,
            'filename' => $fileName,
            'path' => $videoUrl,
            'url' => $videoUrl,
            'mime_type' => 'video/mp4',
            'size_bytes' => $metadata['upload']['size'] ?? 0,
            'duration_seconds' => $widget->config['duration_seconds'] ?? $metadata['duration'] ?? 30,
            'width' => 1920,
            'height' => 1080,
            'metadata' => [
                'source' => 'widget',
                'widget_id' => $widget->id,
                'widget_type' => $widget->widget_type,
                'generated_at' => now()->toIso8601String(),
                'widget_metadata' => $metadata,
            ],
        ]);
    }

    /**
     * Get the API endpoint for a widget type.
     */
    protected function getEndpointForWidget(Widget $widget): string
    {
        return match ($widget->widget_type) {
            Widget::TYPE_WEATHER => '/weather/generate',
            Widget::TYPE_LOTTERY => '/lottery/generate',
            Widget::TYPE_NEWS => '/news/generate',
            default => throw new \InvalidArgumentException("Unknown widget type: {$widget->widget_type}"),
        };
    }

    /**
     * Build the request payload for a widget.
     */
    protected function buildPayload(Widget $widget): array
    {
        $config = $widget->config;
        $payload = [];

        switch ($widget->widget_type) {
            case Widget::TYPE_WEATHER:
                $payload = [
                    'city' => $config['city'] ?? '',
                    'state' => $config['state'] ?? '',
                    'theme' => $config['theme'] ?? 'dark',
                    'orientation' => $config['orientation'] ?? 'landscape',
                    'duration' => $config['duration_seconds'] ?? 5,
                ];
                break;

            case Widget::TYPE_LOTTERY:
                $payload = [
                    'lottery' => $config['lottery'] ?? 'megasena',
                    'orientation' => $config['orientation'] ?? 'landscape',
                ];
                break;

            case Widget::TYPE_NEWS:
                $payload = [
                    'category' => $config['category'] ?? 'economia',
                    'orientation' => $config['orientation'] ?? 'landscape',
                ];
                break;
        }

        // Add widget ID for video identification
        $payload['media_id'] = $widget->id;

        // Add webhook URL for async notification when video is ready
        if ($this->webhookUrl) {
            $payload['webhook_url'] = $this->webhookUrl;
        }

        return $payload;
    }

    /**
     * Generate a title for the media based on widget type and metadata.
     */
    protected function generateMediaTitle(Widget $widget, array $metadata = []): string
    {
        $timestamp = now()->format('d/m/Y H:i');

        return match ($widget->widget_type) {
            Widget::TYPE_WEATHER => sprintf(
                'Clima %s - %s',
                $widget->config['city'] ?? 'Cidade',
                $timestamp
            ),
            Widget::TYPE_LOTTERY => sprintf(
                'Loteria %s - %s',
                ucfirst($widget->config['lottery'] ?? 'megasena'),
                $timestamp
            ),
            Widget::TYPE_NEWS => sprintf(
                'Notícias %s - %s',
                ucfirst($widget->config['category'] ?? 'Geral'),
                $timestamp
            ),
            default => sprintf('%s - %s', $widget->name, $timestamp),
        };
    }

    /**
     * Check if the Widgets API is available.
     */
    public function healthCheck(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/health");

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
