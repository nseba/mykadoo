# Deployment Runbook

This document outlines the deployment procedures, rollback strategies, and emergency protocols for Mykadoo.

## Table of Contents

1. [Environments](#environments)
2. [Deployment Process](#deployment-process)
3. [Rollback Procedures](#rollback-procedures)
4. [Health Checks](#health-checks)
5. [Emergency Procedures](#emergency-procedures)
6. [Troubleshooting](#troubleshooting)

---

## Environments

| Environment | URL | Branch | Auto-Deploy | Approval Required |
|-------------|-----|--------|-------------|-------------------|
| Development | dev.mykadoo.com | develop | Yes | No |
| Staging | staging.mykadoo.com | develop | Yes | No |
| Production | mykadoo.com | main | Yes | Yes |

### Environment Configuration

```bash
# Staging
Namespace: mykadoo-staging
Replicas: 2-5 (auto-scaling)
Resources: 500m CPU, 512Mi RAM per pod

# Production
Namespace: mykadoo-production
Replicas: 5-20 (auto-scaling)
Resources: 2000m CPU, 2Gi RAM per pod
```

---

## Deployment Process

### Automatic Deployment (Standard)

1. **Staging**: Push to `develop` branch triggers automatic deployment
2. **Production**: Push to `main` branch or tag `v*` triggers deployment with approval

### Manual Deployment

```bash
# Via GitHub Actions
gh workflow run deploy-production.yml \
  -f version=v1.2.3 \
  -f skip_approval=false

# Direct Helm deployment (emergency only)
helm upgrade --install mykadoo ./helm/mykadoo \
  --namespace mykadoo-production \
  --values helm/mykadoo/values-production.yaml \
  --set api.image.tag=v1.2.3 \
  --set web.image.tag=v1.2.3 \
  --wait \
  --timeout 10m
```

### Deployment Stages

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pre-Deploy    │───>│    Approval     │───>│     Deploy      │
│     Checks      │    │   (Production)  │    │  (Blue-Green)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Notify      │<───│    Monitor      │<───│  Health Check   │
│     Slack       │    │   (5 minutes)   │    │  & Smoke Test   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Pre-Deployment Checklist

- [ ] All CI checks pass (lint, tests, build)
- [ ] Staging deployment verified and healthy
- [ ] Database migrations tested (if any)
- [ ] No high/critical security vulnerabilities
- [ ] Release notes prepared
- [ ] On-call engineer notified

---

## Rollback Procedures

### Automatic Rollback

Rollback is **automatically triggered** when:
- Health checks fail after deployment
- Error rate increases >2% within 5 minutes
- Pod crash loops detected

### Manual Rollback

#### Via GitHub Actions (Recommended)

```bash
# Rollback to previous version
gh workflow run rollback.yml \
  -f environment=production \
  -f reason="High error rate after deployment"

# Rollback to specific revision
gh workflow run rollback.yml \
  -f environment=production \
  -f revision=5 \
  -f reason="Rolling back to known stable version"
```

#### Via Helm CLI (Emergency)

```bash
# View deployment history
helm history mykadoo -n mykadoo-production

# Rollback to previous release
helm rollback mykadoo -n mykadoo-production --wait

# Rollback to specific revision
helm rollback mykadoo 5 -n mykadoo-production --wait

# Verify rollback
kubectl rollout status deployment/mykadoo-api -n mykadoo-production
kubectl rollout status deployment/mykadoo-web -n mykadoo-production
```

### Rollback Timeline

| Action | Target Time |
|--------|-------------|
| Detect issue | <2 minutes |
| Initiate rollback | <1 minute |
| Complete rollback | <2 minutes |
| Verify health | <1 minute |
| **Total** | **<6 minutes** |

---

## Health Checks

### Endpoints

| Endpoint | Expected Response | Timeout |
|----------|------------------|---------|
| `/api/health` | `{"status": "ok"}` | 5s |
| `/api/health/db` | `{"status": "ok"}` | 10s |
| `/api/health/redis` | `{"status": "ok"}` | 5s |
| `/` | 200 OK | 10s |

### Manual Health Check

```bash
# API health
curl -f https://mykadoo.com/api/health

# Full health check
curl -f https://mykadoo.com/api/health/db
curl -f https://mykadoo.com/api/health/redis

# Web health
curl -f https://mykadoo.com

# Check pod status
kubectl get pods -n mykadoo-production
kubectl describe pod <pod-name> -n mykadoo-production
```

### Kubernetes Probes

```yaml
# Liveness Probe - Restart if unhealthy
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3

# Readiness Probe - Remove from service if unhealthy
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

---

## Emergency Procedures

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P0 | Complete outage | <15 min | Site down, data loss |
| P1 | Major degradation | <30 min | Critical feature broken |
| P2 | Minor degradation | <2 hours | Non-critical bug |
| P3 | Low impact | <24 hours | UI issue |

### P0 Emergency Response

```bash
# 1. Immediately rollback
helm rollback mykadoo -n mykadoo-production --wait --timeout 5m

# 2. Verify rollback
kubectl rollout status deployment/mykadoo-api -n mykadoo-production
curl -f https://mykadoo.com/api/health

# 3. Scale up if needed
kubectl scale deployment/mykadoo-api -n mykadoo-production --replicas=10
kubectl scale deployment/mykadoo-web -n mykadoo-production --replicas=10

# 4. Check logs
kubectl logs -l app=mykadoo-api -n mykadoo-production --tail=100

# 5. Notify team
# Post in #incidents Slack channel
```

### Database Emergency

```bash
# 1. Check database connectivity
kubectl exec -it <api-pod> -n mykadoo-production -- \
  npx prisma db execute --stdin <<< "SELECT 1"

# 2. Check connection pool
kubectl logs -l app=mykadoo-api -n mykadoo-production | grep -i "database\|connection"

# 3. Restart API pods (clears connections)
kubectl rollout restart deployment/mykadoo-api -n mykadoo-production
```

---

## Troubleshooting

### Common Issues

#### Pods not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n mykadoo-production

# Check logs
kubectl logs <pod-name> -n mykadoo-production

# Common causes:
# - Image pull error: Check registry credentials
# - Resource limits: Increase CPU/memory limits
# - Probe failure: Check health endpoint
```

#### High latency

```bash
# Check pod resource usage
kubectl top pods -n mykadoo-production

# Check HPA status
kubectl get hpa -n mykadoo-production

# Scale manually if needed
kubectl scale deployment/mykadoo-api --replicas=15 -n mykadoo-production
```

#### Database connection errors

```bash
# Check database pod
kubectl get pods -n mykadoo-production -l app=postgresql

# Check database logs
kubectl logs -l app=postgresql -n mykadoo-production --tail=50

# Verify secret configuration
kubectl get secret mykadoo-secret -n mykadoo-production -o yaml
```

### Useful Commands

```bash
# Get all resources
kubectl get all -n mykadoo-production

# Watch pods
kubectl get pods -n mykadoo-production -w

# Port forward for debugging
kubectl port-forward svc/mykadoo-api 3000:80 -n mykadoo-production

# Execute shell in pod
kubectl exec -it <pod-name> -n mykadoo-production -- /bin/sh

# View Helm release info
helm status mykadoo -n mykadoo-production
helm get values mykadoo -n mykadoo-production
```

---

## Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| On-Call Engineer | #on-call Slack | PagerDuty |
| DevOps Lead | @devops-lead | Phone |
| Engineering Manager | @eng-manager | Phone |
| CTO | @cto | Phone (P0 only) |

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-28 | 1.0 | DevOps | Initial runbook |
