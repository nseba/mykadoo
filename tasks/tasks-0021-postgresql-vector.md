# Tasks: PostgreSQL Vector Store Integration (PRD 0021)

**Status:** PENDING
**Priority:** P1 - High
**Created:** 2025-12-28
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
| 1.0 pgvector Setup | `devops-engineer` | - | ⏳ PENDING |
| 2.0 Schema & Migrations | `nestjs-specialist` | `typescript-architect` | ⏳ PENDING |
| 3.0 VectorService | `nestjs-specialist` | `ai-architect` | ⏳ PENDING |
| 4.0 Embedding Pipeline | `ai-architect` | `nestjs-specialist` | ⏳ PENDING |
| 5.0 Similarity Search | `nestjs-specialist` | `typescript-architect` | ⏳ PENDING |
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

### ⏳ 1.0 Set up pgvector Extension

**Status:** PENDING
**Agent:** `devops-engineer`
**Estimated:** 2 days

#### 1.1 Install pgvector in local development
- Update docker-compose.yml to use pgvector-enabled PostgreSQL image
- Verify extension loads correctly

#### 1.2 Create pgvector installation migration
- Write Prisma migration to enable pgvector extension
- Handle migration for existing databases

#### 1.3 Configure pgvector in staging environment
- Update Helm values for staging
- Test extension in Kubernetes

#### 1.4 Configure pgvector in production environment
- Update production Helm values
- Verify extension availability

#### 1.5 Document pgvector configuration
- Add configuration guide to docs
- Include troubleshooting steps

#### 1.6 Run linter and verify zero warnings
#### 1.7 Run full test suite and verify all tests pass
#### 1.8 Build project and verify successful compilation
#### 1.9 Verify system functionality end-to-end

---

### ⏳ 2.0 Create Database Schema and Migrations

**Status:** PENDING
**Agent:** `nestjs-specialist`, `typescript-architect`
**Estimated:** 3 days

#### 2.1 Add vector column to Product model
- Define embedding column with correct dimensions (1536)
- Handle Prisma Unsupported type

#### 2.2 Create HNSW index for products
- Configure optimal HNSW parameters (m, efConstruction)
- Test index performance

#### 2.3 Add vector column to SearchQuery model
- Store search query embeddings
- Create IVFFlat index for query similarity

#### 2.4 Add vector column to UserPreference model
- Store user preference vectors
- Enable personalized recommendations

#### 2.5 Create SQL functions for similarity search
- find_similar_products function
- find_similar_queries function
- Hybrid search function

#### 2.6 Create TypeScript types for vector operations
- VectorSearchResult interface
- SimilarityOptions type
- Embedding type definitions

#### 2.7 Generate Prisma client with vector support
- Handle raw SQL for vector operations
- Create typed query builders

#### 2.8 Run linter and verify zero warnings
#### 2.9 Run full test suite and verify all tests pass
#### 2.10 Build project and verify successful compilation
#### 2.11 Verify system functionality end-to-end

---

### ⏳ 3.0 Implement VectorService

**Status:** PENDING
**Agent:** `nestjs-specialist`, `ai-architect`
**Estimated:** 4 days

#### 3.1 Create VectorModule with dependencies
- Configure module imports
- Set up dependency injection

#### 3.2 Implement EmbeddingService
- OpenAI embedding generation
- Support for text-embedding-3-small model
- Batch embedding generation
- Caching layer for embeddings

#### 3.3 Implement VectorStorageService
- Store embeddings in PostgreSQL
- Update existing embeddings
- Bulk insert operations

#### 3.4 Implement SimilaritySearchService
- Cosine similarity search
- L2 distance search
- Filtered similarity search
- Top-K queries with pagination

#### 3.5 Create VectorController for API access
- POST /api/vectors/search - Similarity search
- POST /api/vectors/embed - Generate embedding
- GET /api/products/:id/similar - Similar products

#### 3.6 Add Redis caching for embeddings
- Cache frequently used embeddings
- TTL configuration
- Cache invalidation

#### 3.7 Implement error handling and retries
- Handle OpenAI rate limits
- Graceful degradation
- Circuit breaker pattern

#### 3.8 Run linter and verify zero warnings
#### 3.9 Run full test suite and verify all tests pass
#### 3.10 Build project and verify successful compilation
#### 3.11 Verify system functionality end-to-end

---

### ⏳ 4.0 Build Embedding Pipeline

**Status:** PENDING
**Agent:** `ai-architect`, `nestjs-specialist`
**Estimated:** 4 days

#### 4.1 Create product embedding job
- BullMQ job for generating product embeddings
- Batch processing for efficiency
- Progress tracking

#### 4.2 Implement backfill script for existing products
- Process all products without embeddings
- Resume capability for interruptions
- Validation of generated embeddings

#### 4.3 Add embedding generation to product creation
- Trigger embedding on new product
- Async processing via job queue

#### 4.4 Add embedding update on product modification
- Detect relevant field changes
- Re-generate embedding when needed

#### 4.5 Create embedding validation utilities
- Verify embedding dimensions
- Check for null/invalid embeddings
- Quality metrics

#### 4.6 Implement embedding monitoring
- Track embedding generation success/failure
- Alert on high failure rates
- Dashboard for embedding status

#### 4.7 Add cost tracking for embedding generation
- Track OpenAI API usage
- Cost attribution per product
- Budget alerts

#### 4.8 Run linter and verify zero warnings
#### 4.9 Run full test suite and verify all tests pass
#### 4.10 Build project and verify successful compilation
#### 4.11 Verify system functionality end-to-end

---

### ⏳ 5.0 Implement Similarity Search API

**Status:** PENDING
**Agent:** `nestjs-specialist`, `typescript-architect`
**Estimated:** 3 days

#### 5.1 Create similar products endpoint
- GET /api/products/:id/similar
- Configurable similarity threshold
- Limit and pagination

#### 5.2 Implement category-filtered similarity
- Similar products within category
- Cross-category recommendations

#### 5.3 Add price-range filtering to similarity
- Similar products in price range
- Price tolerance configuration

#### 5.4 Create similar products UI component
- "You might also like" section
- Lazy loading for performance

#### 5.5 Implement A/B testing for recommendations
- Track click-through rates
- Compare with baseline

#### 5.6 Add analytics for similarity searches
- Log search requests
- Track conversion rates

#### 5.7 Run linter and verify zero warnings
#### 5.8 Run full test suite and verify all tests pass
#### 5.9 Build project and verify successful compilation
#### 5.10 Verify system functionality end-to-end

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

**Overall Status:** PENDING
**Completed:** 0/10 tasks
**Remaining:** 10 tasks
**Estimated Total Effort:** 8 weeks

### Key Deliverables
- ⏳ pgvector extension configured in all environments
- ⏳ VectorService with embedding and similarity search
- ⏳ Product similarity feature
- ⏳ Semantic/hybrid search
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
