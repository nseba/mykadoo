#!/bin/bash
# File Storage Backup Script for Mykadoo
# This script backs up uploaded files and persistent volume data to S3
# Supports incremental backups using rsync-style sync

set -euo pipefail

# Configuration from environment
S3_BUCKET="${S3_BUCKET:-mykadoo-backups}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_PREFIX="${S3_PREFIX:-files}"
ENVIRONMENT="${ENVIRONMENT:-production}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Source directories to backup
UPLOAD_DIR="${UPLOAD_DIR:-/app/uploads}"
ASSETS_DIR="${ASSETS_DIR:-/app/public/assets}"
CONFIG_DIR="${CONFIG_DIR:-/app/config}"

# Local paths
BACKUP_DIR="/tmp/file_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

log "=========================================="
log "     FILE STORAGE BACKUP"
log "=========================================="
log "Environment: ${ENVIRONMENT}"
log "Destination: s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/"
log ""

# Function to backup a directory
backup_directory() {
    local src_dir="$1"
    local backup_name="$2"

    if [[ ! -d "${src_dir}" ]]; then
        log "Directory not found, skipping: ${src_dir}"
        return 0
    fi

    local file_count
    file_count=$(find "${src_dir}" -type f 2>/dev/null | wc -l)

    if [[ "${file_count}" -eq 0 ]]; then
        log "No files in ${src_dir}, skipping"
        return 0
    fi

    log "Backing up ${backup_name} (${file_count} files)..."

    local archive_file="${BACKUP_DIR}/${backup_name}_${TIMESTAMP}.tar.gz"

    # Create compressed archive
    tar -czf "${archive_file}" -C "$(dirname "${src_dir}")" "$(basename "${src_dir}")"

    local archive_size
    archive_size=$(du -h "${archive_file}" | cut -f1)
    log "  Archive created: ${archive_size}"

    # Encrypt if key is provided
    local upload_file="${archive_file}"
    if [[ -n "${ENCRYPTION_KEY}" ]]; then
        log "  Encrypting archive..."
        local encrypted_file="${archive_file}.enc"
        openssl enc -aes-256-cbc -salt -pbkdf2 \
            -in "${archive_file}" \
            -out "${encrypted_file}" \
            -pass "pass:${ENCRYPTION_KEY}"
        rm "${archive_file}"
        upload_file="${encrypted_file}"
    fi

    # Upload to S3
    local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${backup_name}/"
    local upload_filename
    upload_filename=$(basename "${upload_file}")

    log "  Uploading to S3..."
    if [[ -n "${S3_ENDPOINT}" ]]; then
        aws s3 cp "${upload_file}" "${s3_path}${upload_filename}" \
            --endpoint-url "${S3_ENDPOINT}" \
            --only-show-errors
    else
        aws s3 cp "${upload_file}" "${s3_path}${upload_filename}" \
            --only-show-errors
    fi

    log "  Uploaded: ${s3_path}${upload_filename}"

    # Update latest pointer
    local latest_path="${s3_path}latest.tar.gz"
    if [[ -n "${ENCRYPTION_KEY}" ]]; then
        latest_path="${s3_path}latest.tar.gz.enc"
    fi

    if [[ -n "${S3_ENDPOINT}" ]]; then
        aws s3 cp "${s3_path}${upload_filename}" "${latest_path}" \
            --endpoint-url "${S3_ENDPOINT}" \
            --only-show-errors
    else
        aws s3 cp "${s3_path}${upload_filename}" "${latest_path}" \
            --only-show-errors
    fi

    rm -f "${upload_file}"
    log "  Backup complete for ${backup_name}"
}

# Function for incremental sync (for large directories)
sync_directory() {
    local src_dir="$1"
    local backup_name="$2"

    if [[ ! -d "${src_dir}" ]]; then
        log "Directory not found, skipping: ${src_dir}"
        return 0
    fi

    log "Syncing ${backup_name}..."

    local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${backup_name}/"

    if [[ -n "${S3_ENDPOINT}" ]]; then
        aws s3 sync "${src_dir}" "${s3_path}" \
            --endpoint-url "${S3_ENDPOINT}" \
            --delete \
            --only-show-errors
    else
        aws s3 sync "${src_dir}" "${s3_path}" \
            --delete \
            --only-show-errors
    fi

    log "  Sync complete for ${backup_name}"
}

