# Monitoring & Logging Guide

Comprehensive guide for monitoring, logging, and observability in the Mykadoo platform.

## Overview

**Monitoring Stack:**
- **Metrics:** Prometheus + Grafana
- **Logs:** Structured JSON logging
- **Errors:** Sentry
- **APM:** Datadog (optional)
- **Uptime:** UptimeRobot or Pingdom

**Key Principles:**
- Observability over monitoring
- Proactive alerts, not reactive firefighting
- Clear SLIs, SLOs, and SLAs
- Actionable alerts only
- 99.9% uptime target

## Quick Start

### Health Checks

```bash
# Basic health
curl https://api.mykadoo.com/health

# Readiness (Kubernetes)
curl https://api.mykadoo.com/health/ready

# Liveness (Kubernetes)
curl https://api.mykadoo.com/health/live

# Prometheus metrics
curl https://api.mykadoo.com/health/metrics
```

### Access Dashboards

- **Grafana:** https://grafana.mykadoo.com
- **Sentry:** https://sentry.io/organizations/mykadoo
- **Datadog:** https://app.datadoghq.com (if configured)

## Health Check Endpoints

### `/health` - Overall Health

Returns comprehensive health status of all dependencies.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-03T12:00:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database connection successful",
      "responseTime": 15
    },
    "redis": {
      "status": "pass",
      "message": "Redis connection successful"
    },
    "memory": {
      "status": "pass",
      "message": "Heap usage: 45.2%"
    }
  }
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Some non-critical issues
- `unhealthy` - Critical systems failing

### `/health/ready` - Readiness Probe

Kubernetes readiness probe. Returns 200 if service can accept traffic.

**Checks:**
- Database connectivity
- Redis connectivity
- Critical dependencies available

### `/health/live` - Liveness Probe

Kubernetes liveness probe. Returns 200 if service is alive.

**Checks:**
- Process is responsive
- Memory not exhausted

### `/health/metrics` - Prometheus Metrics

Returns Prometheus-formatted metrics.

**Example Metrics:**
```
# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds 86400

# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200",route="/api/search"} 12543

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{route="/api/search",le="0.1"} 9500
http_request_duration_seconds_bucket{route="/api/search",le="0.5"} 12000
http_request_duration_seconds_bucket{route="/api/search",le="1.0"} 12400
```

## Application Logging

### Structured Logging

All logs are in JSON format for easy parsing and querying.

**Log Format:**
```json
{
  "timestamp": "2025-01-03T12:00:00Z",
  "level": "info",
  "message": "GET /api/search 200 150ms",
  "context": {
    "method": "GET",
    "path": "/api/search",
    "statusCode": 200,
    "duration": 150,
    "userId": "user123",
    "requestId": "req-abc-123"
  }
}
```

### Using the Logger

**Backend (NestJS):**

```typescript
import { createLogger } from '@mykadoo/utils';

const logger = createLogger('SearchService');

// Info logging
logger.info('Search completed', {
  userId: user.id,
  resultsCount: results.length,
  duration: 150,
});

// Error logging
logger.error('Search failed', error, {
  userId: user.id,
  query: searchQuery,
});

// HTTP request logging
logger.logRequest('GET', '/api/search', 200, 150, user.id);

// Database query logging (slow query detection)
logger.logQuery('SELECT * FROM products WHERE ...', 1500, []);

// AI usage tracking
logger.logAIUsage('gpt-4', 1000, 0.02, 2000, user.id);

// Affiliate click tracking
logger.logAffiliateClick('product123', 'Amazon', user.id);
```

**Frontend (Next.js):**

```typescript
import { createLogger } from '@mykadoo/utils';

const logger = createLogger('SearchPage');

logger.info('Search submitted', {
  occasion: 'birthday',
  budgetMin: 50,
  budgetMax: 100,
});

logger.error('Search failed', error);
```

### Log Levels

- **ERROR** - Critical errors requiring immediate attention
- **WARN** - Warning conditions (e.g., slow queries, high memory)
- **INFO** - Informational messages (e.g., request logs)
- **DEBUG** - Debugging information (development only)
- **VERBOSE** - Detailed tracing (development only)

### Log Retention

- **Production:** 30 days
- **Staging:** 7 days
- **Development:** 1 day

## Error Tracking with Sentry

### Configuration

**Environment Variables:**

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
APP_VERSION=1.0.0
```

### Backend Integration

```typescript
// apps/api/src/main.ts
import { initSentryBackend } from '@mykadoo/utils';

