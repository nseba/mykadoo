#!/bin/bash

# =============================================================================
# Mykadoo - Stop All Services
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
echo "  Mykadoo - Stopping Services"
echo "=============================================="
echo -e "${NC}"

# Parse command line arguments
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --clean      Remove volumes and clean up data"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Stop Docker containers
echo -e "${YELLOW}Stopping Docker containers...${NC}"
if [ "$CLEAN" = true ]; then
    docker-compose down -v --remove-orphans
    echo -e "${GREEN}Stopped and removed containers, networks, and volumes.${NC}"
else
    docker-compose down --remove-orphans
    echo -e "${GREEN}Stopped and removed containers and networks.${NC}"
fi

# Kill any running node processes for this project (optional, be careful)
echo -e "${YELLOW}Checking for running Node.js processes...${NC}"

# Find processes running nx serve
NX_PIDS=$(pgrep -f "nx serve" 2>/dev/null || true)
if [ -n "$NX_PIDS" ]; then
    echo -e "${YELLOW}Stopping Nx serve processes...${NC}"
    echo "$NX_PIDS" | xargs kill 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}=============================================="
echo "  All services stopped!"
echo "==============================================${NC}"
echo ""

if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}Note: Database data has been removed.${NC}"
    echo -e "${YELLOW}Run 'yarn db:seed' after restarting to restore sample data.${NC}"
fi
