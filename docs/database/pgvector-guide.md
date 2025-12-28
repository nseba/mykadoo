# PostgreSQL Vector Store Guide (pgvector)

## Overview

Mykadoo uses pgvector, a PostgreSQL extension, for vector similarity search instead of external vector databases. This approach minimizes third-party costs while providing powerful semantic search capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  VectorService  │  EmbeddingService  │  SimilaritySearchService │
├─────────────────────────────────────────────────────────────────┤
│                     PostgreSQL + pgvector                        │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────────┐   │
│  │   Products  │ │   Searches   │ │   UserProfiles          │   │
│  │  embedding  │ │ queryEmbedding│ │ preferenceEmbedding    │   │
│  │ (HNSW idx)  │ │(IVFFlat idx) │ │ (IVFFlat idx)          │   │
│  └─────────────┘ └──────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Local Development

The `docker-compose.yml` uses the official pgvector Docker image:

```yaml
postgres:
  image: pgvector/pgvector:pg16
```

Start the database:
```bash
docker-compose up -d postgres
```

### Kubernetes/Helm

The Helm chart is configured to use pgvector:

```yaml
postgresql:
  image:
    repository: pgvector/pgvector
    tag: pg16
  primary:
    initdb:
      scripts:
        enable-pgvector.sql: |
          CREATE EXTENSION IF NOT EXISTS vector;
```

## Vector Columns

### Products Table
```sql
-- 1536 dimensions for OpenAI text-embedding-3-small
embedding vector(1536)
```

Used for:
- Product similarity search
- Semantic product recommendations
- "You might also like" features

### Searches Table
```sql
query_embedding vector(1536)
```

Used for:
- Query similarity matching
- Search suggestion improvements
- Query expansion

### UserProfiles Table
```sql
preference_embedding vector(1536)
```

Used for:
- Personalized recommendations
- User preference matching
- Cross-user similarity

## Index Types

### HNSW (Hierarchical Navigable Small World)

**Use for:** Frequently queried tables (products)

```sql
CREATE INDEX products_embedding_hnsw_idx
ON products USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Parameters:**
- `m`: Number of connections per layer (higher = more accurate, more memory)
- `ef_construction`: Search breadth during build (higher = better quality)

**Trade-offs:**
- Faster queries
- More memory usage
- Slower index builds

### IVFFlat (Inverted File with Flat compression)

**Use for:** Large tables with less frequent queries

```sql
CREATE INDEX searches_query_embedding_ivfflat_idx
ON searches USING ivfflat (query_embedding vector_cosine_ops)
WITH (lists = 100);
```

**Parameters:**
- `lists`: Number of clusters (use sqrt(rows) as starting point)

**Trade-offs:**
- Lower memory usage
- Faster index builds
- Slightly slower queries

## SQL Functions

### find_similar_products

Find products similar to a query vector:

```sql
SELECT * FROM find_similar_products(
  query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  match_threshold := 0.7,
  match_count := 10,
  category_filter := 'Electronics',
  min_price := 50.0,
  max_price := 500.0
);
```

### find_similar_queries

Find similar search queries:

```sql
SELECT * FROM find_similar_queries(
  query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  match_threshold := 0.8,
  match_count := 5
);
```

### hybrid_search_products

Combine keyword and semantic search:

```sql
SELECT * FROM hybrid_search_products(
  search_query := 'wireless headphones',
  query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  keyword_weight := 0.3,
  semantic_weight := 0.7,
  match_count := 20
);
```

## Distance Functions

pgvector supports multiple distance operators:

| Operator | Function | Use Case |
|----------|----------|----------|
| `<->` | L2 distance | General similarity |
| `<=>` | Cosine distance | Normalized vectors (embeddings) |
| `<#>` | Inner product | When vectors are already normalized |

For embeddings, use **cosine distance** (`<=>`) which is the default in our functions.

## Performance Tuning

### Index Parameters

**Development:**
```yaml
hnsw:
  m: 16
  efConstruction: 64
```

**Production:**
```yaml
hnsw:
  m: 32
  efConstruction: 128
```

### Query Optimization

Set search parameters per session:
```sql
-- Increase accuracy at cost of speed
SET hnsw.ef_search = 100;

-- Default is 40, increase for better recall
SET ivfflat.probes = 10;
```

### Memory Configuration

For large vector datasets, increase PostgreSQL shared buffers:

```yaml
postgresql:
  primary:
    resources:
      limits:
        memory: "4Gi"
```

## Embedding Generation

### OpenAI text-embedding-3-small

Recommended model for cost-effectiveness:

```typescript
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Your text here",
});
const embedding = response.data[0].embedding;
```

**Properties:**
- 1536 dimensions
- ~$0.00002 per 1K tokens
- Good quality for most use cases

### Alternative Models

| Model | Dimensions | Cost (per 1M tokens) |
|-------|------------|---------------------|
| text-embedding-3-small | 1536 | $0.02 |
| text-embedding-3-large | 3072 | $0.13 |
| text-embedding-ada-002 | 1536 | $0.10 |

## Migrations

### Initial Setup

```bash
# Apply migrations
npx prisma migrate deploy
```

### Adding Vector Column to Existing Table

```sql
-- Add column
ALTER TABLE my_table ADD COLUMN embedding vector(1536);

-- Create index (after populating embeddings)
CREATE INDEX my_table_embedding_idx
ON my_table USING hnsw (embedding vector_cosine_ops);
```

## Troubleshooting

### Extension Not Found

```
ERROR: type "vector" does not exist
```

**Solution:** Ensure pgvector extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Slow Queries

1. Check if index exists:
```sql
SELECT * FROM pg_indexes WHERE indexname LIKE '%embedding%';
```

2. Analyze table after bulk inserts:
```sql
ANALYZE products;
```

3. Increase `ef_search` for better accuracy:
```sql
SET hnsw.ef_search = 100;
```

### Out of Memory

For large datasets, increase resources:
```yaml
postgresql:
  primary:
    resources:
      limits:
        memory: "8Gi"
```

### Index Build Too Slow

Use IVFFlat for initial development, switch to HNSW for production:

```sql
-- Faster to build
CREATE INDEX USING ivfflat (...) WITH (lists = 100);

-- Later, replace with HNSW
DROP INDEX old_ivfflat_idx;
CREATE INDEX USING hnsw (...);
```

## Monitoring

### Vector Index Stats

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
FROM pg_indexes
WHERE indexname LIKE '%embedding%';
```

### Query Performance

```sql
EXPLAIN ANALYZE
SELECT * FROM find_similar_products(
  query_embedding := '[...]'::vector(1536),
  match_count := 10
);
```

## Best Practices

1. **Batch Embeddings**: Generate embeddings in batches of 100-500 for efficiency
2. **Cache Embeddings**: Store embeddings to avoid regenerating
3. **Use Appropriate Index**: HNSW for frequently queried, IVFFlat for archival
4. **Monitor Costs**: Track OpenAI API usage for embedding generation
5. **Regular ANALYZE**: Run after bulk operations for optimal query planning

---

**Last Updated:** 2025-12-28
**Owner:** Engineering Team
