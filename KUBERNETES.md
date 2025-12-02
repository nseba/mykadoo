# Kubernetes Deployment Guide

This guide explains how to deploy Mykadoo to Kubernetes using Helm.

## Prerequisites

- Kubernetes cluster (1.24+)
- Helm 3.0+ installed
- kubectl configured
- cert-manager installed
- ingress-nginx controller installed

## Quick Start

### Deploy to Staging

```bash
helm install mykadoo ./helm/mykadoo \
  --namespace mykadoo-staging \
  --values helm/mykadoo/values-staging.yaml
```

### Deploy to Production

```bash
helm install mykadoo ./helm/mykadoo \
  --namespace mykadoo-production \
  --values helm/mykadoo/values-production.yaml
```

## Helm Commands

### Upgrade

```bash
helm upgrade mykadoo ./helm/mykadoo \
  --namespace mykadoo-production \
  --values helm/mykadoo/values-production.yaml
```

### Rollback

```bash
helm rollback mykadoo --namespace mykadoo-production
```

## Verify Deployment

```bash
kubectl get pods --namespace mykadoo-production
kubectl logs -f deployment/mykadoo-api --namespace mykadoo-production
kubectl get services --namespace mykadoo-production
kubectl get ingress --namespace mykadoo-production
```

## Scaling

```bash
# Manual scaling
kubectl scale deployment/mykadoo-api --replicas=5 --namespace=mykadoo-production

# Check HPA
kubectl get hpa --namespace mykadoo-production
```

## Monitoring

```bash
kubectl top pods --namespace mykadoo-production
kubectl get events --namespace mykadoo-production
```

See Helm chart documentation for full details.
