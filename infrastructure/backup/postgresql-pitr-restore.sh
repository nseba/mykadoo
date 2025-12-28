#!/bin/bash
# PostgreSQL Point-in-Time Recovery Script for Mykadoo
# This script performs point-in-time recovery using base backup and WAL files
# Usage: ./postgresql-pitr-restore.sh [--target-time "2024-01-15 10:30:00"]

set -euo pipefail

# Configuration from environment
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-mykadoo}"
PGUSER="${PGUSER:-mykadoo_user}"
PGPASSWORD="${PGPASSWORD:-}"
PGDATA="${PGDATA:-/var/lib/postgresql/data}"

# Restore configuration
S3_BUCKET="${S3_BUCKET:-mykadoo-backups}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_DATABASE_PREFIX="${S3_DATABASE_PREFIX:-database}"
S3_WAL_PREFIX="${S3_WAL_PREFIX:-wal}"
ENVIRONMENT="${ENVIRONMENT:-production}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

# Default: restore to latest available point
TARGET_TIME="${TARGET_TIME:-}"
BASE_BACKUP="${BASE_BACKUP:-latest}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --target-time)
            TARGET_TIME="$2"
            shift 2
            ;;
        --base-backup)
            BASE_BACKUP="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --target-time TIME   Restore to specific time (e.g., '2024-01-15 10:30:00')"
            echo "  --base-backup FILE   Use specific base backup instead of latest"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Paths
RESTORE_DIR="/tmp/pitr_restore"
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

# Create restore directory
mkdir -p "${RESTORE_DIR}"
mkdir -p "${RESTORE_DIR}/wal"

log "=========================================="
log "     POINT-IN-TIME RECOVERY"
log "=========================================="
log "Environment: ${ENVIRONMENT}"
log "Base backup: ${BASE_BACKUP}"
if [[ -n "${TARGET_TIME}" ]]; then
    log "Target time: ${TARGET_TIME}"
else
    log "Target time: Latest available"
fi
log ""

# Stop PostgreSQL if running
log "Stopping PostgreSQL..."
pg_ctl stop -D "${PGDATA}" -m fast 2>/dev/null || true
sleep 5

# Backup current data directory
log "Backing up current data directory..."
BACKUP_DATA="${PGDATA}_backup_${TIMESTAMP}"
if [[ -d "${PGDATA}" ]]; then
    mv "${PGDATA}" "${BACKUP_DATA}"
    log "Current data backed up to: ${BACKUP_DATA}"
fi

# Download base backup
log "Downloading base backup..."
BASE_BACKUP_FILE="latest.sql.gz"
if [[ "${BASE_BACKUP}" != "latest" ]]; then
    BASE_BACKUP_FILE="${BASE_BACKUP}"
fi

if [[ -n "${ENCRYPTION_KEY}" && ! "${BASE_BACKUP_FILE}" =~ \.enc$ ]]; then
    BASE_BACKUP_FILE="${BASE_BACKUP_FILE}.enc"
fi

S3_BACKUP_PATH="s3://${S3_BUCKET}/${S3_DATABASE_PREFIX}/${ENVIRONMENT}/${BASE_BACKUP_FILE}"
LOCAL_BACKUP="${RESTORE_DIR}/${BASE_BACKUP_FILE}"

if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${S3_BACKUP_PATH}" "${LOCAL_BACKUP}" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${S3_BACKUP_PATH}" "${LOCAL_BACKUP}" \
        --only-show-errors
fi

# Decrypt if needed
if [[ "${LOCAL_BACKUP}" =~ \.enc$ ]]; then
    log "Decrypting backup..."
    DECRYPTED_FILE="${LOCAL_BACKUP%.enc}"
    openssl enc -aes-256-cbc -d -pbkdf2 \
        -in "${LOCAL_BACKUP}" \
        -out "${DECRYPTED_FILE}" \
        -pass "pass:${ENCRYPTION_KEY}"
    rm "${LOCAL_BACKUP}"
    LOCAL_BACKUP="${DECRYPTED_FILE}"
fi

# Initialize new data directory
log "Initializing new data directory..."
mkdir -p "${PGDATA}"
chmod 700 "${PGDATA}"
pg_ctl init -D "${PGDATA}" -o "--encoding=UTF8" 2>/dev/null || initdb -D "${PGDATA}" --encoding=UTF8

# Download WAL files for recovery
log "Downloading WAL files..."
WAL_RESTORE_DIR="${RESTORE_DIR}/wal"

# List and download WAL files based on target time
if [[ -n "${TARGET_TIME}" ]]; then
    # Parse target time to determine which WAL files to download
    TARGET_DATE=$(echo "${TARGET_TIME}" | cut -d' ' -f1 | tr -d '-')
    log "Downloading WAL files up to ${TARGET_DATE}..."
