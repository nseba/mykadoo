# PRD: Operational Monitoring & Observability

## Introduction

Mykadoo requires comprehensive monitoring and observability infrastructure to maintain platform reliability, optimize performance, and quickly resolve incidents. This PRD defines application performance monitoring (APM), error tracking, infrastructure monitoring, logging, distributed tracing, and alerting systems to ensure operational excellence and data-driven decision-making.

## Problem Statement

Without proper monitoring and observability:
- Production issues go undetected until users complain
- Incident resolution takes hours instead of minutes
- Performance degradation impacts user experience silently
- Root cause analysis is slow and speculative
- Team lacks data to optimize system performance
- Capacity planning is reactive rather than proactive
- Business metrics are invisible or delayed
- On-call engineers lack context for incidents

## Goals

1. Achieve 99.9% uptime for all critical services
2. Detect production incidents within 2 minutes of occurrence
3. Reduce mean time to resolution (MTTR) to <30 minutes
4. Capture 100% of errors with full stack traces
5. Trace 100% of requests across distributed services
6. Provide real-time dashboards for all key metrics
7. Alert on-call engineers within 1 minute of threshold breach
8. Maintain <5 second query time for all metrics and logs
9. Retain metrics for 90 days, logs for 30 days
10. Enable self-service debugging for developers

## User Stories

### As a developer:
- I want error alerts so that I know when code breaks
- I want stack traces so that I can debug issues quickly
- I want performance metrics so that I optimize slow code
- I want request tracing so that I find bottlenecks
- I want log search so that I investigate issues

### As a DevOps engineer:
- I want infrastructure metrics so that I monitor health
- I want capacity dashboards so that I plan scaling
- I want deployment tracking so that I correlate changes with issues
- I want automated alerts so that I respond quickly
- I want runbook automation so that I resolve common issues

### As a product manager:
- I want business metrics so that I track KPIs
- I want user analytics so that I understand behavior
- I want performance data so that I prioritize improvements
- I want uptime reports so that I communicate reliability

### As an on-call engineer:
- I want instant alerts so that I respond immediately
- I want full context so that I triage effectively
- I want clear runbooks so that I resolve incidents
- I want silence controls so that I reduce noise

## Functional Requirements

### 1. Application Performance Monitoring (APM)

**1.1** APM must track:

**Response Time Metrics:**
- P50 (median) response time
- P95 response time
- P99 response time
- Max response time
- By endpoint, service, region

**Throughput Metrics:**
- Requests per second (RPS)
- Requests per minute (RPM)
- By endpoint, method (GET/POST)
- Success vs error rates

**Error Rates:**
- HTTP 4xx errors (client errors)
- HTTP 5xx errors (server errors)
- Error percentage
- Error types and messages

**1.2** APM must monitor:

**Frontend Performance:**
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => sendToAnalytics(metric));  // Cumulative Layout Shift
getFID(metric => sendToAnalytics(metric));  // First Input Delay
getFCP(metric => sendToAnalytics(metric));  // First Contentful Paint
getLCP(metric => sendToAnalytics(metric));  // Largest Contentful Paint
getTTFB(metric => sendToAnalytics(metric)); // Time to First Byte
```

**Key Frontend Metrics:**
- Page load time (DOMContentLoaded, window.load)
- Time to Interactive (TTI)
- First Contentful Paint (FCP <1.8s)
- Largest Contentful Paint (LCP <2.5s)
- Cumulative Layout Shift (CLS <0.1)
- First Input Delay (FID <100ms)

**Backend Performance:**
- API endpoint latency
- Database query time
- External API call duration
- Cache hit/miss rates
- Job queue processing time

**1.3** Transaction tracing must capture:
- Request ID (unique identifier)
- User ID (if authenticated)
- Endpoint called
- HTTP method and status
- Response time
- Database queries executed
- External API calls made
- Error details (if any)

### 2. Error Tracking & Logging

**2.1** Error tracking must use:

**Sentry Integration:**
```typescript
// Sentry configuration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% of transactions
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});

