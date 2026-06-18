#!/usr/bin/env bash
# Daily pg_dump backup of the cyberskill database (gzip), with 14-day retention.
# Install via cron, e.g.:
#   0 3 * * *  /root/workspace/cyberskill/scripts/backup-db.sh >> /var/log/cyberskill-backup.log 2>&1
set -euo pipefail
CONTAINER="${DB_CONTAINER:-cyberskill-db}"
BACKUP_DIR="${BACKUP_DIR:-/root/workspace/cyberskill/backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/cyberskill-$STAMP.sql.gz"

docker exec "$CONTAINER" pg_dump --no-owner \
  -U "${POSTGRES_USER:-cyberskill}" "${POSTGRES_DB:-cyberskill}" | gzip > "$FILE"

# Retain last 14 days.
find "$BACKUP_DIR" -name 'cyberskill-*.sql.gz' -mtime +14 -delete
echo "Backup written: $FILE"
