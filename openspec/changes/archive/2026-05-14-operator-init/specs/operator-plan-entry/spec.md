## 目的

定义操作员如何发现本人负责的标注计划，并进入标注工作流。

## ADDED Requirements

### Requirement: 操作员负责计划入口
系统 MUST 提供仅操作员可访问的计划入口页，并 SHALL 只列出分配给当前登录操作员的计划。

#### Scenario: 操作员查看负责计划
- **GIVEN** 已登录且有效的操作员拥有一个或多个负责计划
- **WHEN** 操作员打开 `/operator/plans`
- **THEN** 页面只展示 `owner_user_id` 等于当前操作员用户 id 的计划
- **AND** 每个计划展示名称、状态、总病例数、已标注数、待标注数和完成率

#### Scenario: 操作员没有负责计划
- **GIVEN** 已登录且有效的操作员没有任何负责计划
- **WHEN** 操作员打开 `/operator/plans`
- **THEN** 页面展示无负责计划的空状态
- **AND** 页面不展示任何管理员专属操作

### Requirement: 计划状态进入规则
系统 MUST 仅允许操作员进入本人负责的活跃计划进行标注，并 SHALL 在列表页阻止关闭计划进入标注面板。

#### Scenario: 进入活跃负责计划
- **GIVEN** 已登录操作员负责一个活跃计划，且该计划存在待标注病例
- **WHEN** 操作员点击该计划的标注入口操作
- **THEN** 客户端导航到 `/operator/plans/{plan_id}/annotate`

#### Scenario: 关闭计划不可进入标注
- **GIVEN** 已登录操作员负责一个已关闭计划
- **WHEN** 操作员查看计划入口页
- **THEN** 页面仍展示该计划用于上下文查看
- **AND** 该计划的操作按钮置灰并直接显示“已关闭”
- **AND** 操作员无法通过该计划进入标注面板

### Requirement: 角色边界
系统 MUST 阻止管理员和未登录用户使用操作员计划入口能力。

#### Scenario: 未登录用户打开操作员计划页
- **GIVEN** 当前没有有效 access token
- **WHEN** 用户打开 `/operator/plans`
- **THEN** 客户端重定向到 `/login`

#### Scenario: 管理员打开操作员计划页
- **GIVEN** 已登录用户是管理员
- **WHEN** 管理员打开 `/operator/plans`
- **THEN** 客户端阻止访问并跳转离开操作员路由
