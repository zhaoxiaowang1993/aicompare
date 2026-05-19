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

#### Scenario: 对比模式首次提交成功
- **GIVEN** 已登录操作员负责该任务所属的活跃计划
- **AND** 操作员此前未标注该病例
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/annotate`
- **THEN** API 返回 `201`，并包含标注 id、病例 id、操作员用户 id、结论、原因编码、可选备注和创建时间

#### Scenario: 对比模式重复提交被拒绝
- **GIVEN** 该病例和操作员已经存在一条标注记录
- **WHEN** 客户端再次调用 `POST /api/operator/tasks/{case_id}/annotate`
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`

#### Scenario: 手动模式首次提交成功
- **GIVEN** 已登录操作员负责该任务所属的活跃手动计划
- **AND** 操作员此前未完成该病例的手动标注
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `201`，并包含手动病例完成记录 id、病例 id、操作员用户 id、完成结果、条目数量和创建时间

#### Scenario: 手动模式重复提交被拒绝
- **GIVEN** 该病例和操作员已经存在一条手动病例完成记录
- **WHEN** 客户端再次调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`

### Requirement: 提交后推进
系统 SHALL 在提交成功后推进到下一条任务，并 MUST 在没有剩余待标注任务时展示完成状态。

#### Scenario: 对比提交后仍有任务
- **GIVEN** 当前标注提交成功
- **AND** 计划中仍有另一条待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示下一条待标注病例，并显示空白标注表单

#### Scenario: 手动提交后仍有任务
- **GIVEN** 当前手动病例提交成功
- **AND** 手动计划中仍有另一条待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示下一条待标注病例
- **AND** 新病例右侧标注条目列表为空

#### Scenario: 提交后没有剩余任务
- **GIVEN** 当前标注提交成功
- **AND** 计划中没有剩余待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示完成状态

### Requirement: 手动问题条目提交
系统 MUST 支持 `has_issues` 手动提交，并要求每条问题条目包含原文片段、定位范围、质控规则和修改建议。

#### Scenario: 提交包含问题条目的手动标注
- **GIVEN** 操作员正在查看一个手动任务
- **AND** 操作员已经创建至少一条问题条目
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate` 且 `result=has_issues`
- **THEN** API 保存病例级完成记录
- **AND** API 保存全部问题条目
- **AND** 每条问题条目包含 `source_text`、`start_offset`、`end_offset`、`quality_rule_id`、规则快照、`suggestion` 和可选 `notes`

#### Scenario: 问题条目缺少必填字段
- **GIVEN** 手动提交请求中某条问题条目缺少 `source_text`、`quality_rule_id` 或 `suggestion`
- **WHEN** API 校验请求
- **THEN** API 返回 `400 VALIDATION_ERROR`

#### Scenario: 问题条目定位范围非法
- **GIVEN** 手动提交请求中某条问题条目的 `start_offset` 或 `end_offset` 超出当前病例 `record_text` 范围
- **WHEN** API 校验请求
- **THEN** API 返回 `400 VALIDATION_ERROR`

#### Scenario: 问题条目原文片段与定位不一致
- **GIVEN** 手动提交请求中某条问题条目的 `source_text` 与 `record_text[start_offset:end_offset]` 在换行或安全标签归一化后不一致
- **WHEN** API 校验请求
- **THEN** API 返回 `400 VALIDATION_ERROR`

### Requirement: 手动无问题完成提交
系统 MUST 支持操作员主动提交 `no_issue`，表示该病例没有触发任何质控规则，并将该病例计为已完成。

#### Scenario: 提交无问题完成状态
- **GIVEN** 操作员正在查看一个手动任务
- **AND** 操作员没有创建任何问题条目
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate` 且 `result=no_issue`
- **THEN** API 保存病例级完成记录
- **AND** API 不保存问题条目
- **AND** 该病例计入计划完成进度

#### Scenario: 无问题提交包含条目被拒绝
- **GIVEN** 手动提交请求中 `result=no_issue`
- **AND** 请求同时包含一个或多个问题条目
- **WHEN** API 校验请求
- **THEN** API 返回 `400 VALIDATION_ERROR`

### Requirement: 手动条目规则快照
系统 MUST 在保存手动问题条目时同步保存质控规则分类、内容和分值快照。

#### Scenario: 保存规则快照
- **GIVEN** 操作员提交的问题条目引用一个有效质控规则
- **WHEN** API 保存问题条目
- **THEN** 条目保存 `quality_rule_category_snapshot`、`quality_rule_content_snapshot` 和 `quality_rule_score_snapshot`

#### Scenario: 后续规则变更不影响历史条目
- **GIVEN** 一个手动问题条目已经保存规则快照
- **WHEN** 管理员后续修改或删除该质控规则
- **THEN** 历史手动标注明细仍展示提交时保存的规则快照

### Requirement: 手动原文片段换行保留
系统 MUST 保留手动条目原文片段中的换行信息，并 SHALL 使用定位信息稳定恢复原文片段。

#### Scenario: 提交跨行原文片段
- **GIVEN** 操作员划选的病历原文片段跨越多行
- **WHEN** 客户端提交手动问题条目
- **THEN** API 保存规范化后的 `source_text`
- **AND** 换行标记至少以 `\n` 形式保留

#### Scenario: 使用定位信息恢复原文片段
- **GIVEN** 已保存的手动问题条目包含 `start_offset` 和 `end_offset`
- **WHEN** 管理员打开手动标注详情
- **THEN** 系统可根据定位信息恢复对应原文片段并高亮

### Requirement: 手动提交后不可修改
系统 MUST 在病例手动提交成功后拒绝对该病例新增、修改或删除手动问题条目。

#### Scenario: 提交后尝试新增条目
- **GIVEN** 某病例已存在手动病例完成记录
- **WHEN** 客户端再次提交包含新增条目的请求
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`

#### Scenario: 提交后尝试修改条目
- **GIVEN** 某病例已存在手动病例完成记录
- **WHEN** 客户端尝试通过重复提交修改既有问题条目
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`

#### Scenario: 提交后尝试删除条目
- **GIVEN** 某病例已存在手动病例完成记录
- **WHEN** 客户端尝试通过重复提交删除既有问题条目
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`
