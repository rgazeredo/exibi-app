.PHONY: help up down build logs shell migrate fresh seed test test-setup pint install npm-install npm-build

# Default target
help:
	@echo "Exibi Admin Panel - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install   First time setup (build, up, install deps, migrate)"
	@echo "  up        Start all containers"
	@echo "  down      Stop all containers"
	@echo "  build     Build Docker images"
	@echo "  logs      Show container logs"
	@echo "  shell     Open shell in app container"
	@echo "  migrate   Run database migrations"
	@echo "  fresh     Fresh migrate with seeders"
	@echo "  seed      Run database seeders"
	@echo "  test      Run tests (uses separate test database)"
	@echo "  test-setup Create test database (run once)"
	@echo "  pint      Run Laravel Pint"

# Start containers
up:
	docker compose up -d

# Stop containers
down:
	docker compose down

# Build images
build:
	docker compose build

# Show logs
logs:
	docker compose logs -f

# Open shell in app container
shell:
	docker compose exec app sh

# Run migrations
migrate:
	docker compose exec app php artisan migrate

# Fresh migration with seeders
fresh:
	docker compose exec app php artisan migrate:fresh --seed

# Run seeders
seed:
	docker compose exec app php artisan db:seed

# Run tests (uses separate test database: exibi_test)
test:
	docker compose exec app php artisan migrate --database=pgsql_test --force
	docker compose exec app php artisan test

# Setup test database (run once after first docker compose up)
test-setup:
	docker compose exec postgres psql -U exibi -c "CREATE DATABASE exibi_test;" || true
	docker compose exec app php artisan migrate --database=pgsql_test --force
	@echo "Test database ready!"

# Run Pint
pint:
	docker compose exec app ./vendor/bin/pint

# Install npm dependencies
npm-install:
	docker compose exec app npm install

# Build frontend assets
npm-build:
	docker compose exec app npm run build

# First time setup
install:
	@echo "================================================"
	@echo "  Exibi Admin Panel - Setup"
	@echo "================================================"
	@echo ""
	@echo "1. Building containers..."
	docker compose build
	@echo ""
	@echo "2. Starting containers..."
	docker compose up -d
	@echo ""
	@echo "3. Waiting for services to be ready..."
	sleep 10
	@echo ""
	@echo "4. Installing Composer dependencies..."
	docker compose exec app composer install --no-interaction
	@echo ""
	@echo "5. Installing NPM dependencies..."
	docker compose exec app npm install
	@echo ""
	@echo "6. Generating app key..."
	docker compose exec app php artisan key:generate --force
	@echo ""
	@echo "7. Running migrations..."
	docker compose exec app php artisan migrate --force
	@echo ""
	@echo "8. Building frontend assets..."
	docker compose exec app npm run build
	@echo ""
	@echo "================================================"
	@echo "  Setup complete!"
	@echo "================================================"
	@echo ""
	@echo "  App:          http://localhost:8000"
	@echo "  MinIO:        http://localhost:9001"
	@echo "                (minioadmin/minioadmin)"
	@echo ""
	@echo "  Run 'make logs' to see container logs"
	@echo "================================================"
