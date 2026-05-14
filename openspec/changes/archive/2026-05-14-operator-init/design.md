## 整体技术架构

本变更将操作员标注模块重建为一个前端优先的纵向功能切片：先使用 mock 数据完成 UI 还原和交互验收，再将数据源切换为 FastAPI 后端契约。

- 前端技术栈：Vite、React、TypeScript、React Router、Ant Design 6.x、项目已有 Tailwind 工具类，以及 `frontend/src/styles/globals.css` 中的 CSS 变量。
- 前端结构：
  - `frontend/src/pages/operator/`：操作员路由页面与页面级组合。
  - `frontend/src/pages/operator/components/`：工作台、计划列表、表单、内容面板、状态视图、只读质控规则上下文等组件。
  - `frontend/src/api/operator.ts`：操作员 API 封装。
  - `frontend/src/types/operator.ts`：操作员计划、任务、规则上下文、标注请求、标注响应类型。
  - `frontend/src/mocks/operator.ts`：后端接入前使用的 mock 数据、mock 任务队列和本地提交流。
- 后端技术栈：FastAPI、Pydantic v2、SQLAlchemy、SQLite、现有 token 依赖与角色守卫。
- 后端结构：
  - `backend/app/routers/operator_plans.py`：负责计划列表与计划进度。
  - `backend/app/routers/operator_tasks.py`：下一条任务获取与标注提交。
  - `backend/app/schemas/operator.py` 或按任务模块拆分的 schema：请求/响应契约。
  - `backend/app/repositories/operator.py`：负责计划、任务、质控规则、标注持久化查询。
  - `backend/app/services/operator_tasks.py`：权限检查、队列选择、校验归一化、重复提交处理。
- 数据依赖：
  - 读取 `users`、`plans`、`case_records`、`quality_rules`。
  - 写入 `annotations`。
  - 复用 `display_a_source` 与 `display_b_source` 作为持久化的 A/B 展示映射。
- 实施规则：可以阅读现有操作员模块文件以理解项目约定，但其行为 MUST NOT 作为本次重建设计的事实来源。

## 前端路由规划（React Router）

- `/operator`
  - 已登录操作员重定向到 `/operator/plans`。
- `/operator/plans`
  - 页面：操作员负责计划入口。
  - Pencil 来源：`design/pages/operator.pen`。
  - 页面状态：加载中、存在负责计划、无负责计划、加载失败、活跃计划可进入、关闭计划按钮置灰显示“已关闭”。
- `/operator/plans/:planId/annotate`
  - 页面：操作员标注工作台。
  - Pencil 来源：`design/pages/operator.pen`。
  - 页面状态：任务加载中、任务已加载、表单校验错误、提交中、提交成功切换、可重试错误、无权限/非负责人、计划已关闭、计划已完成。
- 路由保护：
  - `ProtectedRoute` 对所有 `/operator/*` 路由 SHALL 接受 `role="operator"`。
  - 管理员 SHALL NOT 进入操作员路由。
  - 缺失或无效 session SHALL 重定向到 `/login`。
- mock 阶段行为：
  - 操作员路由 SHALL 可以在不启动后端的情况下通过 `frontend/src/mocks/operator.ts` 完成页面还原。
  - mock 数据 SHALL 覆盖：有待标注病例的活跃计划、已完成活跃计划、关闭计划、无负责计划、临时错误模拟。
  - mock 提交流程 SHALL 从待标注队列移除已提交任务，并为下一条病例重置表单状态。

## 后端模块划分（FastAPI Router）

- `GET /api/operator/plans`
  - Router：`backend/app/routers/operator_plans.py`。
  - 鉴权：仅活跃操作员。
  - 响应：负责计划列表与进度计数。
  - 错误：`401 AUTH_UNAUTHORIZED`、`403 FORBIDDEN`。
- `GET /api/operator/plans/{plan_id}/tasks/next`
  - Router：`backend/app/routers/operator_plans.py`。
  - 鉴权：仅活跃操作员。
  - 响应：下一条任务 payload 或 `null`。
  - 错误：`403 PLAN_NOT_ASSIGNED_TO_OPERATOR`、`404 PLAN_NOT_FOUND`、`409 PLAN_CLOSED`。
- `POST /api/operator/tasks/{case_id}/annotate`
  - Router：`backend/app/routers/operator_tasks.py`。
  - 鉴权：仅活跃操作员。
  - 请求：结论、原因编码、可选其他原因文本、可选备注。
  - 响应：已持久化的标注结果。
  - 错误：`422` FastAPI 默认请求体校验错误（缺少或非法的 `decision` / `reason_codes`）、`400 VALIDATION_ERROR`（选择 `OTHER` 但缺少 `other_reason_text`）、`403 PLAN_NOT_ASSIGNED_TO_OPERATOR`、`404 CASE_NOT_FOUND`、`409 PLAN_CLOSED`、`409 ANNOTATION_ALREADY_EXISTS`。
