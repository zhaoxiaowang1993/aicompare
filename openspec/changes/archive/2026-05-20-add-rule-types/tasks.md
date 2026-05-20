## 1. 先完善设计系统

- [x] 1.1 阅读 `design/components/data-entry.lib.pen`、现有 Select/Input 组件结构和 `frontend/src/components/component-code-spec.md`，确认 Cascader 应沿用的组件模式。
- [x] 1.2 在 `design/components/data-entry.lib.pen` 中增加可复用 Cascader 变体，覆盖 default、hover、active/open、disabled、validation-status 和 searchable/open popup 状态。
- [x] 1.3 确保 Cascader 设计使用与现有 Data Entry 控件一致的 token 驱动颜色、间距、字重、边框、圆角和阴影。
- [x] 1.4 从 Pencil 导出或截图 Cascader 组件区域，验证 selector、popup 列、选中 option、hover option 和 disabled/status 状态可读。
- [x] 1.5 创建 `frontend/src/components/data-entry/cascader.tsx`，作为 Ant Design Cascader 的生成/本地封装，并镜像现有 Select 封装约定。
- [x] 1.6 支持 Cascader 的 `searchable`、`open`、`variant`、`size`、`state`、`disabled`、`status`、popup class 配置、options、value 和 change handling。
- [x] 1.7 增加字重保护，确保 Cascader 选中值、placeholder、popup option 和 checked option 保持普通字重。
- [x] 1.8 更新 `frontend/src/components/component-code-spec.md`，列出 Cascader，并说明业务页面必须使用本地封装处理层级选择。

## 2. 后端规则类型契约

- [x] 2.1 更新 `backend/app/models/entities.py` 中的 `RuleCategory`，用 `ADMISSION_RECORD_CHILD`、`ADMISSION_RECORD_FEMALE`、`ADMISSION_RECORD_MALE` 替换 `ADMISSION_RECORD`。
- [x] 2.2 更新后端 schema 和校验逻辑，使所有 API 校验路径都拒绝 legacy `admission_record`，包括创建、patch、筛选、CSV 校验和 CSV 导入。
- [x] 2.3 更新 `backend/app/services/rule_import.py` 中的 CSV 类型别名，接受 入院病历-儿童、入院病历-女性、入院病历-男性，并拒绝 入院病历。
- [x] 2.4 更新 `backend/app/routers/admin_rules.py` 中的管理员 CSV 模板，使示例使用一个拆分后的入院病历类型。
- [x] 2.5 更新后端测试，覆盖有效拆分入院类型、非法 legacy 入院类型、CSV 校验、重复导入行为和管理员筛选。

## 3. 本地数据清洗

- [x] 3.1 为本地 SQLite `quality_rules` 中 category 为 `admission_record` 的行增加确定性清洗：ID 1-42 为 `admission_record_child`，43-95 为 `admission_record_female`，96-140 为 `admission_record_male`。
- [x] 3.2 按 joined `quality_rule_id` 和同一 ID 范围，确定性清洗 `manual_annotation_entries.quality_rule_category_snapshot`。
- [x] 3.3 确保清洗保留规则内容、分值、ID、软删除元数据、手动标注原文、offset、内容快照、分值快照、修改建议、备注和时间戳；除非实现不可避免地更新 `updated_at`。
- [x] 3.4 增加校验或测试，暴露 ID 1-140 之外剩余的 `admission_record` 行，禁止根据文本内容启发式分配类型。
- [x] 3.5 清洗后验证本地数据库数量：儿童入院 42、女性入院 53、男性入院 45，且 ID 1-140 范围内 legacy 入院类型为 0。
- [x] 3.6 验证既有引用 ID 1-42 的手动标注条目，其 `quality_rule_category_snapshot` 已为 `admission_record_child`。

## 4. 前端规则类型与管理员 UI

- [x] 4.1 更新 `frontend/src/types/rules.ts` 中的规则类型常量、标签和选项列表，增加三个拆分后的入院类型并移除 legacy `admission_record`。
- [x] 4.2 更新管理员规则表单、筛选、表格 tag 标签、分类颜色和 mock 数据，使用新的规则类型集合。
- [x] 4.3 更新管理员规则 mock 导入和模板行为，使 入院病历 被拒绝，拆分后的入院标签被接受。
- [x] 4.4 在可行范围内检查管理员规则列表、搜索、类型筛选、新增、编辑、删除、模板下载和 CSV 导入流程，覆盖 mock 和 API 模式。

## 5. 操作员规则映射与 Popover

- [x] 5.1 更新操作员前端类型，使质控规则分组可以表示 `admission_record_child`、`admission_record_female` 和 `admission_record_male`。
- [x] 5.2 更新 `frontend/src/api/operator.ts` 中后端规则类型到操作员展示分组的映射，不再把拆分后的入院类型合并回单一 admission 类型。
- [x] 5.3 更新操作员 mock 质控规则，增加儿童、女性、男性入院病历类型的代表数据。
- [x] 5.4 将 `frontend/src/pages/operator/components/quality-rules-popover.tsx` 改为纵向 tabs，并为规则类型列表设置固定高度和纵向滚动。
- [x] 5.5 验证 popover 可以展示全部七类规则，规则内容保持只读，并保留无规则状态。

## 6. 手动标注 Cascader 接入

- [x] 6.1 更新 `ManualQualityRuleOption` 和 `flattenRules`，使手动标注规则保留机器类型值和展示标签。
- [x] 6.2 用新的 Cascader 组件替换 `frontend/src/pages/shared/manual-annotation-layout.tsx` 中的分组 Select。
- [x] 6.3 构建 `规则类型 -> 质控规则` 的 Cascader options，叶子节点 value 使用规则 ID，搜索文本包含类型标签、规则标题和规则内容。
- [x] 6.4 确保新建和编辑手动标注条目时保存选中的叶子规则 ID，并继续提交既有 `quality_rule_id` 和规则快照字段。
- [x] 6.5 增加校验：只选择规则类型但没有选择叶子规则时，不允许保存。
- [x] 6.6 验证手动标注的新建、编辑、校验、保存、删除和提交流程在 Select 替换为 Cascader 后仍然可用。

## 7. 验证

- [x] 7.1 运行覆盖管理员规则和手动标注清洗的后端测试。
- [x] 7.2 运行前端 typecheck/build 或仓库标准前端验证命令。
- [x] 7.3 对管理员规则、操作员规则 popover、手动标注 Cascader 交互做定向 UI smoke 检查。
- [x] 7.4 记录最终数据库校验查询结果，包含拆分后的入院类型数量和手动标注快照清洗结果。
- [x] 7.5 检查 `git diff`，确认设计系统/Cascader 工作先于业务引用，且没有无关文件改动。
