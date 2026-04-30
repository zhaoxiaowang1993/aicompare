# Pencil Component Governance Status

日期：2026-04-30  
状态：阶段性现状记录  
适用范围：`design/components/*.lib.pen`

## 文档目的

本文档记录当前 Pencil 组件库的真实现状，避免后续治理、业务页面设计和 React 组件实现时误判这些 `.lib.pen` 文件的 token 来源。

当前 `design/tokens.lib.pen` 已完成一轮系统性治理，可以作为全局 token source of truth。但 `design/components/*.lib.pen` 的历史来源不同：这些组件文件主要来自既有设计稿 / Figma 导入结果，并在 Pencil 文件内部沉淀了大量本地变量，形成了组件自己的视觉规范快照。

因此，当前阶段必须明确：

- Pencil 组件库不是完全由 `design/tokens.lib.pen` 派生出来的。
- Pencil 组件库中的本地变量是当前组件视觉的内部契约，不等同于全局 token。
- 业务系统设计稿应优先 import 并消费 `design/components/*.lib.pen` 组件。
- 业务系统设计稿不要直接消费底层 `design/tokens.lib.pen` 来重新拼装按钮、表单、菜单等组件。
- 如确有页面级布局、背景、文本层级等需求，应通过公开 token 或后续治理后的组件能力解决，不应在页面内新增散乱本地变量。

本文档的使用场景：

- 业务系统设计开始前，确认页面设计应消费哪些组件库。
- React 组件实现前，确认 `.lib.pen` 中哪些变体应成为代码组件 API。
- 后续组件 token 治理时，识别哪些变量已经与 `tokens.lib.pen` 一致，哪些仍是本地组件契约。
- 多业务系统复用组件库时，明确组件库的冻结基线和治理边界。

## 总体现状

当前纳入审计的组件库文件：

| 文件 | 主要内容 | Reusable Component 数量 | 变量总数 | 与 `tokens.lib.pen` 同名同值 | 同名但值不同 | 仅本地变量 | `$token` 缺失 |
|---|---|---:|---:|---:|---:|---:|---:|
| `data-display.lib.pen` | Badge、Card、Empty、Table、Tag | 431 | 367 | 306 | 6 | 55 | 0 |
| `data-entry.lib.pen` | Form、Checkbox、Input、Radio、Select、Switch、Upload | 672 | 350 | 309 | 6 | 35 | 0 |
| `feedback.lib.pen` | Alert、Drawer、Message、Modal、Notification、Result | 122 | 395 | 311 | 8 | 76 | 0 |
| `general.lib.pen` | Button、Typography | 1227 | 1241 | 1219 | 7 | 15 | 0 |
| `layout.lib.pen` | Layout、Sider、Header、Content、Footer | 20 | 364 | 309 | 6 | 49 | 0 |
| `navigation.lib.pen` | Breadcrumb、Menu、Pagination、Tabs | 322 | 371 | 311 | 6 | 54 | 0 |

说明：

- `$token` 缺失为 0，表示当前文件中的变量引用都能在本文件变量区或 `tokens.lib.pen` 中找到定义。
- “同名但值不同”表示组件文件中存在与 `tokens.lib.pen` 同名的变量，但当前值不一致。这类变量不能直接视为已经完成全局治理。
- “仅本地变量”多为从设计稿导入产生的颜色、透明色、阴影色、特殊组件值或历史测试变量，后续需要逐项分类。
- 审计发现 reusable 组件内部仍存在大量 raw 数值属性，主要集中在 `padding`、`gap`、`cornerRadius`、`fontFamily`、`fontWeight`、`strokeWidth`、阴影数值等。这些 raw 值当前应视为组件视觉快照的一部分，不能在业务页面中继续扩散。

## 文件逐一审计

### `general.lib.pen`

组件内容：

- `Primary Button`
- `Solid Button`
- `Danger Button`
- `Typography`
- `Sub components`

主要 reusable 组件：

- Button：覆盖 primary / default / danger，solid / outlined / text / link 等变体，包含 default、hover、active、disabled 等状态，以及 small / middle / large、default / round / circle、text / iconOnly 等组合。
- Typography：用于基础文本、标题、段落、代码、链接等排版展示和复用。

应用场景：

- 业务系统中所有通用操作按钮应优先使用本文件中的 Button 组件。
- 文本层级、标题和内容排版应优先参考 Typography 组件，而不是在业务设计稿中自行设置字体样式。

变量与硬编码状态：

