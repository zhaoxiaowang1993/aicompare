## 目的

定义操作员标注工作台的展示结构、内容渲染、质控规则上下文和页面状态。

## ADDED Requirements

### Requirement: 三栏对比工作台
系统 MUST 将标注任务展示为三栏工作台，使病历内容、输出 A 和输出 B 作为并行评审区域同时可见。

#### Scenario: 任务成功加载
- **GIVEN** 下一条任务 API 返回任务 payload
- **WHEN** 标注页面渲染
- **THEN** 页面展示三栏结构，最左侧为病历原文，中间为输出 A，右侧为输出 B
- **AND** 左侧病历原文栏 title 区展示住院号
- **AND** 标注表单保持可见，且不会遮挡对比上下文

#### Scenario: 存在长内容
- **GIVEN** 病历文本或输出文本超过视口高度
- **WHEN** 标注页面渲染
- **THEN** 每个评审区域支持独立滚动
- **AND** 页面级操作控件仍然可访问

### Requirement: 病历与 AI 输出内容渲染
系统 MUST 渲染病历和输出字段中的 Markdown 与安全 HTML-like 源内容，并 SHALL 保留适合临床评审的可读格式。

#### Scenario: 输出包含 Markdown
- **GIVEN** 输出 A 或输出 B 包含 Markdown 标题、列表或强调
- **WHEN** 工作台渲染该输出
- **THEN** 操作员可以看到格式化后的结构

#### Scenario: 输出包含不支持或不安全标记
- **GIVEN** 输出内容包含不支持或不安全的 HTML
- **WHEN** 工作台渲染该输出
- **THEN** 不安全行为不会被执行
- **AND** 可读文本内容仍可用于评审

### Requirement: 质控规则上下文
系统 SHALL 通过左侧病历原文 title 区的“查看质控规则”文字按钮展示任务 API 返回的相关质控规则上下文，并 MUST NOT 允许操作员编辑质控规则。

#### Scenario: 任务包含质控规则
- **GIVEN** 任务 payload 包含一个或多个质控规则
- **WHEN** 操作员点击“查看质控规则”
- **THEN** 页面在按钮右侧弹出 popover
- **AND** popover 不遮挡左侧病历原文
- **AND** popover 以只读方式展示规则分类、规则内容和分值

#### Scenario: 按文书类型切换规则
- **GIVEN** 质控规则包含多个文书类型分类
- **WHEN** 操作员在 popover 面板中切换文书类型
- **THEN** popover 仅展示当前文书类型对应的规则列表

#### Scenario: 任务没有质控规则
- **GIVEN** 任务 payload 中质控规则列表为空
- **WHEN** 操作员点击“查看质控规则”
- **THEN** popover 展示低干扰的无规则状态

### Requirement: 工作台加载、错误与完成状态
系统 MUST 提供明确的加载中、可重试错误、无权限、计划关闭和计划完成状态。

#### Scenario: 任务加载中
- **GIVEN** 标注页面已经请求下一条任务
- **WHEN** 请求仍在进行
- **THEN** 页面展示加载中状态，且不展示过期任务内容

#### Scenario: 任务请求发生可重试错误
- **GIVEN** 任务请求因临时服务端错误或网络错误失败
- **WHEN** 标注页面渲染失败状态
- **THEN** 页面展示错误状态和重试操作

#### Scenario: 计划已完成
- **GIVEN** 下一条任务 API 返回 `null`
- **WHEN** 标注页面渲染
- **THEN** 页面展示完成状态
- **AND** 主要导航操作返回 `/operator/plans`
