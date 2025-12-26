# =============================================================================
# Mykadoo - Development Makefile
# =============================================================================
# Quick commands for local development
# Usage: make <target>
# =============================================================================

.PHONY: help start stop restart dev docker logs status clean install db-* test lint build storybook

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# =============================================================================
# HELP
# =============================================================================

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)Mykadoo Development Commands$(NC)"
	@echo "=============================="
	@echo ""
	@echo "$(GREEN)Quick Start:$(NC)"
	@echo "  make start      - Start dev environment (DB in Docker, apps local)"
	@echo "  make stop       - Stop all services"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# =============================================================================
# MAIN COMMANDS
# =============================================================================

start: ## Start development environment (Postgres/Redis in Docker, apps locally)
	@./scripts/start-dev.sh

start-seed: ## Start development with database seeding
	@./scripts/start-dev.sh --seed

start-api: ## Start only the API server
	@./scripts/start-dev.sh --api-only

start-web: ## Start only the Web server
	@./scripts/start-dev.sh --web-only

docker: ## Start all services via Docker Compose
	@./scripts/start-docker.sh

docker-build: ## Rebuild and start all Docker services
	@./scripts/start-docker.sh --rebuild

docker-logs: ## Start Docker services and follow logs
	@./scripts/start-docker.sh --logs

stop: ## Stop all services
	@./scripts/stop.sh

stop-clean: ## Stop all services and remove volumes
	@./scripts/stop.sh --clean

restart: stop start ## Restart development environment

# =============================================================================
# INFRASTRUCTURE
# =============================================================================

infra: ## Start only infrastructure (Postgres + Redis)
	@echo "$(YELLOW)Starting infrastructure services...$(NC)"
	@docker-compose up -d postgres redis
	@echo "$(GREEN)Infrastructure ready!$(NC)"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis: localhost:6379"

infra-stop: ## Stop infrastructure services
	@docker-compose stop postgres redis

logs: ## Follow Docker container logs
	@docker-compose logs -f

logs-api: ## Follow API container logs
	@docker-compose logs -f api

logs-web: ## Follow Web container logs
	@docker-compose logs -f web

logs-db: ## Follow PostgreSQL container logs
	@docker-compose logs -f postgres

status: ## Show status of all services
	@echo "$(CYAN)Docker Containers:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(CYAN)Node Processes:$(NC)"
	@pgrep -fl "nx serve" 2>/dev/null || echo "  No Nx serve processes running"

ps: status ## Alias for status

# =============================================================================
# DATABASE
# =============================================================================

db-generate: ## Generate Prisma client
	@yarn db:generate

db-migrate: ## Run database migrations
	@yarn db:migrate

db-migrate-deploy: ## Deploy migrations (production)
	@yarn db:migrate:deploy

db-push: ## Push schema changes to database
	@yarn db:push

db-reset: ## Reset database (WARNING: destroys data)
	@echo "$(RED)WARNING: This will destroy all data!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] && yarn db:migrate:reset

db-seed: ## Seed the database
	@yarn db:seed

db-studio: ## Open Prisma Studio
	@yarn db:studio

db-fresh: db-reset db-seed ## Reset and seed database

# =============================================================================
# DEVELOPMENT
# =============================================================================

install: ## Install dependencies
	@yarn install

dev: start ## Alias for start

api: ## Run API in development mode
	@yarn nx serve api

web: ## Run Web in development mode
	@yarn nx serve web

# =============================================================================
# TESTING
# =============================================================================

test: ## Run all tests
	@yarn nx run-many --target=test --all

test-api: ## Run API tests
	@yarn nx test api

test-web: ## Run Web tests
	@yarn nx test web

test-ui: ## Run UI library tests
	@yarn nx test design-system

test-watch: ## Run tests in watch mode
	@yarn nx test api --watch

test-coverage: ## Run tests with coverage report
	@yarn nx run-many --target=test --all --coverage

e2e: ## Run E2E tests
	@yarn nx e2e web-e2e

# =============================================================================
# LINTING & FORMATTING
# =============================================================================

lint: ## Run linting on all projects
	@yarn nx run-many --target=lint --all

lint-api: ## Lint API
	@yarn nx lint api

lint-web: ## Lint Web
	@yarn nx lint web

lint-fix: ## Fix linting issues
	@yarn nx run-many --target=lint --all --fix

format: ## Format all files with Prettier
	@yarn prettier --write .

format-check: ## Check formatting
	@yarn prettier --check .

typecheck: ## Run TypeScript type checking
	@yarn nx run-many --target=build --all --skip-nx-cache 2>&1 | grep -E "(error|Error)" || echo "$(GREEN)No type errors!$(NC)"

# =============================================================================
# BUILD
# =============================================================================

build: ## Build all projects
	@yarn nx run-many --target=build --all

build-api: ## Build API
	@yarn nx build api

build-web: ## Build Web
	@yarn nx build web

build-prod: ## Production build
	@NODE_ENV=production yarn nx run-many --target=build --all

# =============================================================================
# STORYBOOK
# =============================================================================

storybook: ## Start Storybook
	@yarn storybook

storybook-build: ## Build Storybook static site
	@yarn build-storybook

# =============================================================================
# SECURITY
# =============================================================================

security: ## Run security scan
	@./scripts/security-scan.sh

audit: ## Run npm audit
	@npm audit

audit-fix: ## Fix npm audit issues
	@npm audit fix

# =============================================================================
# CLEANUP
# =============================================================================

clean: ## Clean build artifacts
	@rm -rf dist tmp .next
	@echo "$(GREEN)Build artifacts cleaned$(NC)"

clean-all: clean ## Clean everything including node_modules
	@rm -rf node_modules
	@echo "$(YELLOW)Run 'make install' to reinstall dependencies$(NC)"

clean-docker: ## Remove all Docker containers and volumes
	@docker-compose down -v --remove-orphans
	@echo "$(GREEN)Docker cleanup complete$(NC)"

prune: ## Prune Docker system
	@docker system prune -f
	@echo "$(GREEN)Docker system pruned$(NC)"

# =============================================================================
# UTILITIES
# =============================================================================

shell-db: ## Open PostgreSQL shell
	@docker-compose exec postgres psql -U mykadoo_user -d mykadoo

shell-redis: ## Open Redis CLI
	@docker-compose exec redis redis-cli

shell-api: ## Open shell in API container
	@docker-compose exec api sh

shell-web: ## Open shell in Web container
	@docker-compose exec web sh

env: ## Show environment variables
	@cat .env | grep -v "^#" | grep -v "^$$"

env-example: ## Copy .env.example to .env
	@cp .env.example .env
	@echo "$(GREEN)Created .env from .env.example$(NC)"

graph: ## Show Nx dependency graph
	@yarn nx graph

affected: ## Show affected projects
	@yarn nx affected --target=test --base=main

# =============================================================================
# QUICK WORKFLOWS
# =============================================================================

setup: install db-generate db-migrate ## Initial project setup
	@echo "$(GREEN)Project setup complete!$(NC)"
	@echo "Run 'make start' to begin development"

setup-fresh: install db-generate db-migrate db-seed ## Fresh setup with seed data
	@echo "$(GREEN)Fresh setup complete with seed data!$(NC)"
	@echo "Run 'make start' to begin development"

ci: lint test build ## Run CI pipeline locally
	@echo "$(GREEN)CI pipeline passed!$(NC)"

pre-commit: lint-fix format test ## Pre-commit checks
	@echo "$(GREEN)Pre-commit checks passed!$(NC)"
