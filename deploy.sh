#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
GIT_BRANCH="${1:-main}"  # Default to main, or use first argument

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       Exibi Production Deploy        ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${CYAN}Branch: ${GIT_BRANCH}${NC}"
echo -e "${CYAN}Date: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Error: $COMPOSE_FILE not found!${NC}"
    echo "Please run this script from the backend directory."
    exit 1
fi

# Step 1: Pull latest changes
echo -e "${YELLOW}[1/10]${NC} Pulling latest changes from git..."
git fetch origin
git checkout $GIT_BRANCH
git pull origin $GIT_BRANCH
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 2: Stop orphan containers (old queue worker, etc)
echo -e "${YELLOW}[2/10]${NC} Removing orphan containers..."
docker compose -f $COMPOSE_FILE down --remove-orphans 2>/dev/null || true
# Remove old queue container if exists
docker stop exibi-queue 2>/dev/null && docker rm exibi-queue 2>/dev/null || true
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 3: Build new image
echo -e "${YELLOW}[3/10]${NC} Building new Docker image..."
docker compose -f $COMPOSE_FILE build app
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 4: Start database and redis first
echo -e "${YELLOW}[4/10]${NC} Starting database and redis..."
docker compose -f $COMPOSE_FILE up -d postgres redis
echo "  Waiting for services to be ready..."
sleep 5
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 5: Run migrations before starting app
echo -e "${YELLOW}[5/10]${NC} Running database migrations..."
docker compose -f $COMPOSE_FILE run --rm app php artisan migrate --force
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 6: Start all services
echo -e "${YELLOW}[6/10]${NC} Starting all services..."
docker compose -f $COMPOSE_FILE up -d
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 7: Wait for app to be healthy
echo -e "${YELLOW}[7/10]${NC} Waiting for app to be healthy..."
RETRIES=30
until docker compose -f $COMPOSE_FILE exec -T app curl -sf http://localhost:8000/up > /dev/null 2>&1; do
    RETRIES=$((RETRIES-1))
    if [ $RETRIES -le 0 ]; then
        echo -e "${RED}App failed to become healthy!${NC}"
        echo "Check logs with: docker compose -f $COMPOSE_FILE logs app"
        exit 1
    fi
    echo "  Waiting... ($RETRIES attempts remaining)"
    sleep 2
done
echo -e "${GREEN}App is healthy!${NC}"
echo ""

# Step 8: Clear and rebuild caches
echo -e "${YELLOW}[8/10]${NC} Optimizing application..."
docker compose -f $COMPOSE_FILE exec -T app php artisan config:cache
docker compose -f $COMPOSE_FILE exec -T app php artisan route:cache
docker compose -f $COMPOSE_FILE exec -T app php artisan view:cache
docker compose -f $COMPOSE_FILE exec -T app php artisan event:cache
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 9: Restart Horizon to pick up new code
echo -e "${YELLOW}[9/10]${NC} Restarting Horizon workers..."
docker compose -f $COMPOSE_FILE exec -T app php artisan horizon:terminate 2>/dev/null || true
sleep 2
docker compose -f $COMPOSE_FILE restart horizon
echo -e "${GREEN}Done!${NC}"
echo ""

# Step 10: Cleanup
echo -e "${YELLOW}[10/10]${NC} Cleaning up old images..."
docker image prune -f
echo -e "${GREEN}Done!${NC}"
echo ""

# Final status
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}       Deploy completed successfully!  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Container Status:${NC}"
docker compose -f $COMPOSE_FILE ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${CYAN}Horizon Status:${NC}"
docker compose -f $COMPOSE_FILE exec -T app php artisan horizon:status 2>/dev/null || echo "Horizon starting..."
echo ""
echo -e "${CYAN}Useful commands:${NC}"
echo "  Logs:     docker compose -f $COMPOSE_FILE logs -f [service]"
echo "  Shell:    docker compose -f $COMPOSE_FILE exec app bash"
echo "  Horizon:  docker compose -f $COMPOSE_FILE exec app php artisan horizon:status"
echo "  Restart:  docker compose -f $COMPOSE_FILE restart [service]"
echo ""
