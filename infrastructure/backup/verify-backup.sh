#!/bin/bash
# Backup Verification Script for Mykadoo
# This script tests backup integrity by performing a restore to a temporary database
# Runs as part of the weekly backup verification schedule

set -euo pipefail

# Configuration (from environment variables)
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-mykadoo}"
PGUSER="${PGUSER:-mykadoo_user}"
PGPASSWORD="${PGPASSWORD:-}"

# Verification configuration
S3_BUCKET="${S3_BUCKET:-mykadoo-backups}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_PREFIX="${S3_PREFIX:-database}"
ENVIRONMENT="${ENVIRONMENT:-production}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Test database (temporary, will be dropped after verification)
TEST_DATABASE="mykadoo_backup_verify_$(date +%Y%m%d%H%M%S)"

# Local paths
VERIFY_DIR="/tmp/backup_verify"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${VERIFY_DIR}/verification_report_${TIMESTAMP}.json"

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# Cleanup function
cleanup() {
    log "Cleaning up..."

    # Drop test database
    export PGPASSWORD
    psql \
        --host="${PGHOST}" \
        --port="${PGPORT}" \
        --username="${PGUSER}" \
        --dbname="postgres" \
        --command="DROP DATABASE IF EXISTS ${TEST_DATABASE};" \
        2>/dev/null || true

    rm -rf "${VERIFY_DIR}"
    log "Cleanup completed"
}

trap cleanup EXIT

# Send notification
send_notification() {
    local status="$1"
    local message="$2"

    if [[ -z "${SLACK_WEBHOOK}" ]]; then
        return 0
    fi

    local color
    if [[ "${status}" == "success" ]]; then
        color="good"
    else
        color="danger"
    fi

    curl -s -X POST "${SLACK_WEBHOOK}" \
        -H "Content-Type: application/json" \
        -d "{
            \"attachments\": [{
                \"color\": \"${color}\",
                \"title\": \"Backup Verification - ${ENVIRONMENT}\",
                \"text\": \"${message}\",
                \"footer\": \"Mykadoo Backup System\",
                \"ts\": $(date +%s)
            }]
        }" || true
}

# Create verification directory
mkdir -p "${VERIFY_DIR}"

log "=========================================="
log "     BACKUP VERIFICATION STARTED"
log "=========================================="
log "Environment: ${ENVIRONMENT}"
log "Backup source: s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/"
log "Test database: ${TEST_DATABASE}"
log ""

export PGPASSWORD

# Get latest backup file
log "Finding latest backup..."
BACKUP_FILE="latest.sql.gz"
if [[ -n "${ENCRYPTION_KEY}" ]]; then
    BACKUP_FILE="latest.sql.gz.enc"
fi

S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${BACKUP_FILE}"
LOCAL_BACKUP="${VERIFY_DIR}/${BACKUP_FILE}"

# Download backup
log "Downloading latest backup..."
if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${S3_PATH}" "${LOCAL_BACKUP}" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${S3_PATH}" "${LOCAL_BACKUP}" \
        --only-show-errors
fi

BACKUP_SIZE=$(du -h "${LOCAL_BACKUP}" | cut -f1)
log "Backup downloaded. Size: ${BACKUP_SIZE}"

# Decrypt if needed
if [[ "${LOCAL_BACKUP}" =~ \.enc$ ]]; then
    if [[ -z "${ENCRYPTION_KEY}" ]]; then
        error "Backup is encrypted but no BACKUP_ENCRYPTION_KEY provided"
        send_notification "failure" "Backup verification failed: Missing encryption key"
        exit 1
    fi

    log "Decrypting backup..."
    DECRYPTED_FILE="${LOCAL_BACKUP%.enc}"
    openssl enc -aes-256-cbc -d -pbkdf2 \
        -in "${LOCAL_BACKUP}" \
        -out "${DECRYPTED_FILE}" \
        -pass "pass:${ENCRYPTION_KEY}"
    rm "${LOCAL_BACKUP}"
    LOCAL_BACKUP="${DECRYPTED_FILE}"
    log "Decryption completed"
fi

# Create test database
log "Creating test database: ${TEST_DATABASE}"
psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="postgres" \
    --command="CREATE DATABASE ${TEST_DATABASE} OWNER ${PGUSER};"

# Restore to test database
log "Restoring backup to test database..."
RESTORE_START=$(date +%s)

gunzip -c "${LOCAL_BACKUP}" | psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="${TEST_DATABASE}" \
    --quiet \
    2>&1 | grep -v "^SET" | grep -v "^$" || true

RESTORE_END=$(date +%s)
RESTORE_DURATION=$((RESTORE_END - RESTORE_START))

