## 为什么

当前质控规则把所有入院病历都归为同一个 `admission_record` 类型，已经无法匹配新的临床规则集。标注工作流也需要可扩展的规则类型导航，以及可复用的 Cascader 基础组件，才能在未来规则类型继续增加时保持页面可用。

## 变更内容

- **破坏性变更**：将现有 `admission_record` 规则类型拆分为 `admission_record_child`、`admission_record_female`、`admission_record_male` 三个允许值。
- 对现有本地 `quality_rules` 数据执行一次性清洗：
  - ID 1-42 清洗为 `admission_record_child`。
  - ID 43-95 清洗为 `admission_record_female`。
  - ID 96-140 清洗为 `admission_record_male`。
- 按每条历史手动标注条目引用的 `quality_rule_id` 清洗规则分类快照，使既有手动标注数据与拆分后的入院规则类型保持一致。
- 更新管理员规则新增、编辑、筛选、导入、模板下载行为，统一使用新的规则类型集合，并拒绝 legacy `admission_record`。
- 在 `design/components/data-entry.lib.pen` 中增加可复用 Cascader 设计，并在 `frontend/src/components/data-entry/cascader.tsx` 中生成对应 React 组件。
- 将操作员工作台的质控规则 popover 从横向 tab 改为可纵向滚动的左侧 tab。
- 将手动标注新建/编辑条目的质控规则选择控件改为 Cascader，并支持按规则内容搜索。

## 能力范围

### 新增能力
- `data-entry-cascader`：提供 Cascader 选择控件的设计系统和 React 组件基础，覆盖业务页面需要的基础、搜索、禁用、状态和展开态。

### 修改能力
- `admin-rules-management`：更新允许的规则类型契约、CSV 模板和导入校验、管理员筛选，以及本地质控规则数据清洗。
- `operator-annotation-workbench`：将操作员质控规则上下文切换改为纵向 tab，并将手动标注规则选择改为 Cascader 交互。
- `operator-annotation-submission`：定义入院病历规则类型拆分后，历史手动标注规则分类快照的一次性清洗要求。

## 影响范围

- 设计产物：`design/components/data-entry.lib.pen`、新 Cascader 组件的生成契约说明和验收检查。
- 前端组件：`frontend/src/components/data-entry/cascader.tsx`、`frontend/src/components/component-code-spec.md`，以及消费规则类型的页面。
- 前端业务代码：管理员规则页组件、操作员规则 popover、手动标注布局、API 映射、类型定义和 mock 数据。
- 后端代码：`RuleCategory`、规则 schema、管理员规则 router、CSV 解析和模板生成、操作员任务规则 payload、启动/本地数据清洗逻辑和测试。
- 数据：本地 SQLite 中的 `quality_rules.category` 和 `manual_annotation_entries.quality_rule_category_snapshot` 需要按既有规则 ID 执行确定性清洗。
