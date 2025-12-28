# PRD 0021: PostgreSQL Vector Store Integration

**Status:** PENDING
**Priority:** P1 - High
**Created:** 2025-12-28
**Owner:** Engineering Team

## Problem Statement

The current architecture plans for external vector database services (Pinecone, Weaviate) for semantic search and AI recommendation features. This introduces:

1. **Additional costs** - Vector databases charge per query and storage
2. **Operational complexity** - Managing another external service
3. **Data synchronization** - Keeping vectors in sync with PostgreSQL data
4. **Vendor lock-in** - Dependency on third-party services
5. **Latency** - Network round-trips to external services

## Proposed Solution

Migrate to **pgvector** - a PostgreSQL extension that provides vector similarity search capabilities directly within our existing PostgreSQL database. This consolidates our data layer and eliminates external dependencies.

### Why pgvector?

- **Native PostgreSQL** - No additional infrastructure to manage
- **ACID compliance** - Vectors are transactionally consistent with related data
- **Cost-effective** - No per-query charges, just storage
- **Performance** - IVFFlat and HNSW indexes for fast similarity search
- **Proven** - Used by Supabase, Render, and many production systems
- **Open source** - No vendor lock-in

## Goals

1. **Eliminate external vector database costs** - Target: $0 additional vector storage costs
2. **Simplify architecture** - Reduce from 3 data stores to 2 (PostgreSQL + Redis)
3. **Improve data consistency** - Single source of truth for all product data
4. **Maintain search performance** - < 100ms p95 for similarity searches
5. **Enable AI features** - Support semantic search, recommendations, and embeddings

## User Stories

### US-1: Developer Experience
As a developer, I want to store and query vector embeddings using familiar PostgreSQL syntax so that I don't need to learn a new database system.

### US-2: Product Similarity Search
As a user, I want to find products similar to one I'm viewing so that I can discover related gift options.

### US-3: Semantic Search
As a user, I want to search for gifts using natural language so that I can find items even when I don't know exact product names.

### US-4: AI Recommendations
As a user, I want personalized gift recommendations based on my search history and preferences so that I can discover relevant items quickly.

### US-5: Cost Management
As an operations team, I want to minimize third-party service costs while maintaining feature parity so that we can scale efficiently.

## Functional Requirements

### FR-1: Vector Storage
- Store 1536-dimensional vectors (OpenAI ada-002 embeddings)
- Support up to 10 million vectors initially
- Automatic vector normalization

### FR-2: Similarity Search
- Cosine similarity search
- L2 (Euclidean) distance search
- Inner product similarity
- Top-K nearest neighbor queries
- Filtered similarity search (combine vector search with SQL WHERE clauses)

### FR-3: Indexing
- IVFFlat index for high-volume, approximate search
- HNSW index for high-accuracy, real-time search
- Automatic index selection based on table size

### FR-4: Integration
- Prisma schema extension for vector columns
- TypeScript types for vector operations
- Integration with existing AI service

### FR-5: Data Migration
- Migration scripts for existing product embeddings
- Backfill pipeline for historical data
- Validation of migrated vectors

## Technical Requirements

### TR-1: Database Schema

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  // ... existing fields

  // Vector embedding for semantic search
  embedding   Unsupported("vector(1536)")?

  @@index([embedding], type: Hnsw(m: 16, efConstruction: 200))
}

model SearchQuery {
  id        String   @id @default(cuid())
  query     String
  userId    String?

  // Embedded search query for similarity matching
  embedding Unsupported("vector(1536)")?

  @@index([embedding], type: IvfFlat(lists: 100))
}
```

### TR-2: SQL Functions

```sql
-- Find similar products
CREATE OR REPLACE FUNCTION find_similar_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id text,
  name text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    name,
    1 - (embedding <=> query_embedding) as similarity
  FROM "Product"
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### TR-3: Performance Requirements
- Similarity search: < 50ms for 1M vectors
- Index build time: < 10 minutes for 1M vectors
- Storage: ~6KB per 1536-dim vector

### TR-4: Dependencies
- PostgreSQL 14+ (current: 16)
- pgvector extension v0.5.0+
- Node.js pg driver with vector support

## Non-Functional Requirements

### NFR-1: Scalability
- Support 10M+ vectors without performance degradation
- Horizontal read scaling via read replicas

### NFR-2: Availability
- Vector operations inherit PostgreSQL HA configuration
- Graceful degradation if embeddings unavailable

### NFR-3: Security
- Vectors stored with same security as other data
- No additional access controls required

### NFR-4: Observability
- Query performance metrics in Prometheus
- Slow query logging for vector operations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   AI Agent   │    │ Search API   │    │ Product API  │  │
│  │   Service    │    │   Service    │    │   Service    │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                    │                    │          │
│         └────────────────────┼────────────────────┘          │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │  Vector Service   │                    │
│                    │  (Embedding Gen)  │                    │
│                    └─────────┬─────────┘                    │
│                              │                               │
├──────────────────────────────┼──────────────────────────────┤
│                              │                               │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │              PostgreSQL + pgvector                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  Products   │  │   Users     │  │   Search    │   │  │
│  │  │ + vectors   │  │             │  │   History   │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Redis Cache                         │  │
│  │         (Query results, embeddings cache)             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Vector DB monthly cost | $0 (not implemented) | $0 |
| Similarity search p95 latency | N/A | < 100ms |
| Index storage per 1M vectors | N/A | < 6GB |
| Data sync issues | N/A | 0 |
| Query accuracy (relevance) | N/A | > 90% |

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance at scale | Medium | High | HNSW indexing, query optimization, caching |
| Prisma vector support | Low | Medium | Use raw SQL for vector ops, typed wrappers |
| Migration complexity | Medium | Medium | Phased rollout, dual-write period |
| PostgreSQL resource contention | Low | Medium | Dedicated connection pool for vector queries |

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Install pgvector extension
- Create vector columns and indexes
- Implement VectorService in NestJS
- Unit tests for vector operations

### Phase 2: Product Embeddings (Week 3-4)
- Generate embeddings for existing products
- Implement similarity search API
- Add "similar products" feature
- Integration tests

### Phase 3: Semantic Search (Week 5-6)
- Embed search queries
- Hybrid search (keyword + semantic)
- Search ranking improvements
- Performance optimization

### Phase 4: AI Integration (Week 7-8)
- Connect AI agents to vector store
- Implement recommendation engine
- User preference vectors
- A/B testing framework

## Dependencies

- PRD 0001: Core Gift Search & AI (completed)
- PRD 0003: E-commerce Integration (completed)
- PostgreSQL 16 with pgvector extension

## Acceptance Criteria

1. **AC-1:** pgvector extension installed and configured in all environments
2. **AC-2:** Product table has embedding column with HNSW index
3. **AC-3:** VectorService can generate and store embeddings
4. **AC-4:** Similarity search returns relevant results in < 100ms
5. **AC-5:** All existing AI features work with pgvector backend
6. **AC-6:** Zero external vector database dependencies
7. **AC-7:** Documentation updated with vector operations guide
8. **AC-8:** Monitoring dashboards show vector query metrics

## Open Questions

1. Should we use IVFFlat or HNSW as default index? (Recommendation: HNSW for better accuracy)
2. What embedding model to use? (Recommendation: OpenAI text-embedding-3-small for cost efficiency)
3. How to handle embedding updates when product data changes? (Recommendation: Async job queue)

---

## Changelog

| Date | Author | Description |
|------|--------|-------------|
| 2025-12-28 | Engineering | Initial PRD creation |
