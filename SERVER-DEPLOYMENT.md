# seniorlove.weaxi.cn 服务器运维说明

## 部署信息

- 公网地址：`https://seniorlove.weaxi.cn`
- 服务器代码：`/opt/tangshe`
- 生产编排：`compose.server.yaml`
- Compose 项目名：`tangshe`
- 代理网络：复用现有 Docker 网络 `deploy_app`
- 代理配置：`/opt/channel/deploy/nginx-tangshe.conf`
- 证书：`/etc/letsencrypt/live/seniorlove.weaxi.cn/`

生产环境使用独立的 PostgreSQL 容器、数据库 `tang_course_platform` 和用户
`tang_course_app`。数据库未发布宿主机端口；前后端端口仅绑定
`127.0.0.1:3000` 与 `127.0.0.1:3001`。

## 更新项目

```sh
cd /opt/tangshe
git pull --ff-only
./deploy/deploy.sh
curl -f https://seniorlove.weaxi.cn/home
curl -f https://seniorlove.weaxi.cn/api/activities
```

## 查看状态和日志

```sh
cd /opt/tangshe
docker compose -f compose.server.yaml ps
docker compose -f compose.server.yaml logs --tail=100 backend frontend database
docker stats --no-stream tangshe-database-1 tangshe-backend-1 tangshe-frontend-1
```

## 密钥和初始账号

- 生产数据库和 JWT 密钥：`/opt/tangshe/.env`，权限应为 `600`。
- 初始模拟账号清单：`/opt/tangshe/initial-credentials.txt`，权限应为 `600`。
- 两个文件均已加入 `.gitignore`，禁止提交或复制到公开位置。

## 数据库备份

手动备份：

```sh
cd /opt/tangshe
./deploy/backup-database.sh
```

服务器通过 `/etc/cron.d/tangshe-backup` 每天 03:30 自动备份，并保留 14 天。
备份目录为 `/opt/tangshe/backups/`。

恢复前应先停止写入并再次创建即时备份：

```sh
cd /opt/tangshe
docker compose -f compose.server.yaml exec -T database pg_restore \
  -U tang_course_app -d tang_course_platform --clean --if-exists \
  < backups/需要恢复的文件.dump
```

## HTTPS 续期

`/etc/cron.d/certbot-renew` 每日检查证书续期。成功续期后，
`/etc/letsencrypt/renewal-hooks/deploy/tangshe-nginx.sh` 会复制新证书、检查并重载
Nginx。模拟续期检查命令：

```sh
certbot renew --cert-name seniorlove.weaxi.cn --dry-run --no-random-sleep-on-renew
```

## 反向代理与回滚

现有 `deploy-web-1` Nginx 容器同时服务其他域名。新站点通过
`/opt/channel/deploy/docker-compose.yml` 中的单文件挂载接入。部署前的代理编排
备份为：

`/opt/channel/deploy/docker-compose.yml.bak.tangshe-20260916014724`

如需撤下本项目，应先从代理编排中移除 `nginx-tangshe.conf` 挂载并重建 `web`
服务，再在 `/opt/tangshe` 执行：

```sh
docker compose -f compose.server.yaml down
```

除非明确决定永久删除数据，不要附加 `--volumes`。
