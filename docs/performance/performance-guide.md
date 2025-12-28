# Mykadoo Performance Guide

## Overview

This guide covers performance testing, optimization strategies, and monitoring for the Mykadoo platform.

## Performance Targets

### API Response Times (p95)

| Endpoint | Target | Critical |
|----------|--------|----------|
| Health Check | < 50ms | < 100ms |
| Product List | < 200ms | < 500ms |
| Product Search | < 300ms | < 500ms |
| Product Detail | < 150ms | < 300ms |
| User Auth | < 200ms | < 400ms |
| Content/Articles | < 200ms | < 400ms |

### Web Performance (Core Web Vitals)

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTFB | < 200ms | Time to First Byte |

### System Capacity

| Metric | Target |
|--------|--------|
| Concurrent Users | 10,000 |
| Requests/Second | 1,000 RPS |
| Error Rate | < 0.1% |
| Availability | 99.9% |

## Load Testing

### Prerequisites

```bash
# Install k6
brew install k6

# Or using Docker
docker run -i grafana/k6 run - < script.js
```

### Running Tests

```bash
# Navigate to performance directory
cd infrastructure/performance

# Smoke test (verify system works)
k6 run --env BASE_URL=http://localhost:14001 --env SCENARIO=smoke scripts/load-test.js

# Load test (normal load)
k6 run --env BASE_URL=http://localhost:14001 --env SCENARIO=load scripts/load-test.js

# Stress test (find breaking point)
k6 run --env BASE_URL=http://localhost:14001 --env SCENARIO=stress scripts/load-test.js

# Spike test (sudden traffic surge)
k6 run --env BASE_URL=http://localhost:14001 --env SCENARIO=spike scripts/load-test.js

# API benchmark
k6 run --env BASE_URL=http://localhost:14001 scripts/api-benchmark.js

# Database benchmark
k6 run --env BASE_URL=http://localhost:14001 scripts/database-benchmark.js

# Auto-scaling test
k6 run --env BASE_URL=https://api.staging.mykadoo.com scenarios/autoscaling-test.js
```

### Test Scenarios

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| Smoke | 1 | 1 min | Verify system works |
| Load | 50-100 | 15 min | Normal expected load |
| Stress | 100-400 | 30 min | Find breaking point |
| Spike | 10-500 | 10 min | Handle traffic spikes |
| Soak | 100 | 30+ min | Memory leaks, stability |

## CDN Configuration

### Environment Variables

```bash
# Production CDN setup
CDN_URL=https://cdn.mykadoo.com
CDN_PROVIDER=cloudfront  # Options: cloudfront, cloudflare, imgix, cloudinary
```

### Cloudflare Configuration

1. Create a Cloudflare distribution
2. Configure cache rules:
   ```
   /_next/static/* → Cache Everything, TTL: 1 year
   /images/* → Cache Everything, TTL: 1 year
   /api/* → Bypass Cache
   ```

### CloudFront Configuration

1. Create CloudFront distribution
2. Configure behaviors:
   - Default: Forward to origin
   - `/_next/static/*`: Cache 1 year
   - `/api/*`: No cache, forward all headers

### Cache Headers

The application sets these cache headers:

```javascript
// Static assets (images, fonts)
'Cache-Control': 'public, max-age=31536000, immutable'

// Next.js static files
'Cache-Control': 'public, max-age=31536000, immutable'

// API responses
'Cache-Control': 'private, no-cache, no-store, must-revalidate'
```

## Database Optimization

### Index Recommendations

```sql
-- Product search optimization
CREATE INDEX idx_product_name_trgm ON "Product" USING gin (name gin_trgm_ops);
CREATE INDEX idx_product_description_trgm ON "Product" USING gin (description gin_trgm_ops);

-- Category filtering
CREATE INDEX idx_product_category ON "Product" (category_id);

-- Price range queries
CREATE INDEX idx_product_price ON "Product" (price);

-- Date-based queries
CREATE INDEX idx_product_created ON "Product" (created_at DESC);

-- User lookup
CREATE INDEX idx_user_email ON "User" (email);

-- Search history
CREATE INDEX idx_search_user_date ON "SearchHistory" (user_id, created_at DESC);
```

### Query Optimization Tips

1. **Use EXPLAIN ANALYZE** to understand query plans
2. **Limit result sets** - Always paginate
3. **Select only needed columns** - Avoid SELECT *
4. **Use connection pooling** - PgBouncer or Prisma connection pool
5. **Cache frequent queries** - Redis for hot data

### Prisma Optimization

```typescript
// Use select to limit fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
  },
  take: 20,
});

// Use include sparingly
const product = await prisma.product.findUnique({
  where: { id },
  include: {
    category: true,  // Only if needed
  },
});

// Batch operations
const results = await prisma.$transaction([
  prisma.product.findMany({ take: 10 }),
  prisma.category.findMany(),
]);
```

## Auto-Scaling

### Kubernetes HPA Configuration

```yaml
# Current settings in Helm values
autoscaling:
  web:
    enabled: true
    minReplicas: 3
    maxReplicas: 20
    targetCPUUtilizationPercentage: 60
    targetMemoryUtilizationPercentage: 70
  api:
    enabled: true
    minReplicas: 3
    maxReplicas: 20
    targetCPUUtilizationPercentage: 60
    targetMemoryUtilizationPercentage: 70
```

### Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU | > 60% | < 30% |
| Memory | > 70% | < 40% |
| Request Rate | > 100 RPS/pod | < 50 RPS/pod |

### Testing Auto-Scaling

```bash
# Run auto-scaling test
k6 run --env BASE_URL=https://api.staging.mykadoo.com \
  infrastructure/performance/scenarios/autoscaling-test.js

# Monitor pods during test
watch kubectl get hpa -n staging
watch kubectl get pods -n staging
```

## Monitoring

### Key Metrics to Watch

1. **Response Time** (p50, p95, p99)
2. **Error Rate** (% of 5xx responses)
3. **Request Rate** (requests per second)
4. **CPU Usage** (per pod)
5. **Memory Usage** (per pod)
6. **Database Connections** (active/idle)
7. **Cache Hit Rate** (Redis)

### Prometheus Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Response time p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Active pods
count(kube_pod_status_ready{namespace="production", condition="true"})
```

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 1% | > 5% |
| p95 Latency | > 500ms | > 1s |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |

## Performance Checklist

### Before Deployment

- [ ] Run load tests on staging
- [ ] Verify auto-scaling works
- [ ] Check database query plans
- [ ] Validate cache configuration
- [ ] Review bundle size

### After Deployment

- [ ] Monitor error rates
- [ ] Watch response times
- [ ] Verify CDN is working
- [ ] Check auto-scaling behavior
- [ ] Review user experience metrics

## Troubleshooting

### High Latency

1. Check database query performance
2. Verify Redis connectivity
3. Review slow logs
4. Check for N+1 queries
5. Validate CDN cache hits

### High Error Rate

1. Check application logs
2. Verify database connections
3. Review memory usage
4. Check external API health
5. Validate rate limiting

### Scaling Issues

1. Review HPA metrics
2. Check resource limits
3. Verify node capacity
4. Review pod startup time
5. Check readiness probes

---

**Last Updated:** 2025-12-28
**Owner:** DevOps Team
