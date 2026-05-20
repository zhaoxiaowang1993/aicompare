## ADDED Requirements

### Requirement: 管理员可以访问质控规则管理页
系统 SHALL 在 `/admin/rules` 提供仅管理员可访问的质控规则管理页。页面 MUST 优先使用 `frontend/src/components/` 中已有 UI 组件，并 MUST 在前端验收时匹配 `design/pages/admin-rules.pen`。

#### Scenario: 管理员打开规则管理页
- **GIVEN** 已认证管理员用户
- **WHEN** 管理员访问 `/admin/rules`
- **THEN** 系统 SHALL 渲染包含列表、筛选、新建、编辑、软删除和批量导入控件的质控规则管理页

#### Scenario: 非管理员不能访问规则管理页
- **GIVEN** 已认证操作员或未认证用户
- **WHEN** 用户访问 `/admin/rules`
- **THEN** 系统 MUST 按现有路由保护行为拒绝访问

### Requirement: 规则数据模型使用类型内容和文本型分值
系统 MUST 使用规则类型、规则内容、文本型分值、创建元数据、更新元数据和软删除元数据保存每条质控规则。系统 SHALL NOT 在该能力中暴露规则编码、规则名称、规则描述、启用状态、禁用状态或版本冻结字段。允许的规则类型 MUST 为 `admission_record_child`、`admission_record_female`、`admission_record_male`、`first_course_record`、`superior_physician_round`、`daily_course_record` 和 `discharge_record`。

#### Scenario: 使用必填字段创建规则
- **GIVEN** 已认证管理员提供有效规则类型、规则内容和文本型分值
- **WHEN** 管理员提交创建规则请求
- **THEN** 系统 SHALL 持久化该规则，并返回包含类型、内容、分值、创建时间和更新时间的规则数据

#### Scenario: 拒绝缺少必填字段
- **GIVEN** 已认证管理员提交的规则 payload 缺少规则类型、规则内容或分值
- **WHEN** 管理员提交创建或更新规则请求
- **THEN** 系统 MUST 以校验错误语义拒绝请求
- **AND** 系统 MUST NOT 持久化无效数据

#### Scenario: 拒绝枚举范围外的规则类型
- **GIVEN** 已认证管理员提交的规则类型不属于 入院病历-儿童、入院病历-女性、入院病历-男性、首次病程记录、上级医师查房记录、日常病程、出院记录
- **WHEN** 管理员提交创建或更新规则请求
- **THEN** 系统 MUST 以校验错误语义拒绝请求

#### Scenario: 拒绝 legacy 入院病历类型
- **GIVEN** 已认证管理员提交的规则 payload 中 category 为 `admission_record`
- **WHEN** 管理员提交创建、更新或导入请求
- **THEN** 系统 MUST 以校验错误语义拒绝该 payload

### Requirement: 管理员可以列表搜索筛选和分页规则
系统 SHALL 提供仅管理员可访问的分页规则列表。列表 MUST 只包含未删除规则，MUST 支持按规则内容模糊搜索，MUST 支持按规则类型筛选，且 MUST NOT 按分值搜索或筛选。规则类型筛选 MUST 提供 入院病历-儿童、入院病历-女性、入院病历-男性、首次病程记录、上级医师查房记录、日常病程、出院记录。

#### Scenario: 分页列出规则
- **GIVEN** 已认证管理员和已存在的未删除规则
- **WHEN** 管理员按 page 和 page size 请求规则列表
- **THEN** 系统 SHALL 返回分页后的未删除规则和总数

#### Scenario: 按规则内容搜索
- **GIVEN** 已存在多条内容不同的未删除规则
- **WHEN** 管理员使用匹配部分规则内容的关键词搜索
- **THEN** 系统 SHALL 仅返回规则内容匹配关键词的未删除规则

#### Scenario: 按规则类型筛选
- **GIVEN** 已存在多个规则类型的未删除规则
- **WHEN** 管理员按某个规则类型筛选
- **THEN** 系统 SHALL 仅返回该规则类型下的未删除规则

#### Scenario: 分值不可搜索
- **GIVEN** 已存在带分值文本的未删除规则
- **WHEN** 管理员输入只匹配分值文本的关键词
- **THEN** 系统 SHALL NOT 通过分值文本匹配规则

#### Scenario: 按拆分后的入院规则类型筛选
- **GIVEN** 已存在 `admission_record_child`、`admission_record_female` 和 `admission_record_male` 下的未删除规则
- **WHEN** 管理员按 `admission_record_female` 筛选
- **THEN** 系统 SHALL 仅返回 `admission_record_female` 下的未删除规则
- **AND** 不返回儿童或男性入院病历规则

### Requirement: 管理员可以更新和软删除规则
系统 MUST 允许管理员更新既有未删除规则的类型、内容和分值。系统 MUST 通过设置删除元数据实现软删除，且软删除规则 SHALL 立即从管理员列表结果中隐藏。

#### Scenario: 更新规则字段
- **GIVEN** 已认证管理员和一条既有未删除规则
- **WHEN** 管理员更新类型、内容和/或分值
- **THEN** 系统 SHALL 持久化更新后的值并返回更新后的规则

#### Scenario: 软删除规则
- **GIVEN** 已认证管理员和一条既有未删除规则
- **WHEN** 管理员删除该规则
- **THEN** 系统 MUST 将该规则标记为已删除，并 MUST 从后续管理员列表响应中隐藏

#### Scenario: 已删除规则不能作为活跃数据更新
- **GIVEN** 一条已软删除规则
- **WHEN** 管理员尝试通过普通更新端点更新该规则
- **THEN** 系统 MUST 以未找到或不再可用语义拒绝该操作

