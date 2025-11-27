# Tasks: Operational Monitoring & Observability (PRD 0019)

## Relevant Files

### Monitoring Setup
- `apps/api/src/monitoring/monitoring.module.ts` - Monitoring module
- `apps/api/src/monitoring/datadog.ts` - Datadog APM
- `apps/api/src/monitoring/sentry.ts` - Error tracking
- `apps/web/lib/monitoring/sentry-client.ts` - Frontend Sentry

### Logging
- `libs/shared/logging/logger.ts` - Structured logger (Winston)
- `apps/api/src/middleware/logging.middleware.ts` - Request logging

### Health Checks
- `apps/api/src/health/health.controller.ts` - Health endpoints
- `apps/api/src/health/health.service.ts` - Health checks

### Dashboards
- `monitoring/dashboards/system-health.json` - Grafana dashboard
- `monitoring/alerts/critical.yaml` - Alert rules

## Notes

```bash
# Health check
curl http://localhost:3000/health
curl http://localhost:3000/ready

# Logs
docker logs -f mykadoo-api

# Metrics (Prometheus)
curl http://localhost:3000/metrics
```

## Tasks

### 1.0 Set up error tracking with Sentry
#### 1.1 Create Sentry account and project
#### 1.2 Install Sentry SDK for Next.js
#### 1.3 Install Sentry SDK for NestJS
#### 1.4 Configure Sentry DSN in environment
#### 1.5 Set up error boundary in React
#### 1.6 Implement backend error capture
#### 1.7 Add context to error events (user ID, request ID)
#### 1.8 Filter sensitive data from errors
#### 1.9 Set up source maps for stack traces
#### 1.10 Configure release tracking
#### 1.11 Test error capture in development
#### 1.12 Run linter and verify zero warnings
#### 1.13 Run full test suite and verify all tests pass
#### 1.14 Build project and verify successful compilation
#### 1.15 Verify system functionality end-to-end
#### 1.16 Update Docker configurations if deployment changes needed
#### 1.17 Update Helm chart if deployment changes needed

### 2.0 Implement APM with Datadog or Prometheus
#### 2.1 Choose APM solution (Datadog recommended)
#### 2.2 Install Datadog APM agent
#### 2.3 Configure Datadog tracer in API
#### 2.4 Add custom metrics (counters, gauges, histograms)
#### 2.5 Instrument HTTP endpoints
#### 2.6 Track database query performance
#### 2.7 Monitor external API calls (OpenAI, affiliates)
#### 2.8 Set up distributed tracing
#### 2.9 Configure trace sampling (10% success, 100% errors)
#### 2.10 Test APM data collection
#### 2.11 Run linter and verify zero warnings
#### 2.12 Run full test suite and verify all tests pass
#### 2.13 Build project and verify successful compilation
#### 2.14 Verify system functionality end-to-end
#### 2.15 Update Docker configurations if deployment changes needed
#### 2.16 Update Helm chart if deployment changes needed

### 3.0 Set up structured logging infrastructure
#### 3.1 Install Winston logger
#### 3.2 Create logger module with configuration
#### 3.3 Implement JSON-formatted logs
#### 3.4 Add log levels (ERROR, WARN, INFO, DEBUG)
#### 3.5 Include request ID in all logs
#### 3.6 Add user ID to authenticated logs
#### 3.7 Create log middleware for HTTP requests
#### 3.8 Implement log aggregation (ELK or Datadog Logs)
#### 3.9 Set up log retention (30 days)
#### 3.10 Test log search and filtering
#### 3.11 Run linter and verify zero warnings
#### 3.12 Run full test suite and verify all tests pass
#### 3.13 Build project and verify successful compilation
#### 3.14 Verify system functionality end-to-end
#### 3.15 Update Docker configurations if deployment changes needed
#### 3.16 Update Helm chart if deployment changes needed

### 4.0 Create infrastructure monitoring
#### 4.1 Set up infrastructure monitoring (Datadog, CloudWatch)
#### 4.2 Monitor CPU utilization
#### 4.3 Track memory usage
#### 4.4 Monitor disk usage and I/O
#### 4.5 Track network traffic
#### 4.6 Monitor container health
#### 4.7 Track Kubernetes pod status
#### 4.8 Monitor PostgreSQL performance
#### 4.9 Track Redis metrics (hit rate, evictions)
#### 4.10 Set up infrastructure dashboards
#### 4.11 Run linter and verify zero warnings
#### 4.12 Run full test suite and verify all tests pass
#### 4.13 Build project and verify successful compilation
#### 4.14 Verify system functionality end-to-end
#### 4.15 Update Docker configurations if deployment changes needed
#### 4.16 Update Helm chart if deployment changes needed

