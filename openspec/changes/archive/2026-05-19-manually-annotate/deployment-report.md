# 手动标注模式部署验收记录

## 验收时间

- 2026-05-19

## 验收范围

- OpenSpec artifacts 有效性校验。
- 后端测试、前端契约测试、前端生产构建和后端语法编译。
- 本地生产形态冒烟：登录、手动计划创建、CSV 导入、操作员手动标注、管理员统计、病例级聚合明细和单病例详情。
- 前端生产 `dist` 静态服务可访问性。

## 执行结果

| 项目 | 命令/方式 | 结果 |
|---|---|---|
| OpenSpec 校验 | `openspec validate manually-annotate` | 通过 |
| 后端测试 | `/Users/zhaochengwang/anaconda3/envs/aicompare/bin/python -m pytest tests/backend backend/tests -q` | 14 passed |
| 前端测试 | `cd frontend && npm run test` | 14 passed |
| 前端生产构建 | `cd frontend && npm run build` | 通过，保留 Vite chunk size 警告 |
| 后端语法编译 | `/Users/zhaochengwang/anaconda3/envs/aicompare/bin/python -m compileall -q backend/app` | 通过 |
| 后端本地启动 | `SQLITE_PATH=/tmp/aicompare-deployment-smoke.db SECRET_KEY=deployment-smoke-secret uvicorn app.main:app --host 127.0.0.1 --port 8011` | 通过 |
| 前端 dist 预览 | `cd frontend && npm run preview -- --host 127.0.0.1 --port 4174` | `/login` 可访问 |
| Docker Compose 构建 | `SECRET_KEY=deployment-smoke-secret AICOMPARE_HOST_PORT=2667 docker compose -f docker/docker-compose.prod.yml -p aicompare-manual-smoke build` | 通过 |
| Docker Compose 生产冒烟 | `SECRET_KEY=deployment-smoke-secret AICOMPARE_HOST_PORT=2667 docker compose -f docker/docker-compose.prod.yml -p aicompare-manual-smoke up -d` | `/api/health` 与手动模式 API 冒烟通过 |

## 手动模式冒烟结果

- `GET /api/health` 返回 `{"status":"ok"}`。
- `admin / admin` 与 `czy / czy` 登录成功。
- 管理员创建 `manual` 计划并上传两列 CSV 成功。
- 操作员计划列表返回 `annotation_type=manual`。
- 手动任务 payload 不返回 A/B 输出和展示映射。
- `has_issues` 提交成功，并保存富文本片段中的可见文本、offset、规则快照、修改建议和备注。
- 同病例重复提交返回 `409 ANNOTATION_ALREADY_EXISTS`。
- `no_issue` 提交成功并推进计划完成。
- 管理员手动统计返回 `annotated_cases=2`、`pending_cases=0`、`has_issues_cases=1`、`no_issue_cases=1`。
- 管理员病例级聚合明细返回 2 行，不展示原文片段、规则、修改建议或 offset。
- 管理员单病例详情返回问题条目，可用于只读工作台高亮和列表视图展示。

## Docker 镜像构建记录

- 已确认 Docker CLI 与 daemon 可用。
- 已执行 `SECRET_KEY=deployment-smoke-secret AICOMPARE_HOST_PORT=2667 docker compose -f docker/docker-compose.prod.yml -p aicompare-manual-smoke build`，成功构建 `aicompare-manual-smoke-backend` 与 `aicompare-manual-smoke-nginx` 镜像。
- 已使用 `AICOMPARE_HOST_PORT=2667` 启动隔离 Docker Compose 环境，`GET /api/health` 返回 `{"status":"ok"}`。
- 已在 Docker Compose 环境完成手动模式 API 冒烟：管理员登录、操作员登录、手动计划 CSV 导入、操作员手动任务获取、`has_issues` 提交、重复提交拒绝、`no_issue` 提交、管理员统计、病例级聚合明细和单病例详情均通过。
- 验收结束后已执行 `SECRET_KEY=deployment-smoke-secret AICOMPARE_HOST_PORT=2667 docker compose -f docker/docker-compose.prod.yml -p aicompare-manual-smoke down -v` 清理临时容器、网络和数据卷。

## 剩余风险

- 前端自动化仍为契约级测试，未接入浏览器 E2E 或视觉回归。
- 手动模式首期不支持提交后编辑、重提、导出、打印或复杂统计。