# Backup uploads directory (archived, as it may contain user data)
backup_directory "${UPLOAD_DIR}" "uploads"

# Sync assets directory (incremental, for static assets)
sync_directory "${ASSETS_DIR}" "assets"

# Backup configuration files
backup_directory "${CONFIG_DIR}" "config"

# Apply retention policy for archived backups
log ""
log "Applying retention policy (${BACKUP_RETENTION_DAYS} days)..."

CUTOFF_DATE=$(date -d "-${BACKUP_RETENTION_DAYS} days" +%Y%m%d 2>/dev/null || date -v-${BACKUP_RETENTION_DAYS}d +%Y%m%d)

for backup_type in "uploads" "config"; do
    s3_prefix="s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/${backup_type}/"

    if [[ -n "${S3_ENDPOINT}" ]]; then
        OLD_FILES=$(aws s3 ls "${s3_prefix}" \
            --endpoint-url "${S3_ENDPOINT}" 2>/dev/null \
            | grep -E "[0-9]{8}_[0-9]{6}" \
            | awk '{print $4}' \
            | while read -r file; do
                file_date=$(echo "$file" | grep -oE '[0-9]{8}')
                if [[ -n "$file_date" && "$file_date" < "$CUTOFF_DATE" ]]; then
                    echo "$file"
                fi
            done || true)
    else
        OLD_FILES=$(aws s3 ls "${s3_prefix}" 2>/dev/null \
            | grep -E "[0-9]{8}_[0-9]{6}" \
            | awk '{print $4}' \
            | while read -r file; do
                file_date=$(echo "$file" | grep -oE '[0-9]{8}')
                if [[ -n "$file_date" && "$file_date" < "$CUTOFF_DATE" ]]; then
                    echo "$file"
                fi
            done || true)
    fi

    for old_file in $OLD_FILES; do
        log "  Deleting old backup: ${backup_type}/${old_file}"
        if [[ -n "${S3_ENDPOINT}" ]]; then
            aws s3 rm "${s3_prefix}${old_file}" \
                --endpoint-url "${S3_ENDPOINT}" \
                --only-show-errors || true
        else
            aws s3 rm "${s3_prefix}${old_file}" \
                --only-show-errors || true
        fi
    done
done

# Generate backup manifest
MANIFEST_FILE="${BACKUP_DIR}/backup_manifest_${TIMESTAMP}.json"
cat > "${MANIFEST_FILE}" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "environment": "${ENVIRONMENT}",
    "type": "file_storage",
    "s3_bucket": "${S3_BUCKET}",
    "s3_prefix": "${S3_PREFIX}/${ENVIRONMENT}",
    "encrypted": $([ -n "${ENCRYPTION_KEY}" ] && echo "true" || echo "false"),
    "retention_days": ${BACKUP_RETENTION_DAYS},
    "backed_up": {
        "uploads": $([ -d "${UPLOAD_DIR}" ] && echo "true" || echo "false"),
        "assets": $([ -d "${ASSETS_DIR}" ] && echo "true" || echo "false"),
        "config": $([ -d "${CONFIG_DIR}" ] && echo "true" || echo "false")
    }
}
EOF

# Upload manifest
if [[ -n "${S3_ENDPOINT}" ]]; then
    aws s3 cp "${MANIFEST_FILE}" \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/manifests/manifest_${TIMESTAMP}.json" \
        --endpoint-url "${S3_ENDPOINT}" \
        --only-show-errors
else
    aws s3 cp "${MANIFEST_FILE}" \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${ENVIRONMENT}/manifests/manifest_${TIMESTAMP}.json" \
        --only-show-errors
fi

log ""
log "=========================================="
log "     FILE BACKUP COMPLETED"
log "=========================================="
log ""

exit 0