// Capture errors
try {
  await giftSearch(params);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'gift-search' },
    extra: { params },
  });
  throw error;
}
```

**2.2** Error context must include:
- Full stack trace
- Error message and type
- Request context (URL, method, headers)
- User context (ID, subscription tier)
- Device context (browser, OS, viewport)
- Custom tags (feature, component)
- Breadcrumbs (user actions before error)
- Release version (git SHA)

**2.3** Error prioritization must:
- Classify by severity (critical, high, medium, low)
- Group similar errors (fingerprinting)
- Track error frequency and trends
- Identify new vs recurring errors
- Assign ownership to teams/individuals

**2.4** Logging infrastructure must provide:

**Structured Logging:**
```typescript
// Winston logger with JSON format
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('Gift search completed', {
  userId: user.id,
  searchId: search.id,
  resultCount: gifts.length,
  duration: Date.now() - startTime,
});

logger.error('Database query failed', {
  query: sql,
  error: error.message,
  stack: error.stack,
});
```

**Log Levels:**
- **ERROR**: Application errors requiring attention
- **WARN**: Degraded functionality, potential issues
- **INFO**: Important business events (user registration, purchases)
- **DEBUG**: Detailed debugging information (dev/staging only)
- **TRACE**: Very detailed traces (disabled in production)

**2.5** Log aggregation must use:
- Centralized log storage (ELK Stack, Datadog, CloudWatch)
- Real-time log streaming
- Structured JSON logs
- Correlation IDs across services
- Log retention (30 days production, 7 days dev/staging)

**2.6** Log search must support:
- Full-text search
- Field filtering (level, service, user ID)
- Time range selection
- Regex patterns
- Saved queries
- Export to CSV/JSON

### 3. Infrastructure Monitoring

**3.1** Server metrics must track:

**CPU & Memory:**
- CPU utilization (%)
- Memory usage (MB, %)
- Swap usage
- Load average (1min, 5min, 15min)

**Disk:**
- Disk usage (GB, %)
- Disk I/O (read/write MB/s)
- Inode usage

**Network:**
- Network traffic (inbound/outbound MB/s)
- Connection count
- Packet loss
- Latency

**3.2** Container metrics must track:
- Container CPU usage
- Container memory usage
- Container restart count
- Container health status
- Image pull duration

**3.3** Kubernetes metrics must track:
- Pod status (running, pending, failed)
- Node health
- Deployment status
- Resource requests vs limits
- HPA (Horizontal Pod Autoscaler) activity
- Persistent volume usage

**3.4** Database monitoring must track:

**PostgreSQL:**
- Connection count (active, idle)
- Query duration (slow query log)
- Cache hit ratio
- Database size
- Table/index sizes
- Replication lag (if applicable)
- Deadlocks
- Transaction rate

**Redis:**
- Memory usage
- Cache hit/miss ratio
- Evicted keys
- Connected clients
- Command stats
- Keyspace size

**3.5** External service monitoring must track:
- OpenAI API latency and errors
- Affiliate API response times
- Email service (SendGrid) delivery rates
- CDN performance (CloudFront/Cloudflare)
- Third-party uptime

### 4. Distributed Tracing

**4.1** Distributed tracing must use:

**OpenTelemetry Integration:**
```typescript
// Next.js instrumentation
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Manual span creation
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('mykadoo-api');

