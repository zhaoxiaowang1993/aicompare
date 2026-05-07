# 测试与联调报告

日期：2026-05-07
变更：`admin-init-plan`

## 结论

第 5 组“测试与联调”已完成。后端 API 主链路、前端关键流程契约、统计一致性、`Asia/Shanghai` 日期边界均已纳入自动化验证。

本轮测试过程中发现并修复了一个后端 token 问题：同一秒内 refresh 可能生成与旧 refresh token 完全相同的 JWT，导致 `refresh_tokens.token_hash` 唯一约束冲突。已在 access/refresh token payload 中加入 `jti`，保证每次签发唯一。

## 执行命令与结果

| 命令 | 结果 | 说明 |
|---|---|---|
| `/Users/zhaochengwang/anaconda3/envs/aicompare/bin/python -m pytest` | 通过 | 6 passed，3 warnings |
| `/Users/zhaochengwang/anaconda3/envs/aicompare/bin/python -m compileall backend/app` | 通过 | 后端模块编译通过 |
| `npm run build` | 通过 | Vite 构建通过；存在 chunk size warning |
| `npm run lint` | 通过 | 0 errors，2 existing React hooks warnings |

## 自动化覆盖

### 后端 API 与业务规则

测试文件：`tests/backend/test_admin_init_plan_api.py`

覆盖范围：

- `/api/health` 健康检查。
- `/api/auth/login` 成功与失败。
- `/api/auth/refresh` 成功与无效 token 失败。
- `/api/auth/me` 当前用户读取与无效 Bearer token 的 `401 AUTH_UNAUTHORIZED`。
- operator 访问 `/api/admin/plans` 返回 `403 FORBIDDEN`。
- `POST /api/admin/plans` 不再创建草稿，返回 `400 PLAN_IMPORT_REQUIRED`。
- `POST /api/admin/plans/import-csv` 创建计划并导入 CSV。
- CSV 非法文件类型返回 `400 CSV_INVALID_TEMPLATE`。
- 无效负责人返回 `400 VALIDATION_ERROR`。
- CSV 成功、重复跳过、失败行的 `total_rows/success_rows/skipped_rows/failed_rows/errors/import_batch_id` 汇总。
- 计划列表、详情、404 `PLAN_NOT_FOUND`。
- active → closed，closed → active 状态切换。
- closed 计划允许编辑 `name/description`。
- closed 计划拒绝 owner 修改、CSV 导入、operator 标注写入。
- `/stats` 与 `/annotations` 在同一过滤范围下可复算一致。
- `Asia/Shanghai` 本地日期边界包含 `00:00:00` 到 `23:59:59`，排除前后相邻日期。

### 前端关键流程契约

测试文件：`tests/frontend/test_frontend_flow_contracts.py`

覆盖范围：

- `/login`、`/admin/plans`、`/admin/plans/:id` 路由存在。
- admin 路由使用 `ProtectedRoute role="admin"`。
- `frontend/src/lib/api.ts` 注入 Bearer token。
- 401 自动 refresh，refresh 失败回登录页。
- 登录页调用 `login(values.username, values.password)` 并展示账号密码错误提示。
- 计划创建使用 `createPlanWithImport`。
- 新建计划 CSV 上传 endpoint 为 `/admin/plans/import-csv`。
- 既有计划追加导入 endpoint 为 `/admin/plans/{planId}/import-csv`。
- 详情页接入 `/stats`、`/annotations`，并传递 `start_date/end_date`。
- 上传面板提供 CSV 模板下载，模板字段为 `住院号`、`病历内容`、`智能体A输出`、`智能体B输出`。
- 明细展示使用 `Asia/Shanghai` 时区格式化。

## 联调核对

| 核对项 | 结果 |
|---|---|
| 401 错误码 | 通过：无效 Bearer token 返回 `AUTH_UNAUTHORIZED`；登录失败返回 `AUTH_INVALID_CREDENTIALS` |
| 403 错误码 | 通过：operator 访问 admin endpoint 返回 `FORBIDDEN` |
| 404 错误码 | 通过：不存在计划返回 `PLAN_NOT_FOUND` |
| 409 错误码 | 通过：closed 计划导入/写入与非法 closed 编辑返回冲突类错误 |
| CSV 导入字段契约 | 通过：固定四列表头与导入汇总字段已验证 |
| 统计/明细一致性 | 通过：同过滤条件下明细复算结果等于 stats |
| 本地时区日期边界 | 通过：按 `Asia/Shanghai` 日期过滤 |

## 已知非阻塞项

- `npm run lint` 仍有 2 个既有 `react-hooks/exhaustive-deps` warnings：
  - `frontend/src/pages/admin/admin-plan-detail-page.tsx:61`
  - `frontend/src/pages/admin/admin-plans-page.tsx:86`
- `npm run build` 仍有 Vite chunk size warning，当前不影响功能验收。
- 前端自动化当前为静态流程契约测试 + build/lint，尚未引入浏览器 E2E runner。若后续需要覆盖真实点击与视觉回归，应新增 Playwright 或等价工具。
