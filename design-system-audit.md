# 设计系统审计报告

审计日期：2026-04-29

审计范围：
- `design/tokens.lib.pen`
- `design/components/*.lib.pen`
- `frontend/src/styles/globals.css`
- `frontend/tailwind.config.ts`
- `frontend/src/components`

说明：
- 本次审计未修改任何既有设计系统源文件。
- 最终校验显示，工作区中唯一由本次审计新增的文件是本报告。

## 一、`design/tokens.lib.pen` 审计

### variables 统计

`tokens.lib.pen` 当前实际定义了 285 个 variables。

| 分类 | 数量 | 变量 |
| --- | ---: | --- |
| 颜色 | 253 | Ant 风格色板：`color-blue-*`、`color-cyan-*`、`color-geekblue-*`、`color-gold-*`、`color-gray-*`、`color-green-*`、`color-lime-*`、`color-magenta-*`、`color-orange-*`、`color-purple-*`、`color-red-*`、`color-volcano-*`、`color-yellow-*`；大多数色板包含 `1`-`10` 与 `*-dark`，灰阶包含 `1`-`13` |
| 字号 | 11 | `font-size`、`font-size-heading-1`、`font-size-heading-2`、`font-size-heading-3`、`font-size-heading-4`、`font-size-heading-5`、`font-size-lg`、`font-size-sm`、`font-size-xl`、`font-size-xs`、`font-size-xxs` |
| 字重 | 0 | 未沉淀 |
| 行高 | 4 | `line-height-compact`、`line-height-loose`、`line-height-relaxed`、`line-height-xs` |
| 间距 | 8 | `space-4`、`space-8`、`space-12`、`space-16`、`space-20`、`space-24`、`space-32`、`space-48` |
| 圆角 | 8 | `radius`、`radius-xs`、`radius-sm`、`radius-lg`、`radius-xl`、`radius-xxl`、`radius-full`、`radius-outer` |
| 描边 | 0 | 未沉淀 |
| 阴影 | 0 | 未沉淀 |
| 动效 | 0 | 未沉淀 |
| 响应式 | 0 | 未沉淀 |
| z-index | 0 | 未沉淀 |
| 组件 token | 0 | 未沉淀 |
| 其他 | 1 | `test-var` |

### 画板规范

顶层画板：
- `Map`
- `Seed`
- `Alias`
- `Responsive`
- `Text Styles`
- `Components`
- `Colors`
- `Colors`

各画板观察到的规范：
- `Seed`：定义 seed 规范，例如 `colorPrimary`、`colorSuccess`、`colorWarning`、`colorError`、`colorInfo`、`colorTextBase`、`colorBgBase`、`sizeUnit`、`sizeStep`、`controlHeight`、`fontFamily`、`fontFamilyCode`、`fontSize`、`lineWidth`、`hairline`、`borderRadius`、`zIndexPopupBase`、`lineType`、`motion`、动效曲线、`motionUnit`、`wireframe`。
- `Map`：定义语义映射规范，例如 `colorPrimaryBg`、`colorPrimaryHover`、`colorPrimaryActive`、`colorSuccess*`、`colorWarning*`、`colorError*`、`colorInfo*`、`colorText*`、`colorBorder*`、`colorFill*`、`colorBg*`、`size*`、`controlHeight*`、`borderRadius*`、`fontSize*`、`lineHeight*`。
- `Alias`：定义 alias 规范，例如 `colorLink*`、`colorSplit`、`fontSizeIcon`、`padding*`、`margin*`、内容区 padding、`colorTextPlaceholder`、`colorTextDisabled`、`colorTextHeading`、`colorIcon*`、`controlItem*`、`controlOutline*`、`opacityLoading`、`screenXS` 到 `screenXXL`、`lineWidthFocus`、链接装饰。
- `Responsive`：定义 `device`、`deviceMin`、`deviceMax`、`hideOn*`、`only*`、`gutter`、`pageOffset`。
- `Text Styles`：定义 `XXSmall`、`XSmall`、`Small`、`Base`、`Large`、`Huge`、`Heading`，并包含 regular、medium、strong、heading 等文本样式。
- `Components`：定义大量组件 token 画板，包括 `Button`、`Typography`、`Divider`、`Layout`、`Splitter`、`Anchor`、`Breadcrumb`、`Dropdown`、`Menu`、`Pagination`、`Steps`、`Tabs`、`AutoComplete`、`Cascader`、`Input`、`DatePicker`、`Form`、`InputNumber`、`Mentions`、`Radio`、`Rate`、`Select`、`Slider`、`Switch`、`TimePicker`、`Transfer`、`TreeSelect`、`Upload`、`Avatar`、`Badge`、`Calendar`、`Card`、`Carousel`、`Descriptions`、`Image`、`List`、`Popover`、`Segmented`、`Statistic`、`Table`、`Tag`、`Timeline`、`Tooltip`、`Tour`、`Tree`、`Alert`、`Drawer`、`Message`、`Modal`、`Notification`、`Progress`、`Popconfirm`、`Result`、`Skeleton`、`Spin`、`Collapse`。
- `Colors`：视觉色板展示画板。