log "Restore completed in ${RESTORE_DURATION} seconds"

# Verify restore - count tables
log "Verifying restored data..."
TABLE_COUNT=$(psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="${TEST_DATABASE}" \
    --tuples-only \
    --command="SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
TABLE_COUNT=$(echo "${TABLE_COUNT}" | tr -d ' ')

# Get row counts for critical tables
log "Checking critical tables..."
CRITICAL_TABLES=("User" "Product" "SearchHistory" "Article" "Subscription")
TABLE_CHECKS=()
ALL_CHECKS_PASSED=true

for table in "${CRITICAL_TABLES[@]}"; do
    COUNT=$(psql \
        --host="${PGHOST}" \
        --port="${PGPORT}" \
        --username="${PGUSER}" \
        --dbname="${TEST_DATABASE}" \
        --tuples-only \
        --command="SELECT count(*) FROM \"${table}\" 2>/dev/null || SELECT 0;" 2>/dev/null || echo "0")
    COUNT=$(echo "${COUNT}" | tr -d ' ')

    if [[ "${COUNT}" =~ ^[0-9]+$ ]]; then
        TABLE_CHECKS+=("{\"table\": \"${table}\", \"count\": ${COUNT}}")
        log "  ${table}: ${COUNT} rows"
    else
        TABLE_CHECKS+=("{\"table\": \"${table}\", \"count\": 0, \"error\": \"table not found\"}")
        log "  ${table}: Not found or error"
    fi
done

# Test database integrity
log "Running integrity checks..."
INTEGRITY_CHECK=$(psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="${TEST_DATABASE}" \
    --tuples-only \
    --command="SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public';" 2>/dev/null || echo "0")
INTEGRITY_CHECK=$(echo "${INTEGRITY_CHECK}" | tr -d ' ')

# Determine verification status
VERIFICATION_STATUS="success"
VERIFICATION_MESSAGE="Backup verification passed"

if [[ "${TABLE_COUNT}" -lt 1 ]]; then
    VERIFICATION_STATUS="failure"
    VERIFICATION_MESSAGE="No tables found after restore"
    ALL_CHECKS_PASSED=false
fi

if [[ "${INTEGRITY_CHECK}" != "${TABLE_COUNT}" ]]; then
    VERIFICATION_STATUS="warning"
    VERIFICATION_MESSAGE="Table count mismatch detected"
fi

# Generate report
TABLE_CHECKS_JSON=$(printf '%s,' "${TABLE_CHECKS[@]}" | sed 's/,$//')
cat > "${REPORT_FILE}" << EOF
{
    "verification_id": "${TIMESTAMP}",
    "environment": "${ENVIRONMENT}",
    "status": "${VERIFICATION_STATUS}",
    "message": "${VERIFICATION_MESSAGE}",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backup": {
        "source": "${S3_PATH}",
        "size": "${BACKUP_SIZE}",
        "encrypted": $([ -n "${ENCRYPTION_KEY}" ] && echo "true" || echo "false")
    },
    "restore": {
        "duration_seconds": ${RESTORE_DURATION},
        "test_database": "${TEST_DATABASE}"
    },
    "verification": {
        "total_tables": ${TABLE_COUNT},
        "integrity_check_tables": ${INTEGRITY_CHECK},
        "critical_tables": [${TABLE_CHECKS_JSON}]
    }
}
EOF

log ""
log "=========================================="
if [[ "${VERIFICATION_STATUS}" == "success" ]]; then
    log "     VERIFICATION PASSED"
else
    log "     VERIFICATION ${VERIFICATION_STATUS^^}"
fi
log "=========================================="
log ""
log "Report:"
cat "${REPORT_FILE}"
log ""

# Upload report to S3
REPORT_S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/verification_reports/verification_${TIMESTAMP}.json"
if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${REPORT_FILE}" "${REPORT_S3_PATH}" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${REPORT_FILE}" "${REPORT_S3_PATH}" \
        --only-show-errors
fi
log "Report uploaded to: ${REPORT_S3_PATH}"

# Send notification
if [[ "${VERIFICATION_STATUS}" == "success" ]]; then
    send_notification "success" "Backup verification passed. Tables: ${TABLE_COUNT}, Restore time: ${RESTORE_DURATION}s"
else
    send_notification "failure" "Backup verification ${VERIFICATION_STATUS}: ${VERIFICATION_MESSAGE}"
fi

# Exit with appropriate code
if [[ "${VERIFICATION_STATUS}" == "failure" ]]; then
    exit 1
elif [[ "${VERIFICATION_STATUS}" == "warning" ]]; then
    exit 0  # Warning is not a failure
else
    exit 0
fi
