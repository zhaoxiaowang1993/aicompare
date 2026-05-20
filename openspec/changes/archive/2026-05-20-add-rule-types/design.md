## 背景

现有质控规则模型在 `quality_rules` 中以扁平字段保存 `category`、`content` 和文本型 `score`。当前允许的规则类型包含单一 `admission_record`，操作员页面也会把这个值映射为入院病历规则组。本地 SQLite 数据库当前有 140 条启用状态的 `admission_record` 规则，ID 连续为 1-140；另有 8 条手动标注条目的 `quality_rule_id` 均引用 ID 1-42 范围内的规则。

本变更将入院病历规则扩展为儿童、女性、男性三类。同时引入可复用 Cascader 组件，因为手动标注表单需要通过“规则类型 -> 具体规则”的两级路径选择规则，而不是继续使用分组 Select。用户明确要求先完善设计组件库和生成组件代码，因此实现必须先处理 `design/components/data-entry.lib.pen` 和 `frontend/src/components/data-entry/cascader.tsx`，再改业务页面。

相关设计和代码产物：

- `design/components/data-entry.lib.pen`：Data Entry 控件的 Pencil 源组件库。
- `frontend/src/components/data-entry/select.tsx`：当前 Select 封装，Cascader 组件应沿用相同封装风格。
- `frontend/src/components/component-code-spec.md`：新增 Cascader 后需要更新的组件治理文档。
- `frontend/src/types/rules.ts`：前端规则类型契约。
- `backend/app/models/entities.py`：后端 `RuleCategory` 枚举和质控规则存储模型。
- `backend/data/aicompare.db`：需要执行确定性清洗的本地 SQLite 数据。

## 目标 / 非目标

**目标：**

- 先在 Pencil Data Entry 组件库中增加 Cascader 设计系统组件，再生成可复用 React 封装。
- 在规则校验、管理员 UI、操作员 payload 映射、mock 和测试中，将 `admission_record` 替换为 `admission_record_child`、`admission_record_female`、`admission_record_male`。
- 按 ID 范围清洗现有本地 `quality_rules` 数据：
  - 1-42：`admission_record_child`
  - 43-95：`admission_record_female`
  - 96-140：`admission_record_male`
- 按每条手动标注条目的 `quality_rule_id` 清洗 `quality_rule_category_snapshot`。
- 将操作员质控规则 popover 改为纵向 tab，保证未来规则类型增加后仍可使用。
- 将手动标注新建/编辑条目的规则选择从分组 Select 改为支持内容搜索的 Cascader。

**非目标：**

- 不引入父子规则类型数据模型，也不新增规则层级数据库字段。
- 不修改质控规则内容、分值、软删除行为或重复导入行为。
- 不重新计算既有手动标注的原文 offset、修改建议、备注、规则内容快照或规则分值快照。
- 不根据患者性别或年龄自动匹配规则；规则选择仍由操作员完成。
- 不重构无关组件族，也不重建整个设计系统。

## 技术决策

### 1. 规则类型保持扁平枚举

使用三个新的枚举值，而不是新增 `parent_category` 和 `sub_category` 字段。

目标枚举：

| 值 | 标签 |
|---|---|
| `admission_record_child` | 入院病历-儿童 |
| `admission_record_female` | 入院病历-女性 |
| `admission_record_male` | 入院病历-男性 |
| `first_course_record` | 首次病程记录 |
| `superior_physician_round` | 上级医师查房记录 |
| `daily_course_record` | 日常病程 |
| `discharge_record` | 出院记录 |

理由：现有 schema、管理员 API、操作员任务 payload 和手动标注快照都消费扁平分类。继续使用扁平枚举可以保持数据库和 API 形态稳定，同时满足 UI 展示更细规则类型的需求。

备选方案：新增 `category_group` 和 `category_variant`。这种方案语义上更接近 Cascader 层级，但需要数据库结构、CSV 格式、迁移逻辑和报表兼容范围一起扩大，超过本次需求。

### 2. 清洗后将 `admission_record` 视为 legacy 值

实现完成后，所有 API 校验路径都必须拒绝 `admission_record`，包括管理员创建、更新、筛选、CSV 校验、CSV 导入以及任何后续写入或读取参数校验。操作员 payload 生成也不得再产生 `admission_record`。既有本地数据按已验证 ID 范围清洗一次。如果某个非预期环境中存在 ID 1-140 之外的 `admission_record` 行，清洗逻辑应保留这些行，并在校验输出或测试中暴露剩余数量，避免根据文本内容猜测。