### 未沉淀为 variables 的画板规范

主要缺口：
- 语义颜色：`colorPrimary`、`colorText`、`colorBgContainer`、`colorBorder`、状态色别名、链接色别名、填充色别名。
- 字体族：`fontFamily`、`fontFamilyCode`、前端使用的 `font-family-*`。
- 字重：regular、medium、semibold、bold。
- 常用行高：`line-height`、`line-height-sm`、`line-height-lg`、`line-height-heading`。
- 描边/线宽：`lineWidth`、`lineWidthFocus`、`lineType`、`hairline`。
- 阴影：按钮、卡片、弹窗、控件阴影未正式 token 化。
- 动效：`motion`、动效曲线、`motionUnit`。
- 响应式：screen、device、gutter、page offset 规则。
- z-index：`zIndexPopupBase`。
- 组件 token：组件画板目前更像文档/规范，没有进入全局 variables。
- `test-var` 已进入 variables，但看起来是临时 token。

## 二、`design/components/*.lib.pen` 审计

### 文件统计

| 文件 | 本地变量数量 | `$token` 引用数 | 不存在于 `tokens.lib.pen` 的 `$token` 数 | 仍硬编码的属性 |
| --- | ---: | ---: | ---: | --- |
| `data-display-new.lib.pen` | 367 | 110 | 57 | `cornerRadius` 5735、`fontWeight` 7063、`padding` 12279、`gap` 4414、`fill` 29 |
| `data-entry-new.lib.pen` | 350 | 79 | 52 | `cornerRadius` 1802、`padding` 2987、`fontWeight` 1919、`gap` 827、`fill` 27 |
| `feedback-new.lib.pen` | 395 | 74 | 62 | `cornerRadius` 353、`padding` 495、`fontWeight` 410、`gap` 565 |
| `general-new.lib.pen` | 320 | 31 | 29 | `fill` 8、`cornerRadius` 1089、`stroke.fill` 2、`gap` 1080、`padding` 648、`fontWeight` 432 |
| `layout-new.lib.pen` | 364 | 41 | 33 | `cornerRadius` 642、`padding` 1069、`gap` 655、`fill` 24、`fontWeight` 874 |
| `navigation-new.lib.pen` | 371 | 46 | 36 | `cornerRadius` 1011、`gap` 1136、`fontWeight` 1414、`padding` 1837 |

判断：每个组件库文件都携带了大量本地变量。很多 `$token` 能在对应 `.lib.pen` 的本地 variables 中解析，但不能解析到目标全局源 `design/tokens.lib.pen`。

### 缺失 `$token` 总览

组件库共使用 122 个不存在于 `tokens.lib.pen` variables 的 `$token`：

