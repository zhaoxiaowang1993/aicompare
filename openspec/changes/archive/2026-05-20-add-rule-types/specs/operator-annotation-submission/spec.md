## ADDED Requirements

### Requirement: 历史手动条目规则分类快照清洗
系统 MUST 在入院病历规则类型拆分时清洗历史手动问题条目的规则分类快照，使其与引用的质控规则拆分类别一致。

#### Scenario: 清洗儿童入院规则快照
- **GIVEN** 手动问题条目的 `quality_rule_id` 引用 ID 1 至 42 的质控规则
- **AND** 该条目的 `quality_rule_category_snapshot` 为 `admission_record`
- **WHEN** 入院病历规则类型清洗执行
- **THEN** 该条目的 `quality_rule_category_snapshot` MUST 更新为 `admission_record_child`

#### Scenario: 清洗女性入院规则快照
- **GIVEN** 手动问题条目的 `quality_rule_id` 引用 ID 43 至 95 的质控规则
- **AND** 该条目的 `quality_rule_category_snapshot` 为 `admission_record`
- **WHEN** 入院病历规则类型清洗执行
- **THEN** 该条目的 `quality_rule_category_snapshot` MUST 更新为 `admission_record_female`

#### Scenario: 清洗男性入院规则快照
- **GIVEN** 手动问题条目的 `quality_rule_id` 引用 ID 96 至 140 的质控规则
- **AND** 该条目的 `quality_rule_category_snapshot` 为 `admission_record`
- **WHEN** 入院病历规则类型清洗执行
- **THEN** 该条目的 `quality_rule_category_snapshot` MUST 更新为 `admission_record_male`

#### Scenario: 清洗保留历史手动条目内容
- **GIVEN** 一个历史手动问题条目的规则分类快照被清洗
- **WHEN** 清洗完成
- **THEN** 系统 MUST 保留该条目的 `source_text`、`start_offset`、`end_offset`、`quality_rule_id`、`quality_rule_content_snapshot`、`quality_rule_score_snapshot`、`suggestion`、`notes` 和创建时间

#### Scenario: 非入院规则快照不受影响
- **GIVEN** 手动问题条目的 `quality_rule_category_snapshot` 不是 `admission_record`
- **WHEN** 入院病历规则类型清洗执行
- **THEN** 系统 MUST NOT 修改该条目的规则分类快照