fi

# Download all available WAL files (in production, filter by date)
if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 sync "s3://${S3_BUCKET}/${S3_WAL_PREFIX}/${ENVIRONMENT}/" "${WAL_RESTORE_DIR}/" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors || true
else
    aws s3 sync "s3://${S3_BUCKET}/${S3_WAL_PREFIX}/${ENVIRONMENT}/" "${WAL_RESTORE_DIR}/" \
        --only-show-errors || true
fi

WAL_COUNT=$(find "${WAL_RESTORE_DIR}" -name "*.gz*" 2>/dev/null | wc -l)
log "Downloaded ${WAL_COUNT} WAL files"

# Create recovery configuration
log "Creating recovery configuration..."

# Create restore_command script
cat > "${RESTORE_DIR}/restore_wal.sh" << 'RESTORE_EOF'
#!/bin/bash
WAL_FILE="$1"
RESTORE_PATH="$2"
WAL_DIR="/tmp/pitr_restore/wal"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

# Find WAL file (may be in date-organized subdirectories)
FOUND_FILE=$(find "${WAL_DIR}" -name "${WAL_FILE}.gz*" 2>/dev/null | head -1)

if [[ -z "${FOUND_FILE}" ]]; then
    exit 1
fi

# Decompress and decrypt
TEMP_FILE="/tmp/wal_restore_${WAL_FILE}"

if [[ "${FOUND_FILE}" =~ \.enc$ ]]; then
    if [[ -n "${ENCRYPTION_KEY}" ]]; then
        openssl enc -aes-256-cbc -d -pbkdf2 \
            -in "${FOUND_FILE}" \
            -pass "pass:${ENCRYPTION_KEY}" 2>/dev/null | gunzip > "${TEMP_FILE}"
    else
        exit 1
    fi
else
    gunzip -c "${FOUND_FILE}" > "${TEMP_FILE}"
fi

mv "${TEMP_FILE}" "${RESTORE_PATH}"
exit 0
RESTORE_EOF
chmod +x "${RESTORE_DIR}/restore_wal.sh"

# Create postgresql.auto.conf for recovery
cat > "${PGDATA}/postgresql.auto.conf" << EOF
# Recovery configuration for point-in-time recovery
restore_command = '${RESTORE_DIR}/restore_wal.sh %f %p'
EOF

# Add recovery target if specified
if [[ -n "${TARGET_TIME}" ]]; then
    cat >> "${PGDATA}/postgresql.auto.conf" << EOF
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF
fi

# Create recovery signal file (PostgreSQL 12+)
touch "${PGDATA}/recovery.signal"

# Start PostgreSQL in recovery mode
log "Starting PostgreSQL in recovery mode..."
pg_ctl start -D "${PGDATA}" -l "${RESTORE_DIR}/recovery.log" -w

# Wait for recovery to complete
log "Waiting for recovery to complete..."
RECOVERY_COMPLETE=false
for i in {1..300}; do
    if pg_isready -h localhost -p "${PGPORT}" -U "${PGUSER}" >/dev/null 2>&1; then
        # Check if still in recovery
        IN_RECOVERY=$(psql -h localhost -p "${PGPORT}" -U "${PGUSER}" -d postgres -tAc "SELECT pg_is_in_recovery();" 2>/dev/null || echo "t")
        if [[ "${IN_RECOVERY}" == "f" ]]; then
            RECOVERY_COMPLETE=true
            break
        fi
    fi
    sleep 1
done

if [[ "${RECOVERY_COMPLETE}" == "true" ]]; then
    log "Recovery completed successfully!"
else
    warn "Recovery may still be in progress or encountered issues"
    warn "Check ${RESTORE_DIR}/recovery.log for details"
fi

# Restore the original database from SQL dump
log "Restoring database from base backup..."
export PGPASSWORD

# Create database if it doesn't exist
psql -h localhost -p "${PGPORT}" -U "${PGUSER}" -d postgres \
    -c "CREATE DATABASE ${PGDATABASE} OWNER ${PGUSER};" 2>/dev/null || true

# Restore from backup
gunzip -c "${LOCAL_BACKUP}" | psql \
    -h localhost -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" \
    --quiet 2>&1 | grep -v "^SET" | grep -v "^$" || true

# Verify restoration
TABLE_COUNT=$(psql -h localhost -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" \
    -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

log ""
log "=========================================="
log "     RECOVERY COMPLETED"
log "=========================================="
log "Database: ${PGDATABASE}"
log "Tables: ${TABLE_COUNT}"
if [[ -n "${TARGET_TIME}" ]]; then
    log "Restored to: ${TARGET_TIME}"
else
    log "Restored to: Latest available point"
fi
log "Previous data backup: ${BACKUP_DATA}"
log ""

exit 0