`color-000000-08`、`color-000000-0d`、`color-000000-14`、`color-000000-17`、`color-000000-1f`、`color-000000-26`、`color-000000-29`、`color-000000-4d`、`color-000000-a6`、`color-000000-d9`、`color-0000ff`、`color-00230b-33`、`color-00ff00`、`color-00ffff`、`color-050505-0f`、`color-0a60ff`、`color-148eff`、`color-1677ff-1a`、`color-192064`、`color-222529`、`color-252525-ab`、`color-29cdff`、`color-2b0849`、`color-2ec7ff`、`color-3496ff`、`color-416fdc`、`color-4285eb`、`color-520038`、`color-5389f5`、`color-552950`、`color-5ba02e`、`color-5c2552`、`color-648bd8`、`color-666666`、`color-7a13aa`、`color-7bb2f9`、`color-7c90a5`、`color-7ca5f7`、`color-8a38f5`、`color-919191-26`、`color-92c110`、`color-96a1c5-5f`、`color-9747ff`、`color-a26ef4`、`color-a3b4c6`、`color-a4aaba`、`color-a9a9a9-4d`、`color-adddff`、`color-aeb8c2`、`color-b6cfff`、`color-bfcddd`、`color-bg-container`、`color-bg-container-disabled`、`color-bg-layout`、`color-black`、`color-border`、`color-border-secondary`、`color-border-subtle`、`color-c4d6fc`、`color-cbd1d1`、`color-cc9b6e`、`color-db836e`、`color-dce0e6`、`color-dce9ff`、`color-dedede-00`、`color-e4ebf7`、`color-e59788`、`color-eee1ff-03`、`color-eeeff1`、`color-error`、`color-error-active`、`color-error-bg`、`color-error-bg-hover`、`color-error-border`、`color-error-hover`、`color-error-shadow`、`color-f0faff`、`color-f2d7ad`、`color-f4d19d`、`color-f51d2c`、`color-f5f5f7`、`color-f74a5c`、`color-fa816e`、`color-fa8e7d`、`color-ff0000`、`color-ff00ff`、`color-ff603b`、`color-ffb594`、`color-ffc6a0`、`color-fff2f0`、`color-ffff00-cd`、`color-fill-quaternary`、`color-fill-secondary`、`color-fill-tertiary`、`color-layout-sider-bg`、`color-layout-sider-bg-dark`、`color-primary`、`color-primary-active`、`color-primary-bg`、`color-primary-bg-hover`、`color-primary-border`、`color-primary-border-hover`、`color-primary-hover`、`color-primary-shadow`、`color-success`、`color-success-active`、`color-success-bg`、`color-success-border`、`color-text`、`color-text-disabled`、`color-text-secondary`、`color-transparent`、`color-transparent-white`、`color-warning`、`color-warning-bg`、`color-warning-border`、`color-warning-shadow`、`color-white`、`color-white-alpha-25`、`color-white-alpha-65`、`line-height`、`line-height-sm`。

### 分文件缺失重点

- `data-display-new.lib.pen`：缺少 `color-bg-container`、`color-border`、`color-primary*`、`color-text*`、`color-fill-*`、`color-success*` 等语义色，以及 `line-height`、`line-height-sm`。
- `data-entry-new.lib.pen`：缺少表单/控件语义色、warning/error 阴影、原始导入色，以及 `line-height`、`line-height-sm`。
- `feedback-new.lib.pen`：缺少反馈语义色、插图/导入色、状态色，以及 `line-height`、`line-height-sm`。
- `general-new.lib.pen`：缺少按钮/通用颜色，例如 `color-primary*`、`color-error*`、`color-bg-container-disabled`、`color-border-subtle`、`color-white`，以及 `line-height`、`line-height-sm`。
- `layout-new.lib.pen`：缺少布局色，例如 `color-layout-sider-bg`、`color-layout-sider-bg-dark`、`color-white-alpha-*`、渐变色，以及 `line-height`、`line-height-sm`。
- `navigation-new.lib.pen`：缺少导航/布局语义色、`color-white-alpha-*`，以及 `line-height`、`line-height-sm`。

### 硬编码模式

`.lib.pen` 文件中仍存在以下硬编码：
- `cornerRadius`：例如 `8`、`10`、`16`。
- `gap`：例如 `4`、`8`、`10`、`12`。
- `padding`：数字数组或单个数字。
- `fontWeight`：例如 `normal`、`700`。
- `fill`：部分 fill 对象虽然包含 token，但处于 disabled；也存在图片和渐变 fill。
- `stroke.fill`：部分文件中存在。

这些统计包含组件展示/规格画板，不只代表可复用原子节点。

## 三、frontend 审计

### `globals.css`

`frontend/src/styles/globals.css` 当前定义 465 个 CSS variables。

已出现的变量组：
- 颜色变量：色板色、原始导入色、语义别名，例如 `--color-primary`、`--color-text`、`--color-bg-container`、状态色、布局色、白色透明度变量。
- 字体变量：`--font-family-base`、`--font-family-heading`、`--font-family-mono`、`--font-weight-*`、`--font-size-*`。
- 行高变量：`--line-height`、`--line-height-sm`、`--line-height-lg`、`--line-height-heading`，以及 compact、relaxed、loose、xs。
- 圆角变量：`--radius*`。
- 间距变量：`--space-*`。
- 其他：`--test-var`。