- 后端共享职责：
  - 角色校验保留在依赖层。
  - 操作员负责人归属校验放在 service 层。
  - 数据库完整性和重复提交保护依赖 `UNIQUE(case_id, operator_user_id)` 与显式冲突处理。
  - 当未选择 `OTHER` 时，校验逻辑必须将 `other_reason_text` 归一化为 `null`。

## 数据库 Schema 概要

本次重建主要使用 `openspec/specs/SPEC.md` 中既有表。

- `users`
  - 用途：识别当前操作员与角色。
  - 必要字段：`id`、`username`、`role`、`is_active`。
- `plans`
  - 用途：计划分配与计划状态。
  - 必要字段：`id`、`name`、`description`、`owner_user_id`、`status`、`created_at`、`updated_at`。
  - 操作员可见状态：`active`、`closed`。
- `case_records`
  - 用途：任务内容与 A/B 展示映射。
  - 必要字段：`id`、`plan_id`、`hospitalization_no`、`record_text`、`agent_a_output`、`agent_b_output`、`display_a_source`、`display_b_source`、`created_at`。
  - 任务 API 根据持久化 source 映射输出 `output_a` 和 `output_b`。
- `annotations`
  - 用途：保存操作员提交的标注结果。
  - 必要字段：`id`、`plan_id`、`case_id`、`operator_user_id`、`decision`、`reason_codes`、`other_reason_text`、`notes`、`created_at`、`updated_at`。
  - 必要唯一约束：`UNIQUE(case_id, operator_user_id)`。
  - 建议索引：`(plan_id, created_at)`、`(operator_user_id, decision)`；如果唯一约束未覆盖查询路径，可补充 `(case_id, operator_user_id)`。
- `quality_rules`
  - 用途：作为任务 payload 中的只读规则上下文。
  - 必要字段：`id`、`category`、`content`、`score`、`deleted_at`。
  - 任务 payload SHALL 排除软删除规则。

除非实现过程中确认缺少必要索引或字段，否则不要求新增数据库迁移。任何新增列或索引都必须写入实现任务，并由后端测试覆盖。

## Pencil 设计文件规划

- `design/pages/operator.pen`
  - 该文件承载操作员模块的所有页面设计，通过不同画板区分不同页面与状态。
  - 计划列表页必要画板/状态：
    - 至少包含一个活跃计划和一个关闭计划的负责计划列表。
    - 关闭计划在列表页按钮置灰，按钮文本直接显示“已关闭”，用户无法进入标注面板。
    - 无负责计划状态。
    - 加载中状态。
    - 错误状态。
  - 标注工作台必要画板/状态：
    - 任务已加载：三栏结构，最左侧为病历原文，中间为输出 A，右侧为输出 B。
    - 左侧病历原文栏 title 区展示住院号，以及一个“查看质控规则”的文字按钮。
    - 点击“查看质控规则”后，在按钮右侧展示 popover；popover MUST NOT 遮挡左侧病历原文。
    - popover 面板展示质控规则列表，并支持按文书类型切换查看对应分类。
    - 表单校验错误：缺少结论、缺少原因、缺少其他原因文本。
    - 提交中状态。
    - 计划已完成状态。
    - 任务加载错误或无权限/计划关闭状态。
  - 前端实现任务 MUST 在编码前阅读 `operator.pen` 的所有画板，并将每个画板映射到 React 页面状态。
- 支撑设计引用：
  - `design/components/layout.lib.pen`
  - `design/components/navigation.lib.pen`
  - `design/components/data-display.lib.pen`
  - `design/components/data-entry.lib.pen`
  - `design/components/feedback.lib.pen`
  - `design/tokens.lib.pen`
- 设计 token 来源：
  - CSS token 实现仍为 `frontend/src/styles/globals.css`。
  - 前端代码 MUST 使用既有 token 变量，SHOULD NOT 对已有 token 覆盖的颜色或间距进行硬编码。

## API Payload 草案

```ts
type OperatorPlanSummary = {
  id: number
  name: string
  description: string | null
  status: 'active' | 'closed'
  total_cases: number
  annotated_cases: number
  pending_cases: number
  completion_rate: number
}

type OperatorTask = {
  case_id: number
  plan_id: number
  hospitalization_no: string
  record_text: string
  output_a: string
  output_b: string
  display_mapping: {
    A: 'agent_a' | 'agent_b'
    B: 'agent_a' | 'agent_b'
  }
  quality_rules: Array<{
    id: number
    category: string
    content: string
    score: string
  }>
}

type AnnotationSubmitRequest = {
  decision: 'A_BETTER' | 'B_BETTER' | 'BOTH_BAD' | 'BOTH_GOOD'
  reason_codes: Array<'NO_HIT_ERROR_RULE' | 'NO_MISSING_RULE' | 'NO_OVER_QC' | 'OTHER'>
  other_reason_text?: string | null
  notes?: string | null
}
```
