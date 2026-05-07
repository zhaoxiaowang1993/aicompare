## Context

本变更面向病历质控标注系统 0→1 首期建设，范围限定为 `SPEC.md` 的 3.1、3.2、3.3、3.5：认证登录、管理员计划管理、CSV 导入与数据清洗、统计与明细。当前仓库已约定前后端技术栈与目录规范，但尚无围绕该范围的可执行设计与模块边界文档。

关键约束：

- 后端采用 FastAPI + Pydantic v2 + SQLite，接口统一前缀 `/api`。
- 前端采用 React + TypeScript + React Router + Ant Design，API 通过 `frontend/src/lib/api.ts` 统一封装。
- 鉴权采用 Bearer access token + refresh token。
- 设计稿通过 Pencil `.pen` 管理，需与页面路由一一对应。
- 本次不引入 3.4/3.6/3.7 的新增能力，仅与其存在最小依赖（如统计依赖 Annotation 数据）。

## Goals / Non-Goals

**Goals:**

- 明确前后端分层架构与模块边界，保证管理员计划管理主链路可独立落地。
- 定义前端路由结构，覆盖登录、计划列表、计划详情（导入+统计+明细）页面。
- 定义后端 Router 与 Service 的职责切分，覆盖认证、计划、导入、统计四大能力。
- 固化数据库实体与关键约束，确保与 API 契约和统计口径一致。
- 规划 Pencil 设计文件与页面映射，支撑 UI 设计与实现联动。

**Non-Goals:**

- 不包含操作员标注提交端到端实现（3.4），仅保留被管理员统计读取的数据依赖。
- 不包含成员管理（3.6）与规则管理（3.7）新增接口与页面。
- 不引入多租户、复杂 RBAC、导出报表、审计日志等扩展能力。

## Decisions

### 1) 整体技术架构

决策：采用「前端 BFF-free 直连后端 API + 后端 Router/Service/Repository 分层 + SQLite 单库」架构。

- 前端
  - `pages` 负责页面编排。
  - `components` 负责复用 UI（列表筛选、统计卡片、导入结果面板等）。
  - `lib/api.ts` 负责请求、鉴权头注入、401 自动刷新重试。
  - `types/*.ts` 对齐后端 DTO。
- 后端
  - `routers/*.py` 仅处理请求校验、鉴权、HTTP 错误码映射。
  - `services/*.py` 承载业务规则（状态机、导入校验、统计口径）。
  - `repositories/*.py` 负责 SQLAlchemy/SQLModel 数据访问。
- 数据层
  - SQLite 存储核心业务数据。
  - 统计优先在线聚合查询（首期体量可控），避免引入预计算任务。

选型理由：满足 0→1 快速闭环与可维护性，在不引入额外基础设施的前提下保证模块清晰。

备选方案：

- 前端引入全局复杂状态库（如 Redux）被否决；当前页面复杂度可由 React Query + 组件状态满足。
- 后端合并为单文件路由被否决；会导致计划/导入/统计规则耦合，后续扩展困难。

### 2) 前端路由规划（React Router）

决策：按角色与布局拆分路由层级，管理员路由统一挂载在 `/admin` 下。

- 公共路由
  - `/login`：登录页。
- 受保护路由（需登录）
  - `/admin/plans`：计划列表页（筛选、分页、新建计划）。
  - `/admin/plans/:id`：计划详情页（计划信息、CSV 导入、统计与明细）。
- 路由守卫
  - 未登录访问受保护路由：跳转 `/login`。
  - 非 admin 访问 `/admin/`*：展示 403 页面或重定向。
  - access token 过期时触发 refresh，刷新失败则清理会话并跳转 `/login`。

关键页面组件拆分：

- `PlanListPage`：筛选区、表格区、创建计划弹窗。
- `PlanDetailPage`：基础信息卡、导入卡、统计卡、明细表。
- `ImportCsvPanel`：文件选择、上传进度、导入结果摘要与错误行展示。
- `StatsPanel`：总量/完成率与 decision/reason 分布图表。

### 3) 后端模块划分（FastAPI Router）

决策：按能力拆分 4 个核心 router，并由 service 封装业务规则。

