## 目的

定义操作员标注表单校验、持久化语义、重复提交处理和提交后导航行为。

## ADDED Requirements

### Requirement: 标注结论与原因
系统 MUST 在提交前要求恰好一个标注结论和至少一个原因编码。

#### Scenario: 提交有效必填字段
- **GIVEN** 操作员正在查看一条任务
- **AND** 操作员从 `A_BETTER`、`B_BETTER`、`BOTH_BAD`、`BOTH_GOOD` 中选择了一个结论
- **AND** 操作员从 `NO_HIT_ERROR_RULE`、`NO_MISSING_RULE`、`NO_OVER_QC`、`OTHER` 中选择了至少一个原因
- **WHEN** 操作员提交表单
- **THEN** 客户端向后端发送标注请求

#### Scenario: 缺少结论
- **GIVEN** 操作员正在查看一条任务
- **WHEN** 操作员未选择结论就提交
- **THEN** 客户端阻止提交，并展示字段级校验提示

#### Scenario: 缺少原因
- **GIVEN** 操作员正在查看一条任务
- **WHEN** 操作员未选择任何原因就提交
- **THEN** 客户端阻止提交，并展示字段级校验提示

### Requirement: 其他原因校验
系统 MUST 在选择 `OTHER` 时要求填写 `other_reason_text`，并 SHALL 在未选择 `OTHER` 时清空或省略 `other_reason_text`。

#### Scenario: 选择其他原因并填写文本
- **GIVEN** 操作员选择了 `OTHER`
- **AND** 操作员输入了非空的其他原因文本
- **WHEN** 操作员提交表单
- **THEN** 请求中包含 `OTHER` 和输入的 `other_reason_text`

#### Scenario: 选择其他原因但未填写文本
- **GIVEN** 操作员选择了 `OTHER`
- **WHEN** 操作员未输入其他原因文本就提交
- **THEN** 客户端阻止提交，并展示字段级校验提示

#### Scenario: 未选择其他原因
- **GIVEN** 操作员之前输入过其他原因文本
- **WHEN** 操作员取消选择 `OTHER` 后提交
- **THEN** 提交的 `other_reason_text` 为 `null` 或被省略

### Requirement: 每病例每操作员只能提交一次
系统 MUST 对每个病例和每个操作员最多持久化一条标注记录，并 SHALL 对重复提交返回冲突语义。

#### Scenario: 首次提交成功
- **GIVEN** 已登录操作员负责该任务所属的活跃计划
- **AND** 操作员此前未标注该病例
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/annotate`
- **THEN** API 返回 `201`，并包含标注 id、病例 id、操作员用户 id、结论、原因编码、可选备注和创建时间

#### Scenario: 重复提交被拒绝
- **GIVEN** 该病例和操作员已经存在一条标注记录
- **WHEN** 客户端再次调用 `POST /api/operator/tasks/{case_id}/annotate`
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`

### Requirement: 提交后推进
系统 SHALL 在提交成功后推进到下一条任务，并 MUST 在没有剩余待标注任务时展示完成状态。

#### Scenario: 提交后仍有任务
- **GIVEN** 当前标注提交成功
- **AND** 计划中仍有另一条待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示下一条待标注病例，并显示空白标注表单

#### Scenario: 提交后没有剩余任务
- **GIVEN** 当前标注提交成功
- **AND** 计划中没有剩余待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示完成状态