理由：本地数据库已确认存在 140 条连续入院规则。使用已知 ID 分段比内容启发式更可靠，因为部分规则文本在多个分段中重复出现。清洗完成后继续允许 `admission_record` 进入 API 会让新旧分类并存，破坏后续筛选、Cascader 选择和手动标注快照的一致性。

### 3. 手动标注快照按引用规则 ID 清洗

手动标注条目已保存 `quality_rule_id` 和规则分类快照。本次变更只按引用规则 ID 更新 `quality_rule_category_snapshot`：

- 引用规则 1-42：`admission_record_child`
- 引用规则 43-95：`admission_record_female`
- 引用规则 96-140：`admission_record_male`

理由：规则内容和分值快照仍然正确，不应重新计算。只更新分类快照既保留历史标注，又让报表和详情展示与规则拆分保持一致。

### 4. 设计系统先于业务页面

实施顺序必须是：

1. 在 `design/components/data-entry.lib.pen` 中增加 Cascader 视觉状态。
2. 在 `frontend/src/components/data-entry/cascader.tsx` 中生成或手写对应封装，并沿用 Select 的封装风格。
3. 更新 `frontend/src/components/component-code-spec.md`，记录 Cascader 和使用规则。
4. 再更新管理员和操作员业务代码。

理由：手动标注页面应消费基础组件，而不是在业务代码中直接拼 raw Ant Design Cascader。

### 5. Cascader 封装沿用 Select 封装风格

`frontend/src/components/data-entry/cascader.tsx` 应封装 Ant Design Cascader，并暴露小而稳定的本地 props：

- `searchable?: boolean` 映射到 `showSearch`。
- `open?: boolean`。
- `variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'`。
- `size?: 'default' | 'small' | 'large'`，其中 `default` 映射为 AntD `middle`。
- `state?: 'default' | 'hover' | 'active'`。
- 透传 `options`、`value`、`onChange`、`placeholder`、`disabled`、`status` 和 popup class 配置。

组件必须像现有 Select 一样，保证选中值、placeholder、popup option 和 checked option 都保持普通字重。

### 6. 手动标注 Cascader 值映射为规则 ID

Cascader 使用两级 option 树：

```text
规则类型 -> 质控规则
```

叶子节点 value 使用质控规则 ID。表单内部可以保存 Cascader path，但提交 payload 继续发送既有 `quality_rule_id` 和规则快照字段，避免改变后端提交契约。

### 7. 规则 popover 使用纵向 tab

对比工作台和手动工作台的规则上下文 popover 都使用 `Tabs` 的 `placement="left"` 或等价 AntD 纵向 tab 行为。tab 列表需要固定可视高度并支持纵向滚动；规则内容区域保持只读并独立滚动。

## 风险 / 权衡

- [风险] 未来数据库可能存在已验证 ID 范围外的 `admission_record` 行。→ 缓解：清洗只覆盖已知范围，并增加校验或测试暴露剩余 legacy 行，避免静默猜测。
- [风险] 手动标注快照历史上承诺不受后续规则修改影响。→ 缓解：将本次定义为规则类型拆分导致的一次性分类归一化，不修改内容或分值快照。
- [风险] Cascader 搜索可能命中规则类型但未选择叶子规则。→ 缓解：手动标注场景只允许叶子规则作为有效选择，并在保存前校验 `qualityRuleId`。
- [风险] popover 内纵向 tab 可能过宽或裁切内容。→ 缓解：设置明确 popover 宽度、最大高度、可滚动 tab 列表和内容滚动区，并用七类规则验收。
- [风险] 分类颜色映射和标签可能在枚举扩展后遗漏。→ 缓解：尽量在 `frontend/src/types/rules.ts` 集中维护标签，并同步更新表格标签、筛选、mock 和操作员映射。

## 迁移计划

1. 应用本地清洗前，先备份或检查 `backend/data/aicompare.db`。
2. 在后端和前端契约中增加新枚举值。
3. 在应用启动兼容路径或聚焦的本地迁移辅助逻辑中增加确定性清洗：
   - 按 ID 范围更新 legacy 入院规则的 `quality_rules.category`。
   - 按 joined `quality_rule_id` 更新 `manual_annotation_entries.quality_rule_category_snapshot`。
4. 清洗后运行校验查询：
   - ID 1-140 范围内没有 `admission_record`。
   - 三个新入院分类数量分别为 42、53、45。
   - 手动标注条目引用这些规则时，分类快照使用新的分类值。
5. 如果在创建新数据前需要回滚，可将 ID 1-140 和受影响手动快照恢复为 `admission_record`。如果已经产生新数据，回滚应作为数据修复单独评估。
