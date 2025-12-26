#!/bin/bash

# =============================================================================
# Mykadoo - Start Development Environment
# =============================================================================
# This script starts the development environment with hot-reload
# Services: PostgreSQL (Docker), Redis (Docker), API (local), Web (local)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo -e "${BLUE}"
echo "=============================================="
echo "  Mykadoo - Development Environment"
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
        echo -e "${GREEN}Created .env file.${NC}"
    else
        echo -e "${RED}Error: .env.example not found.${NC}"
        exit 1
    fi
fi

# Parse command line arguments
SEED=false
API_ONLY=false
WEB_ONLY=false
SKIP_DEPS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --seed)
            SEED=true
            shift
            ;;
        --api-only)
            API_ONLY=true
            shift
            ;;
        --web-only)
            WEB_ONLY=true
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --seed       Run database seed"
            echo "  --api-only   Only start the API server"
            echo "  --web-only   Only start the Web server"
            echo "  --skip-deps  Skip starting PostgreSQL/Redis"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    # Kill background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start infrastructure services if not skipping
if [ "$SKIP_DEPS" = false ]; then
    echo -e "${YELLOW}Starting infrastructure services...${NC}"

    # Stop any existing containers first
    docker-compose stop postgres redis 2>/dev/null || true

    # Start only PostgreSQL and Redis
    docker-compose up -d postgres redis

    # Wait for PostgreSQL
    echo -n "  PostgreSQL: "
    until docker-compose exec -T postgres pg_isready -U mykadoo_user -d mykadoo > /dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo -e "${GREEN}Ready${NC}"

    # Wait for Redis
    echo -n "  Redis: "
    until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo -e "${GREEN}Ready${NC}"
fi

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
yarn db:generate

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
yarn db:migrate 2>/dev/null || yarn db:push

# Seed database if requested
if [ "$SEED" = true ]; then
    echo -e "${YELLOW}Seeding database...${NC}"
    yarn db:seed
fi

echo ""
echo -e "${GREEN}=============================================="
echo "  Starting Development Servers"
echo "==============================================${NC}"
echo ""

# Start services based on flags
if [ "$WEB_ONLY" = true ]; then
    echo -e "${CYAN}Starting Web server only...${NC}"
    echo -e "  ${BLUE}Web:${NC} http://localhost:14000"
    echo ""
    yarn nx serve web
elif [ "$API_ONLY" = true ]; then
    echo -e "${CYAN}Starting API server only...${NC}"
    echo -e "  ${BLUE}API:${NC} http://localhost:14001"
    echo ""
    yarn nx serve api
else
    # Start both API and Web in parallel
    echo -e "${CYAN}Starting API and Web servers...${NC}"
    echo ""
    echo -e "  ${BLUE}API Server:${NC}       http://localhost:14001"
    echo -e "  ${BLUE}Web Application:${NC}  http://localhost:14000"
    echo -e "  ${BLUE}Blog:${NC}             http://localhost:14000/blog"
    echo ""
    echo -e "  ${YELLOW}Press Ctrl+C to stop all servers${NC}"
    echo ""

    # Use concurrently if available, otherwise run in background
    if command -v npx &> /dev/null && npx --yes concurrently --version &> /dev/null 2>&1; then
        npx --yes concurrently \
            --names "API,WEB" \
            --prefix-colors "blue,green" \
            "yarn nx serve api" \
            "yarn nx serve web"
    else
        # Fallback: run in background
        echo -e "${YELLOW}Starting servers in background...${NC}"
        yarn nx serve api &
        API_PID=$!
        sleep 3
        yarn nx serve web &
        WEB_PID=$!

        # Wait for any process to exit
        wait $API_PID $WEB_PID
    fi
fi
