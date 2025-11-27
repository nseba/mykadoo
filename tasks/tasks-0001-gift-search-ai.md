# Tasks: Core Gift Search & AI Recommendation Engine (PRD 0001)

## Relevant Files

### Frontend (Next.js)
- `apps/web/app/search/page.tsx` - Main gift search page
- `apps/web/app/search/results/page.tsx` - Search results display
- `apps/web/components/search/SearchForm.tsx` - User preference input form
- `apps/web/components/search/ResultCard.tsx` - Individual gift recommendation card
- `apps/web/components/search/ResultGrid.tsx` - Grid layout for results
- `apps/web/components/search/FilterPanel.tsx` - Price/category filters
- `apps/web/components/profile/RecipientProfileForm.tsx` - Create/edit recipient profiles
- `apps/web/components/profile/ProfileList.tsx` - Display saved profiles
- `apps/web/hooks/useGiftSearch.ts` - React Query hook for search API
- `apps/web/hooks/useRecipientProfiles.ts` - Hook for profile management
- `apps/web/lib/api/search.ts` - API client for search endpoints

### Backend (NestJS)
- `apps/api/src/search/search.module.ts` - Search module
- `apps/api/src/search/search.controller.ts` - REST API endpoints
- `apps/api/src/search/search.service.ts` - Business logic orchestration
- `apps/api/src/search/dto/create-search.dto.ts` - Request validation
- `apps/api/src/search/dto/search-response.dto.ts` - Response formatting
- `apps/api/src/ai/ai.module.ts` - AI service module
- `apps/api/src/ai/ai.service.ts` - OpenAI integration
- `apps/api/src/ai/prompt-templates.ts` - AI prompt templates
- `apps/api/src/ai/embedding.service.ts` - Text embeddings for semantic search
- `apps/api/src/profiles/profiles.module.ts` - Recipient profiles module
- `apps/api/src/profiles/profiles.service.ts` - Profile CRUD operations
- `apps/api/src/feedback/feedback.module.ts` - User feedback tracking

### Database (Prisma)
- `prisma/schema.prisma` - Data models (GiftSearch, RecipientProfile, GiftRecommendation, UserFeedback)
- `prisma/migrations/` - Database migration files

### AI/Vector DB
- `apps/api/src/vector/vector.module.ts` - Vector database integration
- `apps/api/src/vector/pinecone.service.ts` - Pinecone client

### Testing
- `apps/web/__tests__/search/SearchForm.test.tsx` - Frontend unit tests
- `apps/api/src/search/search.service.spec.ts` - Backend unit tests
- `apps/api/src/ai/ai.service.spec.ts` - AI service tests
- `e2e/gift-search.spec.ts` - End-to-end tests

### Configuration
- `.env.example` - Environment variable template
- `apps/api/.env` - OpenAI API key, Pinecone credentials

## Notes

### Testing Commands
```bash
# Frontend tests
yarn nx test web

# Backend tests
yarn nx test api

# E2E tests
yarn nx e2e e2e

# Test coverage
yarn nx test web --coverage
yarn nx test api --coverage
```

### Linting Commands
```bash
# Lint all projects
yarn nx run-many --target=lint --all

# Lint specific projects
yarn nx lint web
yarn nx lint api

# Auto-fix
yarn nx lint web --fix
yarn nx lint api --fix
```

### Build Commands
```bash
# Build all projects
yarn nx run-many --target=build --all

# Build specific projects
yarn nx build web
yarn nx build api

# Production build
yarn nx build web --configuration=production
yarn nx build api --configuration=production
```

### Database Commands
```bash
# Create migration
yarn prisma migrate dev --name init_gift_search

# Apply migrations
yarn prisma migrate deploy

# Generate Prisma client
yarn prisma generate

# Seed database
yarn prisma db seed
```

## Tasks

### 1.0 Set up Nx monorepo and project structure

