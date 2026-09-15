#!/usr/bin/env sh
set -eu
umask 077

cd "$(dirname "$0")/.."
mkdir -p backups
timestamp="$(date +%Y%m%d-%H%M%S)"
set -a
. ./.env
set +a

compose_file="${COMPOSE_FILE:-compose.yaml}"
docker compose -f "$compose_file" exec -T database pg_dump \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
  > "backups/tangshe-$timestamp.dump"

find backups -type f -name 'tangshe-*.dump' -mtime +14 -delete
echo "备份完成：backups/tangshe-$timestamp.dump"