async function bootstrap() {
  await initSentryBackend();

  // ... rest of bootstrap
}
```

### Frontend Integration

```typescript
// apps/web/src/app/layout.tsx
import { initSentryFrontend } from '@mykadoo/utils';

initSentryFrontend();
```

### Capturing Errors

```typescript
import { captureError, captureMessage } from '@mykadoo/utils';

try {
  await performSearch();
} catch (error) {
  captureError(error, {
    userId: user.id,
    tags: {
      feature: 'search',
      environment: 'production',
    },
    extra: {
      searchQuery: query,
    },
  });

  throw error;
}

// Capture warning message
captureMessage('Slow query detected', 'warning', {
  query: sql,
  duration: 2000,
});
```

### Error Filtering

Sentry automatically filters:
- Validation errors
- 401/403 errors
- Development errors (not sent to Sentry)

## Prometheus Metrics

### Metric Types

**Counter** - Monotonically increasing value
```typescript
http_requests_total{method="GET",status="200"} 12543
```

**Gauge** - Value that can increase or decrease
```typescript
process_uptime_seconds 86400
memory_usage_bytes 524288000
```

**Histogram** - Distribution of values
```typescript
http_request_duration_seconds_bucket{le="0.1"} 9500
http_request_duration_seconds_bucket{le="0.5"} 12000
http_request_duration_seconds_sum 1850.5
http_request_duration_seconds_count 12543
```

### Custom Metrics

Add custom business metrics to track:

```typescript
// Increment counter
metricsRegistry.incrementCounter('searches_total', {
  userId: user.id,
  occasion: 'birthday',
});

// Set gauge
metricsRegistry.setGauge('active_users', activeUserCount);

// Observe histogram
metricsRegistry.observeHistogram('search_duration_seconds', duration / 1000);
```

### Key Metrics to Monitor

**System Metrics:**
- `process_uptime_seconds` - Service uptime
- `process_resident_memory_bytes` - Memory usage
- `database_health` - Database connectivity (0/1)
- `database_response_time_ms` - Database latency

**Application Metrics:**
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency
- `searches_total` - Total searches
- `affiliate_clicks_total` - Affiliate link clicks
- `ai_requests_total` - AI model requests
- `ai_cost_usd` - AI costs in USD

**Business Metrics:**
- `conversion_rate` - Search to click ratio
- `active_users` - Current active users
- `revenue_usd` - Affiliate revenue

## Grafana Dashboards

### Pre-built Dashboards

**Application Overview:**
- Request rate and error rate
- Response time (p50, p95, p99)
- Active users
- Database performance

**AI Usage:**
- Requests per model
- Token usage
- Cost per hour/day/month
- Average response time

**Business Metrics:**
- Searches per hour
- Conversion rate
- Top products
- Revenue tracking

### Creating Custom Dashboards

1. Access Grafana at https://grafana.mykadoo.com
2. Click "+" → "Dashboard"
3. Add Panel
4. Select Prometheus as data source
5. Write PromQL query:

```promql
# Request rate by status
sum(rate(http_requests_total[5m])) by (status)

# 95th percentile latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

### Dashboard Import

Import pre-configured dashboard:

```bash
# From infrastructure/monitoring/grafana-dashboard.json
curl -X POST \
  -H "Content-Type: application/json" \
  -d @infrastructure/monitoring/grafana-dashboard.json \
  http://grafana.mykadoo.com/api/dashboards/db
```

## Alerting

### Alert Configuration

Alerts are defined in `infrastructure/monitoring/prometheus-rules.yml`.

**Alert Components:**
- **Expression:** PromQL query that triggers alert
- **For:** How long condition must be true
- **Severity:** `critical`, `warning`, `info`
- **Annotations:** Human-readable description

### Critical Alerts

**High Error Rate** (>2% for 5 minutes)
```yaml
alert: HighErrorRate
expr: |
  (sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m]))) > 0.02
severity: critical
```

**Database Connection Failure**
```yaml
alert: DatabaseConnectionFailure
expr: database_health == 0
severity: critical
```

**High Memory Usage** (>90% for 5 minutes)
```yaml
alert: HighMemoryUsage
expr: (process_resident_memory_bytes / container_spec_memory_limit_bytes) > 0.9
severity: warning
```

### Alert Channels

**Slack:** Critical and warning alerts
**PagerDuty:** Critical alerts only (24/7 on-call)
**Email:** All alerts (low-priority)

### Silence Alerts

```bash
# Silence alert during maintenance
amtool silence add \
  alertname=HighErrorRate \
  --duration=2h \
  --comment="Scheduled maintenance"
```