| 项目 | 数量 / 说明 |
|---|---:|
| 变量总数 | 1241 |
| 与 `tokens.lib.pen` 同名同值 | 1219 |
| 同名但值不同 | 7 |
| 仅本地变量 | 15 |
| `$token` 缺失 | 0 |
| reusable 内 raw 样式 | `cornerRadius`、`gap`、`padding`、`strokeWidth`、`fontSize`、`fontFamily`、`fontWeight`、`lineHeight`、阴影数值 |

同名但值不同：

- `color-bg-solid-active`
- `color-error-bg-hover`
- `color-text-secondary`
- `responsive-hide-on-desktop`
- `responsive-hide-on-desktop-sm`
- `responsive-hide-on-mobile`
- `responsive-hide-on-tablet`

本地变量样例：

- `color-border-subtle`
- `color-code-bg`
- `color-code-border`
- `color-error-shadow`
- `color-primary-shadow`
- `color-tooltip-shadow-1`
- `color-tooltip-shadow-2`
- `color-tooltip-shadow-3`
- `color-transparent`
- `color-transparent-white`
- `color-white-alpha-12`

治理判断：

`general.lib.pen` 已经是当前最接近 `tokens.lib.pen` 的组件文件，但仍不能称为完全由全局 token 驱动。短期应把它作为 Button / Typography 的设计基线；后续再把差异变量反向归类为 Component Token、Alias Token 或废弃项。

### `data-entry.lib.pen`

组件内容：

- `Form`
- `Checkbox`
- `Input`
- `Radio`
- `Select`
- `Switch`
- `Upload`
- 多组 `Sub components`

主要 reusable 组件：

- FormItem、FormItemHorizontal、FormItemLabel、FormItemFooter、RequiredMark
- Checkbox、CheckboxGroup
- Input、Password、Textarea、InputAddon、Search、Prefix、Suffix、Feedback
- Radio、RadioButton、RadioGroup
- Select、Selector、Dropdown、SelectItem、TagItem、SuffixIcon
- Switch、SwitchTextAndIcon
- Upload、Dragger、ListItem、CropImageModal

应用场景：

- 业务系统所有表单录入、选择、开关、上传流程应优先基于本文件组件。
- 表单状态、校验反馈、禁用态、hover / active 状态应以本组件库为视觉来源。

变量与硬编码状态：

| 项目 | 数量 / 说明 |
|---|---:|
| 变量总数 | 350 |
| 与 `tokens.lib.pen` 同名同值 | 309 |
| 同名但值不同 | 6 |
| 仅本地变量 | 35 |
| `$token` 缺失 | 0 |
| reusable 内 raw 样式 | `padding`、`cornerRadius`、`gap`、`strokeWidth`、`fontFamily`、`fontWeight`、阴影数值 |

同名但值不同：

- `color-bg-layout`
- `color-text-secondary`
- `line-height`
- `line-height-lg`
- `line-height-sm`
- `line-height-xs`

本地变量样例：

- `color-error-shadow`
- `color-primary-shadow`
- `color-warning-shadow`
- `color-transparent`
- `color-transparent-white`
- `color-white-alpha-12`
- `color-white-alpha-85`
- `line-height-heading`
- `test-var`

治理判断：

这是业务系统高频依赖的核心组件库。短期不应在页面层重做 Input / Select / Form 样式；中期应优先把表单相关尺寸、状态色、阴影和校验态整理为 Component Token。

### `data-display.lib.pen`

组件内容：

- `Badge`
- `Card`
- `Empty`
- `Table`
- `Tag`
- 多组 `Sub components`

主要 reusable 组件：

- BadgeIcon、Badge、BadgeRibbon、BadgeDot、BadgePreset
- Card、CardInner、CardHeader、CardActions、CardMeta、Cover
- Empty、EmptyImage
- TableColumn、Table、BodyCell、HeaderCell、Sorter、Filter、Pagination
- Tag、TagButton

应用场景：

- 业务系统中的状态标记、数据卡片、空状态、表格和标签展示应优先使用本文件。
- Table 是复杂业务系统的关键组件，后续 React 实现时应优先保留其 header、body、filter、sorter、pagination 等结构语义。

变量与硬编码状态：

| 项目 | 数量 / 说明 |
|---|---:|
| 变量总数 | 367 |
| 与 `tokens.lib.pen` 同名同值 | 306 |
| 同名但值不同 | 6 |
| 仅本地变量 | 55 |
| `$token` 缺失 | 0 |
| reusable 内 raw 样式 | `padding`、`gap`、`cornerRadius`、`strokeWidth`、`fontFamily`、`fontWeight`、阴影数值 |

