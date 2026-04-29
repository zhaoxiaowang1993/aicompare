# Token Special Case Rules

日期：2026-04-29

## 文档定位

本文档记录 `design/tokens.lib.pen` 第一阶段治理过程中形成的特殊规则、例外决策和后续实现约束。

它不是 token 总纲，也不替代 `design/specs/token-guidebook.md`。它的作用是补充那些无法仅靠命名规范表达的治理上下文，避免后续治理 `design/components/*.lib.pen`、React 组件库、CSS variables、Tailwind 和 AntD theme 时误解已经做过的决策。

## 适用范围

- `design/tokens.lib.pen`
- `design/components/*.lib.pen`
- `frontend/src/styles/globals.css`
- `frontend/tailwind.config.ts`
- `frontend/src/components`
- AntD theme runtime 映射
- 未来 token runtime 生成器

## 特殊规则

### 1. Component Token 可以引用全局 token

组件 token 可以通过 `$token-name` 引用全局 Alias / Map token。

例如：

```text
button-primary-shadow -> $shadow-control-primary
input-active-shadow -> $shadow-focus
```

Runtime 生成器不得把 `$shadow-focus` 当作普通字符串输出。CSS variables 应输出为：

```css
--input-active-shadow: var(--shadow-focus);
```

### 2. `$responsive-query-*` 是 media query 引用列表

`responsive-hide-on-*` 和 `responsive-only-*` 使用 `$responsive-query-*` 组合表达显示规则。

例如：

```text
responsive-hide-on-mobile:
$responsive-query-tablet, $responsive-query-desktop-sm, $responsive-query-desktop
```

这些值不是普通 CSS property 值。Runtime 生成器需要识别它们并展开为多个 media query，不应直接当成普通 CSS variable 消费。

### 3. `screen-*` 和 `responsive-*` 分工不同

`screen-*` 是断点基础，优先用于 Tailwind screens：

```text
screen-md = 768
screen-lg = 992
```

`responsive-*` 是产品级响应式规则，包括设计稿宽度、页面边距和显示策略：

```text
responsive-device-tablet
responsive-page-offset-desktop
responsive-only-tablet
```

Tailwind screens 应从 `screen-*` 派生，不应从 `responsive-only-*` 派生。

### 4. App Shell layout 和 AntD Layout 必须分层

`layout-header-height = 64` 是 AntD `Layout` 组件 token。

`layout-shell-*` 是产品 App Shell / 框架布局 Alias Token。

例如：

```text
layout-shell-header-height = 44
layout-shell-sidebar-width-md = 256
```

React AppShell、Dashboard 框架和页面骨架应使用 `layout-shell-*`。AntD theme 的 `components.Layout` 映射应使用 `layout-*` 组件 token。

### 5. Drawer 历史变量暂不归入 App Shell

当前存在：

```text
drawer-width
drawer-width-md
drawer-width-lg
```

这些变量不属于 App Shell layout alias。后续治理 Drawer 组件时再决定是否保留、重命名或映射到 Drawer component token。

### 6. Progress 异常项已修正

原画板异常项：

```text
Progress/circleTextFontSize 2
```

已修正为：

```text
Progress/circleIconFontSize
progress-circle-icon-font-size
```

后续不得生成或引用 `progress-circle-text-font-size-2`。

### 7. `transparent` 不作为全局 token

不新增全局 `transparent` token。

但 Component Token 可以使用字符串值：

```text
transparent
```

Runtime 输出时可直接输出 `transparent`。

### 8. Component Token 中允许保留组件私有 raw hex

部分组件 token 仍可保留 raw hex，例如深色 Menu / Layout、Table 背景、Image preview 操作色。

规则：

- 不因单个组件使用而提升为 Alias Token。
- 只有多个组件共享且语义明确时，才考虑抽象到 Alias / Map。
- Runtime 可以输出这些值。
- 后续组件视觉精修时再判断是否继续抽象。

### 9. shadow 体系当前是最小集

当前只建立了以下全局 shadow token：

```text
shadow-control
shadow-control-primary
shadow-control-danger
shadow-focus
shadow-focus-error
shadow-focus-warning
shadow-handle
```

尚未建立完整 elevation 体系，例如：

```text
shadow-card
shadow-popover
shadow-modal
shadow-lg
```

后续治理 Card、Modal、Popover、Dropdown 等组件时，不应凭空创建 elevation token，必须从组件画板或实际设计需求反推。

### 10. Alias layout 的 sidebar 背景已归一化

原画板值为：

```text
#fbfbfb
```

已按色板规范归一为：

```text
#fafafa
```

即 `color-gray-2`。后续审计如果发现与旧稿有 1 个色阶差异，应以当前 token 为准。

### 11. `layout-shell-footer-height` 已统一为 34

原画板曾出现 Light `34` / Dark `33`。

当前统一为：

```text
layout-shell-footer-height = 34
```

布局尺寸原则上不随 light / dark 主题变化，除非后续明确引入 density 模式。

