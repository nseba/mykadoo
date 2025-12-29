# Vector Operations Runbook

This runbook provides procedures for operating, monitoring, and troubleshooting the vector search system.

## Table of Contents

1. [System Overview](#system-overview)
2. [Health Checks](#health-checks)
3. [Common Operations](#common-operations)
4. [Incident Response](#incident-response)
5. [Recovery Procedures](#recovery-procedures)
6. [Maintenance Tasks](#maintenance-tasks)

---

## System Overview

### Components

| Component | Purpose | Health Endpoint |
|-----------|---------|-----------------|
| VectorService | Main facade | `/api/vectors/status` |
| EmbeddingService | OpenAI embeddings | N/A (checked via status) |
| pgvector | Vector storage | `/api/health` |
| QueryCacheService | L1/L2 cache | `/api/performance/cache/stats` |
| VectorPoolService | Connection pool | `/api/performance/pool/health` |
| Prometheus | Metrics | `/api/vector-monitoring/metrics` |

### Key Metrics

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| p95 Search Latency | > 500ms | > 2000ms |
| Error Rate | > 2% | > 5% |
| Embedding Coverage | < 80% | < 50% |
| Cache Hit Rate | < 50% | < 30% |
| Pool Utilization | > 80% | > 95% |

---

## Health Checks

### Quick Health Check

```bash
# Check overall vector health
curl -s http://localhost:3000/api/vector-monitoring/health | jq

# Expected response:
# {
#   "status": "healthy",
#   "indexHealth": "ok",
#   "cacheHealth": "ok",
#   "poolHealth": "ok"
# }
```

### Detailed Health Check

```bash
# Check embedding status
curl -s http://localhost:3000/api/vectors/status | jq

# Check pool stats
curl -s http://localhost:3000/api/performance/pool/stats | jq

# Check cache stats
curl -s http://localhost:3000/api/performance/cache/stats | jq

# Check Prometheus metrics
curl -s http://localhost:3000/api/vector-monitoring/metrics
```

### Database Health Check

```sql
-- Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check index health
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE indexname LIKE '%embedding%' OR indexname LIKE '%hnsw%';

-- Check table sizes
SELECT
    relname as table,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_catalog.pg_statio_user_tables
WHERE relname IN ('products', 'searches', 'user_profiles')
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## Common Operations

### Regenerate Embeddings for a Product

```bash
# Via API
curl -X POST http://localhost:3000/api/vectors/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "Product title and description"}'

# Via CLI (if implemented)
yarn nx run api:embedding:regenerate --productId=<product-id>
```

### Backfill Missing Embeddings

```bash
# Check how many products need embeddings
curl -s http://localhost:3000/api/vectors/products/missing?limit=1 | jq '.count'

# Run backfill (in batches)
curl -X POST http://localhost:3000/api/vectors/backfill \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "batchSize": 50}'

# Monitor progress
watch -n 5 'curl -s http://localhost:3000/api/vectors/status | jq ".coverage"'
```

### Clear Cache

```bash
# Invalidate all cache
curl -X POST http://localhost:3000/api/performance/cache/invalidate

# Clean expired entries only
curl -X POST http://localhost:3000/api/performance/cache/cleanup
```

### Tune HNSW ef_search

```bash
# Run tuning benchmark
curl -X POST http://localhost:3000/api/performance/tune-ef-search \
  -H "Content-Type: application/json" \
  -d '{"minEfSearch": 40, "maxEfSearch": 200, "step": 20}'

# Apply new setting (runtime)
psql -d mykadoo -c "SET hnsw.ef_search = 80;"
```

---

## Incident Response

### High Latency Alert

**Symptoms:**
- SlowVectorSearch alert firing
- p95 latency > 500ms

**Triage Steps:**

1. Check current load:
   ```bash
   curl -s http://localhost:3000/api/performance/pool/stats | jq
   ```

2. Check for slow queries:
   ```sql
   SELECT query, calls, mean_exec_time, max_exec_time
   FROM pg_stat_statements
   WHERE query LIKE '%vector%' OR query LIKE '%embedding%'
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. Check cache hit rate:
   ```bash
   curl -s http://localhost:3000/api/performance/cache/stats | jq '.hitRate'
   ```

**Remediation:**

- If cache hit rate is low: Warm cache with popular queries
- If pool is saturated: Increase VECTOR_POOL_MAX
- If all queries are slow: Check PostgreSQL performance, consider VACUUM ANALYZE

---

### High Error Rate Alert

**Symptoms:**
- HighVectorErrorRate alert firing
- Error rate > 5%

**Triage Steps:**

1. Check error types:
   ```bash
   curl -s http://localhost:3000/api/vector-monitoring/metrics | grep vector_errors
   ```

2. Check recent logs:
   ```bash
   kubectl logs -l app=api --since=5m | grep -i "vector\|embedding"
   ```

3. Check OpenAI API status:
   ```bash
   curl -s https://status.openai.com/api/v2/status.json | jq
   ```

**Remediation:**

- If OpenAI rate limited: Reduce request rate, check quotas
- If database errors: Check PostgreSQL logs, connection pool
- If embedding validation errors: Check for corrupted data

---

### Low Embedding Coverage Alert

**Symptoms:**
- LowEmbeddingCoverage alert firing
- Coverage < 80%

**Triage Steps:**

1. Check current coverage:
   ```bash
   curl -s http://localhost:3000/api/vectors/status | jq
   ```

2. Count products without embeddings:
   ```sql
   SELECT COUNT(*) FROM products WHERE embedding IS NULL;
   ```

3. Check backfill job status:
   ```bash
   # If using BullMQ
   curl -s http://localhost:3000/api/embeddings/jobs/status
   ```

**Remediation:**

1. Run backfill:
   ```bash
   curl -X POST http://localhost:3000/api/vectors/backfill \
     -d '{"limit": 500, "batchSize": 50}'
   ```

2. Monitor progress:
   ```bash
   watch -n 10 'curl -s http://localhost:3000/api/vectors/status | jq ".coverage"'
   ```

---

### Connection Pool Exhaustion

**Symptoms:**
- CriticalVectorPoolUtilization alert firing
- Pool utilization > 95%

**Triage Steps:**

1. Check pool stats:
   ```bash
   curl -s http://localhost:3000/api/performance/pool/stats | jq
   ```

2. Check for long-running queries:
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state = 'active' AND query LIKE '%vector%'
   ORDER BY duration DESC;
   ```

**Immediate Remediation:**

1. Kill long-running queries (if safe):
   ```sql
   SELECT pg_terminate_backend(<pid>);
   ```

2. Temporarily increase pool size:
   ```bash
   # Update environment variable and restart
   VECTOR_POOL_MAX=20
   ```

**Long-term Fix:**

- Review query patterns for optimization
- Add connection timeouts
- Consider read replicas for search traffic

---

## Recovery Procedures

### Rebuild HNSW Index

If index becomes corrupted or performance degrades significantly:

```sql
-- Drop existing index
DROP INDEX IF EXISTS idx_products_embedding_hnsw;

-- Recreate with optimal settings
CREATE INDEX CONCURRENTLY idx_products_embedding_hnsw
ON products
USING hnsw (embedding vector_cosine_ops)
WITH (m = 24, ef_construction = 100);

-- Analyze table
ANALYZE products;
```

**Expected Duration:** ~1 hour per 100K products

---

### Restore from Backup

If embeddings are lost or corrupted:

1. Stop incoming traffic:
   ```bash
   kubectl scale deployment api --replicas=0
   ```

2. Restore from backup:
   ```bash
   pg_restore -d mykadoo -t products backup_file.dump
   ```

3. Verify embeddings:
   ```sql
   SELECT COUNT(*) FROM products WHERE embedding IS NOT NULL;
   ```

4. Resume traffic:
   ```bash
   kubectl scale deployment api --replicas=3
   ```

---

### Regenerate All Embeddings

In case of model change or complete re-embedding:

1. Create embedding job:
   ```bash
   curl -X POST http://localhost:3000/api/embeddings/jobs/backfill \
     -d '{"force": true, "batchSize": 100}'
   ```

2. Monitor progress:
   ```bash
   # Check job status
   curl -s http://localhost:3000/api/embeddings/jobs/status

   # Watch coverage increase
   watch 'curl -s http://localhost:3000/api/vectors/status | jq'
   ```

3. Estimated time: ~10 hours for 100K products (at 10 embeddings/second)

4. Estimated cost: ~$2 per 100K products (text-embedding-3-small)

---

## Maintenance Tasks

### Daily

- [ ] Review error rate in Grafana dashboard
- [ ] Check embedding coverage (should be >90%)
- [ ] Verify cache hit rate (should be >50%)

### Weekly

- [ ] Run VACUUM ANALYZE on vector tables:
  ```sql
  VACUUM ANALYZE products;
  VACUUM ANALYZE searches;
  VACUUM ANALYZE user_profiles;
  ```
- [ ] Review slow query logs
- [ ] Check OpenAI API usage/costs
- [ ] Clean expired cache entries

### Monthly

- [ ] Review and optimize HNSW index parameters
- [ ] Run full benchmark suite
- [ ] Review embedding model costs
- [ ] Check for pgvector updates
- [ ] Audit search quality metrics

### Quarterly

- [ ] Evaluate new embedding models
- [ ] Review and update alert thresholds
- [ ] Performance regression testing
- [ ] Capacity planning review

---

## Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| On-call Engineer | Slack #on-call | Page via PagerDuty |
| Database Admin | database@mykadoo.com | Slack #database |
| AI/ML Engineer | ai-team@mykadoo.com | Slack #ai-platform |
| OpenAI Support | support.openai.com | Account dashboard |

---

## Appendix

### Useful Commands

```bash
# Quick health check
curl -s localhost:3000/api/vector-monitoring/health | jq '.status'

# Get current latency percentiles
curl -s localhost:3000/api/vector-monitoring/metrics | grep vector_search_duration

# Check embedding generation rate
curl -s localhost:3000/api/vector-monitoring/metrics | grep embedding_tokens

# Export metrics for analysis
curl -s localhost:3000/api/vector-monitoring/metrics > metrics_$(date +%Y%m%d).txt
```

### SQL Queries

```sql
-- Products with highest similarity to a query
SELECT id, title, similarity
FROM find_similar_products('<vector>', 0.7, 10, NULL, NULL, NULL);

-- Recent embedding generation stats
SELECT
    date_trunc('hour', created_at) as hour,
    COUNT(*) as embeddings_generated
FROM products
WHERE embedding IS NOT NULL
    AND updated_at > NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY 1 DESC;

-- Index size and usage
SELECT
    indexrelname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_scan as scans
FROM pg_stat_user_indexes
WHERE indexrelname LIKE '%embedding%';
```
