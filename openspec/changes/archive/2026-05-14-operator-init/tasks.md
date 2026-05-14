## 任务

### 1. 设计（Pencil）

- [x] 1.1 阅读 `openspec/specs/SPEC.md` 以及本变更的 proposal、specs、design，再开始修改 Pencil 文件。
- [x] 1.2 打开 `design/pages/operator.pen` 并检查所有画板/状态；记录每个画板对应的路由状态。
- [x] 1.3 确认 `operator.pen` 中的计划列表页、标注工作台及其各状态画板均已覆盖。
- [x] 1.4 确认 `operator.pen` 使用 `design/components/*.lib.pen` 与 `design/tokens.lib.pen` 中的共享组件和 token。
- [x] 1.5 更新或补齐画板：负责计划列表、关闭计划按钮置灰显示“已关闭”、无计划、加载中、错误、三栏标注工作台、质控规则 popover、文书类型切换、校验错误、提交中、已完成、无权限、计划已关闭。
- [x] 1.6 导出或截图相关 Pencil 画板，用于前端还原验收。
- [x] 1.7 确认 Pencil 页面状态可以清晰映射到 `/operator/plans` 与 `/operator/plans/:planId/annotate`。

### 2. 前端代码（先使用 mock 数据）

- [x] 2.1 编码前阅读 `design/pages/operator.pen` 的所有画板；建立画板到 React 组件/状态的实现映射。
- [x] 2.2 创建 `frontend/src/types/operator.ts`，定义操作员计划摘要、任务 payload、结论枚举、原因枚举、提交请求和提交响应类型。
- [x] 2.3 创建 `frontend/src/mocks/operator.ts`，包含负责计划、mock 任务、质控规则上下文、已完成计划、无计划、关闭计划和错误模拟。
- [x] 2.4 创建 `frontend/src/api/operator.ts`，支持 mock/后端数据源切换，确保前端验收可在后端开发前完成。
- [x] 2.5 用基于 Pencil 状态的新 `/operator/plans` 页面替换现有操作员入口实现。
- [x] 2.6 用基于 Pencil 状态的新 `/operator/plans/:planId/annotate` 工作台替换现有标注页面实现。
- [x] 2.7 实现关闭计划在列表页按钮置灰并显示“已关闭”，且无法进入标注面板。
- [x] 2.8 实现三栏评审区域，最左侧为病历原文，中间为输出 A，右侧为输出 B；三栏支持独立滚动，并保持页面级操作控件可访问。
- [x] 2.9 在病历原文栏 title 区展示住院号和“查看质控规则”文字按钮。
- [x] 2.10 实现“查看质控规则”按钮右侧 popover，展示质控规则列表，且不遮挡左侧病历原文。
- [x] 2.11 实现 popover 内按文书类型切换规则分类。
- [x] 2.12 实现病历内容与 A/B 输出字段的 Markdown 与安全 HTML-like 内容渲染策略。
- [x] 2.13 实现结论、原因、其他原因文本、备注等标注表单控件。
- [x] 2.14 实现前端校验：缺少结论、缺少原因、选择 `OTHER` 但缺少其他原因文本。
- [x] 2.15 实现 mock 提交流程：提交后进入下一条任务或完成态，并重置表单状态。
- [x] 2.16 实现加载中、可重试错误、无权限/非负责人、计划已关闭和计划已完成状态。
- [x] 2.17 增加前端测试，覆盖操作员路由保护、负责计划渲染、关闭计划不可进入、工作台渲染、质控规则 popover、文书类型切换、表单校验、mock 提交推进和完成态。
- [x] 2.18 在 `frontend/` 下运行前端验证：`npm run lint` 与 `npm run build`。
- [x] 2.19 使用本地前端和 in-app browser 做视觉 QA；在后端开发前与导出的 Pencil 画板进行对照验收。

### 3. 后端代码（前端验收后进行）

- [x] 3.1 后端验证使用既有 conda 环境 `aicompare`；不要创建或使用项目 `venv`。
- [x] 3.2 新增或更新 Pydantic schema：操作员计划摘要、任务 payload、标注请求、标注响应。
- [x] 3.3 新增 `GET /api/operator/plans`，返回本人负责的 active/closed 计划摘要和进度计数。
- [x] 3.4 新增 `GET /api/operator/plans/{plan_id}/tasks/next`，实现负责人校验、关闭计划冲突处理、确定性待标注任务选择和持久化展示映射。
- [x] 3.5 新增 `POST /api/operator/tasks/{case_id}/annotate`，实现角色校验、负责人校验、计划状态校验、结论/原因校验、`OTHER` 校验、重复提交冲突处理和持久化。
- [x] 3.6 新增 repository/service 函数，覆盖负责计划查询、进度计数、待标注任务查询、规则上下文查询和标注创建。
- [x] 3.7 确认任务 payload 排除软删除的质控规则。
- [x] 3.8 增加后端测试，覆盖负责计划列表、任务成功返回、无任务返回 null、非负责人 forbidden、关闭计划冲突、提交成功、非法表单 payload、重复提交冲突。
- [x] 3.9 使用 conda `aicompare` 运行后端验证，例如 `/Users/zhaochengwang/anaconda3/envs/aicompare/bin/python -m pytest`。

### 4. 前后端联调

- [x] 4.1 将操作员 API client 从 mock 模式切换到后端模式，同时保留开发期 mock 选项。
- [x] 4.2 验证使用 `czy / czy` 登录后进入 `/operator/plans`。
- [x] 4.3 验证负责计划来自 `GET /api/operator/plans`。
- [x] 4.4 验证进入活跃计划后通过 `GET /api/operator/plans/{plan_id}/tasks/next` 加载下一条任务。
- [x] 4.5 验证标注提交调用 `POST /api/operator/tasks/{case_id}/annotate` 并推进到下一条任务。
- [x] 4.6 验证重复提交、关闭计划、非负责人计划和计划完成态从 UI 到 API 的行为一致。
- [x] 4.7 验证管理员路由仍可用，且操作员不能访问 `/admin/*`。
- [x] 4.8 增加集成测试或流程契约测试，覆盖操作员主流程和关键错误场景。

### 5. 部署

- [x] 5.1 如果新增前后端文件需要配置变更，更新 Docker 构建输入。
- [x] 5.2 在容器验证前运行生产前端构建和后端测试。
- [x] 5.3 运行应用的 Docker Compose build。
- [x] 5.4 使用生产 compose 文件在本地启动 Docker Compose。
- [x] 5.5 对部署后的容器执行 smoke test：`/api/health`、登录、操作员计划列表、下一条任务获取、标注提交。
- [x] 5.6 如存在部署配置变化，更新 `docs/deployment.md`。

### 6. 最终验证

- [x] 6.1 运行 `openspec status --change operator-init`。
- [x] 6.2 运行 `openspec validate --changes operator-init`。
- [x] 6.3 确认 proposal、specs、design、tasks 四类 artifact 完整且互相一致。
- [x] 6.4 确认实现不会把旧操作员模块行为作为事实来源。
