## ADDED Requirements

### Requirement: Cascader 设计系统组件
系统 SHALL 在任何业务页面使用 Cascader 交互前，先在 `design/components/data-entry.lib.pen` 中提供 Data Entry Cascader 组件。

#### Scenario: Pencil 组件库包含 Cascader
- **GIVEN** 打开 Data Entry 设计组件库
- **WHEN** 设计师或实现者搜索 Cascader
- **THEN** 组件库中包含可复用的 Cascader 组件变体，覆盖默认、hover、active/open、disabled 和校验状态
- **AND** 该组件使用与现有 Input 和 Select 一致的 token 驱动视觉语言

#### Scenario: Cascader 展开态被设计表达
- **GIVEN** 查看 Cascader 设计组件
- **WHEN** 选择 active/open 变体
- **THEN** 设计稿展示包含至少两列的 popup，用于表达规则类型和叶子选项层级
- **AND** 设计稿中可见 option 行、选中态、hover 态和 popup 间距

### Requirement: Cascader React 组件
系统 SHALL 在业务页面直接引用 Cascader 前，先在 `frontend/src/components/data-entry/cascader.tsx` 中提供可复用 React 封装。

#### Scenario: 业务页面引入 Cascader
- **GIVEN** 某个业务页面需要层级选择
- **WHEN** 页面从 `frontend/src/components/data-entry/cascader.tsx` 引入组件
- **THEN** 该引入暴露一个符合项目本地组件约定的 Ant Design Cascader 封装
- **AND** 同一交互场景下，业务页面 MUST NOT 直接引入 raw Ant Design Cascader

#### Scenario: Cascader 支持项目状态
- **GIVEN** Cascader 组件使用 `size`、`variant`、`state`、`open`、`disabled`、`status` 或 `searchable` props 渲染
- **WHEN** 组件将这些 props 映射到 Ant Design 行为
- **THEN** `size="default"` 映射为 Ant Design `middle`
- **AND** `searchable` 开启 Cascader 搜索
- **AND** hover 和 active 状态使用现有 CSS variables，而不是硬编码颜色

#### Scenario: Cascader 字重遵循 Select 规则
- **GIVEN** Cascader 已选中某个值，或 popup 中某个选项被高亮
- **WHEN** 组件渲染选中值、placeholder、option 文本或 checked option 文本
- **THEN** 这些文本节点使用与现有 Select 组件一致的普通字重

### Requirement: Cascader 文档
系统 SHALL 更新组件治理文档，使后续页面清楚何时以及如何使用 Cascader 组件。

#### Scenario: 组件代码规范列出 Cascader
- **GIVEN** 打开 `frontend/src/components/component-code-spec.md`
- **WHEN** 阅读 Data Entry 组件表
- **THEN** 文档列出 Cascader 的文件路径和用途
- **AND** 使用规则说明业务页面应使用本地 Cascader 封装处理层级选项选择