### 5.0 Implement distributed tracing with OpenTelemetry
#### 5.1 Install OpenTelemetry SDK
#### 5.2 Configure OTLP exporter
#### 5.3 Auto-instrument HTTP requests
#### 5.4 Create custom spans for business logic
#### 5.5 Add trace context propagation
#### 5.6 Track database queries in traces
#### 5.7 Trace external API calls
#### 5.8 Implement trace sampling strategy
#### 5.9 Visualize traces in Datadog or Jaeger
#### 5.10 Test trace correlation
#### 5.11 Run linter and verify zero warnings
#### 5.12 Run full test suite and verify all tests pass
#### 5.13 Build project and verify successful compilation
#### 5.14 Verify system functionality end-to-end
#### 5.15 Update Docker configurations if deployment changes needed
#### 5.16 Update Helm chart if deployment changes needed

### 6.0 Create real-time monitoring dashboards
#### 6.1 Build system health dashboard
#### 6.2 Create business metrics dashboard
#### 6.3 Add feature-specific dashboards (gift search, auth)
#### 6.4 Include key metrics (RPS, latency, errors)
#### 6.5 Add time series graphs
#### 6.6 Create auto-refresh (30s-60s)
#### 6.7 Implement drill-down capabilities
#### 6.8 Add alert threshold visualizations
#### 6.9 Configure dashboard access control
#### 6.10 Test dashboard performance
#### 6.11 Run linter and verify zero warnings
#### 6.12 Run full test suite and verify all tests pass
#### 6.13 Build project and verify successful compilation
#### 6.14 Verify system functionality end-to-end
#### 6.15 Update Docker configurations if deployment changes needed
#### 6.16 Update Helm chart if deployment changes needed

### 7.0 Set up alerting and incident management
#### 7.1 Create PagerDuty account and service
#### 7.2 Define critical alert rules (service down, high error rate)
#### 7.3 Define warning alert rules
#### 7.4 Configure Slack integration
#### 7.5 Set up email alerting
#### 7.6 Create SMS alerts for critical issues
#### 7.7 Implement alert escalation policy
#### 7.8 Build alert templates with runbook links
#### 7.9 Add auto-resolve for transient issues
#### 7.10 Test alert delivery
#### 7.11 Run linter and verify zero warnings
#### 7.12 Run full test suite and verify all tests pass
#### 7.13 Build project and verify successful compilation
#### 7.14 Verify system functionality end-to-end
#### 7.15 Update Docker configurations if deployment changes needed
#### 7.16 Update Helm chart if deployment changes needed

### 8.0 Implement SLO tracking and error budgets
#### 8.1 Define availability SLO (99.9% uptime target)
#### 8.2 Define latency SLO (95% requests <2s)
#### 8.3 Define error rate SLO (<1% errors)
#### 8.4 Calculate error budgets
#### 8.5 Build SLO tracking dashboard
#### 8.6 Implement error budget burn rate alerts
#### 8.7 Create monthly uptime reports
#### 8.8 Track SLO compliance trends
#### 8.9 Build public status page (status.mykadoo.com)
#### 8.10 Test SLO calculations
#### 8.11 Run linter and verify zero warnings
#### 8.12 Run full test suite and verify all tests pass
#### 8.13 Build project and verify successful compilation
#### 8.14 Verify system functionality end-to-end
#### 8.15 Update Docker configurations if deployment changes needed
#### 8.16 Update Helm chart if deployment changes needed

### 9.0 Set up on-call rotation and runbooks
#### 9.1 Define on-call rotation schedule (weekly)
#### 9.2 Configure PagerDuty on-call calendar
#### 9.3 Create incident response runbooks
#### 9.4 Write runbook for high error rates
#### 9.5 Write runbook for high latency
#### 9.6 Write runbook for database issues
#### 9.7 Write runbook for API quota exceeded
#### 9.8 Create deployment rollback runbook
#### 9.9 Document escalation procedures
#### 9.10 Train team on incident response
#### 9.11 Run linter and verify zero warnings
#### 9.12 Run full test suite and verify all tests pass
#### 9.13 Build project and verify successful compilation
#### 9.14 Verify system functionality end-to-end
#### 9.15 Update Docker configurations if deployment changes needed
#### 9.16 Update Helm chart if deployment changes needed

### 10.0 Testing, optimization, and continuous improvement
#### 10.1 Test all monitoring integrations
#### 10.2 Verify error capture for all error types
#### 10.3 Validate trace collection
#### 10.4 Test alert delivery and escalation
#### 10.5 Perform chaos engineering tests
#### 10.6 Simulate failures and verify detection
#### 10.7 Optimize data retention costs
#### 10.8 Review and tune alert thresholds
#### 10.9 Create monitoring health checklist
#### 10.10 Document monitoring architecture
#### 10.11 Schedule monthly monitoring reviews
#### 10.12 Run linter and verify zero warnings
#### 10.13 Run full test suite and verify all tests pass
#### 10.14 Build project and verify successful compilation
#### 10.15 Verify system functionality end-to-end
#### 10.16 Update Docker configurations if deployment changes needed
#### 10.17 Update Helm chart if deployment changes needed

---

**Status:** Ready for Implementation
**Priority:** P2 - Advanced Features (Phase 4)
**Estimated Duration:** 8 weeks
**Dependencies:** PRD 0016 (DevOps infrastructure)
