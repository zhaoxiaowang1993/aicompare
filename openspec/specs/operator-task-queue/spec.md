## 目的

定义操作员标注任务的资格判断、获取顺序、权限检查和完成态行为。

## ADDED Requirements

### Requirement: 下一条任务获取
系统 MUST 为操作员负责的活跃计划提供下一条任务 API，并 SHALL 返回当前登录操作员尚未标注的下一条病例。

#### Scenario: 存在下一条任务
- **GIVEN** 已登录操作员负责一个活跃计划
- **AND** 该计划至少存在一条当前操作员尚未标注的病例
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `200`，并包含病例 id、计划 id、住院号、病历内容、展示后的输出 A、展示后的输出 B、展示映射元数据和质控规则上下文

#### Scenario: 不存在下一条任务
- **GIVEN** 已登录操作员负责一个活跃计划
- **AND** 该计划所有病例都已由该操作员完成标注
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `200` 和 `null`
- **AND** 前端展示计划已完成状态

### Requirement: 任务资格边界
系统 MUST 拒绝操作员获取非本人负责计划的任务，并 SHALL 拒绝获取已关闭计划的任务。

#### Scenario: 操作员请求其他操作员负责的计划
- **GIVEN** 已登录操作员不是请求计划的负责人
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `403 PLAN_NOT_ASSIGNED_TO_OPERATOR`

#### Scenario: 操作员请求关闭计划任务
- **GIVEN** 已登录操作员负责一个已关闭计划
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `409 PLAN_CLOSED`

#### Scenario: 请求的计划不存在
- **GIVEN** 请求的计划 id 不存在
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `404 PLAN_NOT_FOUND`

### Requirement: 稳定展示映射
系统 MUST 保留每条病例已持久化的 A/B 展示映射，并 SHALL 在任务获取时绝不重新计算 A/B 顺序。

#### Scenario: 提交前重复加载同一病例
- **GIVEN** 某病例已经持久化 `display_a_source` 和 `display_b_source`
- **WHEN** 操作员在提交前刷新标注页面
- **THEN** 每次展示的输出 A 和输出 B 都使用相同的持久化映射

### Requirement: 确定性队列顺序
系统 SHALL 按确定性顺序选择待标注病例，并 MUST 排除当前操作员已经标注过的病例。

#### Scenario: 存在多条待标注病例
- **GIVEN** 操作员负责的活跃计划包含多条未标注病例
- **WHEN** 客户端请求下一条任务
- **THEN** API 返回按稳定数据库顺序排列的第一条合格病例
- **AND** 已存在当前操作员标注记录的病例被跳过