## Uptime Monitoring

### External Monitoring

**UptimeRobot Configuration:**
- Monitor: https://api.mykadoo.com/health
- Interval: 5 minutes
- Alert on: 2 consecutive failures
- Notify: Slack, PagerDuty

**Endpoints to Monitor:**
- `GET /health` - Overall health
- `GET /` - Homepage availability
- `GET /api/search` - API availability

### SLA Targets

- **Uptime:** 99.9% (43.8 minutes downtime/month)
- **Response Time:** <500ms p95
- **Error Rate:** <1%

## Incident Response

### Severity Levels

**P0 - Critical**
- Complete service outage
- Data loss/corruption
- Security breach
- Response: Immediate (24/7)

**P1 - High**
- Major feature unavailable
- Severe performance degradation
- Response: 1 hour

**P2 - Medium**
- Minor feature broken
- Moderate performance issues
- Response: 4 hours

**P3 - Low**
- Cosmetic issues
- Non-critical bugs
- Response: Next business day

### On-Call Rotation

- Primary: Engineering lead
- Secondary: DevOps engineer
- Escalation: CTO

### Incident Checklist

1. **Acknowledge:** Acknowledge alert in PagerDuty
2. **Assess:** Check dashboards and logs
3. **Communicate:** Notify team in #incidents Slack channel
4. **Mitigate:** Implement temporary fix or rollback
5. **Monitor:** Verify issue is resolved
6. **Document:** Write incident report
7. **Postmortem:** Schedule blameless postmortem

## Performance Monitoring

### Core Web Vitals

**Largest Contentful Paint (LCP):** <2.5s
- Measure: Time to render largest content element
- Impact: Perceived loading speed

**First Input Delay (FID):** <100ms
- Measure: Time from user interaction to browser response
- Impact: Interactivity

**Cumulative Layout Shift (CLS):** <0.1
- Measure: Visual stability during loading
- Impact: User experience

### Monitoring Tools

- **Lighthouse CI:** Automated performance testing
- **Datadog RUM:** Real user monitoring
- **Chrome UX Report:** Real-world performance data

### Performance Budgets

- **JavaScript:** <300KB gzipped
- **CSS:** <50KB gzipped
- **Images:** Lazy-loaded, WebP format
- **Fonts:** Preloaded, subset for Latin

## Database Monitoring

### Key Metrics

- **Active connections:** Should be <80% of max_connections
- **Query duration:** p95 <100ms
- **Slow queries:** Log queries >1s
- **Cache hit ratio:** Should be >95%
- **Index usage:** Monitor unused indexes

### pg_stat_statements

Enable slow query logging:

```sql
-- Show top 10 slowest queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Show queries with low cache hit ratio
SELECT
  query,
  shared_blks_hit,
  shared_blks_read,
  shared_blks_hit::float / (shared_blks_hit + shared_blks_read) as hit_ratio
FROM pg_stat_statements
WHERE shared_blks_hit + shared_blks_read > 0
ORDER BY hit_ratio ASC
LIMIT 10;
```

## Cost Monitoring

### AI Costs

Track AI usage and costs:

```typescript
logger.logAIUsage(
  'gpt-4',      // model
  1000,         // tokens
  0.02,         // cost in USD
  2000,         // duration in ms
  user.id       // user
);
```

**Alert:** Monthly AI cost >$1000

### Infrastructure Costs

Monitor cloud spending:
- Kubernetes cluster
- Database (RDS/Cloud SQL)
- Redis (ElastiCache/Memorystore)
- Storage (S3/GCS)
- Bandwidth

**Budget:** $500/month for development, $2000/month for production

## Troubleshooting

### High Memory Usage

```bash
# Check container memory
kubectl top pods -n mykadoo

# Get memory profile
curl http://api-pod:3000/debug/pprof/heap > heap.prof

# Analyze with pprof
go tool pprof heap.prof
```

### Slow Queries

```bash
# Enable query logging in Prisma
DEBUG=prisma:query yarn start

# Check pg_stat_statements
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"
```

### High Error Rate

```bash
# Check recent errors in logs
kubectl logs -n mykadoo deployment/api --tail=100 | grep ERROR

# Check Sentry for error trends
open https://sentry.io/organizations/mykadoo/issues

# Check error distribution by endpoint
curl -s http://prometheus:9090/api/v1/query?query='sum(rate(http_requests_total{status=~"5.."}[5m]))by(route)'
```

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Sentry Documentation](https://docs.sentry.io/)
- [SRE Book - Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
- [12 Factor App - Logs](https://12factor.net/logs)
