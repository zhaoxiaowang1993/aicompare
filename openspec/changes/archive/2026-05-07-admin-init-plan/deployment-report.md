## 发布与部署报告

### 部署策略

- 生产入口：`http://47.93.150.173`
- 应用端口：Docker Compose 仅绑定宿主机 `127.0.0.1:2657`
- 反向代理：宿主机 Nginx 新增独立 `server_name 47.93.150.173` 配置，代理到 `http://127.0.0.1:2657`
- 现有项目隔离：不修改 `wenshuyisheng.cn` 的既有 Nginx 配置
- 触发方式：仅 `main` 分支 push 或手动 `workflow_dispatch` 触发 GitHub Actions

### 配置项

- `SECRET_KEY`：由 GitHub Secret `PROD_SECRET_KEY` 写入服务器 `.env`
- `ACCESS_TOKEN_EXPIRE_MINUTES=60`
- `REFRESH_TOKEN_EXPIRE_DAYS=7`
- `APP_TIMEZONE=Asia/Shanghai`
- `SQLITE_PATH=/app/data/aicompare.db`
- `AICOMPARE_HOST_PORT=2657`

### Docker 验证

- Compose 已调整为 `context: ..`，确保从 `docker/docker-compose.prod.yml` 构建时能读取仓库根目录。
- 前端构建阶段使用 `npm ci`，与 `package-lock.json` 锁定依赖一致。
- SQLite 数据使用 Docker named volume `aicompare_sqlite-data` 持久化，应用容器重建不删除数据。
- 后端容器增加 `/api/health` healthcheck。

### 数据库迁移与回滚

- 首期采用启动期 `Base.metadata.create_all()` 创建缺失表和索引。
- 本次变更不包含破坏性迁移，不删除生产数据表或字段。
- 回滚以应用版本回滚为主，SQLite volume 保留；必要时可临时停用 IP server block，使公网 IP 入口下线且不影响同机其他站点。

### 发布检查清单

- GitHub Actions 执行 `python -m pytest`
- GitHub Actions 执行 `npm run build`
- GitHub Actions 执行 `npm run lint`
- 部署后执行 `curl -fsS http://47.93.150.173/api/health`
- 人工检查 `/login` 与 `/admin/plans` 关键页面

### 已知限制

- 首期不包含 3.4 操作员标注执行能力扩展。
- 首期成员管理、质控规则管理只保留入口占位，不交付 3.6、3.7 新增业务页面。
- 当前前端自动化覆盖静态流程契约、build、lint；真实浏览器 E2E 与视觉回归基线仍需后续引入。