同名但值不同：

- `color-bg-layout`
- `color-text-secondary`
- `line-height`
- `line-height-lg`
- `line-height-sm`
- `line-height-xs`

本地变量样例：

- `color-primary-shadow`
- `color-transparent`
- `color-transparent-white`
- `color-white-alpha-12`
- `color-white-alpha-85`
- `line-height-heading`
- `test-var`
- 多个 `color-xxxxxx` / `color-xxxxxx-aa` 形式的导入色值变量

治理判断：

该文件存在大量色板型组件，如 Badge、Tag，因此部分 Palette-like 本地颜色在短期内可以保留为组件视觉契约。后续治理时应区分“色板展示组件需要的 palette token”和“偶然导入的局部颜色”。

### `navigation.lib.pen`

组件内容：

- `Breadcrumb`
- `Menu`
- `Pagination`
- `Tabs`
- 多组 `Sub components`

主要 reusable 组件：

- Breadcrumb、BreadcrumbItem、Seperator
- MenuLight、MenuDark、MenuItemLight、MenuItemDark、MenuPopup、MenuSub、HorizontalMenuItem
- PaginationItem、PaginationArrow、PaginationMore
- Tabs、TabsWithContent、TabItem、TabCardItem

应用场景：

- 业务系统的侧边导航、顶部导航、标签页、分页和面包屑应优先基于本文件。
- Menu 的 light / dark、inline / vertical / horizontal、danger / disabled / current 等状态是 React 组件实现时的重要 API 来源。

变量与硬编码状态：

| 项目 | 数量 / 说明 |
|---|---:|
| 变量总数 | 371 |
| 与 `tokens.lib.pen` 同名同值 | 311 |
| 同名但值不同 | 6 |
| 仅本地变量 | 54 |
| `$token` 缺失 | 0 |
| reusable 内 raw 样式 | `gap`、`padding`、`cornerRadius`、`strokeWidth`、`fontFamily`、`fontWeight`、阴影数值 |

同名但值不同：

- `color-bg-layout`
- `color-text-secondary`
- `line-height`
- `line-height-lg`
- `line-height-sm`
- `line-height-xs`

本地变量样例：

- `color-layout-sider-bg`
- `color-layout-sider-bg-dark`
- `color-primary-shadow`
- `color-transparent`
- `color-transparent-white`
- `color-white-alpha-12`
- `color-white-alpha-25`
- `color-white-alpha-40`
- `color-white-alpha-65`
- `color-white-alpha-85`
- `line-height-heading`
- `test-var`

治理判断：

Navigation 组件强依赖状态、层级和主题色。后续应优先把 Menu / Tabs / Pagination 的状态色、item 高度、active bar、popup shadow 等沉淀为 Component Token。

### `layout.lib.pen`

组件内容：

- `Layout`
- `Layout Sider`
- `Layout Content`
- `Layout Header`
- `Layout Footer`
- `Sub components`

主要 reusable 组件：

- Layout：Header / Content / Footer、Header / Sider、多种组合结构
- LayoutSider：dark / light
- LayoutHeader：dark / light、level1 / level2、empty
- LayoutContent：empty、demo1、demo2、demo3
- LayoutFooter、DemoLogo、CollapseButton

应用场景：

- 业务系统页面框架、后台管理布局、侧边栏和顶部栏应优先参考本文件。
- App Shell 与 AntD Layout 的 token 分层应遵守 `token-special-case.md` 中的规则。

变量与硬编码状态：

| 项目 | 数量 / 说明 |
|---|---:|
| 变量总数 | 364 |
| 与 `tokens.lib.pen` 同名同值 | 309 |
| 同名但值不同 | 6 |
| 仅本地变量 | 49 |
| `$token` 缺失 | 0 |
| reusable 内 raw 样式 | `padding`、`gap`、`cornerRadius`、`strokeWidth`、`fontFamily`、`fontWeight`、阴影数值 |

同名但值不同：

- `color-bg-layout`
- `color-text-secondary`
- `line-height`
- `line-height-lg`
- `line-height-sm`
- `line-height-xs`

本地变量样例：

- `color-layout-sider-bg`
- `color-layout-sider-bg-dark`
- `color-primary-shadow`
- `color-transparent`
- `color-transparent-white`
- `color-white-alpha-12`
- `color-white-alpha-25`
- `color-white-alpha-40`
- `color-white-alpha-65`
- `color-white-alpha-85`
- `line-height-heading`
- `test-var`