有 180 个 CSS variables 不存在于 `tokens.lib.pen`。缺失集合主要是语义别名和原始导入色，包括：

`color-bg-container`、`color-bg-container-disabled`、`color-bg-layout`、`color-black`、`color-border`、`color-border-secondary`、`color-border-subtle`、`color-error`、`color-error-active`、`color-error-bg`、`color-error-bg-hover`、`color-error-border`、`color-error-hover`、`color-error-shadow`、`color-fill-quaternary`、`color-fill-secondary`、`color-fill-tertiary`、`color-info-bg`、`color-info-border`、`color-layout-sider-bg`、`color-layout-sider-bg-dark`、`color-primary`、`color-primary-active`、`color-primary-bg`、`color-primary-bg-hover`、`color-primary-border`、`color-primary-border-hover`、`color-primary-hover`、`color-primary-shadow`、`color-success`、`color-success-active`、`color-success-bg`、`color-success-border`、`color-text`、`color-text-disabled`、`color-text-secondary`、`color-transparent`、`color-transparent-white`、`color-warning`、`color-warning-bg`、`color-warning-border`、`color-warning-shadow`、`color-white`、`color-white-alpha-12`、`color-white-alpha-25`、`color-white-alpha-40`、`color-white-alpha-65`、`color-white-alpha-85`、`font-family-base`、`font-family-heading`、`font-family-mono`、`font-weight-bold`、`font-weight-medium`、`font-weight-regular`、`font-weight-semibold`、`line-height`、`line-height-heading`、`line-height-lg`、`line-height-sm`。

另有大量原始/导入色变量也不在 `tokens.lib.pen`，例如 `color-000000-*`、`color-ffffff-*`、`color-222529`、`color-7a13aa`、`color-8a38f5`、`color-9747ff`，以及多组插图/渐变色。

### `tailwind.config.ts`

Tailwind 当前暴露 82 个基于 CSS variable 的 token：
- 颜色：48 个，多为 `color-primary`、`color-text`、`color-bg-container`、状态色、布局色、白色透明度等语义别名。
- 间距：8 个，`space-4` 到 `space-48`。
- 字体族：3 个。
- 字号：11 个。
- 字重：4 个。
- 行高：8 个。

其中 59 个 Tailwind 暴露变量不存在于 `tokens.lib.pen`：

`color-bg-container`、`color-bg-container-disabled`、`color-bg-layout`、`color-black`、`color-border`、`color-border-secondary`、`color-border-subtle`、`color-error`、`color-error-active`、`color-error-bg`、`color-error-bg-hover`、`color-error-border`、`color-error-hover`、`color-error-shadow`、`color-fill-quaternary`、`color-fill-secondary`、`color-fill-tertiary`、`color-info-bg`、`color-info-border`、`color-layout-sider-bg`、`color-layout-sider-bg-dark`、`color-primary`、`color-primary-active`、`color-primary-bg`、`color-primary-bg-hover`、`color-primary-border`、`color-primary-border-hover`、`color-primary-hover`、`color-primary-shadow`、`color-success`、`color-success-active`、`color-success-bg`、`color-success-border`、`color-text`、`color-text-disabled`、`color-text-secondary`、`color-transparent`、`color-transparent-white`、`color-warning`、`color-warning-bg`、`color-warning-border`、`color-warning-shadow`、`color-white`、`color-white-alpha-12`、`color-white-alpha-25`、`color-white-alpha-40`、`color-white-alpha-65`、`color-white-alpha-85`、`font-family-base`、`font-family-heading`、`font-family-mono`、`font-weight-bold`、`font-weight-medium`、`font-weight-regular`、`font-weight-semibold`、`line-height`、`line-height-heading`、`line-height-lg`、`line-height-sm`。

明显缺口：`tokens.lib.pen` 和 `globals.css` 都有 `radius*`，但 Tailwind 没有暴露圆角 token。

### React 组件

React 组件共使用 62 个唯一 `var(--xxx)` 引用。

其中 22 个 React 正在使用的变量不存在于 `tokens.lib.pen`：

