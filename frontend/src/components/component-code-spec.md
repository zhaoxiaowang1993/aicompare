# Component Code Spec

日期：2026-05-01

## 文档作用

本文档记录 `frontend/src/components` 当前 React 基础 UI 组件代码的现状、设计系统符合度、业务引用方式和剩余治理债务。

阅读场景：

- 业务页面开发前，确认应优先复用哪些组件代码。
- 组件治理前，确认当前组件与 `design/` 设计系统的关系。
- 代码评审时，判断组件样式是否继续沿用 runtime token，而不是新增业务硬编码。

本文档不是组件 API 完整手册，也不替代 `design/components/specs/component-governace-status.md` 和 `design/components/specs/component-governace-plan.md`。Pencil 组件库仍以 `design/components/*.lib.pen` 为短期视觉契约；React 基础 UI 组件代码是业务前端的组件消费层。业务域组件不放在本目录，应收拢到对应 `frontend/src/pages/<domain>/components` 下。

## 一、当前组件代码现状

当前共有 `24` 个组件文件，按组件族分布如下。

### 1. Data Display

| 文件 | 组件 | 用途 |
|---|---|---|
| `data-display/badge.tsx` | `Badge` | 徽标、状态点、数字徽标、Ribbon。 |
| `data-display/card.tsx` | `Card` | 卡片容器，支持大小、边框和 hover 状态。 |
| `data-display/empty.tsx` | `Empty` | 空状态展示。 |
| `data-display/table.tsx` | `Table` | 表格展示，支持尺寸、边框、空状态和列样式变体。 |
| `data-display/tag.tsx` | `Tag` | 标签、彩色标签、实心/填充/描边、可选中标签。 |

### 2. Data Entry

| 文件 | 组件 | 用途 |
|---|---|---|
| `data-entry/checkbox.tsx` | `Checkbox` | 复选框和复选框组。 |
| `data-entry/form.tsx` | `Form` | 表单和表单项封装。 |
| `data-entry/input.tsx` | `Input` | 输入框、密码框、文本域、搜索框、带 addon 输入框。 |
| `data-entry/radio.tsx` | `Radio` | 单选框、单选组、按钮型单选。 |
| `data-entry/select.tsx` | `Select` | 选择器，支持多选、搜索、展开和状态。 |
| `data-entry/switch.tsx` | `Switch` | 开关，支持文字/图标、尺寸、状态。 |
| `data-entry/upload.tsx` | `Upload` | 上传组件，支持文本、图片、卡片、拖拽等形态。 |

### 3. Feedback

| 文件 | 组件 | 用途 |
|---|---|---|
| `feedback/alert.tsx` | `Alert` | 警告提示，支持类型、描述、banner、关闭和操作区。 |
| `feedback/button.tsx` | `Button` | 按钮，支持颜色、状态、变体、尺寸、形状和内容组合。 |
| `feedback/drawer.tsx` | `Drawer` | 抽屉，支持方向、尺寸、遮罩、页脚、关闭状态。 |
| `feedback/message.tsx` | `Message` | 全局消息提示。 |
| `feedback/modal-dialog.tsx` | `ModalDialog` | Modal 和 Dialog 封装。 |
| `feedback/notification.tsx` | `Notification` | 全局通知提示。 |
| `feedback/result.tsx` | `Result` | 结果页状态展示。 |

### 4. Layout

| 文件 | 组件 | 用途 |
|---|---|---|
| `layout/layout.tsx` | `Layout` | 页面框架布局，支持 header/content/footer、sider、自定义触发器等结构。 |

### 5. Navigation

| 文件 | 组件 | 用途 |
|---|---|---|
| `navigation/breadcrumb.tsx` | `Breadcrumb` | 面包屑导航。 |
| `navigation/menu.tsx` | `Menu` | 菜单，支持主题、模式、选中、危险态等。 |
| `navigation/pagination.tsx` | `Pagination` | 分页器，支持更多、跳转、尺寸和交互态。 |
| `navigation/tabs.tsx` | `Tabs` | 标签页，支持位置、尺寸、卡片、内容布局和交互态。 |

## 二、与 design/ 设计系统的符合度

### 1. 已完成治理的部分

当前组件代码已经完成以下最小治理闭环：

- 组件文件全部来自 `design/components/*.lib.pen` 的组件族导出痕迹，代码注释中保留了来源信息。
- 前端 runtime token 已由 `design/tokens.lib.pen` 派生到：
  - `frontend/src/styles/globals.css`
  - `frontend/tailwind.config.ts`
  - `frontend/src/styles/antd-theme.ts`
  - `frontend/src/styles/tokens.json`
- 组件内未发现明显裸 `hex`、`rgb()`、`hsl()` 色值。
- 组件内 `var(--*)` 引用均已能在 `globals.css` 中找到。
- 已修正以下阻塞级问题：
  - `Card` 不再引用不存在的 `--color-000000-17`。
  - `Input` / `Select` 不再引用不存在的 `--color-primary-shadow`。
  - `Input` error 状态边框必须由组件层统一覆盖到 `.ant-input-status-error` 和 `.ant-input-affix-wrapper-status-error`，避免密码框 affix wrapper 与 AntD 默认边框叠色。
  - `Select` 选中项回填到输入框、下拉已选项均应保持普通字重；组件层和 token 生成的全局 AntD guard 已强制 `selection-item` / popup selected option 使用普通字重。
  - `Message` / toast 文案必须保持普通字重；由于 AntD message 通过 portal 渲染，字重约束已写入 `scripts/sync-design-tokens.ts` 生成的全局样式，业务页面不得自行加粗 toast 内容。
  - `Layout` 不再引用不存在的 `--color-layout-sider-bg`。
  - `Badge` 的关键尺寸、圆角、padding 已改为 badge / radius / space token。

