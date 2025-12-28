#!/bin/bash
# PostgreSQL WAL Archive Script for Mykadoo
# This script archives WAL files to S3 for point-in-time recovery
# Called by PostgreSQL's archive_command

set -euo pipefail

# Arguments from PostgreSQL
WAL_FILE="$1"      # %f - WAL file name
WAL_PATH="$2"      # %p - Path to WAL file

# Configuration from environment
S3_BUCKET="${S3_BUCKET:-mykadoo-backups}"
S3_PREFIX="${S3_PREFIX:-wal}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
ENVIRONMENT="${ENVIRONMENT:-production}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

# Paths
ARCHIVE_DIR="/tmp/wal_archive"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging (to syslog for PostgreSQL integration)
log() {
    logger -t "pg-wal-archive" "$1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    logger -t "pg-wal-archive" -p local0.err "ERROR: $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# Create archive directory
mkdir -p "${ARCHIVE_DIR}"

log "Archiving WAL file: ${WAL_FILE}"

# Copy WAL file to temporary location
TEMP_FILE="${ARCHIVE_DIR}/${WAL_FILE}"
cp "${WAL_PATH}" "${TEMP_FILE}"

# Compress WAL file
COMPRESSED_FILE="${TEMP_FILE}.gz"
gzip -c "${TEMP_FILE}" > "${COMPRESSED_FILE}"
rm "${TEMP_FILE}"

# Encrypt if key is provided
UPLOAD_FILE="${COMPRESSED_FILE}"
if [[ -n "${ENCRYPTION_KEY}" ]]; then
    ENCRYPTED_FILE="${COMPRESSED_FILE}.enc"
    openssl enc -aes-256-cbc -salt -pbkdf2 \
        -in "${COMPRESSED_FILE}" \
        -out "${ENCRYPTED_FILE}" \
        -pass "pass:${ENCRYPTION_KEY}"
    rm "${COMPRESSED_FILE}"
    UPLOAD_FILE="${ENCRYPTED_FILE}"
fi

# Determine S3 path with date-based partitioning
DATE_PREFIX=$(date +%Y/%m/%d)
S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${DATE_PREFIX}/${WAL_FILE}.gz"
if [[ -n "${ENCRYPTION_KEY}" ]]; then
    S3_PATH="${S3_PATH}.enc"
fi

# Upload to S3
if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${UPLOAD_FILE}" "${S3_PATH}" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${UPLOAD_FILE}" "${S3_PATH}" \
        --only-show-errors
fi

# Cleanup
rm -f "${UPLOAD_FILE}"

log "WAL file archived: ${S3_PATH}"

exit 0