async function searchGifts(params) {
  const span = tracer.startSpan('searchGifts');

  try {
    // Business logic
    const gifts = await giftService.search(params);
    span.setAttribute('gift.count', gifts.length);
    return gifts;
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

**4.2** Trace context must include:
- Trace ID (unique across all spans)
- Span ID (unique within trace)
- Parent span ID (for nested calls)
- Service name
- Operation name
- Duration
- Tags (HTTP method, status code, user ID)
- Logs (events within span)

**4.3** Tracing must capture:
- HTTP requests (frontend → backend)
- Database queries (backend → PostgreSQL)
- External API calls (backend → OpenAI)
- Message queue operations
- Cache operations (Redis)
- Background jobs

**4.4** Trace visualization must show:
- Waterfall view (service call timeline)
- Dependency graph (service relationships)
- Critical path (slowest components)
- Error propagation
- Span details

### 5. Real-Time Dashboards

**5.1** System health dashboard must display:
- Service status (up/down)
- Current RPS/RPM
- Error rate (%)
- Average response time
- P95/P99 latency
- Infrastructure health (CPU, memory, disk)
- Deployment history (recent releases)

**5.2** Business metrics dashboard must show:
- Active users (current, daily, weekly)
- Gift searches (count, success rate)
- Affiliate clicks and conversions
- Revenue (daily, weekly, monthly)
- User registrations
- Subscription conversions

**5.3** Feature-specific dashboards must track:

**Gift Search:**
- Search volume
- Search success rate
- Average results returned
- Search latency (p50, p95, p99)
- AI model performance
- Cache hit rate

**User Activity:**
- Active sessions
- Login/logout events
- Profile creations
- Wishlist additions
- Share events

**5.4** Dashboard requirements:
- Auto-refresh (5-60 seconds)
- Time range selector (1h, 24h, 7d, 30d)
- Drill-down capabilities
- Alert thresholds visualized
- Exportable (PDF, PNG)
- Embeddable (for stakeholders)
- Role-based access control

### 6. Alerting & Incident Management

**6.1** Alert rules must define:

**Critical Alerts (Immediate Response):**
- Service down (health check fails)
- Error rate >5% (5min window)
- P95 latency >5s (5min window)
- Database connection pool exhausted
- Disk usage >90%
- Memory usage >90%

**Warning Alerts (Review Required):**
- Error rate >2% (15min window)
- P95 latency >3s (15min window)
- Cache hit rate <70%
- Slow queries (>1s)
- Disk usage >80%

**6.2** Alert channels must include:
- PagerDuty (critical, on-call rotation)
- Slack (all alerts, team channel)
- Email (digest, non-critical)
- SMS (critical only, backup)

**6.3** Alert format must provide:
```
🚨 CRITICAL: High Error Rate Detected

Service: mykadoo-api
Error Rate: 8.5% (threshold: 5%)
Duration: 6 minutes
Affected Endpoints:
  - POST /api/search (12% errors)
  - GET /api/gifts/:id (5% errors)

Runbook: https://docs.mykadoo.com/runbooks/high-error-rate
Dashboard: https://dash.mykadoo.com/errors
Logs: https://logs.mykadoo.com?service=api&level=error

Acknowledge: https://pagerduty.com/incidents/123
```

**6.4** Alert best practices:
- Clear, actionable titles
- Link to runbooks
- Include relevant metrics
- Suggest first steps
- Avoid alert fatigue (tune thresholds)
- Auto-resolve when condition clears
- Escalation policy (15min → manager)

**6.5** On-call rotation must:
- Use PagerDuty schedules
- Rotate weekly (minimize burnout)
- Provide on-call compensation
- Document on-call playbooks
- Track incident response times
- Post-mortem after major incidents

### 7. SLA/SLO Tracking

**7.1** Service Level Objectives (SLOs) must define:

**Availability SLO:**
- Target: 99.9% uptime (43 min downtime/month)
- Measurement: Health check success rate
- Error budget: 0.1% (43 min/month)

**Latency SLO:**
- Target: 95% of requests <2s
- Measurement: P95 response time
- Error budget: 5% of requests >2s

**Error Rate SLO:**
- Target: <1% error rate
- Measurement: HTTP 5xx / total requests
- Error budget: 1% error rate

**7.2** SLI (Service Level Indicators) must measure:
- Uptime percentage (good minutes / total minutes)
- Success rate (successful requests / total requests)
- Latency compliance (fast requests / total requests)

**7.3** SLA reporting must provide:
- Monthly uptime reports
- Error budget burn rate
- Incident summaries
- SLO compliance trends
- Customer-facing status page (status.mykadoo.com)

### 8. Monitoring Tools Stack

**8.1** Recommended tools:

**APM & Tracing:**
- Datadog (all-in-one, recommended)
- New Relic (alternative)
- Elastic APM (open-source alternative)

**Error Tracking:**
- Sentry (errors, performance)

**Infrastructure:**
- Prometheus + Grafana (metrics, dashboards)
- CloudWatch (AWS native)
- Datadog Infrastructure (if using Datadog APM)

**Logging:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog Logs (if using Datadog APM)
- CloudWatch Logs (AWS native)

**Alerting:**
- PagerDuty (incident management)
- Opsgenie (alternative)
- Slack (lightweight alerts)

**Uptime Monitoring:**
- Pingdom (external monitoring)
- UptimeRobot (free alternative)
- StatusCake (alternative)

**8.2** Tool integration must:
- Send all metrics to single platform (reduce tool sprawl)
- Correlate logs, metrics, traces (unified view)
- Link alerts to dashboards and runbooks
- Integrate with Slack and PagerDuty
- Support API access for automation

## Non-Goals (Out of Scope)

- Security monitoring (SIEM) - Separate security PRD
- Compliance auditing - Part of compliance PRD
- Business intelligence (BI) - Analytics PRD
- A/B testing infrastructure - Growth PRD
- Customer support ticketing - Support PRD

## Technical Considerations

### Architecture

**Monitoring Data Flow:**
```
Application
  ↓ (metrics, logs, traces)
OpenTelemetry Collector
  ↓ (processes, batches)
Datadog / Prometheus
  ↓ (stores, queries)
Grafana / Datadog UI
  ↓ (visualizes)
Alerts → PagerDuty → On-call Engineer
```

**Datadog Configuration:**
```typescript
// datadog.config.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'mykadoo-api',
  env: process.env.NODE_ENV,
  version: process.env.GIT_SHA,
  logInjection: true, // Correlate logs with traces
  runtimeMetrics: true, // Node.js runtime metrics
  profiling: true, // Continuous profiling
});

// Custom metrics
import { StatsD } from 'node-dogstatsd';

const dogstatsd = new StatsD();

// Increment counter
dogstatsd.increment('gift.search.count', 1, ['tier:free']);

// Record timing
dogstatsd.timing('gift.search.duration', duration, ['success:true']);

// Gauge (current value)
dogstatsd.gauge('active.sessions', sessionCount);
```

### Cost Optimization

**Data Sampling:**
- Trace 100% of errors
- Trace 10% of successful requests (adjustable)
- Log ERROR/WARN always
- Log INFO selectively (key events only)
- Log DEBUG/TRACE in dev only

**Data Retention:**
- Metrics: 90 days (1min granularity for 7d, then downsampled)
- Logs: 30 days (7 days for full text, 30 days for errors)
- Traces: 15 days
- Archive to S3 for long-term storage (cheap)

## Design Considerations

### Dashboard Design

**Principles:**
- Glanceable (understand in 5 seconds)
- Actionable (link to logs/traces/runbooks)
- Hierarchical (system → service → component)
- Consistent (same metrics, same colors)

**Layout:**
```
┌─────────────────────────────────────┐
│ System Health (Green/Yellow/Red)   │
├─────────────────────────────────────┤
│ Key Metrics (RPS, Errors, Latency) │
├─────────────────────────────────────┤
│ Graphs (Time series, last 1 hour)  │
├─────────────────────────────────────┤
│ Service Status (Uptime indicators) │
├─────────────────────────────────────┤
│ Recent Deployments & Alerts        │
└─────────────────────────────────────┘
```

### Alert Fatigue Prevention

- Set realistic thresholds (tune based on data)
- Group related alerts (avoid duplicate noise)
- Auto-resolve when issue clears
- Snooze/acknowledge capabilities
- Weekly alert review (prune unnecessary alerts)

## Success Metrics

### Reliability
- **Target:** 99.9% uptime (SLO compliance)
- **Target:** <2 min mean time to detect (MTTD)
- **Target:** <30 min mean time to resolve (MTTR)
- **Target:** <5% error budget consumption per month

### Observability
- **Target:** 100% of errors captured in Sentry
- **Target:** 100% of requests traced
- **Target:** <5s query time for metrics/logs
- **Target:** 95% of incidents have clear root cause

### Developer Experience
- **Target:** 90% of developers use dashboards weekly
- **Target:** 80% of incidents resolved using runbooks
- **Target:** <10 min to find relevant logs
- **Target:** 5+ self-service debugging sessions per week

### Alert Quality
- **Target:** <5% false positive rate
- **Target:** 95% of critical alerts acknowledged within 5 min
- **Target:** 100% of critical alerts have runbooks
- **Target:** <20 alerts per day (reduce noise)

## Open Questions

1. **Monitoring Budget**: What's our monthly budget for monitoring tools (Datadog ~$500-2000/mo)?

2. **Trace Sampling**: Should we trace 100% or sample to reduce costs?

3. **Custom Metrics**: How many custom metrics should we allow per service?

4. **Retention**: Should we retain data longer for compliance/analysis?

5. **On-Call**: How many engineers on on-call rotation (2-3 minimum)?

6. **Status Page**: Should status page be public or customer-only?

## Implementation Phases

### Phase 1: Error Tracking (Week 1)
- Set up Sentry
- Instrument frontend and backend errors
- Configure error alerts (Slack)
- Create error dashboard

### Phase 2: APM & Metrics (Weeks 2-3)
- Set up Datadog APM (or Prometheus)
- Instrument application metrics
- Create system health dashboard
- Configure performance alerts

### Phase 3: Infrastructure Monitoring (Week 4)
- Monitor servers/containers (CPU, memory, disk)
- Monitor databases (PostgreSQL, Redis)
- Create infrastructure dashboard
- Configure resource alerts

### Phase 4: Distributed Tracing (Week 5)
- Implement OpenTelemetry
- Trace requests across services
- Integrate with APM tool
- Create trace search interface

### Phase 5: Logging (Week 6)
- Centralize logs (ELK or Datadog Logs)
- Implement structured logging
- Create log search interface
- Configure log-based alerts

### Phase 6: Alerting & On-Call (Week 7)
- Set up PagerDuty
- Define on-call rotation
- Write incident runbooks
- Test alert escalation

### Phase 7: SLO Tracking (Week 8)
- Define SLOs (uptime, latency, errors)
- Build SLO dashboards
- Track error budget
- Create public status page

## Dependencies

- DevOps infrastructure (PRD 0016) for deployment tracking
- All services must emit metrics, logs, traces
- PagerDuty account and configuration
- Monitoring tool subscriptions (Datadog, Sentry)

## Risks & Mitigation

### Risk 1: Monitoring Costs Spiral
**Mitigation:**
- Set data retention limits
- Sample traces (10% of success, 100% errors)
- Use log levels appropriately
- Monitor monitoring costs
- Evaluate open-source alternatives (Prometheus, ELK)

### Risk 2: Alert Fatigue
**Mitigation:**
- Start with conservative thresholds
- Tune based on real data
- Weekly alert review meetings
- Auto-resolve when possible
- Group related alerts

### Risk 3: Incomplete Instrumentation
**Mitigation:**
- Instrument from day one
- Include in PR checklist
- Automated detection of uninstrumented endpoints
- Regular instrumentation audits
- Make instrumentation easy (libraries, helpers)

### Risk 4: Data Silos (Logs separate from metrics)
**Mitigation:**
- Use unified observability platform (Datadog)
- Correlation IDs across logs/traces/metrics
- Single pane of glass dashboard
- Link alerts to relevant data

## Acceptance Criteria

- [ ] Sentry capturing 100% of frontend and backend errors
- [ ] APM tracking all API endpoints
- [ ] Distributed tracing implemented across services
- [ ] Centralized logging with search capability
- [ ] Infrastructure metrics (CPU, memory, disk) monitored
- [ ] Database performance metrics tracked
- [ ] Real-time system health dashboard
- [ ] Business metrics dashboard
- [ ] Critical alerts configured (error rate, latency, uptime)
- [ ] PagerDuty on-call rotation set up
- [ ] Runbooks for top 5 incidents
- [ ] SLO tracking dashboard (99.9% uptime)
- [ ] Public status page (status.mykadoo.com)
- [ ] Alerts link to dashboards and runbooks
- [ ] Mean time to detect <2 minutes
- [ ] Mean time to resolve <30 minutes
- [ ] Log retention: 30 days
- [ ] Metric retention: 90 days
- [ ] Team trained on monitoring tools

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** Draft
**Author:** AI Product Team
**Reviewers:** Engineering, DevOps, SRE, Product