- `backend/app/routers/auth.py`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
- `backend/app/routers/admin_plans.py`
  - `POST /api/admin/plans`
  - `GET /api/admin/plans`
  - `GET /api/admin/plans/{plan_id}`
  - `PATCH /api/admin/plans/{plan_id}`
- `backend/app/routers/admin_import.py`
  - `POST /api/admin/plans/{plan_id}/import-csv`
- `backend/app/routers/admin_reports.py`
  - `GET /api/admin/plans/{plan_id}/stats`
  - `GET /api/admin/plans/{plan_id}/annotations`

对应 service：

- `AuthService`：密码校验、token 签发/刷新、refresh token 失效策略。
- `PlanService`：负责人合法性校验、状态流转校验（draft→active→closed）、计划详情读取。
- `CsvImportService`：模板校验、清洗、重复检测、A/B 映射固化、导入结果汇总。
- `ReportService`：统计聚合、明细过滤分页、统计-明细口径一致性。

鉴权决策：

- 统一依赖 `get_current_user` + `require_role("admin")`。
- 未认证返回 `401`，角色不匹配返回 `403`。

### 4) 数据库 Schema 概要

决策：沿用 `SPEC.md` 数据模型，不新增跨域实体，仅补充必要索引与约束落地建议。

- 核心表
  - `users`：账号、角色、激活状态。
  - `plans`：计划信息、负责人、状态。
  - `case_records`：CSV 入库样本与固定 A/B 展示映射。
  - `annotations`：标注结果（用于统计/明细读取）。
  - `refresh_tokens`：refresh token 哈希与有效期。
- 关键约束
  - `UNIQUE(plans.name)` 不强制；同名可由业务决定是否允许（首期按 SPEC 不设强唯一）。
  - `UNIQUE(case_records.plan_id, case_records.hospitalization_no)` 保证同计划住院号去重。
  - `UNIQUE(annotations.case_id, annotations.operator_user_id)` 防重复提交。
  - `plans.owner_user_id` 必须指向 `users.role=operator` 且 `is_active=true`（业务校验）。
- 索引建议
  - `case_records(plan_id)`、`annotations(plan_id, created_at)`、`annotations(operator_user_id, decision)`。

CSV 清洗与映射落库规则：

- 仅接受四列：`住院号`、`病历内容`、`智能体A输出`、`智能体B输出`。
- 文本清洗后写入 `record_text/agent_a_output/agent_b_output`。
- 每条成功样本生成并固化 `display_a_source` 与 `display_b_source`，刷新后不变。
- 导入错误 `errors` 响应暂不限制条数，由调用端按需分页展示或截断渲染。

计划状态与编辑规则：

- `closed` 状态下仍允许管理员编辑 `name/description`。
- `closed` 状态下仍禁止导入新样本与操作员继续提交标注。

统计时间口径：

- `start_date/end_date` 过滤按本地时区（`Asia/Shanghai`）解释并计算。

### 5) Pencil 设计文件规划

决策：按页面与场景拆分 `.pen` 文件，避免单文件过大并便于评审。

- `design/auth-login.pen`
  - 对应页面：`/login`
  - 内容：账号密码表单、错误提示、加载态。
- `design/admin-plan-list.pen`
  - 对应页面：`/admin/plans`
  - 内容：筛选栏、计划表格、新建计划弹窗、状态标签。
- `design/admin-plan-detail.pen`
  - 对应页面：`/admin/plans/:id`
  - 内容：计划信息卡、CSV 导入面板、导入反馈面板。
- `design/admin-plan-report.pen`
  - 对应页面：`/admin/plans/:id`（统计与明细分区）
  - 内容：统计总览卡、决策分布、原因分布、明细筛选与表格。
- 共享设计系统
  - `design/design-system.lib.pen`：按钮、输入、表格、标签、卡片等复用组件。
- 设计系统 Token 同步文件：frontend/src/styles/globals.css
- Design Tokens
  - 主色：#1677ff（Ant Design 默认）
  - 圆角：6px（radius-md）
  - 字体：-apple-system（系统字体）

## Risks / Trade-offs

