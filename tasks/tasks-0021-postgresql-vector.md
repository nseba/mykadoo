# Tasks: PostgreSQL Vector Store Integration (PRD 0021)

**Status:** IN PROGRESS (50% complete - 5/10 tasks)
**Priority:** P1 - High
**Created:** 2025-12-28
**Last Updated:** 2025-12-28
**Commits:** `ea6c145`, `789c97e`, `524116a`, `351ebc4`
**Estimated Effort:** 8 weeks

## Recommended Claude Code Agents

### Primary Agents
- **`nestjs-specialist`** - Backend API, VectorService implementation
- **`devops-engineer`** - Database configuration, migrations, infrastructure
- **`ai-architect`** - Embedding strategies, model selection, optimization

### Supporting Agents
- **`typescript-architect`** - Type safety, Prisma integration
- **`test-engineer`** - Testing vector operations, benchmarks
- **`quality-security-auditor`** - Security review, performance auditing

## Task-to-Agent Mapping

| Task | Primary Agent | Supporting Agent | Status |
|------|---------------|------------------|--------|
| 1.0 pgvector Setup | `devops-engineer` | - | ✅ COMPLETED |
| 2.0 Schema & Migrations | `nestjs-specialist` | `typescript-architect` | ✅ COMPLETED |
| 3.0 VectorService | `nestjs-specialist` | `ai-architect` | ✅ COMPLETED |
| 4.0 Embedding Pipeline | `ai-architect` | `nestjs-specialist` | ✅ COMPLETED |
| 5.0 Similarity Search | `nestjs-specialist` | `typescript-architect` | ✅ COMPLETED |
| 6.0 Semantic Search | `ai-architect` | `nestjs-specialist` | ⏳ PENDING |
| 7.0 AI Integration | `ai-architect` | `nestjs-specialist` | ⏳ PENDING |
| 8.0 Performance Optimization | `devops-engineer` | `test-engineer` | ⏳ PENDING |
| 9.0 Monitoring & Observability | `devops-engineer` | - | ⏳ PENDING |
| 10.0 Documentation & Testing | `test-engineer` | `typescript-architect` | ⏳ PENDING |

## Relevant Files (To Be Created/Modified)

### Database
- `libs/database/prisma/schema.prisma` - Vector column definitions
- `libs/database/prisma/migrations/` - pgvector migrations
- `libs/database/prisma/seeds/vector-seed.ts` - Seed embeddings

### Backend
- `apps/api/src/app/vector/vector.module.ts` - Vector module
- `apps/api/src/app/vector/vector.service.ts` - Core vector operations
- `apps/api/src/app/vector/embedding.service.ts` - Embedding generation
- `apps/api/src/app/vector/similarity.service.ts` - Similarity search
- `apps/api/src/app/vector/vector.controller.ts` - API endpoints

### Configuration
- `docker-compose.yml` - pgvector Docker image
- `infrastructure/helm/mykadoo/values.yaml` - Production config

---

## Tasks

### ✅ 1.0 Set up pgvector Extension

**Status:** COMPLETED
**Agent:** `devops-engineer`
**Commit:** `ea6c145` - 2025-12-28

#### 1.1 Install pgvector in local development ✅
- Updated docker-compose.yml to use `pgvector/pgvector:pg16` image
- PostgreSQL now includes vector similarity capabilities

#### 1.2 Create pgvector installation migration ✅
- Created `migrations/00000000000000_enable_pgvector/migration.sql`
- Created `migrations/00000000000001_add_vector_columns/migration.sql`
- Added vector columns to Product, Search, UserProfile models
- Created HNSW and IVFFlat indices
- Implemented SQL functions: find_similar_products, find_similar_queries, hybrid_search_products

#### 1.3 Configure pgvector in staging environment ✅
- Updated Helm values.yaml with pgvector image configuration
- Added initdb script to enable extension on startup
- Configured pgvector settings (dimensions: 1536, HNSW parameters)

#### 1.4 Configure pgvector in production environment ✅
- Updated values-production.yaml with production-optimized settings
- Higher HNSW parameters for better accuracy (m=32, efConstruction=128)
- Increased PostgreSQL resources for vector operations

#### 1.5 Document pgvector configuration ✅
- Created `docs/database/pgvector-guide.md`
- Comprehensive guide with architecture, configuration, SQL functions
- Troubleshooting and performance tuning sections

#### 1.6 Run linter and verify zero warnings ✅
#### 1.7 Run full test suite and verify all tests pass ✅
#### 1.8 Build project and verify successful compilation ✅
#### 1.9 Verify system functionality end-to-end ✅

---

### ✅ 2.0 Create Database Schema and Migrations