### Requirement: 管理员可以下载 CSV 模板和批量导入规则
系统 SHALL 在管理员规则管理页提供 CSV 批量导入能力。批量导入面板 MUST 在同一流程中包含 CSV 模板下载和文件上传控件。CSV 模板和导入校验 MUST 使用拆分后的入院病历类型标签，而不是 legacy 入院病历标签。

#### Scenario: 下载 CSV 模板
- **GIVEN** 已认证管理员位于规则管理页
- **WHEN** 管理员请求 CSV 模板
- **THEN** 系统 SHALL 下载包含规则类型、规则内容、分值表头的 CSV 模板
- **AND** 模板示例使用 入院病历-儿童、入院病历-女性、入院病历-男性、首次病程记录、上级医师查房记录、日常病程、出院记录 中的一个类型

#### Scenario: 导入有效 CSV 行
- **GIVEN** 已认证管理员上传包含有效表头和有效行的 CSV 文件
- **WHEN** 管理员通过批量导入面板上传该文件
- **THEN** 系统 SHALL 为有效行创建规则
- **AND** 系统 SHALL 返回包含总行数、成功行数、失败行数和行级错误的导入摘要

#### Scenario: 报告缺失值行错误
- **GIVEN** CSV 文件中存在缺少规则类型、规则内容或分值的行
- **WHEN** 管理员上传 CSV 文件
- **THEN** 系统 MUST 将这些行视为失败项
- **AND** 系统 MUST 包含行级错误详情

#### Scenario: 报告非法规则类型行错误
- **GIVEN** CSV 文件中某行规则类型不属于 入院病历-儿童、入院病历-女性、入院病历-男性、首次病程记录、上级医师查房记录、日常病程、出院记录
- **WHEN** 管理员上传 CSV 文件
- **THEN** 系统 MUST 将该行视为失败项
- **AND** 系统 MUST 包含行级错误详情

#### Scenario: 报告 legacy 入院病历行错误
- **GIVEN** CSV 文件中某行规则类型为 入院病历 或 `admission_record`
- **WHEN** 管理员上传 CSV 文件
- **THEN** 系统 MUST 将该行视为失败项
- **AND** 系统 MUST 包含行级错误详情

#### Scenario: 允许重复行
- **GIVEN** CSV 文件中包含重复规则内容或重复规则类型-内容组合
- **WHEN** 管理员上传 CSV 文件
- **THEN** 系统 SHALL 独立导入每一行有效数据
- **AND** 系统 SHALL NOT 因重复而拒绝导入

### Requirement: 入院病历规则类型数据清洗
系统 MUST 清洗本地 SQLite 质控规则数据，将既有 legacy `admission_record` 行按已验证规则 ID 范围映射为拆分后的入院病历类型。

#### Scenario: 清洗儿童入院病历规则
- **GIVEN** 本地 `quality_rules` 中 ID 1 至 42 且 category 为 `admission_record` 的行
- **WHEN** 清洗逻辑执行
- **THEN** 这些行 MUST 更新为 category `admission_record_child`

#### Scenario: 清洗女性入院病历规则
- **GIVEN** 本地 `quality_rules` 中 ID 43 至 95 且 category 为 `admission_record` 的行
- **WHEN** 清洗逻辑执行
- **THEN** 这些行 MUST 更新为 category `admission_record_female`

#### Scenario: 清洗男性入院病历规则
- **GIVEN** 本地 `quality_rules` 中 ID 96 至 140 且 category 为 `admission_record` 的行
- **WHEN** 清洗逻辑执行
- **THEN** 这些行 MUST 更新为 category `admission_record_male`

#### Scenario: 清洗保留规则内容和分值
- **GIVEN** 某条质控规则从 `admission_record` 清洗为拆分后的入院病历类型
- **WHEN** 清洗完成
- **THEN** 除实现不可避免的更新时间行为外，该规则的内容、分值、创建元数据、更新元数据、软删除元数据和主键 MUST 保持不变

#### Scenario: 清洗不猜测异常 legacy 行
- **GIVEN** 某条 `quality_rules` 行的 category 为 `admission_record` 且 ID 不在 1 至 140 范围内
- **WHEN** 清洗逻辑执行
- **THEN** 系统 MUST NOT 根据内容启发式为该行分配拆分类型
- **AND** 校验逻辑 MUST 暴露剩余 legacy 行数量供实现者检查

### Requirement: 规则实现替换旧规则存储
系统 MUST 放弃基于编码、名称、描述、数字分值和启用状态的 legacy 规则结构。系统 SHALL 清理历史 legacy 规则数据，并为该能力使用新的 `quality_rules` 存储结构。

#### Scenario: 不迁移 legacy 规则数据
- **GIVEN** 环境中存在 legacy `rules` 数据
- **WHEN** 应用该变更
- **THEN** 系统 MUST 删除或忽略 legacy 规则数据，并 MUST 初始化新的质控规则存储且不保留历史规则记录

#### Scenario: 不存在启用或禁用状态
- **GIVEN** 管理员创建、列表查看、更新、导入或删除规则
- **WHEN** 系统处理规则数据
- **THEN** 系统 SHALL NOT 要求、返回或持久化启用或禁用状态字段

### Requirement: 操作员规则展示由操作员能力负责
管理员规则管理能力 SHALL 为下游展示提供未删除规则数据。操作员标注 UI 行为和 `design/pages/operator.pen` 变更 SHALL 由操作员标注能力负责，而不是由管理员规则管理能力负责。

#### Scenario: 操作员标注读取活跃规则但不拥有管理行为
- **GIVEN** 存在活跃未删除质控规则
- **WHEN** 操作员标注能力需要规则上下文
- **THEN** 它 MAY 查询这些活跃规则，但不改变管理员创建、更新、导入或软删除语义
