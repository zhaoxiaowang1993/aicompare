## MODIFIED Requirements

### Requirement: 每病例每操作员只能提交一次
系统 MUST 对每个病例和每个操作员最多持久化一条完成语义的标注记录，并 SHALL 对重复提交返回冲突语义。对比计划使用对比标注记录判断重复；手动计划使用手动病例完成记录判断重复。

#### Scenario: 对比模式首次提交成功
- **GIVEN** 已登录操作员负责该任务所属的活跃 `comparison` 计划
- **AND** 操作员此前未标注该病例
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/annotate`
- **THEN** API 返回 `201`，并包含标注 id、病例 id、操作员用户 id、结论、原因编码、可选备注和创建时间

#### Scenario: 对比模式重复提交被拒绝
- **GIVEN** 该病例和操作员已经存在一条对比标注记录
- **WHEN** 客户端再次调用 `POST /api/operator/tasks/{case_id}/annotate`
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`

#### Scenario: 手动模式首次提交成功
- **GIVEN** 已登录操作员负责该任务所属的活跃 `manual` 计划
- **AND** 操作员此前未完成该病例的手动标注
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `201`，并包含手动完成记录 id、病例 id、操作员用户 id、手动结果、条目数量和创建时间

#### Scenario: 手动模式重复提交被拒绝
- **GIVEN** 该病例和操作员已经存在一条手动完成记录
- **WHEN** 客户端再次调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`
- **AND** 系统不新增、不修改、不删除该病例已有手动条目

### Requirement: 提交后推进
系统 SHALL 在提交成功后推进到下一条任务，并 MUST 在没有剩余待标注任务时展示完成状态。

#### Scenario: 对比提交后仍有任务
- **GIVEN** 当前对比标注提交成功
- **AND** 计划中仍有另一条待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示下一条待标注病例，并显示空白对比标注表单

#### Scenario: 手动提交后仍有任务
- **GIVEN** 当前手动标注提交成功
- **AND** 计划中仍有另一条待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示下一条待标注病例，并显示空白手动标注条目面板

#### Scenario: 提交后没有剩余任务
- **GIVEN** 当前标注提交成功
- **AND** 计划中没有剩余待标注病例
- **WHEN** 客户端刷新任务队列
- **THEN** 页面展示完成状态

## ADDED Requirements

### Requirement: 手动问题条目提交
系统 MUST 支持操作员为手动病例提交 `has_issues` 结果和一条或多条问题条目。每条问题条目 MUST 包含病历原文片段、原文定位信息、一个质控规则和修改建议，备注 SHALL 为选填。

#### Scenario: 提交包含问题条目的手动标注
- **GIVEN** 操作员正在查看一个活跃手动计划下的病例
- **AND** 请求包含 `result=has_issues`
- **AND** 请求包含一条或多条 entries
- **AND** 每条 entry 均包含非空 `source_text`、有效 `start_offset`、有效 `end_offset`、有效 `quality_rule_id` 和非空 `suggestion`
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `201`
- **AND** 系统持久化病例级手动完成记录和全部问题条目

#### Scenario: 问题条目缺少必填字段
- **GIVEN** 请求包含 `result=has_issues`
- **AND** 任一 entry 缺少 `source_text`、`start_offset`、`end_offset`、`quality_rule_id` 或 `suggestion`
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `400 VALIDATION_ERROR`

#### Scenario: 问题条目定位范围非法
- **GIVEN** 请求包含 `result=has_issues`
- **AND** 任一 entry 的 `start_offset` 或 `end_offset` 不在当前病例清洗后 `record_text` 的有效范围内
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `400 VALIDATION_ERROR`

#### Scenario: 问题条目原文片段与定位不一致
- **GIVEN** 请求包含 `result=has_issues`
- **AND** 任一 entry 的 `source_text` 与 `start_offset` 到 `end_offset` 对应的原文片段在换行规范化后不一致
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `400 VALIDATION_ERROR`

### Requirement: 手动无问题完成提交
系统 MUST 支持操作员主动提交 `no_issue` 结果表示当前病例文书未触发任何质控规则，并 SHALL 将该提交计为病例完成。`no_issue` 提交 MUST NOT 包含问题条目或备注字段。

#### Scenario: 提交无问题完成状态
- **GIVEN** 操作员正在查看一个活跃手动计划下的病例
- **AND** 请求包含 `result=no_issue`
- **AND** 请求不包含 entries
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `201`
- **AND** 系统持久化病例级手动完成记录
- **AND** 该病例计入已完成数

#### Scenario: 无问题提交包含条目被拒绝
- **GIVEN** 请求包含 `result=no_issue`
- **AND** 请求同时包含一条或多条 entries
- **WHEN** 客户端调用 `POST /api/operator/tasks/{case_id}/manual-annotate`
- **THEN** API 返回 `400 VALIDATION_ERROR`

### Requirement: 手动条目规则快照
系统 MUST 在持久化手动问题条目时保存所选质控规则的分类、内容和分值快照，以保证历史标注明细不受规则后续编辑或删除影响。

#### Scenario: 保存规则快照
- **GIVEN** 操作员提交的问题条目引用了一个有效质控规则
- **WHEN** 系统持久化该问题条目
- **THEN** 条目保存 `quality_rule_id`
- **AND** 条目保存提交时的规则分类、规则内容和分值快照

#### Scenario: 后续规则变更不影响历史条目
- **GIVEN** 某手动问题条目已经保存规则快照
- **WHEN** 管理员后续编辑或删除对应质控规则
- **THEN** 历史手动标注明细仍展示提交时保存的规则分类、规则内容和分值

### Requirement: 手动原文片段换行保留
系统 SHALL 保留手动条目中病历原文片段的换行信息，并 MAY 将换行统一规范为 `\n` 存储。系统 MUST 同时保存该片段在清洗后 `record_text` 中的 `start_offset` 和 `end_offset`。

#### Scenario: 提交跨行原文片段
- **GIVEN** 操作员提交的问题条目 `source_text` 包含换行
- **WHEN** 系统持久化该条目
- **THEN** 保存后的 `source_text` 保留换行信息
- **AND** 保存后的条目包含 `start_offset` 和 `end_offset`
- **AND** 管理员打开该病例标注详情并切换到列表视图时能够还原跨行片段的可读结构

#### Scenario: 使用定位信息恢复原文片段
- **GIVEN** 某手动问题条目已经保存 `source_text`、`start_offset` 和 `end_offset`
- **WHEN** 系统需要展示该条目对应的病历原文位置
- **THEN** 系统可以基于 `start_offset` 和 `end_offset` 定位清洗后 `record_text` 中的对应片段
- **AND** 该片段与保存的 `source_text` 在换行规范化后保持一致

### Requirement: 手动提交后不可修改
系统 MUST 将手动病例提交视为该病例质控完成，并 SHALL 在提交成功后禁止通过新增、编辑、删除条目或再次提交来改变该病例的手动标注结果。

#### Scenario: 提交后尝试新增条目
- **GIVEN** 某手动病例已经由当前操作员提交完成
- **WHEN** 客户端尝试再次提交包含新增条目的手动标注请求
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`
- **AND** 已有手动完成记录和条目保持不变

#### Scenario: 提交后尝试修改条目
- **GIVEN** 某手动病例已经由当前操作员提交完成
- **WHEN** 客户端尝试再次提交修改后的手动标注请求
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`
- **AND** 已有手动完成记录和条目保持不变

#### Scenario: 提交后尝试删除条目
- **GIVEN** 某手动病例已经由当前操作员提交完成
- **WHEN** 客户端尝试通过再次提交缺少既有条目的请求来删除条目
- **THEN** API 返回 `409 ANNOTATION_ALREADY_EXISTS`
- **AND** 已有手动完成记录和条目保持不变
