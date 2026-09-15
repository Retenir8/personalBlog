# 唐社长者学院部署仓库

当前生产服务器的实际运维信息见 [`SERVER-DEPLOYMENT.md`](SERVER-DEPLOYMENT.md)。

本仓库包含：

- `frontend/`：Next.js 前端，使用 standalone 生产镜像。
- `backend/`：Spring Boot 后端，使用 Java 21 精简运行镜像。
- `compose.yaml`：前端、后端、PostgreSQL 三服务编排。
- `compose.server.yaml`：接入现有 `deploy_app` 代理网络的低资源生产编排。
- `deploy/`：部署、备份、模拟数据和 Nginx 模板。

## 快速部署

```sh
cp .env.production.example .env
# 编辑 .env，替换数据库密码和两个 JWT 密钥
chmod +x deploy/*.sh
./deploy/deploy.sh
```

服务只绑定服务器本机：

- 前端：`127.0.0.1:3000`
- 后端：`127.0.0.1:3001`
- PostgreSQL：不映射宿主机端口

请使用宿主机 Nginx 将域名 `/` 转发到前端，将 `/api/` 转发到后端。

目标服务器已有 `deploy_app` 反向代理网络时，请在 `.env` 中保留
`COMPOSE_FILE=compose.server.yaml`。该编排只把 3000/3001 绑定到服务器回环地址，
数据库完全不发布端口；现有 Nginx 可通过 `tangshe-frontend` 与
`tangshe-backend` 网络别名访问服务。HTTP/HTTPS 配置位于
`deploy/nginx-tangshe.*.conf`。

## 创建真实姓名风格的模拟数据

```sh
./deploy/seed-realistic-users.sh
```

脚本会随机生成每个账号的独立密码，并写入仅服务器可读的 `initial-credentials.txt`。该文件已被 Git 忽略，不得提交。

## 备份数据库

```sh
./deploy/backup-database.sh
```

建议通过 cron 每天执行，并把备份同步到服务器以外的位置。
