#!/bin/sh
set -e

cd /app

# Cache Laravel config, routes, and views for production
if [ "$APP_ENV" = "production" ]; then
    echo "Caching configuration..."
    php artisan config:cache 2>/dev/null || true
    php artisan route:cache 2>/dev/null || true
    php artisan view:cache 2>/dev/null || true
    echo "Cache completed."
fi

# Execute the main command
exec "$@"
