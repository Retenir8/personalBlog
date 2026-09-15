#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "缺少 .env，请先复制 .env.production.example 并填写生产密钥。" >&2
  exit 1
fi

set -a
. ./.env
set +a

compose_file="${COMPOSE_FILE:-compose.yaml}"
docker compose -f "$compose_file" config >/dev/null
docker compose -f "$compose_file" up -d --build
docker compose -f "$compose_file" ps

echo "部署命令已完成。请检查："
echo "  curl http://127.0.0.1:3000/home"
echo "  curl http://127.0.0.1:3001/api/activities"