#### 1.1 Initialize Nx workspace with Next.js and NestJS
#### 1.2 Configure project structure (apps/web, apps/api, libs/shared)
#### 1.3 Set up TypeScript configurations with strict mode
#### 1.4 Configure Tailwind CSS for frontend styling
#### 1.5 Set up ESLint and Prettier with shared configs
#### 1.6 Configure path aliases (@/, @api/, @shared/)
#### 1.7 Set up environment variable management (.env files)
#### 1.8 Create shared types library (libs/shared/types)
#### 1.9 Configure Nx build dependencies and caching
#### 1.10 Set up Git hooks with Husky (pre-commit, pre-push)
#### 1.11 Run linter and verify zero warnings
#### 1.12 Run full test suite and verify all tests pass
#### 1.13 Build project and verify successful compilation
#### 1.14 Verify system functionality end-to-end
#### 1.15 Update Docker configurations if deployment changes needed
#### 1.16 Update Helm chart if deployment changes needed

### 2.0 Implement AI recommendation engine with OpenAI integration

#### 2.1 Install OpenAI SDK and LangChain dependencies
#### 2.2 Create AI service with model configuration (GPT-4, GPT-3.5-turbo)
#### 2.3 Implement prompt templates for gift recommendations
#### 2.4 Add fallback logic (GPT-4 → GPT-3.5-turbo on error/rate limit)
#### 2.5 Create recommendation request/response DTOs
#### 2.6 Implement budget filtering logic (min/max constraints)
#### 2.7 Add category diversity algorithm (ensure varied suggestions)
#### 2.8 Implement semantic search using text-embedding-3-large
#### 2.9 Create rate limiting and queue management for API calls
#### 2.10 Add error handling for API failures with retries
#### 2.11 Implement caching layer for common search patterns
#### 2.12 Create unit tests for AI service (mocked responses)
#### 2.13 Add integration tests with actual API calls (test environment)
#### 2.14 Run linter and verify zero warnings
#### 2.15 Run full test suite and verify all tests pass
#### 2.16 Build project and verify successful compilation
#### 2.17 Verify system functionality end-to-end
#### 2.18 Update Docker configurations if deployment changes needed
#### 2.19 Update Helm chart if deployment changes needed

### 3.0 Set up vector database for semantic search

#### 3.1 Create Pinecone account and obtain API credentials
#### 3.2 Initialize Pinecone index with appropriate dimensions (1536 for OpenAI)
#### 3.3 Create vector service with Pinecone client
#### 3.4 Implement embedding generation for gift descriptions
#### 3.5 Build vector upsert logic (store gift embeddings)
#### 3.6 Create semantic search query function
#### 3.7 Implement similarity scoring and ranking
#### 3.8 Add vector index management (create, delete, update)
#### 3.9 Create batch embedding processing for initial dataset
#### 3.10 Implement vector search with metadata filtering
#### 3.11 Add error handling for Pinecone API failures
#### 3.12 Create unit tests for vector service
#### 3.13 Add integration tests with Pinecone
#### 3.14 Run linter and verify zero warnings
#### 3.15 Run full test suite and verify all tests pass
#### 3.16 Build project and verify successful compilation
#### 3.17 Verify system functionality end-to-end
#### 3.18 Update Docker configurations if deployment changes needed
#### 3.19 Update Helm chart if deployment changes needed

### 4.0 Create gift search API endpoints

#### 4.1 Design REST API structure (POST /api/search, GET /api/search/:id)
#### 4.2 Create GiftSearch Prisma schema with all required fields
#### 4.3 Run Prisma migration to create database tables
#### 4.4 Implement SearchController with validation decorators
#### 4.5 Create SearchService with business logic
#### 4.6 Build CreateSearchDto with validation rules
#### 4.7 Create GiftRecommendationDto for response formatting
#### 4.8 Implement search result storage in database
#### 4.9 Add pagination for search results (limit, offset)
#### 4.10 Implement search history endpoint (GET /api/search/history)
#### 4.11 Create filtering endpoints (price, category, rating)
#### 4.12 Add sorting options (relevance, price, popularity)
#### 4.13 Implement request/response logging
#### 4.14 Create API documentation with Swagger decorators
#### 4.15 Write unit tests for controller and service
#### 4.16 Add integration tests for all endpoints
#### 4.17 Run linter and verify zero warnings
#### 4.18 Run full test suite and verify all tests pass
#### 4.19 Build project and verify successful compilation
#### 4.20 Verify system functionality end-to-end
#### 4.21 Update Docker configurations if deployment changes needed
#### 4.22 Update Helm chart if deployment changes needed

