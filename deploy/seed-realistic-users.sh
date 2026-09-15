#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."
credential_file="initial-credentials.txt"
api="http://127.0.0.1:3001/api"

if [ -f "$credential_file" ]; then
  echo "$credential_file 已存在。为避免覆盖账号密码，本脚本不会重复执行。" >&2
  exit 1
fi

umask 077
: > "$credential_file"

create_account() {
  username="$1"
  role_label="$2"
  password="$(openssl rand -hex 12)Aa!"
  curl --fail --silent --show-error \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
    "$api/register" >/dev/null
  printf '%s | %s | %s\n' "$role_label" "$username" "$password" >> "$credential_file"
}

create_account '周明远' '管理员'
create_account '赵文博' '教师'
create_account '刘芳' '护理员'
create_account '张桂英' '普通用户'
create_account '李建国' '普通用户'
create_account '陈秀兰' '普通用户'
create_account '王德明' '普通用户'
create_account '孙玉梅' '普通用户'

set -a
. ./.env
set +a

compose_file="${COMPOSE_FILE:-compose.yaml}"
docker compose -f "$compose_file" exec -T database psql -v ON_ERROR_STOP=1 \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /dev/stdin < backend/resources/seed_realistic_data.sql

echo "模拟账号和数据已创建。凭据仅保存在服务器：$(pwd)/$credential_file"
cat "$credential_file"