`color-000000-17`、`color-bg-container`、`color-bg-layout`、`color-border`、`color-error`、`color-error-active`、`color-error-hover`、`color-fill-quaternary`、`color-fill-secondary`、`color-layout-sider-bg`、`color-primary`、`color-primary-active`、`color-primary-bg`、`color-primary-border`、`color-primary-hover`、`color-primary-shadow`、`color-success`、`color-text`、`color-text-disabled`、`color-text-secondary`、`color-warning`、`color-white`。

使用 `var(--xxx)` 的文件：
- `data-display/badge.tsx`：色板色和状态色。
- `data-display/card.tsx`：`color-bg-container`、`color-000000-17`。
- `data-display/empty.tsx`：`color-text-secondary`。
- `data-display/table.tsx`：`color-bg-container`、`color-bg-layout`。
- `data-display/tag.tsx`：大量色板色、状态色、语义色。
- `data-entry/*`：primary、error、text、控件相关颜色。
- `feedback/*`：primary hover、文本色、状态色。
- `layout/layout.tsx`：布局背景、侧边栏、文本、白色。
- `navigation/*`：primary、文本色、error。

前端硬编码情况：
- `frontend/src/components` 中未发现直接十六进制颜色。
- 发现固定尺寸值：`4px`、`7px`、`10px`、`22px`、`280px`。
- 任意值尺寸类包括 `[4px]`、`[7px]`、`[10px]`、`[22px]`、`[280px]`。
- 圆角类使用 Tailwind 默认值：`rounded`、`rounded-lg`、`rounded-md`、`rounded-none`、`rounded-t`。
- 间距类使用 Tailwind 默认刻度或任意值：`gap-1`、`gap-2`、`gap-3`、`gap-4`、`gap-6`、`mb-4`、`mb-6`、`my-1`、`my-2`、`my-4`、`my-6`、`my-8`、`p-0`、`p-3`、`p-6`、`pr-12`、`px-0`、`px-1.5`、`px-12`、`px-2`、`px-3`、`px-4`、`px-[7px]`、`py-0`、`py-2`、`py-3`。
- 字号类使用 `text-xs`、`text-sm`、`text-base`。

## 四、结论

### 当前系统是否已经完全由 `tokens.lib.pen` 驱动

没有。

`tokens.lib.pen` 还不是完整 source of truth。它目前主要包含 seed 色板、字号、少量行高、间距、圆角和 `test-var`。当前前端和 Pencil 组件库大量依赖语义别名、原始导入色、字体族、字重、常用行高和组件级 token，而这些并没有进入 `tokens.lib.pen` variables。

### 主要断层

1. `tokens.lib.pen` variables 远小于其画板中已经表达的设计语言。
2. `design/components/*.lib.pen` 各自携带大量本地变量，并引用许多 `tokens.lib.pen` 不存在的变量。
3. `globals.css` 更像是组件本地变量与语义变量的合并输出，而不是严格从 `tokens.lib.pen` 生成的输出。
4. `tailwind.config.ts` 暴露了大量 `tokens.lib.pen` 中不存在的语义变量。
5. React 组件虽然大多通过 CSS variables 使用颜色，但这些变量经常不在 `tokens.lib.pen` 中。
6. 圆角、间距、字号和布局尺寸仍大量使用 Tailwind 默认类或字面量。
7. 动效、z-index、响应式、阴影、描边、字重、组件 token 等画板规范仍停留在视觉文档层，没有正式变量化。

### 推荐治理优先级

1. 优先治理 `tokens.lib.pen`：明确 Seed、Map、Alias、Responsive、Text Styles、Components 画板中哪些规范必须沉淀为 variables。
2. 先补齐语义别名：从 `color-primary*`、`color-text*`、`color-bg-*`、`color-border*`、状态色、`font-family-*`、`font-weight-*`、`line-height`、`line-height-sm`、`line-height-lg`、`line-height-heading` 开始。
3. 处理 `test-var`：删除、改名或明确归类。
4. 明确输出契约：`tokens.lib.pen` -> `globals.css` -> `tailwind.config.ts`；生成物不应包含 source 中不存在的变量。
5. 让 `design/components/*.lib.pen` 消费全局变量，逐步减少组件库本地变量分叉。
6. 在 Tailwind 中暴露圆角 token，并按需替换 React 中的 `rounded-*` 默认类。
7. 等 token 契约稳定后，再替换 React 中固定间距、字号、尺寸类。
8. 业务页面治理应后置，等组件库和 token 输出链路稳定后再迁移。
