## MODIFIED Requirements

### Requirement: 下一条任务获取
系统 MUST 为操作员负责的活跃计划提供下一条任务 API，并 SHALL 返回当前登录操作员尚未完成标注的下一条病例。任务 payload MUST 按计划标注类型区分。

#### Scenario: 存在下一条对比任务
- **GIVEN** 已登录操作员负责一个活跃 `comparison` 计划
- **AND** 该计划至少存在一条当前操作员尚未提交对比标注的病例
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `200`
- **AND** payload 包含 `annotation_type=comparison`、病例 id、计划 id、住院号、病历内容、展示后的输出 A、展示后的输出 B、展示映射元数据和质控规则上下文

#### Scenario: 存在下一条手动任务
- **GIVEN** 已登录操作员负责一个活跃 `manual` 计划
- **AND** 该计划至少存在一条当前操作员尚未提交手动完成记录的病例
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `200`
- **AND** payload 包含 `annotation_type=manual`、病例 id、计划 id、住院号、病历内容和质控规则上下文
- **AND** payload 不包含输出 A、输出 B 或 A/B 展示映射

#### Scenario: 不存在下一条任务
- **GIVEN** 已登录操作员负责一个活跃计划
- **AND** 该计划所有病例都已由该操作员按计划类型完成标注
- **WHEN** 客户端调用 `GET /api/operator/plans/{plan_id}/tasks/next`
- **THEN** API 返回 `200` 和 `null`
- **AND** 前端展示计划已完成状态

### Requirement: 稳定展示映射
系统 MUST 保留每条对比病例已持久化的 A/B 展示映射，并 SHALL 在任务获取时绝不重新计算 A/B 顺序。手动病例 MUST NOT 依赖 A/B 展示映射。

#### Scenario: 提交前重复加载同一对比病例
- **GIVEN** 某对比病例已经持久化 `display_a_source` 和 `display_b_source`
- **WHEN** 操作员在提交前刷新标注页面
- **THEN** 每次展示的输出 A 和输出 B 都使用相同的持久化映射

#### Scenario: 手动病例不返回展示映射
- **GIVEN** 某手动病例不包含智能体输出
- **WHEN** 操作员请求下一条任务
- **THEN** API 返回的手动任务不包含 A/B 展示映射字段

### Requirement: 确定性队列顺序
系统 SHALL 按确定性顺序选择待标注病例，并 MUST 排除当前操作员已经按计划类型完成标注的病例。

#### Scenario: 存在多条待标注对比病例
- **GIVEN** 操作员负责的活跃 `comparison` 计划包含多条未标注病例
- **WHEN** 客户端请求下一条任务
- **THEN** API 返回按稳定数据库顺序排列的第一条合格病例
- **AND** 已存在当前操作员对比标注记录的病例被跳过

#### Scenario: 存在多条待标注手动病例
- **GIVEN** 操作员负责的活跃 `manual` 计划包含多条未完成病例
- **WHEN** 客户端请求下一条任务
- **THEN** API 返回按稳定数据库顺序排列的第一条合格病例
- **AND** 已存在当前操作员手动完成记录的病例被跳过