**Status:** COMPLETED (Done as part of Task 1.0)
**Agent:** `nestjs-specialist`, `typescript-architect`
**Commit:** `ea6c145` - 2025-12-28

#### 2.1 Add vector column to Product model ✅
- Defined embedding column with 1536 dimensions in Prisma schema
- Using `Unsupported("vector(1536)")` for Prisma compatibility

#### 2.2 Create HNSW index for products ✅
- Configured HNSW index with m=16, efConstruction=64 (dev/staging)
- Production settings: m=32, efConstruction=128 for better accuracy

#### 2.3 Add vector column to SearchQuery model ✅
- Added queryEmbedding to Search model
- Created IVFFlat index for query similarity

#### 2.4 Add vector column to UserPreference model ✅
- Added preferenceEmbedding to UserProfile model
- Enables personalized recommendations

#### 2.5 Create SQL functions for similarity search ✅
- find_similar_products function (cosine similarity)
- find_similar_queries function (query similarity)
- hybrid_search_products function (keyword + semantic)

#### 2.6 Create TypeScript types for vector operations ✅
- VectorSearchResult interface in vector.interfaces.ts
- SimilaritySearchOptions, HybridSearchOptions types
- Embedding type definitions

#### 2.7 Generate Prisma client with vector support ✅
- Raw SQL queries for vector operations
- Typed query builders in services

#### 2.8 Run linter and verify zero warnings ✅
#### 2.9 Run full test suite and verify all tests pass ✅
#### 2.10 Build project and verify successful compilation ✅
#### 2.11 Verify system functionality end-to-end ✅

---

### ✅ 3.0 Implement VectorService

**Status:** COMPLETED
**Agent:** `nestjs-specialist`, `ai-architect`
**Commit:** `789c97e` - 2025-12-28

#### 3.1 Create VectorModule with dependencies ✅
- Configured module with ConfigModule, PrismaModule, CacheModule
- Set up dependency injection for all services

#### 3.2 Implement EmbeddingService ✅
- OpenAI embedding generation (text-embedding-3-small, 1536 dimensions)
- Batch embedding generation for efficiency
- Cost tracking per embedding request
- Automatic retry with exponential backoff for rate limits

#### 3.3 Implement VectorStorageService ✅
- Store embeddings in PostgreSQL using raw SQL
- Batch insert operations for bulk processing
- Update existing embeddings
- Query products without embeddings for backfilling

#### 3.4 Implement SimilaritySearchService ✅
- Cosine similarity search via pgvector
- Filtered similarity by category, price range
- Top-K queries with configurable match count
- Hybrid search (keyword + semantic)
- Personalized recommendations by user ID

#### 3.5 Create VectorController for API access ✅
- POST /api/vectors/search - Semantic similarity search
- POST /api/vectors/hybrid-search - Combined keyword + semantic
- GET /api/vectors/products/:id/similar - Similar products
- GET /api/vectors/recommendations/:userId - Personalized recommendations
- GET /api/vectors/status - Embedding generation status
- POST /api/vectors/backfill - Backfill product embeddings
- GET /api/vectors/products/missing - Products needing embeddings

#### 3.6 Add Redis caching for embeddings ✅
- In-memory caching with @nestjs/cache-manager
- 1 hour TTL for cached embeddings
- Cache key generation for products and queries
- Cache invalidation methods

#### 3.7 Implement error handling and retries ✅
- Automatic retry with exponential backoff (3 attempts)
- Rate limit handling for OpenAI API
- Error logging and propagation
- Graceful degradation on failures

#### 3.8 Run linter and verify zero warnings ✅
#### 3.9 Run full test suite and verify all tests pass ✅
#### 3.10 Build project and verify successful compilation ✅
#### 3.11 Verify system functionality end-to-end ✅

---

### ✅ 4.0 Build Embedding Pipeline

**Status:** COMPLETED
**Agent:** `ai-architect`, `nestjs-specialist`
**Commit:** `524116a` - 2025-12-28

#### 4.1 Create product embedding job ✅
- EmbeddingJobProcessor with BullMQ for async embedding generation
- Batch processing with configurable batch size
- Job progress tracking with updateProgress()

#### 4.2 Implement backfill script for existing products ✅
- POST /api/embeddings/jobs/backfill endpoint
- Resume capability via job queue persistence
- Validation of generated embeddings before storage

#### 4.3 Add embedding generation to product creation ✅
- createProductEmbeddingJob() for new products
- Async processing via BullMQ queue
- Priority-based job scheduling

#### 4.4 Add embedding update on product modification ✅
- createUpdateEmbeddingJob() for modified products
- Tracks changed fields for smart re-generation
- Cache invalidation before regeneration

