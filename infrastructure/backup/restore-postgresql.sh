#!/bin/bash
# PostgreSQL Restore Script for Mykadoo
# This script restores database from S3 backups
# Supports both full backups and point-in-time recovery

set -euo pipefail

# Configuration (from environment variables)
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-mykadoo}"
PGUSER="${PGUSER:-mykadoo_user}"
PGPASSWORD="${PGPASSWORD:-}"

# Restore configuration
S3_BUCKET="${S3_BUCKET:-mykadoo-backups}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_PREFIX="${S3_PREFIX:-database}"
ENVIRONMENT="${ENVIRONMENT:-production}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

# Options
BACKUP_FILE="${BACKUP_FILE:-latest.sql.gz}"  # Specific backup or "latest"
RESTORE_TARGET="${RESTORE_TARGET:-${PGDATABASE}}"  # Target database name
DRY_RUN="${DRY_RUN:-false}"
SKIP_CONFIRMATION="${SKIP_CONFIRMATION:-false}"

# Local paths
RESTORE_DIR="/tmp/restore"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

warn() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >&2
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    rm -rf "${RESTORE_DIR}"
}

trap cleanup EXIT

# Confirmation prompt
confirm_restore() {
    if [[ "${SKIP_CONFIRMATION}" == "true" ]]; then
        return 0
    fi

    echo ""
    warn "=========================================="
    warn "         DATABASE RESTORE WARNING"
    warn "=========================================="
    echo ""
    echo "You are about to restore:"
    echo "  Source: s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${BACKUP_FILE}"
    echo "  Target: ${PGHOST}:${PGPORT}/${RESTORE_TARGET}"
    echo ""
    warn "This will OVERWRITE the existing database!"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! "$REPLY" =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
}

# List available backups
list_backups() {
    log "Available backups in ${ENVIRONMENT}:"
    echo ""

    if [[ -n "${S3_ENDPOINT}" ]]; then
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/" \
            --endpoint-url "${S3_ENDPOINT}" \
            | grep -E "\.sql\.gz" \
            | sort -r \
            | head -20
    else
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/" \
            | grep -E "\.sql\.gz" \
            | sort -r \
            | head -20
    fi

    echo ""
    log "To restore a specific backup, set BACKUP_FILE=<filename>"
}

# Create restore directory
mkdir -p "${RESTORE_DIR}"

log "Starting database restore"
log "Source: s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${BACKUP_FILE}"
log "Target: ${PGHOST}:${PGPORT}/${RESTORE_TARGET}"

# Handle encrypted backup file names
DOWNLOAD_FILE="${BACKUP_FILE}"
if [[ -n "${ENCRYPTION_KEY}" && ! "${BACKUP_FILE}" =~ \.enc$ ]]; then
    DOWNLOAD_FILE="${BACKUP_FILE}.enc"
fi

S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${DOWNLOAD_FILE}"
LOCAL_FILE="${RESTORE_DIR}/${DOWNLOAD_FILE}"

# Check if backup exists
log "Verifying backup exists..."
if [[ -n "${S3_ENDPOINT}" ]]; then
    if ! aws s3 ls "${S3_PATH}" --endpoint-url "${S3_ENDPOINT}" &>/dev/null; then
        error "Backup not found: ${S3_PATH}"
        list_backups
        exit 1
    fi
else
    if ! aws s3 ls "${S3_PATH}" &>/dev/null; then
        error "Backup not found: ${S3_PATH}"
        list_backups
        exit 1
    fi
fi

# Confirm restore
confirm_restore

if [[ "${DRY_RUN}" == "true" ]]; then
    log "DRY RUN: Would restore from ${S3_PATH} to ${RESTORE_TARGET}"
    exit 0
fi

# Download backup
log "Downloading backup from S3..."
if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${S3_PATH}" "${LOCAL_FILE}" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${S3_PATH}" "${LOCAL_FILE}" \
        --only-show-errors
fi

log "Backup downloaded. Size: $(du -h "${LOCAL_FILE}" | cut -f1)"