### 5.0 Build gift search UI components (Next.js)

#### 5.1 Create SearchForm component with all input fields
#### 5.2 Implement budget slider with min/max range
#### 5.3 Build occasion selector (dropdown or radio buttons)
#### 5.4 Create relationship selector with common options
#### 5.5 Implement age range selector
#### 5.6 Build interests input with autocomplete/tags
#### 5.7 Create gender selector (optional field)
#### 5.8 Add form validation with Zod schema
#### 5.9 Implement loading states during API calls
#### 5.10 Create ResultCard component for gift display
#### 5.11 Build ResultGrid with responsive layout (3-4 columns)
#### 5.12 Implement FilterPanel for price and category filters
#### 5.13 Add sorting dropdown (relevance, price, popularity)
#### 5.14 Create "Why this gift?" explanation display
#### 5.15 Implement save to wishlist functionality
#### 5.16 Add rating component (thumbs up/down or 1-5 stars)
#### 5.17 Create share functionality for individual gifts
#### 5.18 Implement mobile-responsive design
#### 5.19 Add accessibility features (ARIA labels, keyboard nav)
#### 5.20 Write component tests with React Testing Library
#### 5.21 Run linter and verify zero warnings
#### 5.22 Run full test suite and verify all tests pass
#### 5.23 Build project and verify successful compilation
#### 5.24 Verify system functionality end-to-end
#### 5.25 Update Docker configurations if deployment changes needed
#### 5.26 Update Helm chart if deployment changes needed

### 6.0 Implement recipient profile management

#### 6.1 Create RecipientProfile Prisma schema
#### 6.2 Run migration to add profiles table
#### 6.3 Create ProfilesController with CRUD endpoints
#### 6.4 Implement ProfilesService with business logic
#### 6.5 Add free tier limit enforcement (max 3 profiles)
#### 6.6 Create RecipientProfileForm component
#### 6.7 Build ProfileList component with edit/delete actions
#### 6.8 Implement profile selection for gift searches
#### 6.9 Add profile reuse logic (pre-fill search form)
#### 6.10 Create profile history tracking (past searches)
#### 6.11 Implement profile validation (required fields)
#### 6.12 Add profile count indicator ("2 of 3 used")
#### 6.13 Create upgrade prompt when limit reached
#### 6.14 Write unit tests for profiles service
#### 6.15 Add integration tests for profile endpoints
#### 6.16 Write component tests for profile UI
#### 6.17 Run linter and verify zero warnings
#### 6.18 Run full test suite and verify all tests pass
#### 6.19 Build project and verify successful compilation
#### 6.20 Verify system functionality end-to-end
#### 6.21 Update Docker configurations if deployment changes needed
#### 6.22 Update Helm chart if deployment changes needed

### 7.0 Implement user feedback and learning system

#### 7.1 Create UserFeedback Prisma schema
#### 7.2 Run migration to add feedback table
#### 7.3 Create FeedbackController with rating endpoints
#### 7.4 Implement FeedbackService to store user interactions
#### 7.5 Build rating component (thumbs up/down or star rating)
#### 7.6 Add action tracking (purchased, saved, dismissed, clicked)
#### 7.7 Implement click-through rate tracking
#### 7.8 Create time-on-page tracking for gift cards
#### 7.9 Build feedback aggregation for recommendation improvement
#### 7.10 Implement preference learning algorithm
#### 7.11 Create weekly model update job (batch processing)
#### 7.12 Add feedback analytics dashboard (internal)
#### 7.13 Write unit tests for feedback service
#### 7.14 Add integration tests for feedback endpoints
#### 7.15 Run linter and verify zero warnings
#### 7.16 Run full test suite and verify all tests pass
#### 7.17 Build project and verify successful compilation
#### 7.18 Verify system functionality end-to-end
#### 7.19 Update Docker configurations if deployment changes needed
#### 7.20 Update Helm chart if deployment changes needed

