#!/bin/bash

# =============================================================================
# Mykadoo - Start with Docker Compose
# =============================================================================
# This script starts the entire Mykadoo stack using Docker Compose
# Services: PostgreSQL, Redis, API (NestJS), Web (Next.js)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo -e "${BLUE}"
echo "=============================================="
echo "  Mykadoo - Docker Compose Startup"
echo "=============================================="
echo -e "${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}Created .env file. Please review and update values if needed.${NC}"
    else
        echo -e "${RED}Error: .env.example not found. Please create a .env file.${NC}"
        exit 1
    fi
fi

# Parse command line arguments
REBUILD=false
SEED=false
LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild)
            REBUILD=true
            shift
            ;;
        --seed)
            SEED=true
            shift
            ;;
        --logs)
            LOGS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --rebuild    Force rebuild of Docker images"
            echo "  --seed       Run database seed after startup"
            echo "  --logs       Follow logs after startup"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Build and start services
if [ "$REBUILD" = true ]; then
    echo -e "${YELLOW}Rebuilding Docker images...${NC}"
    docker-compose build --no-cache
fi

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"

# Wait for PostgreSQL
echo -n "  PostgreSQL: "
until docker-compose exec -T postgres pg_isready -U mykadoo_user -d mykadoo > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo -e "${GREEN}Ready${NC}"

# Wait for Redis
echo -n "  Redis: "
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo -e "${GREEN}Ready${NC}"

# Wait for API
echo -n "  API: "
sleep 5  # Give API time to start
for i in {1..30}; do
    if curl -s http://localhost:14001/api > /dev/null 2>&1; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec -T api npx prisma migrate deploy --schema=libs/database/prisma/schema.prisma 2>/dev/null || \
    docker-compose exec -T api npx prisma db push --schema=libs/database/prisma/schema.prisma

# Seed database if requested
if [ "$SEED" = true ]; then
    echo -e "${YELLOW}Seeding database...${NC}"
    docker-compose exec -T api npx ts-node libs/database/prisma/seeds/seed.ts
fi

# Print status
echo ""
echo -e "${GREEN}=============================================="
echo "  Mykadoo is running!"
echo "==============================================${NC}"
echo ""
echo -e "  ${BLUE}Web Application:${NC}  http://localhost:3001"
echo -e "  ${BLUE}API Server:${NC}       http://localhost:14001"
echo -e "  ${BLUE}Blog:${NC}             http://localhost:3001/blog"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo "    docker-compose logs -f        # View logs"
echo "    docker-compose down           # Stop all services"
echo "    docker-compose ps             # Check status"
echo ""

# Follow logs if requested
if [ "$LOGS" = true ]; then
    echo -e "${YELLOW}Following logs (Ctrl+C to exit)...${NC}"
    docker-compose logs -f
fi