# Decrypt if needed
if [[ "${LOCAL_FILE}" =~ \.enc$ ]]; then
    if [[ -z "${ENCRYPTION_KEY}" ]]; then
        error "Backup is encrypted but no BACKUP_ENCRYPTION_KEY provided"
        exit 1
    fi

    log "Decrypting backup..."
    DECRYPTED_FILE="${LOCAL_FILE%.enc}"
    openssl enc -aes-256-cbc -d -pbkdf2 \
        -in "${LOCAL_FILE}" \
        -out "${DECRYPTED_FILE}" \
        -pass "pass:${ENCRYPTION_KEY}"
    rm "${LOCAL_FILE}"
    LOCAL_FILE="${DECRYPTED_FILE}"
    log "Decryption completed"
fi

# Create pre-restore backup
log "Creating pre-restore backup of current database..."
PRE_RESTORE_BACKUP="${RESTORE_DIR}/pre_restore_${RESTORE_TARGET}_${TIMESTAMP}.sql.gz"
export PGPASSWORD

pg_dump \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="${RESTORE_TARGET}" \
    --format=plain \
    --no-owner \
    --no-privileges \
    2>/dev/null | gzip > "${PRE_RESTORE_BACKUP}" || true

if [[ -f "${PRE_RESTORE_BACKUP}" && -s "${PRE_RESTORE_BACKUP}" ]]; then
    log "Pre-restore backup created: $(du -h "${PRE_RESTORE_BACKUP}" | cut -f1)"

    # Upload pre-restore backup to S3
    PRE_RESTORE_S3="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/pre_restore/pre_restore_${RESTORE_TARGET}_${TIMESTAMP}.sql.gz"
    if [[ -n "${S3_ENDPOINT}" ]]; then
        aws s3 cp "${PRE_RESTORE_BACKUP}" "${PRE_RESTORE_S3}" \
            --endpoint-url "${S3_ENDPOINT}" \
            --only-show-errors || true
    else
        aws s3 cp "${PRE_RESTORE_BACKUP}" "${PRE_RESTORE_S3}" \
            --only-show-errors || true
    fi
    log "Pre-restore backup uploaded to S3"
else
    warn "Could not create pre-restore backup (database may be empty)"
fi

# Terminate existing connections
log "Terminating existing database connections..."
psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="postgres" \
    --command="SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${RESTORE_TARGET}' AND pid <> pg_backend_pid();" \
    2>/dev/null || true

# Drop and recreate database
log "Recreating database ${RESTORE_TARGET}..."
psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="postgres" \
    --command="DROP DATABASE IF EXISTS ${RESTORE_TARGET};" \
    2>/dev/null || true

psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="postgres" \
    --command="CREATE DATABASE ${RESTORE_TARGET} OWNER ${PGUSER};"

# Restore database
log "Restoring database from backup..."
gunzip -c "${LOCAL_FILE}" | psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="${RESTORE_TARGET}" \
    --quiet \
    --single-transaction \
    2>&1 | grep -v "^SET" | grep -v "^$" || true

log "Database restore completed!"

# Verify restore
log "Verifying restore..."
TABLE_COUNT=$(psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="${RESTORE_TARGET}" \
    --tuples-only \
    --command="SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")

TABLE_COUNT=$(echo "${TABLE_COUNT}" | tr -d ' ')

if [[ "${TABLE_COUNT}" -gt 0 ]]; then
    log "Restore verification successful: ${TABLE_COUNT} tables found"
else
    warn "No tables found after restore - this may indicate an issue"
fi

# Log restore metadata
METADATA_FILE="${RESTORE_DIR}/restore_metadata.json"
cat > "${METADATA_FILE}" << EOF
{
    "database": "${RESTORE_TARGET}",
    "environment": "${ENVIRONMENT}",
    "restored_at": "${TIMESTAMP}",
    "source_backup": "${BACKUP_FILE}",
    "s3_path": "${S3_PATH}",
    "table_count": ${TABLE_COUNT},
    "pre_restore_backup": "${PRE_RESTORE_S3:-none}"
}
EOF

log "Restore metadata:"
cat "${METADATA_FILE}"

log ""
log "=========================================="
log "         RESTORE COMPLETED"
log "=========================================="
log "Database: ${RESTORE_TARGET}"
log "Tables restored: ${TABLE_COUNT}"
log "Pre-restore backup: ${PRE_RESTORE_S3:-none}"
log ""

exit 0