### 8.0 Implement caching and performance optimization

#### 8.1 Install Redis and configure connection
#### 8.2 Create cache service with Redis client
#### 8.3 Implement search result caching (TTL: 1 hour)
#### 8.4 Add API response caching for common queries
#### 8.5 Create cache invalidation logic on data updates
#### 8.6 Implement rate limiting with Redis
#### 8.7 Add database query optimization (indexes, query analysis)
#### 8.8 Implement connection pooling for PostgreSQL
#### 8.9 Create CDN configuration for static assets
#### 8.10 Add image optimization and lazy loading
#### 8.11 Implement code splitting for Next.js routes
#### 8.12 Create performance monitoring (measure p95 latency)
#### 8.13 Add load testing scripts (k6 or Artillery)
#### 8.14 Run performance tests and verify <3s response time
#### 8.15 Run linter and verify zero warnings
#### 8.16 Run full test suite and verify all tests pass
#### 8.17 Build project and verify successful compilation
#### 8.18 Verify system functionality end-to-end
#### 8.19 Update Docker configurations if deployment changes needed
#### 8.20 Update Helm chart if deployment changes needed

### 9.0 Create comprehensive test suite

#### 9.1 Set up Jest and React Testing Library
#### 9.2 Configure Playwright for E2E tests
#### 9.3 Write unit tests for all AI service functions (>80% coverage)
#### 9.4 Create unit tests for search service (>80% coverage)
#### 9.5 Write unit tests for profile service (>80% coverage)
#### 9.6 Add unit tests for feedback service (>80% coverage)
#### 9.7 Create component tests for SearchForm
#### 9.8 Write component tests for ResultCard and ResultGrid
#### 9.9 Add component tests for RecipientProfileForm
#### 9.10 Create integration tests for search API endpoints
#### 9.11 Write integration tests for profile API endpoints
#### 9.12 Add E2E test for complete gift search flow
#### 9.13 Create E2E test for profile creation and reuse
#### 9.14 Write E2E test for feedback submission
#### 9.15 Add visual regression tests for key components
#### 9.16 Create API contract tests (ensure API compatibility)
#### 9.17 Run linter and verify zero warnings
#### 9.18 Run full test suite and verify all tests pass
#### 9.19 Build project and verify successful compilation
#### 9.20 Verify system functionality end-to-end
#### 9.21 Update Docker configurations if deployment changes needed
#### 9.22 Update Helm chart if deployment changes needed

### 10.0 Deploy and configure production environment

#### 10.1 Create production environment on hosting platform (Vercel, AWS, GCP)
#### 10.2 Configure environment variables for production
#### 10.3 Set up PostgreSQL production database
#### 10.4 Configure Redis production instance
#### 10.5 Set up Pinecone production index
#### 10.6 Configure OpenAI API keys and rate limits
#### 10.7 Set up CDN for static asset delivery
#### 10.8 Configure SSL certificates and domain
#### 10.9 Implement health check endpoints (/health, /ready)
#### 10.10 Set up application monitoring (Datadog, Sentry)
#### 10.11 Configure error tracking and alerting
#### 10.12 Create deployment pipeline (CI/CD)
#### 10.13 Set up staging environment for testing
#### 10.14 Configure auto-scaling rules (CPU/memory thresholds)
#### 10.15 Create backup and disaster recovery plan
#### 10.16 Run production smoke tests
#### 10.17 Run linter and verify zero warnings
#### 10.18 Run full test suite and verify all tests pass
#### 10.19 Build project and verify successful compilation
#### 10.20 Verify system functionality end-to-end
#### 10.21 Update Docker configurations if deployment changes needed
#### 10.22 Update Helm chart if deployment changes needed

---

**Status:** Ready for Implementation
**Priority:** P0 - MVP Critical
**Estimated Duration:** 8 weeks
**Dependencies:** None (foundational)
