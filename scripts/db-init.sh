#!/usr/bin/env bash
# Idempotently (re-)apply database/schema.sql to the running postgres container.
# Safe to run any time — the schema uses IF NOT EXISTS / CREATE OR REPLACE.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTAINER="${DB_CONTAINER:-cyberskill-db}"
docker exec -i "$CONTAINER" psql -v ON_ERROR_STOP=1 \
  -U "${POSTGRES_USER:-cyberskill}" -d "${POSTGRES_DB:-cyberskill}" \
  < "$DIR/database/schema.sql"
echo "Schema applied to $CONTAINER."
