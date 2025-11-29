# Mykadoo Helm Chart

This Helm chart deploys the Mykadoo AI-powered gift search platform to Kubernetes.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.0+
- NGINX Ingress Controller
- cert-manager (for TLS certificates)

## Installing Dependencies

Before installing the chart, update dependencies:

```bash
cd infrastructure/helm/mykadoo
helm dependency update
```

This will download the required PostgreSQL and Redis charts from Bitnami.

## Installing the Chart

### Development Environment

```bash
helm install mykadoo ./infrastructure/helm/mykadoo \
  --namespace mykadoo-dev \
  --create-namespace \
  --set image.tag=dev \
  --set postgresql.auth.password=dev_password \
  --set redis.auth.password=dev_password
```

### Staging Environment

```bash
helm install mykadoo ./infrastructure/helm/mykadoo \
  --namespace mykadoo-staging \
  --create-namespace \
  --values ./infrastructure/helm/mykadoo/values-staging.yaml \
  --set postgresql.auth.password=${POSTGRES_PASSWORD} \
  --set redis.auth.password=${REDIS_PASSWORD}
```

### Production Environment

```bash
helm install mykadoo ./infrastructure/helm/mykadoo \
  --namespace mykadoo-prod \
  --create-namespace \
  --values ./infrastructure/helm/mykadoo/values-production.yaml \
  --set postgresql.auth.password=${POSTGRES_PASSWORD} \
  --set redis.auth.password=${REDIS_PASSWORD} \
  --set image.tag=v1.0.0
```

## Upgrading the Chart

```bash
helm upgrade mykadoo ./infrastructure/helm/mykadoo \
  --namespace mykadoo-prod \
  --values ./infrastructure/helm/mykadoo/values-production.yaml \
  --set image.tag=v1.1.0
```

## Uninstalling the Chart

```bash
helm uninstall mykadoo --namespace mykadoo-prod
```

## Configuration

The following table lists the configurable parameters of the Mykadoo chart and their default values.

### Global Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.environment` | Environment name | `production` |
| `global.domain` | Base domain name | `mykadoo.com` |

### Image Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.registry` | Container image registry | `docker.io` |
| `image.repository.web` | Web app repository | `mykadoo/web` |
| `image.repository.api` | API repository | `mykadoo/api` |
| `image.tag` | Image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |

### Replica Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount.web` | Web replicas | `3` |
| `replicaCount.api` | API replicas | `3` |

### Service Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `service.type` | Service type | `ClusterIP` |
| `service.web.port` | Web service port | `80` |
| `service.api.port` | API service port | `80` |

### Ingress Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class | `nginx` |
| `ingress.hosts` | Ingress hosts | See values.yaml |
| `ingress.tls` | TLS configuration | See values.yaml |

### Autoscaling Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `autoscaling.web.enabled` | Enable web autoscaling | `true` |
| `autoscaling.web.minReplicas` | Minimum web replicas | `3` |
| `autoscaling.web.maxReplicas` | Maximum web replicas | `10` |
| `autoscaling.api.enabled` | Enable API autoscaling | `true` |
| `autoscaling.api.minReplicas` | Minimum API replicas | `3` |
| `autoscaling.api.maxReplicas` | Maximum API replicas | `10` |

### Database Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `postgresql.enabled` | Enable PostgreSQL | `true` |
| `postgresql.auth.username` | Database username | `mykadoo_user` |
| `postgresql.auth.password` | Database password | `""` (set via CLI) |
| `postgresql.auth.database` | Database name | `mykadoo` |
| `postgresql.primary.persistence.size` | Database storage size | `20Gi` |

### Redis Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `redis.enabled` | Enable Redis | `true` |
| `redis.auth.password` | Redis password | `""` (set via CLI) |
| `redis.master.persistence.size` | Redis storage size | `8Gi` |

## Health Checks

Both web and API deployments include:
- **Liveness probes**: Check if container is alive (restart if fails)
- **Readiness probes**: Check if container is ready to serve traffic

Health check endpoints:
- Web: `GET /api/health`
- API: `GET /api/health`

## Resource Limits

Default resource limits:

**Web (Next.js)**
- Requests: 256Mi RAM, 250m CPU
- Limits: 512Mi RAM, 500m CPU

**API (NestJS)**
- Requests: 512Mi RAM, 500m CPU
- Limits: 1Gi RAM, 1000m CPU

## Security

- All containers run as non-root users
- Security contexts applied to pods
- Secrets managed via Kubernetes Secrets
- TLS termination at ingress

## High Availability

- Multiple replicas for each service
- Pod anti-affinity to distribute across nodes
- Pod Disruption Budgets to ensure minimum availability
- Horizontal Pod Autoscaling based on CPU/memory

## Monitoring

Enable Prometheus ServiceMonitor:

```bash
helm upgrade mykadoo ./infrastructure/helm/mykadoo \
  --set serviceMonitor.enabled=true
```

## Secrets Management

For production, use external secrets management:

```bash
# Using kubectl
kubectl create secret generic mykadoo-secret \
  --namespace mykadoo-prod \
  --from-literal=jwt_secret=$(openssl rand -base64 32) \
  --from-literal=openai_api_key=${OPENAI_API_KEY}

# Or use External Secrets Operator, Sealed Secrets, etc.
```

## Troubleshooting

### Check pod status

```bash
kubectl get pods -n mykadoo-prod
```

### View logs

```bash
kubectl logs -n mykadoo-prod deployment/mykadoo-web
kubectl logs -n mykadoo-prod deployment/mykadoo-api
```

### Debug deployment

```bash
helm get values mykadoo -n mykadoo-prod
helm get manifest mykadoo -n mykadoo-prod
```

### Template validation

```bash
helm template mykadoo ./infrastructure/helm/mykadoo \
  --values ./infrastructure/helm/mykadoo/values-production.yaml
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Deploy to Kubernetes
  run: |
    helm upgrade --install mykadoo ./infrastructure/helm/mykadoo \
      --namespace mykadoo-prod \
      --values ./infrastructure/helm/mykadoo/values-production.yaml \
      --set image.tag=${{ github.sha }} \
      --wait \
      --timeout 10m
```

## Support

For issues and questions:
- GitHub: https://github.com/mykadoo/mykadoo2/issues
- Email: dev@mykadoo.com