- [Risk] 统计与明细口径不一致（聚合 SQL 与列表过滤条件不一致） → Mitigation：复用同一过滤构造器，增加“明细复算统计”集成测试。
- [Risk] CSV 清洗策略过严导致高失败率 → Mitigation：保留逐行错误摘要，支持失败原因可视化反馈，先实现可配置最小清洗规则。
- [Risk] token 自动刷新引发并发重放请求 → Mitigation：前端实现单飞刷新队列（同一时刻仅一次 refresh）。
- [Risk] SQLite 在大分页场景性能波动 → Mitigation：首期限定 page_size，上线前加索引并进行基线压测。
- [Trade-off] 首期采用在线聚合而非物化统计 → 换取实现速度，后续在数据量增长后再引入离线汇总。

## Migration Plan

1. 数据库迁移：创建/校验 `users/plans/case_records/annotations/refresh_tokens` 表与约束索引。
2. 后端发布：先上线认证与计划管理，再上线导入接口，最后上线统计明细接口。
3. 前端发布：先交付登录与计划列表，再交付计划详情中的导入与统计区域。
4. 联调验收：按 `SPEC.md` 5.1/5.2/5.3/5.5 契约逐接口验收，并校验权限矩阵 401/403 行为。
5. 回滚策略：
  - 应用层回滚到上一个镜像版本；
  - 新增表保留（向前兼容），必要时仅停用新路由入口；
  - 导入批次通过 `import_batch_id` 可追踪与人工处置。

## Open Questions

- 当前无阻塞性开放问题。

## UI / API / 数据字段映射

### 登录页 `/login`

| UI 字段 | API 字段 | 数据表字段 |
|---|---|---|
| 用户名 | `POST /api/auth/login.username` | `users.username` |
| 密码 | `POST /api/auth/login.password` | `users.password_hash`（校验用，不回传） |
| 登录错误 | `detail=AUTH_INVALID_CREDENTIALS` | 无 |
| 当前用户角色 | `user.role`、`GET /api/auth/me.role` | `users.role` |

### 计划列表页 `/admin/plans`

| UI 字段 | API 字段 | 数据表字段 |
|---|---|---|
| 计划名称 | `items[].name` | `plans.name` |
| 计划说明 | `items[].description` | `plans.description` |
| 负责人 | `items[].owner_user_id`、`items[].owner_username` | `plans.owner_user_id` → `users.id/users.username` |
| 状态 | `items[].status` | `plans.status` |
| 样本数 | `items[].total_cases` | `COUNT(case_records.id)` |
| 已标注 | `items[].annotated_cases` | `COUNT(DISTINCT annotations.case_id)` |
| 分页 | `page/page_size/total` | 查询参数与聚合结果 |

### 计划详情页 `/admin/plans/:id`

| UI 字段 | API 字段 | 数据表字段 |
|---|---|---|
| 基础信息 | `GET /api/admin/plans/{plan_id}` | `plans.*` |
| 待标注 | `pending_cases` | `total_cases - annotated_cases` |
| 完成率 | `completion_rate` | `annotated_cases / total_cases` |
| CSV 导入摘要 | `total_rows/success_rows/skipped_rows/failed_rows/import_batch_id/errors` | `case_records.import_batch_id` 与导入处理结果 |
| 决策分布 | `decision_distribution` | `annotations.decision` |
| 原因分布 | `reason_distribution` | `annotations.reason_codes` |
| 标注明细 | `items[]` from `/annotations` | `annotations` JOIN `case_records/users` |
| 日期范围筛选 | `start_date/end_date` | `annotations.created_at`，按 `Asia/Shanghai` 日期边界解释 |

### `GET /api/admin/plans/{plan_id}` 响应结构确认

本次新增详情接口返回 `PlanDetail`，用于计划详情基础信息区和统计入口：

```json
{
  "id": 1,
  "name": "病历质控对比评审",
  "description": "首期评审计划",
  "owner_user_id": 2,
  "owner_username": "czy",
  "status": "active",
  "total_cases": 180,
  "annotated_cases": 120,
  "pending_cases": 60,
  "completion_rate": 0.6667,
  "created_at": "2026-05-06T08:00:00",
  "updated_at": "2026-05-06T09:00:00"
}
```

状态不存在时返回 `404 PLAN_NOT_FOUND`；鉴权缺失返回 `401 AUTH_UNAUTHORIZED`；非 admin 返回 `403 FORBIDDEN`。
