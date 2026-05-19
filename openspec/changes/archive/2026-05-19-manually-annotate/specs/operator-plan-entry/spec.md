## MODIFIED Requirements

### Requirement: 操作员负责计划入口
系统 MUST 提供仅操作员可访问的计划入口页，并 SHALL 只列出分配给当前登录操作员的计划。系统 SHALL 在每个计划中展示标注类型，使操作员在进入工作流前可以区分对比计划和手动计划。

#### Scenario: 操作员查看负责计划
- **GIVEN** 已登录且有效的操作员拥有一个或多个负责计划
- **WHEN** 操作员打开 `/operator/plans`
- **THEN** 页面只展示 `owner_user_id` 等于当前操作员用户 id 的计划
- **AND** 每个计划展示名称、状态、标注类型、总病例数、已标注数、待标注数和完成率

#### Scenario: 操作员没有负责计划
- **GIVEN** 已登录且有效的操作员没有任何负责计划
- **WHEN** 操作员打开 `/operator/plans`
- **THEN** 页面展示无负责计划的空状态
- **AND** 页面不展示任何管理员专属操作

### Requirement: 计划状态进入规则
系统 MUST 仅允许操作员进入本人负责的活跃计划进行标注，并 SHALL 在列表页阻止关闭计划进入标注面板。系统 SHALL 根据计划标注类型进入对应工作台。

#### Scenario: 进入活跃对比计划
- **GIVEN** 已登录操作员负责一个活跃 `comparison` 计划，且该计划存在待标注病例
- **WHEN** 操作员点击该计划的标注入口操作
- **THEN** 客户端导航到 `/operator/plans/{plan_id}/annotate`
- **AND** 标注页面加载对比工作台

#### Scenario: 进入活跃手动计划
- **GIVEN** 已登录操作员负责一个活跃 `manual` 计划，且该计划存在待标注病例
- **WHEN** 操作员点击该计划的标注入口操作
- **THEN** 客户端导航到 `/operator/plans/{plan_id}/annotate`
- **AND** 标注页面加载手动工作台

#### Scenario: 关闭计划不可进入标注
- **GIVEN** 已登录操作员负责一个已关闭计划
- **WHEN** 操作员查看计划入口页
- **THEN** 页面仍展示该计划用于上下文查看
- **AND** 该计划的操作按钮置灰并直接显示“已关闭”
- **AND** 操作员无法通过该计划进入标注面板