#### 4.5 Create embedding validation utilities ✅
- EmbeddingValidationService for quality checks
- Verifies embedding dimensions (1536)
- Detects zero vectors and invalid embeddings
- GET /api/embeddings/validation/coverage endpoint

#### 4.6 Implement embedding monitoring ✅
- EmbeddingMonitoringService for metrics tracking
- Success/failure rate monitoring
- Alert thresholds (5% warning, 10% critical)
- GET /api/embeddings/metrics/summary endpoint

#### 4.7 Add cost tracking for embedding generation ✅
- EmbeddingCostService for OpenAI usage tracking
- Daily/monthly budget management
- Cost projection and budget alerts
- GET /api/embeddings/cost/daily, /monthly, /projection endpoints

#### 4.8 Run linter and verify zero warnings ✅
#### 4.9 Run full test suite and verify all tests pass ✅
#### 4.10 Build project and verify successful compilation ✅
#### 4.11 Verify system functionality end-to-end ✅

---

### ✅ 5.0 Implement Similarity Search API

**Status:** COMPLETED
**Agent:** `nestjs-specialist`, `typescript-architect`
**Commit:** `351ebc4` - 2025-12-28

#### 5.1 Create similar products endpoint ✅
- GET /api/vectors/products/:id/similar (already implemented in Task 3.0)
- Configurable similarity threshold via matchThreshold param
- Limit and pagination support

#### 5.2 Implement category-filtered similarity ✅
- categoryFilter param for same-category recommendations
- Cross-category via default (no filter)

#### 5.3 Add price-range filtering to similarity ✅
- minPrice and maxPrice query params
- Implemented in SimilaritySearchService

#### 5.4 Create similar products UI component ✅
- Created `SimilarProducts.tsx` component with "You might also like" section
- Lazy loading via IntersectionObserver (200px rootMargin)
- Horizontal scroll carousel with navigation arrows
- `useSimilarProducts` hook for easy integration

#### 5.5 Implement A/B testing for recommendations ✅
- `SimilarityAnalyticsService` with 4 variants: control, basic, hybrid, personalized
- Deterministic variant assignment based on user/session ID
- Configurable weights (10% control, 30% each treatment)
- A/B test results endpoint with statistical significance

#### 5.6 Add analytics for similarity searches ✅
- Created `similarity_events` database table with indexes
- Track search, impression, click, and conversion events
- Event buffering for performance (100 events, 30s flush)
- REST API endpoints for tracking and metrics:
  - POST /api/similarity-analytics/track/search
  - POST /api/similarity-analytics/track/impression
  - POST /api/similarity-analytics/track/click
  - POST /api/similarity-analytics/track/conversion
  - GET /api/similarity-analytics/metrics
  - GET /api/similarity-analytics/ab-test/results

#### 5.7 Run linter and verify zero warnings ✅
#### 5.8 Run full test suite and verify all tests pass ✅
#### 5.9 Build project and verify successful compilation ✅
#### 5.10 Verify system functionality end-to-end ✅

---

### ⏳ 6.0 Implement Semantic Search

**Status:** PENDING
**Agent:** `ai-architect`, `nestjs-specialist`
**Estimated:** 5 days

#### 6.1 Embed search queries on submission
- Generate embedding for user query
- Cache query embeddings

#### 6.2 Implement hybrid search (keyword + semantic)
- Combine full-text and vector search
- Configurable weights
- RRF (Reciprocal Rank Fusion) for ranking

#### 6.3 Create semantic search endpoint
- POST /api/search/semantic
- Return products with relevance scores

#### 6.4 Update existing search to use hybrid mode
- Gradual rollout
- Fallback to keyword search

#### 6.5 Implement query expansion
- Generate related queries
- Improve recall

#### 6.6 Add search result re-ranking
- Use embeddings for final ranking
- Personalization factor

#### 6.7 Create search quality metrics
- Precision and recall tracking
- User satisfaction signals

#### 6.8 Run linter and verify zero warnings
#### 6.9 Run full test suite and verify all tests pass
#### 6.10 Build project and verify successful compilation
#### 6.11 Verify system functionality end-to-end

---

### ⏳ 7.0 Integrate with AI Agents

**Status:** PENDING
**Agent:** `ai-architect`, `nestjs-specialist`
**Estimated:** 4 days

#### 7.1 Connect AI recommendation service to VectorService
- Replace external vector DB calls
- Maintain API compatibility

#### 7.2 Implement user preference vectors
- Aggregate user behavior into vectors
- Update preferences incrementally

#### 7.3 Create personalized recommendation engine
- Combine user preferences with product vectors
- Real-time personalization

#### 7.4 Add context-aware recommendations
- Use conversation context
- Recipient profile vectors

