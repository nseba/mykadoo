#!/bin/bash
# PostgreSQL Backup Script for Mykadoo
# This script performs automated database backups to S3-compatible storage
# Supports full backups and point-in-time recovery

set -euo pipefail

# Configuration (from environment variables)
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-mykadoo}"
PGUSER="${PGUSER:-mykadoo_user}"
PGPASSWORD="${PGPASSWORD:-}"

# Backup configuration
BACKUP_TYPE="${BACKUP_TYPE:-full}"  # full, incremental
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-mykadoo-backups}"
S3_ENDPOINT="${S3_ENDPOINT:-}"  # For S3-compatible storage (MinIO, etc.)
S3_PREFIX="${S3_PREFIX:-database}"
ENVIRONMENT="${ENVIRONMENT:-production}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

# Local paths
BACKUP_DIR="/tmp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${PGDATABASE}_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    rm -rf "${BACKUP_DIR}"
}

trap cleanup EXIT

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log "Starting ${BACKUP_TYPE} backup for ${PGDATABASE} on ${ENVIRONMENT}"
log "Backup file: ${BACKUP_FILE}"

# Perform PostgreSQL dump
log "Creating database dump..."
export PGPASSWORD

if [[ "${BACKUP_TYPE}" == "full" ]]; then
    # Full backup with all data
    pg_dump \
        --host="${PGHOST}" \
        --port="${PGPORT}" \
        --username="${PGUSER}" \
        --dbname="${PGDATABASE}" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --verbose \
        --clean \
        --if-exists \
        2>&1 | gzip > "${BACKUP_PATH}"
elif [[ "${BACKUP_TYPE}" == "schema" ]]; then
    # Schema only backup
    pg_dump \
        --host="${PGHOST}" \
        --port="${PGPORT}" \
        --username="${PGUSER}" \
        --dbname="${PGDATABASE}" \
        --schema-only \
        --format=plain \
        --verbose \
        2>&1 | gzip > "${BACKUP_PATH}"
else
    error "Unknown backup type: ${BACKUP_TYPE}"
    exit 1
fi

# Verify backup file
if [[ ! -f "${BACKUP_PATH}" ]]; then
    error "Backup file was not created"
    exit 1
fi

BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
log "Backup completed. Size: ${BACKUP_SIZE}"

# Encrypt if key is provided
if [[ -n "${ENCRYPTION_KEY}" ]]; then
    log "Encrypting backup..."
    ENCRYPTED_FILE="${BACKUP_PATH}.enc"
    openssl enc -aes-256-cbc -salt -pbkdf2 \
        -in "${BACKUP_PATH}" \
        -out "${ENCRYPTED_FILE}" \
        -pass "pass:${ENCRYPTION_KEY}"
    rm "${BACKUP_PATH}"
    BACKUP_PATH="${ENCRYPTED_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.enc"
    log "Encryption completed"
fi

# Upload to S3
log "Uploading backup to S3..."
S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${BACKUP_FILE}"

if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${BACKUP_PATH}" "${S3_PATH}" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${BACKUP_PATH}" "${S3_PATH}" \
        --only-show-errors
fi

log "Backup uploaded to ${S3_PATH}"

# Create latest symlink/copy for easy restore
LATEST_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/latest.sql.gz"
if [[ -n "${ENCRYPTION_KEY}" ]]; then
    LATEST_PATH="${LATEST_PATH}.enc"
fi

if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${S3_PATH}" "${LATEST_PATH}" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${S3_PATH}" "${LATEST_PATH}" \
        --only-show-errors
fi

log "Latest backup pointer updated"

# Cleanup old backups (retention policy)
log "Applying retention policy (${BACKUP_RETENTION_DAYS} days)..."
CUTOFF_DATE=$(date -d "-${BACKUP_RETENTION_DAYS} days" +%Y%m%d 2>/dev/null || date -v-${BACKUP_RETENTION_DAYS}d +%Y%m%d)

if [[ -n "${S3_ENDPOINT}" ]]; then
    OLD_BACKUPS=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/" \
        --endpoint-url "${S3_ENDPOINT}" \
        | grep -E "${PGDATABASE}_${ENVIRONMENT}_[0-9]{8}" \
        | awk '{print $4}' \
        | while read -r file; do
            file_date=$(echo "$file" | grep -oE '[0-9]{8}')
            if [[ "$file_date" < "$CUTOFF_DATE" ]]; then
                echo "$file"
            fi
        done || true)
else
    OLD_BACKUPS=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/" \
        | grep -E "${PGDATABASE}_${ENVIRONMENT}_[0-9]{8}" \
        | awk '{print $4}' \
        | while read -r file; do
            file_date=$(echo "$file" | grep -oE '[0-9]{8}')
            if [[ "$file_date" < "$CUTOFF_DATE" ]]; then
                echo "$file"
            fi
        done || true)
fi

for old_backup in $OLD_BACKUPS; do
    log "Deleting old backup: ${old_backup}"
    if [[ -n "${S3_ENDPOINT}" ]]; then
        aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${old_backup}" \
            --endpoint-url "${S3_ENDPOINT}" \
            --only-show-errors || true
    else
        aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${old_backup}" \
            --only-show-errors || true
    fi
done

# Create backup metadata
METADATA_FILE="${BACKUP_DIR}/backup_metadata.json"
cat > "${METADATA_FILE}" << EOF
{
    "database": "${PGDATABASE}",
    "environment": "${ENVIRONMENT}",
    "timestamp": "${TIMESTAMP}",
    "type": "${BACKUP_TYPE}",
    "size": "${BACKUP_SIZE}",
    "encrypted": $([ -n "${ENCRYPTION_KEY}" ] && echo "true" || echo "false"),
    "s3_path": "${S3_PATH}",
    "retention_days": ${BACKUP_RETENTION_DAYS},
    "pg_version": "$(pg_dump --version | head -1)"
}
EOF

if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${METADATA_FILE}" \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${PGDATABASE}_${ENVIRONMENT}_${TIMESTAMP}_metadata.json" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${METADATA_FILE}" \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${PGDATABASE}_${ENVIRONMENT}_${TIMESTAMP}_metadata.json" \
        --only-show-errors
fi

log "Backup completed successfully!"
log "Backup location: ${S3_PATH}"
log "Metadata: s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${PGDATABASE}_${ENVIRONMENT}_${TIMESTAMP}_metadata.json"

# Exit with success
exit 0
