# 病例质控标注系统部署说明

## 生产部署策略

- 触发条件：代码合并并推送到 `main` 分支后触发 GitHub Actions。
- 运行方式：服务器上使用 Docker Compose 启动前端 Nginx 容器与 FastAPI 后端容器。
- 访问入口：用户访问 `http://47.93.150.173`。
- 端口隔离：AICompare 容器只绑定宿主机 `127.0.0.1:2657`，由宿主机 Nginx 的独立 IP server block 代理。
- 现有项目隔离：仅新增 `/etc/nginx/conf.d/aicompare-ip.conf`，不修改 `wenshuyisheng.cn` 的既有 Nginx 配置。
- 服务器依赖：Docker、Docker Compose、Nginx、rsync；部署用户需要能执行 `sudo nginx -t` 与 `sudo systemctl reload nginx`。

## GitHub Secrets

| Secret | 用途 |
|---|---|
| `DEPLOY_HOST` | 服务器公网 IP，当前为 `47.93.150.173` |
| `DEPLOY_USER` | SSH 登录用户 |
| `DEPLOY_SSH_KEY` | 可登录服务器的私钥 |
| `DEPLOY_SSH_PORT` | SSH 端口，可省略，默认 `22` |
| `DEPLOY_PATH` | 服务器部署目录，例如 `/opt/aicompare` |
| `PROD_SECRET_KEY` | 生产 JWT 签名密钥 |

## 生产环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `SECRET_KEY` | 必填 | JWT 签名密钥，来自 `PROD_SECRET_KEY` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | access token 过期分钟数 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | refresh token 过期天数 |
| `APP_TIMEZONE` | `Asia/Shanghai` | 日期过滤与展示的业务时区 |
| `SQLITE_PATH` | `/app/data/aicompare.db` | 容器内 SQLite 数据库路径 |
| `AICOMPARE_HOST_PORT` | `2657` | 宿主机本机监听端口 |

## 数据库与迁移

首期使用 SQLAlchemy `Base.metadata.create_all()` 在应用启动时创建缺失表和索引，SQLite 文件存放在 Docker named volume `aicompare_sqlite-data` 中，应用镜像升级不会删除数据。

回滚策略：

1. 应用回滚：在服务器部署目录执行 `docker compose -f docker/docker-compose.prod.yml --env-file .env up -d --build`，切回上一个已验证提交对应的代码。
2. 数据兼容：首期迁移仅创建表和索引，不执行破坏性字段删除；新增表保留。
3. 入口回滚：如需临时下线，仅停用 `/etc/nginx/conf.d/aicompare-ip.conf` 并 reload Nginx，不影响 `wenshuyisheng.cn`。

## 发布检查

发布后检查：

```bash
curl -fsS http://47.93.150.173/api/health
```

关键页面：

- `http://47.93.150.173/login`
- `http://47.93.150.173/admin/plans`

已知限制：

- 首期不包含 3.4 操作员标注执行能力扩展。
- 首期成员管理和质控规则管理仅作为入口占位，不包含 3.6、3.7 的新增业务页面。
- 前端自动化仍以静态流程契约、build、lint 为主，尚未加入浏览器 E2E 与视觉回归基线。
