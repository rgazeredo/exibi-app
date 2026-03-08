<?php

return [

    'dsn' => env('SENTRY_LARAVEL_DSN'),

    // Capture unhandled exceptions and errors
    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),

    // Performance Monitoring
    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.0),

    // Profiling (requires traces_sample_rate > 0)
    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.0),

    // Release tracking
    'release' => env('SENTRY_RELEASE'),

    // Environment
    'environment' => env('APP_ENV', 'production'),

    // Ignore specific exceptions
    'ignore_exceptions' => [
        Illuminate\Auth\AuthenticationException::class,
        Illuminate\Auth\Access\AuthorizationException::class,
        Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        Illuminate\Database\Eloquent\ModelNotFoundException::class,
        Illuminate\Validation\ValidationException::class,
        Illuminate\Session\TokenMismatchException::class,
    ],

    // Ignore specific transactions for performance monitoring
    'ignore_transactions' => [
        // Ignore health check endpoints
        'GET /health',
        'GET /up',
    ],

    // Breadcrumbs
    'breadcrumbs' => [
        // Capture Laravel logs as breadcrumbs
        'logs' => true,

        // Capture Laravel cache events
        'cache' => true,

        // Capture Livewire components (if using Livewire)
        'livewire' => true,

        // Capture SQL queries
        'sql_queries' => true,

        // Capture SQL query bindings (values)
        'sql_bindings' => true,

        // Capture queue job information
        'queue_info' => true,

        // Capture command information
        'command_info' => true,

        // Capture HTTP client requests
        'http_client_requests' => true,
    ],

    // Context to add to every event
    'controllers_base_namespace' => env('SENTRY_CONTROLLERS_BASE_NAMESPACE', 'App\\Http\\Controllers'),

];