#### 7.5 Implement recommendation explanation
- Show why items are recommended
- Transparency for users

#### 7.6 Create recommendation diversity
- Avoid filter bubbles
- Exploration vs exploitation

#### 7.7 Run linter and verify zero warnings
#### 7.8 Run full test suite and verify all tests pass
#### 7.9 Build project and verify successful compilation
#### 7.10 Verify system functionality end-to-end

---

### ⏳ 8.0 Performance Optimization

**Status:** PENDING
**Agent:** `devops-engineer`, `test-engineer`
**Estimated:** 3 days

#### 8.1 Benchmark similarity search performance
- Test with various dataset sizes
- Identify bottlenecks

#### 8.2 Optimize HNSW index parameters
- Tune m and efConstruction
- Balance accuracy vs speed

#### 8.3 Implement query result caching
- Cache popular similarity searches
- Invalidation strategy

#### 8.4 Add connection pooling for vector queries
- Dedicated pool for heavy queries
- Prevent resource contention

#### 8.5 Create load testing suite
- k6 load tests for vector endpoints
- Establish performance baselines

#### 8.6 Optimize batch embedding generation
- Parallel processing
- Memory management

#### 8.7 Run linter and verify zero warnings
#### 8.8 Run full test suite and verify all tests pass
#### 8.9 Build project and verify successful compilation
#### 8.10 Verify system functionality end-to-end

---

### ⏳ 9.0 Monitoring and Observability

**Status:** PENDING
**Agent:** `devops-engineer`
**Estimated:** 2 days

#### 9.1 Add Prometheus metrics for vector operations
- Query latency histograms
- Embedding generation counters
- Cache hit rates

#### 9.2 Create Grafana dashboard for vector store
- Query performance charts
- Index statistics
- Storage usage

#### 9.3 Set up alerts for vector operations
- Slow query alerts
- High error rate alerts
- Storage threshold alerts

#### 9.4 Add structured logging for vector queries
- Query details and timing
- Error context

#### 9.5 Run linter and verify zero warnings
#### 9.6 Run full test suite and verify all tests pass
#### 9.7 Build project and verify successful compilation
#### 9.8 Verify system functionality end-to-end

---

### ⏳ 10.0 Documentation and Testing

**Status:** PENDING
**Agent:** `test-engineer`, `typescript-architect`
**Estimated:** 3 days

#### 10.1 Write unit tests for VectorService
- Test embedding generation
- Test similarity search
- Mock OpenAI responses

#### 10.2 Write integration tests for vector endpoints
- Test full request flow
- Database integration tests

#### 10.3 Create vector operation benchmarks
- Automated performance testing
- Regression detection

#### 10.4 Document vector API endpoints
- OpenAPI specifications
- Usage examples

#### 10.5 Write developer guide for vector operations
- How to add new embeddings
- Best practices

#### 10.6 Create runbook for vector operations
- Troubleshooting guide
- Recovery procedures

#### 10.7 Run linter and verify zero warnings
#### 10.8 Run full test suite and verify all tests pass
#### 10.9 Build project and verify successful compilation
#### 10.10 Verify system functionality end-to-end

---

## Implementation Summary

**Overall Status:** IN PROGRESS (50% complete)
**Completed:** 5/10 tasks
**Remaining:** 5 tasks
**Estimated Total Effort:** 8 weeks

### Key Deliverables
- ✅ pgvector extension configured in all environments
- ✅ Database schema with vector columns and indices
- ✅ VectorService with embedding and similarity search
- ✅ Embedding pipeline with BullMQ job queue
- ✅ Similarity Search API with A/B testing and analytics
- ⏳ Semantic/hybrid search API
- ⏳ AI agent integration
- ⏳ Performance-optimized vector queries
- ⏳ Monitoring and documentation

### Dependencies
- OpenAI API access (for embedding generation)
- PostgreSQL 16 with pgvector extension
- Redis for caching

### Success Criteria
1. Zero external vector database costs
2. < 100ms p95 similarity search latency
3. > 90% search relevance accuracy
4. All AI features functioning with pgvector backend

---

## Changelog

| Date | Author | Description |
|------|--------|-------------|
| 2025-12-28 | Engineering | Initial task list creation |
| 2025-12-28 | Engineering | Task 1.0 completed - pgvector setup and configuration |
| 2025-12-28 | Engineering | Task 2.0 completed - Schema and migrations (done with Task 1.0) |
| 2025-12-28 | Engineering | Task 3.0 completed - VectorService implementation |
| 2025-12-28 | Engineering | Task 4.0 completed - Embedding pipeline with BullMQ |
| 2025-12-28 | Engineering | Task 5.0 completed - Similarity Search API with A/B testing and analytics |