治理判断：

Layout 文件目前更像页面骨架组件库。短期可作为后台框架设计来源；中期需要与 `layout-shell-*`、`layout-*` 组件 token 对齐，避免 App Shell、AntD Layout、业务页面三套规则混用。

### `feedback.lib.pen`

组件内容：

- `Alert`
- `Drawer`
- `Message`
- `Modal & Dialog`
- `Notification`
- `Result`
- 多组 `Sub components`

主要 reusable 组件：

- Alert、AlertClose、AlertTitle、AlertContent、AlertExtra
- Drawer、DrawerMask、DrawerClose、DrawerTitle、DrawerFooter、DrawerBody、DrawerHeader、DrawerBackdrop
- Message
- Modal / Dialog
- Notification
- Result

应用场景：

- 业务系统中的反馈提示、弹窗、抽屉、通知、结果页应优先使用本文件。
- Drawer / Modal / Notification 涉及遮罩、层级、阴影和尺寸，后续代码实现时必须对齐 z-index、mask、shadow、motion 规则。

变量与硬编码状态：

| 项目 | 数量 / 说明 |
|---|---:|
| 变量总数 | 395 |
| 与 `tokens.lib.pen` 同名同值 | 311 |
| 同名但值不同 | 8 |
| 仅本地变量 | 76 |
| `$token` 缺失 | 0 |
| reusable 内 raw 样式 | `padding`、`gap`、`cornerRadius`、`strokeWidth`、`fontFamily`、`fontWeight`、阴影数值 |

同名但值不同：

- `color-bg-layout`
- `color-info-bg`
- `color-info-border`
- `color-text-secondary`
- `line-height`
- `line-height-lg`
- `line-height-sm`
- `line-height-xs`

本地变量样例：

- `color-primary-shadow`
- `color-error-shadow`
- 多个 Drawer / Modal / Notification 相关深色、透明色和阴影色
- `color-transparent`
- `color-transparent-white`
- `line-height-heading`
- `test-var`

治理判断：

Feedback 文件中弹层类组件较多，后续治理优先级高于普通展示组件。重点是 mask、shadow、z-index、motion、overlay background 和 footer/header padding。

## 组件 TS 实现约定

后续实现 `frontend/src/components` 时，应遵守以下约定：

- React 组件 API 应从 `.lib.pen` 的 reusable component 命名中提取，而不是从业务页面临时样式中推断。
- 组件实现应消费 CSS variables、Tailwind token、AntD theme 或组件级公开 token，不直接写 hex 色值。
- 对 `.lib.pen` 中已经存在的状态组合，应优先实现为组件 props，例如 `variant`、`size`、`shape`、`state`、`disabled`、`danger`、`theme`。
- 对 `.lib.pen` 中存在但当前业务暂不需要的复杂组合，可以延后实现，但不要用业务代码重写视觉规则。
- 组件内部确需 raw 数值时，应先判断是否已有 runtime token；没有 token 的，记录为组件治理债务，不在业务系统中扩散。
- AntD 组件封装应优先通过 AntD theme token 和 component token 映射完成，不在单个业务页面覆盖 CSS。

## 跨系统复用约定

将当前组件库复用到其他业务系统时，应遵守以下约定：

- 页面设计稿只 import 组件库，不直接复制组件内部结构。
- 不在业务页面新增与组件库同名但不同值的本地变量。
- 不把某个业务系统的页面特殊样式反向写入全局 `tokens.lib.pen`。
- 如果业务系统需要新增组件变体，应先在组件库中沉淀 reusable component，再由 React 组件库实现。
- 如果发现组件库视觉与 `tokens.lib.pen` 不一致，短期以组件库视觉为业务交付基线；中长期通过组件 token 治理解决。
- 旧 General 组件文件已废弃，后续应统一使用 `general.lib.pen`。

## 剩余风险

- 多个组件文件仍保留 `test-var`、`line-height-heading`、`color-transparent` 等本地历史变量；这些变量当前不会造成引用缺失，但不应被视为全局 token。
- 多个文件存在同名不同值变量，后续直接批量替换为 `tokens.lib.pen` 值可能改变视觉。
- Reusable 组件内部仍有大量 raw `padding`、`gap`、`cornerRadius`、`strokeWidth`、字体和阴影数值。它们是后续组件 token 治理的主要债务。
- `general.lib.pen` 当前最接近全局 token 体系，但它也不是完全无本地变量的源生 token 组件库。
