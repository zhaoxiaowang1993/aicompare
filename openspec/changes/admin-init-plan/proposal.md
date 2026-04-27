## Why

当前项目只有总规范 `openspec/specs/SPEC.md`，尚未形成可执行的 change artifacts，导致管理员计划管理相关功能无法按 OpenSpec 工作流分解实现与验收。需要先把认证、计划管理、CSV 导入清洗、统计明细这四块首期范围固化为变更能力边界，支撑后续设计、实现与联调。

## What Changes

- 为管理员计划管理首期能力建立完整的 change artifacts 起点，范围严格限定在 `SPEC.md` 的 3.1、3.2、3.3、3.5。
- 明确认证闭环：登录、token 刷新、当前用户信息查询，以及 401/403 边界行为。
- 明确管理员计划管理闭环：计划创建、列表查询、状态流转（`draft`/`active`/`closed`）与负责人约束。
- 明确 CSV 导入与清洗闭环：模板校验、重复跳过、入库口径、固定 A/B 映射持久化、导入结果统计返回。
- 明确管理员统计与标注明细闭环：计划级统计口径、决策与原因分布、明细过滤与分页。
- 不引入本次范围外能力：不包含 3.4 标注执行、3.6 成员管理、3.7 规则管理的新需求扩展。

## Capabilities

### New Capabilities
- `auth-login`: 认证登录与 token 刷新能力，覆盖登录、刷新、当前用户信息与鉴权/鉴权失败行为。
- `admin-plan-management`: 管理员计划管理能力，覆盖计划创建、列表查询、计划编辑与状态流转约束。
- `admin-csv-import-cleaning`: 管理员 CSV 导入与数据清洗能力，覆盖模板校验、清洗入库、重复处理与导入结果摘要。
- `admin-results-reporting`: 管理员统计与标注明细能力，覆盖计划统计、分布统计、明细查询与过滤分页。

### Modified Capabilities
- 无。

## Impact

- Specs: 新增本 change 下上述四个 capability 的规范文档，并使用 MUST/SHALL + Given/When/Then 场景。
- Backend: 影响 `backend/app/routers/` 下认证、管理员计划、导入、统计相关路由与服务编排；涉及 `User`、`Plan`、`CaseRecord`、`Annotation`、`RefreshToken` 表。
- Frontend: 影响管理员计划列表/详情、导入反馈、统计明细页面与认证状态管理；涉及 `frontend/src/lib/api.ts` 与模块类型定义。
- API: 以 `SPEC.md` 第 5 章契约为准，重点覆盖 `/auth/*`、`/admin/plans*`、`/admin/plans/{id}/import-csv`、`/admin/plans/{id}/stats|annotations`。
- Deployment & Ops: 不新增外部依赖，维持 FastAPI + SQLite + Docker Compose 约束。