### 2. 当前符合度判断

当前 React 组件库达到“业务开发可使用”的最低标准：

- 核心颜色优先来自 CSS variables 或 AntD theme。
- 交互状态优先引用已有 map / alias / component token。
- 未定义 CSS variable 问题为 `0`。
- 没有为了业务页面新增组件私有硬编码。

当前组件库还没有达到“完整组件 token 化”的标准。它仍是轻量治理状态，不是最终组件系统。

### 3. 剩余债务

阻塞债务：无。

非阻塞债务：

| 范围 | 问题 | 建议处理阶段 |
|---|---|---|
| `data-display/tag.tsx` | 仍有 `min-h-[22px]`、`px-[7px]` 等 Tag 尺寸细节；当前 `tokens.lib.pen` 只有极少 Tag token。 | 后续 Data Display / Tag 组件族治理。 |
| `layout/layout.tsx` | 仍有 `h-16`、`px-12`、`min-h-[280px]` 等结构尺寸；需要结合 `layout-*` 与 `layout-shell-*` 决策。 | 后续 Layout 组件族治理。 |
| 多数组件 | 仍有 `text-[var(--...)]`、`bg-[var(--...)]` 等 Tailwind arbitrary token 写法。引用有效，不是阻塞项。 | 后续可收敛为组件样式层或语义 class。 |
| 多数组件 | 组件 props 是从设计稿导出后轻量整理的状态，尚未按业务使用频率重新设计 API。 | 业务首轮稳定后再重构。 |

## 三、业务系统如何引用组件

业务页面和业务域组件应优先引用 `frontend/src/components` 中的基础 UI 组件，而不是直接使用 AntD 原始组件拼装视觉。仅服务单个业务域的组件应放在对应页面域目录下，例如 `frontend/src/pages/admin/components` 或 `frontend/src/pages/auth/components`。

推荐规则：

1. 页面优先使用本组件库。
2. 样式优先通过组件 props 表达，例如 `size`、`state`、`variant`、`type`、`color`。
3. 页面不直接写裸色值、裸字号、裸圆角、裸阴影。
4. 页面不为单个业务场景修改 `globals.css` 或新增 token。
5. 组件缺少变体时，先记录组件需求；不要在页面中复制组件内部结构后自行改样式。
6. 页面级布局可使用 `Layout` 组件；App Shell 类尺寸优先遵守 `layout-shell-*` 的后续治理方向。
7. 表单、按钮、输入、选择、表格、提示、导航等常见 UI，应优先从对应组件族中选择。
8. 使用 `Select` 时不要在业务页面覆盖选中值字重；单选回填、多选标签和下拉已选项默认都必须保持 `font-normal`。如需强调，应新增明确业务组件，而不是改 Select 基础组件。
9. 使用 toast/message 时不要在业务页面覆盖字号或字重；全局消息默认继承 `--font-size`、`--line-height`、`--font-weight-regular`，错误、成功、警告等状态只通过图标和颜色表达。
10. 使用 `Input` 时不要在业务页面直接覆盖 error 边框；错误态统一通过 `status="error"` 或 Form 校验上下文触发，由组件封装覆盖普通输入框和密码输入框的 AntD 状态类。

示例：

```tsx
import Button from '../components/feedback/button'
import Input from '../components/data-entry/input'
import Table from '../components/data-display/table'

export function ExamplePage() {
  return (
    <>
      <Input state="active" placeholder="请输入" />
      <Button color="primary" variant="solid">
        提交
      </Button>
      <Table dataSource={[]} columns={[]} />
    </>
  )
}
```

当前组件目录没有统一 `index.ts` 聚合导出。业务代码应直接从具体组件文件导入，直到后续建立稳定导出边界。

## 四、后续治理规则

后续治理 `frontend/src/components` 时应遵守：

- 不重建整个组件库。
- 不为了单个页面新增散乱 hardcode。
- 不修改业务页面来适配组件治理。
- 不随意改变组件 props API。
- 不把业务页面样式反向沉淀为设计系统 token。
- 对尺寸、间距、状态、阴影等问题，应优先检查 `design/tokens.lib.pen` 是否已有对应 token。
- 如果源 token 缺失，应记录为组件 token 候选，而不是在组件里临时发明值。
- 间距类使用设计 token 数值语义：`p-16` = 16px，`p-24` = 24px，`gap-8` = 8px。不要按 Tailwind 默认比例理解 `p-6/gap-2`，它们在本项目中会变成 6px/2px，容易造成文字贴边。
- 字号类优先使用语义别名：`text-caption` = 12px，`text-body` / `text-base` / `text-sm` = 14px，`text-body-lg` / `text-lg` = 16px，页面标题使用 `text-heading-*` 或 `text-title*`。需要精确引用原始 token 时使用 `text-token-*`，避免把 Tailwind 的 `text-sm` 误当成设计稿小号字。

推荐后续顺序：

1. `feedback/button.tsx` 与基础交互态。
2. `data-entry/input.tsx`、`select.tsx`、`form.tsx`。
3. `navigation/menu.tsx`、`tabs.tsx`、`pagination.tsx`。
4. `layout/layout.tsx`。
5. `data-display/table.tsx`、`card.tsx`、`tag.tsx`、`badge.tsx`。
