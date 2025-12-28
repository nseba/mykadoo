# Disaster Recovery Runbook

## Overview

This runbook provides procedures for recovering Mykadoo services in the event of a disaster, including database corruption, data loss, infrastructure failure, or security incidents.

**Recovery Time Objective (RTO):** < 4 hours
**Recovery Point Objective (RPO):** < 1 hour (with WAL archiving) or < 24 hours (daily backups)

## Table of Contents

1. [Backup Overview](#backup-overview)
2. [Recovery Procedures](#recovery-procedures)
3. [Incident Response](#incident-response)
4. [Post-Recovery Validation](#post-recovery-validation)
5. [Contacts & Escalation](#contacts--escalation)

---

## Backup Overview

### Backup Types

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Database Full Backup | Daily at 2:00 AM UTC | 90 days (production) | S3: `mykadoo-backups/database/` |
| WAL Archives (PITR) | Continuous | 7 days | S3: `mykadoo-backups/wal/` |
| File Storage | Daily at 3:00 AM UTC | 30 days | S3: `mykadoo-backups/files/` |
| Backup Verification | Weekly (Sunday 3:00 AM) | Reports: 90 days | S3: `mykadoo-backups/verification_reports/` |

### Backup Locations

```
s3://mykadoo-production-backups/
├── database/
│   ├── production/
│   │   ├── mykadoo_production_YYYYMMDD_HHMMSS.sql.gz.enc
│   │   ├── latest.sql.gz.enc
│   │   └── *_metadata.json
│   └── staging/
├── wal/
│   └── production/
│       └── YYYY/MM/DD/
│           └── *.gz.enc
├── files/
│   ├── uploads/
│   ├── assets/
│   └── config/
└── verification_reports/
    └── verification_YYYYMMDD_HHMMSS.json
```

---

## Recovery Procedures

### Procedure 1: Full Database Restore (Latest Backup)

**Use when:** Complete database loss, corruption, or need to restore to last known good state.

**Estimated time:** 15-30 minutes

#### Prerequisites
- Access to Kubernetes cluster (`kubectl` configured)
- AWS credentials with S3 read access
- Database encryption key (if backups are encrypted)

#### Steps

```bash
# 1. Get current environment variables
kubectl get secret mykadoo-db-credentials -n production -o yaml > /tmp/db-creds-backup.yaml

# 2. Scale down API to prevent connections
kubectl scale deployment mykadoo-api -n production --replicas=0

# 3. Wait for pods to terminate
kubectl wait --for=delete pod -l app=mykadoo-api -n production --timeout=120s

# 4. Run restore job
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: database-restore-$(date +%Y%m%d%H%M%S)
  namespace: production
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: restore
        image: postgres:16-alpine
        command: ["/scripts/restore-postgresql.sh"]
        env:
        - name: SKIP_CONFIRMATION
          value: "true"
        - name: BACKUP_FILE
          value: "latest.sql.gz.enc"
        envFrom:
        - secretRef:
            name: mykadoo-db-credentials
        - secretRef:
            name: mykadoo-backup-secrets
        volumeMounts:
        - name: scripts
          mountPath: /scripts
      volumes:
      - name: scripts
        configMap:
          name: mykadoo-backup-scripts
          defaultMode: 0755
EOF

# 5. Monitor restore progress
kubectl logs -f job/database-restore-* -n production

# 6. Verify restoration
kubectl exec -it deployment/mykadoo-postgresql -n production -- \
  psql -U mykadoo_user -d mykadoo -c "SELECT count(*) FROM \"User\";"

# 7. Scale API back up
kubectl scale deployment mykadoo-api -n production --replicas=5

# 8. Verify API health
kubectl rollout status deployment/mykadoo-api -n production
curl -f https://api.mykadoo.com/api/health
```

---

### Procedure 2: Point-in-Time Recovery (PITR)

**Use when:** Need to restore to a specific point in time (e.g., before accidental data deletion).

**Estimated time:** 30-60 minutes

#### Steps

```bash
# 1. Determine target recovery time
# Example: Restore to 2024-01-15 10:30:00 UTC
TARGET_TIME="2024-01-15 10:30:00"

# 2. Scale down all services
kubectl scale deployment mykadoo-api mykadoo-web -n production --replicas=0

# 3. Run PITR restore job
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: pitr-restore-$(date +%Y%m%d%H%M%S)
  namespace: production
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: restore
        image: postgres:16-alpine
        command: ["/scripts/postgresql-pitr-restore.sh", "--target-time", "${TARGET_TIME}"]
        envFrom:
        - secretRef:
            name: mykadoo-db-credentials
        - secretRef:
            name: mykadoo-backup-secrets
        volumeMounts:
        - name: scripts
          mountPath: /scripts
        - name: pgdata
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: scripts
        configMap:
          name: mykadoo-backup-scripts
          defaultMode: 0755
      - name: pgdata
        persistentVolumeClaim:
          claimName: mykadoo-postgresql-data
EOF

# 4. Monitor and wait for completion
kubectl logs -f job/pitr-restore-* -n production

# 5. Restart services
kubectl scale deployment mykadoo-api -n production --replicas=5
kubectl scale deployment mykadoo-web -n production --replicas=5

# 6. Verify recovery
kubectl rollout status deployment/mykadoo-api -n production
```

---

### Procedure 3: File Storage Restore

**Use when:** File uploads or assets are missing or corrupted.

**Estimated time:** 10-30 minutes (depending on data size)

#### Steps

```bash
# 1. Identify what needs to be restored
# - uploads: User uploaded files
# - assets: Static assets
# - config: Configuration files

RESTORE_TYPE="uploads"  # or "assets" or "config"

# 2. Download latest backup
aws s3 cp \
  s3://mykadoo-production-backups/files/production/${RESTORE_TYPE}/latest.tar.gz.enc \
  /tmp/restore.tar.gz.enc

# 3. Decrypt (if encrypted)
openssl enc -aes-256-cbc -d -pbkdf2 \
  -in /tmp/restore.tar.gz.enc \
  -out /tmp/restore.tar.gz \
  -pass "pass:${BACKUP_ENCRYPTION_KEY}"

# 4. Extract to target location
tar -xzf /tmp/restore.tar.gz -C /app/

# 5. Verify files
ls -la /app/${RESTORE_TYPE}/
```

---

### Procedure 4: Complete Environment Recovery

**Use when:** Complete infrastructure failure or need to rebuild environment from scratch.

**Estimated time:** 2-4 hours

#### Steps

```bash
# 1. Ensure Kubernetes cluster is available
kubectl cluster-info

# 2. Deploy infrastructure
helm upgrade --install mykadoo ./infrastructure/helm/mykadoo \
  --namespace production \
  --create-namespace \
  --values ./infrastructure/helm/mykadoo/values-production.yaml \
  --wait \
  --timeout 15m

# 3. Restore database (follow Procedure 1)
# ...

# 4. Restore file storage (follow Procedure 3)
# ...

# 5. Run database migrations
kubectl exec -it deployment/mykadoo-api -n production -- \
  npx prisma migrate deploy

# 6. Verify all services
kubectl get pods -n production
curl -f https://mykadoo.com/api/health
curl -f https://api.mykadoo.com/api/health

# 7. Run smoke tests
./scripts/smoke-tests.sh production
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1 - Critical** | Complete service outage | < 15 minutes | Database down, all pods crashing |
| **P2 - High** | Major feature unavailable | < 1 hour | Search not working, auth failures |
| **P3 - Medium** | Degraded performance | < 4 hours | Slow responses, partial outages |
| **P4 - Low** | Minor issues | < 24 hours | UI bugs, non-critical errors |

### Incident Checklist

- [ ] Assess severity and impact
- [ ] Notify stakeholders (Slack #incidents channel)
- [ ] Create incident ticket
- [ ] Identify root cause
- [ ] Execute recovery procedure
- [ ] Validate recovery
- [ ] Document timeline and actions
- [ ] Schedule post-mortem (for P1/P2)

---

## Post-Recovery Validation

### Health Checks

```bash
# 1. API Health
curl -f https://api.mykadoo.com/api/health

# 2. Database connectivity
kubectl exec -it deployment/mykadoo-api -n production -- \
  node -e "const { PrismaClient } = require('@prisma/client'); new PrismaClient().\$connect().then(() => console.log('OK'))"

# 3. Redis connectivity
kubectl exec -it deployment/mykadoo-api -n production -- \
  redis-cli -h mykadoo-redis ping

# 4. Critical table row counts
kubectl exec -it deployment/mykadoo-postgresql -n production -- \
  psql -U mykadoo_user -d mykadoo -c "
    SELECT 'User' as table_name, count(*) FROM \"User\"
    UNION ALL
    SELECT 'Product', count(*) FROM \"Product\"
    UNION ALL
    SELECT 'SearchHistory', count(*) FROM \"SearchHistory\"
    UNION ALL
    SELECT 'Article', count(*) FROM \"Article\";
  "
```

### Functional Tests

```bash
# Run critical path tests
npm run test:e2e -- --grep "critical"

# Or run smoke test suite
./scripts/smoke-tests.sh production
```

### Monitoring Verification

- [ ] Check Datadog dashboards for errors
- [ ] Verify Sentry is receiving events
- [ ] Check Prometheus metrics are flowing
- [ ] Verify alerting is working

---

## Contacts & Escalation

### On-Call Rotation

| Role | Primary | Secondary |
|------|---------|-----------|
| Backend Engineer | @backend-oncall | @backend-secondary |
| DevOps Engineer | @devops-oncall | @devops-secondary |
| Engineering Manager | @eng-manager | - |

### External Contacts

| Service | Support Link | SLA |
|---------|-------------|-----|
| AWS Support | aws.amazon.com/support | Business Support |
| Stripe | dashboard.stripe.com/support | 24/7 |
| Datadog | app.datadoghq.com/support | - |

### Communication Channels

- **Slack:** #incidents (real-time updates)
- **Slack:** #engineering (technical discussion)
- **PagerDuty:** For P1/P2 escalation
- **Status Page:** status.mykadoo.com

---

## Appendix

### Backup Encryption Key Recovery

If the backup encryption key is lost:

1. Check AWS Secrets Manager: `aws secretsmanager get-secret-value --secret-id mykadoo/backup-encryption-key`
2. Check 1Password vault: "Mykadoo Production" > "Backup Encryption Key"
3. Contact Security team for key escrow

### Manual Backup Trigger

```bash
# Trigger immediate database backup
kubectl create job --from=cronjob/mykadoo-db-backup manual-backup-$(date +%s) -n production

# Monitor progress
kubectl logs -f job/manual-backup-* -n production
```

### Backup Verification Status

Check latest verification report:

```bash
aws s3 ls s3://mykadoo-production-backups/database/production/verification_reports/ \
  --recursive | tail -5
```

---

**Last Updated:** 2025-12-28
**Document Owner:** DevOps Team
**Review Cycle:** Quarterly