### 12. Component Token 命名按 AntD component token 机械映射

例如：

```text
Button/defaultBg -> button-default-bg
Input/activeBorderColor -> input-active-border-color
```

这套命名服务于 AntD theme 映射稳定性，不应随意改成更主观的命名。

AntD 映射示例：

```text
components.Button.defaultBg -> var(--button-default-bg)
```

### 13. `fontWeightNormal` / `fontWeightStrong` 不作为正式变量

画板中的 AntD 风格命名：

```text
fontWeightNormal
fontWeightStrong
```

正式变量映射为：

```text
font-weight-regular
font-weight-bold
```

生成器不得重新生成 `font-weight-normal` 或 `font-weight-strong`。

### 14. `borderRadius*` 统一映射为 `radius-*`

画板中的：

```text
borderRadiusSM
borderRadiusLG
```

正式变量为：

```text
radius-sm
radius-lg
```

后续不得生成重复的 `border-radius-sm`、`border-radius-lg`。

### 15. Heading token 编号必须带连字符

正式变量为：

```text
font-size-heading-1
line-height-heading-1
```

不是：

```text
font-size-heading1
line-height-heading1
```

脚本转换 camelCase 时必须保留 heading 与编号之间的连字符。

### 16. opacity 当前按实际值命名

当前规则：

```text
opacity-2 = 2
opacity-4 = 4
opacity-6 = 6
```

不是按画板序号命名：

```text
opacity-1 = 2
opacity-2 = 4
```

后续不得按行号重新生成 opacity token，除非先重新决策。

### 17. Seed 中允许存在 Runtime / AntD 输入项

以下 Seed Token 已补齐：

```text
seed-motion-base = 0
seed-wireframe = false
```

它们是 AntD / Runtime 配置输入，不是页面设计稿、Pencil 组件或 React 组件应该直接消费的样式 token。

生成器可以使用它们映射 AntD theme 或算法配置；组件治理时不得因为它们存在而直接引用 Seed Token。

### 18. `font-size-icon` 是 Alias Token，不是独立字号体系

`font-size-icon` 当前值为：

```text
font-size-icon = 12
```

它来自画板 `fontSizeIcon`，语义是 Select、Cascader 等操作图标字号，通常与 `font-size-sm` 保持一致。

当前变量使用数值沉淀，而不是 `$font-size-sm` 引用。后续如果调整 `font-size-sm`，不得自动联动修改 `font-size-icon`，必须单独确认图标字号是否同步调整。

### 19. italic text style 是复合样式 token

当前补齐的 italic text style token 为：

```text
font-style-regular-italic = "font-style: italic; font-weight: 400"
font-style-medium-italic = "font-style: italic; font-weight: 500"
font-style-semibold-italic = "font-style: italic; font-weight: 600"
```

它们不是单一 CSS property，也不适合 Pencil 组件直接按普通 number / color token 消费。

Runtime 生成器需要把这些字符串解析为复合样式；例如 CSS 输出可拆成 `font-style` 与 `font-weight`，React 组件可映射为 style object 或 class 规则。

后续不得生成 `font-style-regular`、`font-style-medium` 等非 italic 重复 token，除非画板新增了对应规范并经过治理确认。

### 20. Tabs 空白字符串仍是治理债务

当前保留了画板空白值：

```text
tabs-horizontal-item-margin = " "
tabs-horizontal-item-margin-rtl = " "
```

后续治理 Tabs 或 Runtime 输出时必须单独确认。它们可能应改为 `0`、空字符串，或不输出。

### 21. string 类型 token 不都适合 Pencil 直接消费

以下类型更偏 Runtime：

- shadow 字符串
- CSS shorthand
- media query
- `auto`
- `unset`
- `scale(1.1)`
- `transparent`
- 复合 text style，例如 `font-style: italic; font-weight: 500`

Pencil 组件治理时应优先消费 color / number token。string token 可能只服务 React、CSS variables 或 AntD runtime。

### 22. Component Token 不默认全量暴露到 Tailwind

Tailwind 不默认暴露全部 Component Token。

Tailwind 应优先暴露：

- Map / Alias color
- spacing
- radius
- typography
- screens
- 必要的 shadow

Component Token 更适合进入 CSS variables 和 AntD `components` theme。

### 23. 业务系统不应直接消费底层 token

业务页面原则上不直接消费：

- Seed Token
- Palette Token
- Component Token 内部细节

业务页面应优先消费 React 组件。确实需要布局能力时，消费公开 Alias，例如：

```text
layout-shell-*
responsive-*
```

## 后续使用要求

后续执行以下任务前，应先阅读本文档：

- 从 `tokens.lib.pen` 生成 `globals.css`
- 从 `tokens.lib.pen` 生成 `tailwind.config.ts`
- 生成 AntD theme token
- 治理 Pencil 组件库
- 重建 React 组件库
- 编写 token 审计脚本

如果后续治理中推翻本文档的任何规则，必须同步更新本文档，并说明变更原因。