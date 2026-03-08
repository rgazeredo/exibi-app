#!/bin/sh
set -e

# Wait for dependencies to be installed
if [ ! -f /var/www/html/vendor/autoload.php ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction
fi

if [ ! -d /var/www/html/node_modules ]; then
    echo "Installing NPM dependencies..."
    npm install
fi

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    if [ -f /var/www/html/.env ]; then
        php artisan key:generate --no-interaction 2>/dev/null || true
    fi
fi

# Execute the main command
exec "$@"
