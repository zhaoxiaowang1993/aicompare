# Token Governance Spec

版本：Draft 0.1  
日期：2026-04-29  
适用范围：设计系统 token、Pencil 组件库、React 组件库、CSS variables、Tailwind token、AntD theme token 映射。

## 1. 设计系统目标

本项目以 `design/tokens.lib.pen` 作为唯一设计源头。所有设计 token 必须先在该文件中定义、审查和归档，再派生到其他运行环境。

治理目标：

- 建立一套设计与前端都能理解的 token 分层模型。
- 保证 `design/components/*.lib.pen`、`frontend/src/components`、`frontend/src/styles/globals.css`、`frontend/tailwind.config.ts` 都从 `design/tokens.lib.pen` 派生。
- 让主题、组件状态、间距、圆角、排版、阴影、动效、响应式等规则可审计、可生成、可回溯。
- 为未来重建 React 组件库提供稳定 token 契约。

非目标：

- 不以现有业务页面和业务代码作为规范依据。
- 不要求一次性迁移所有旧组件，但新增组件必须遵守本规范。
- 不允许通过业务页面反向定义设计系统 token。

## 2. Token 分层模型

Token 分为六层：

1. Seed Token：品牌和基础输入。
2. Palette Token：由 seed 派生出的色板、基础刻度。
3. Map Token：基础 token 到语义角色的映射。
4. Alias Token：跨组件、跨场景可复用的通用别名。
5. Component Token：具体组件的局部语义 token。
6. Runtime Token：面向运行环境输出的 CSS、Tailwind、AntD token。

依赖方向必须单向：

```text
Seed -> Palette -> Map -> Alias -> Component -> Runtime
```

禁止低层 token 反向依赖高层 token。禁止 Runtime Token 反向定义设计 token。

## 3. 各层定义、用途、命名示例

### 3.1 Seed Token

定义：设计系统的最小输入值，通常来自品牌、产品基础策略或平台基础参数。

用途：

- 驱动色板生成。
- 定义基础字号、基础圆角、基础线宽、基础动效单位。
- 作为主题算法输入。

命名示例：

- Pencil：`seed-color-primary`
- CSS：`--seed-color-primary`
- Tailwind：默认不直接暴露给业务使用。
- AntD 映射：`colorPrimary`

示例：

- `seed-color-primary`
- `seed-color-success`
- `seed-color-warning`
- `seed-color-error`
- `seed-color-info`
- `seed-color-text-base`
- `seed-color-bg-base`
- `seed-font-size`
- `seed-font-family`
- `seed-font-family-code`
- `seed-line-width`
- `seed-radius`
- `seed-motion-unit`

引用规则：

- 只能被 Palette Token、Map Token 生成规则、AntD seed theme 映射引用。
- Pencil 组件和 React 组件不得直接引用 Seed Token。

### 3.2 Palette Token

定义：由 Seed Token 或明确色彩规则派生出的基础色阶、灰阶、透明度色、基础尺寸刻度。

用途：

- 提供稳定的基础色板。
- 支撑 Light / Dark 主题。
- 作为 Map Token 的取值来源。

命名示例：

- Pencil：`color-blue-6`
- CSS：`--color-blue-6`
- Tailwind：`blue.6` 或 `blue6`
- AntD 映射：不直接映射业务语义，通常作为算法结果或补充色板。

示例：

- `color-blue-1` 到 `color-blue-10`
- `color-blue-1-dark` 到 `color-blue-10-dark`
- `color-gray-1` 到 `color-gray-13`
- `color-red-6`
- `color-green-6`
- `space-4`
- `space-8`
- `radius-sm`
- `radius-lg`

引用规则：

- 可被 Map Token、Alias Token、Component Token 引用。
- Pencil 组件可以在展示色板或特殊色彩组件中引用 Palette Token。
- React 组件原则上不直接引用 Palette Token，除非组件本身就是色板型组件，例如 Tag、Badge、ColorSwatch。

### 3.3 Map Token

定义：把基础色板和基础刻度映射为产品语义角色的 token。

用途：

- 表达通用 UI 语义。
- 作为组件库的主要设计输入。
- 支撑主题切换。

命名示例：

- Pencil：`color-primary`
- CSS：`--color-primary`
- Tailwind：`primary`
- AntD 映射：`colorPrimary`

示例：

- `color-primary`
- `color-primary-hover`
- `color-primary-active`
- `color-primary-bg`
- `color-primary-border`
- `color-success`
- `color-warning`
- `color-error`
- `color-info`
- `color-text`
- `color-text-secondary`
- `color-text-disabled`
- `color-bg-layout`
- `color-bg-container`
- `color-border`
- `color-border-secondary`
- `line-height`
- `line-height-sm`
- `line-height-lg`

引用规则：

- 可被 Alias Token、Component Token、Runtime Token 引用。
- Pencil 组件库必要时可以引用 Map Token，但不应把 Map Token 作为组件实现的默认入口。
- React 组件可引用 Map Token，但组件内部更推荐引用 Component Token 或 Alias Token。

### 3.4 Alias Token

定义：跨组件复用的场景别名，通常描述交互、布局、内容密度、文本层级等复用语义。

用途：

- 减少组件之间重复定义。
- 提供比 Map Token 更贴近 UI 场景的语义。
- 统一控件高度、内容 padding、focus outline、禁用态、占位文本等规则。

命名示例：

- Pencil：`control-height`
- CSS：`--control-height`
- Tailwind：`control.height`
- AntD 映射：`controlHeight`

示例：

- `control-height`
- `control-height-sm`
- `control-height-lg`
- `control-padding-horizontal`
- `control-padding-horizontal-sm`
- `control-outline`
- `control-outline-width`
- `control-item-bg-hover`
- `control-item-bg-active`
- `color-link`
- `color-link-hover`
- `color-text-placeholder`
- `color-text-heading`
- `padding-content-horizontal`
- `padding-content-vertical`
- `screen-md`
- `screen-lg`

引用规则：

- 可被 Component Token、Runtime Token 引用。
- Pencil 组件库和 React 组件库均可引用 Alias Token。
- Alias Token 不允许引用 Component Token。

### 3.5 Component Token

定义：具体组件的局部语义 token，只服务于某一个组件或组件族。

用途：

- 表达组件内不同状态、尺寸、变体的设计规则。
- 隔离组件实现细节。
- 支撑 Pencil 组件库与 React 组件库的一致性。

命名示例：

- Pencil：`button-primary-bg`
- CSS：`--button-primary-bg`
- Tailwind：不默认全量暴露，可通过组件样式层使用。
- AntD 映射：`components.Button.defaultBg`、`components.Button.primaryColor` 等。

示例：

- `button-default-bg`
- `button-default-color`
- `button-primary-bg`
- `button-primary-color`
- `button-primary-hover-bg`
- `button-border-color-disabled`
- `input-bg`
- `input-border-color`
- `input-hover-border-color`
- `table-header-bg`
- `table-row-hover-bg`
- `tag-default-bg`
- `tag-default-color`
- `menu-item-active-bg`

引用规则：

- 只能被对应 Pencil 组件、对应 React 组件、组件文档、Runtime Token 输出引用。
- 不允许被其他无关组件引用。
- 不允许被 Seed、Palette、Map、Alias Token 引用。

### 3.6 Runtime Token

定义：面向运行环境的输出 token，包括 CSS variables、Tailwind theme、AntD theme 配置。

用途：

- 将设计源头转换成前端可消费格式。
- 支撑主题切换和组件运行时样式。
- 保证前端实现与设计源头一致。

命名示例：

- CSS：`--color-primary`
- Tailwind：`theme.extend.colors.primary`
- AntD：`theme.token.colorPrimary`

引用规则：

- Runtime Token 只能从 `design/tokens.lib.pen` 派生。
- 禁止手写新增未存在于源头的 Runtime Token。
- Runtime Token 不得反向成为设计决策来源。

## 4. 每层 token 的允许引用关系


| 使用方             | 可引用                                                            |
| --------------- | -------------------------------------------------------------- |
| Seed Token      | 不引用其他 token，或只引用基础算法输入                                         |
| Palette Token   | Seed Token                                                     |
| Map Token       | Seed Token、Palette Token                                       |
| Alias Token     | Palette Token、Map Token                                        |
| Component Token | Palette Token、Map Token、Alias Token                            |
| Runtime Token   | Seed Token、Palette Token、Map Token、Alias Token、Component Token |
| Pencil 组件库      | 优先引用 Component Token；可以引用 Alias Token；必要时引用 Map Token；色板型组件可引用 Palette Token |
| React 组件库       | Alias Token、Component Token；必要时可引用 Map Token                   |
| 业务页面            | 只通过 React 组件使用 token；原则上不直接消费 token                            |


### 页面设计稿引用规则

页面设计稿是设计系统消费方，不是 token 定义方。

规则：

- 可以引用 Alias Token，用于页面级布局、响应式、内容密度、通用文本层级等场景。
- 可以引用 Component Token，用于组件实例、组件状态和组件变体。
- 不允许引用 Seed Token。
- 不建议直接引用 Palette Token，除非页面本身是色板展示、品牌展示或设计系统文档页。
- 不允许在页面设计稿中新增临时 token、裸色值、裸尺寸来绕过设计系统。
- 页面中发现缺失 token 时，应先提出 token 需求，再进入 token 治理流程。

### Pencil 组件库引用优先级

Pencil 组件库应按以下顺序选择 token：

1. 优先使用 Component Token，表达组件自身的结构、状态、尺寸和变体。
2. 当多个组件共享同一规则时，使用 Alias Token。
3. 当组件需要直接表达全局语义时，才引用 Map Token，例如文本主色、背景容器色、边框色。
4. 只有色板、徽标、Tag/Badge 色彩展示等特殊场景可以直接引用 Palette Token。
5. 不允许直接使用裸色值、裸字号、裸间距、裸圆角、裸阴影。

## 5. Pencil token 命名规范

Pencil variables 使用 kebab-case，不带 `$` 前缀定义。引用时由 Pencil 使用 `$token-name`。

规范：

- 全部小写。
- 使用 `-` 分隔。
- 不使用驼峰命名。
- 不使用含义不明的十六进制变量名作为正式语义 token。
- Palette Token 可保留色板命名，例如 `color-blue-6`。
- Map / Alias / Component Token 必须表达语义，不表达具体色值。

推荐格式：

- Seed：`seed-{category}-{role}`
- Palette：`{category}-{scale}` 或 `{category}-{hue}-{scale}`
- Map：`{category}-{semantic-role}-{state?}`
- Alias：`{domain}-{role}-{state?}-{size?}`
- Component：`{component}-{part}-{property}-{state?}-{size?}`

示例：

- `seed-color-primary`
- `color-blue-6`
- `color-primary-hover`
- `color-text-secondary`
- `control-height-sm`
- `button-primary-bg-hover`
- `table-header-bg`

禁止示例：

- `color-1677ff` 作为语义 token
- `bluePrimary`
- `ButtonPrimaryBg`
- `temp-color`
- `test-var`

## 6. CSS variable 命名规范

CSS variables 必须由 `design/tokens.lib.pen` 生成，命名与 Pencil token 保持一一对应，只增加 `--` 前缀。

规则：

- Pencil `color-primary` 输出为 CSS `--color-primary`。
- Pencil `button-primary-bg` 输出为 CSS `--button-primary-bg`。
- CSS 变量名不得引入源头不存在的新 token。
- CSS 中不得手写新增 token。
- CSS 中允许保留 Tailwind base/components/utilities 引入，但 token 区块必须可生成。

示例：

```css
:root {
  --color-primary: #1677ff;
  --color-text: #000000e0;
  --space-8: 8px;
  --radius-lg: 8px;
  --button-primary-bg: var(--color-primary);
}
```

主题输出：

```css
:root,
[data-theme='light'] {
  --color-bg-container: #ffffff;
}

[data-theme='dark'] {
  --color-bg-container: #141414;
}
```

## 7. Tailwind token 命名规范

Tailwind 只暴露前端实现需要的稳定 token，不要求暴露全部 Pencil variables。

规则：

- `colors` 暴露 Map Token 和必要 Alias Token。
- `spacing` 暴露 `space-*`。
- `borderRadius` 暴露 `radius*`。
- `fontFamily`、`fontSize`、`fontWeight`、`lineHeight` 必须从 CSS variables 派生。
- Tailwind key 使用前端友好的 camelCase 或嵌套对象，但必须能回溯到源 token。
- 禁止在 Tailwind 中写死色值、字号、间距、圆角。

示例：

```ts
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      text: 'var(--color-text)',
      bgContainer: 'var(--color-bg-container)'
    },
    spacing: {
      8: 'var(--space-8)',
      16: 'var(--space-16)'
    },
    borderRadius: {
      DEFAULT: 'var(--radius)',
      lg: 'var(--radius-lg)'
    }
  }
}
```

## 8. AntD theme token 映射规则

AntD theme 只能作为 Runtime Token 输出，不作为设计源头。

映射原则：

- AntD seed token 从 Seed / Map Token 映射。
- AntD alias token 从 Map / Alias Token 映射。
- AntD component token 从 Component Token 映射。
- 不允许为了适配 AntD 临时在前端定义未进入 `tokens.lib.pen` 的 token。

### AntD runtime 映射方式

AntD theme 配置应消费 Runtime Token，优先使用 CSS variables 作为运行时值。

示例：

```ts
theme: {
  token: {
    colorPrimary: 'var(--color-primary)',
    colorSuccess: 'var(--color-success)',
    colorWarning: 'var(--color-warning)',
    colorError: 'var(--color-error)',
    colorText: 'var(--color-text)',
    colorTextSecondary: 'var(--color-text-secondary)',
    colorBgContainer: 'var(--color-bg-container)',
    colorBgLayout: 'var(--color-bg-layout)',
    colorBorder: 'var(--color-border)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-family-base)',
    fontSize: 'var(--font-size)',
    lineHeight: 'var(--line-height)'
  },
  components: {
    Button: {
      defaultBg: 'var(--button-default-bg)',
      defaultColor: 'var(--button-default-color)',
      primaryColor: 'var(--button-primary-color)'
    },
    Input: {
      hoverBorderColor: 'var(--input-hover-border-color)'
    },
    Table: {
      headerBg: 'var(--table-header-bg)'
    }
  }
}
```

规则：

- AntD theme 中不得写死 hex 色值、px 字号、px 圆角或固定阴影。
- AntD theme 使用的每个 `var(--xxx)` 必须能回溯到 `design/tokens.lib.pen`。
- 如果 AntD 需要某个 token，而 CSS variables 中不存在，应先回到 `tokens.lib.pen` 定义，再派生到 CSS variables。
- Light / Dark 切换应通过 CSS variables 的主题值完成，AntD theme 配置不应为不同主题维护两套硬编码值。

基础映射示例：


| AntD token           | 来源                                     |
| -------------------- | -------------------------------------- |
| `colorPrimary`       | `color-primary` 或 `seed-color-primary` |
| `colorSuccess`       | `color-success`                        |
| `colorWarning`       | `color-warning`                        |
| `colorError`         | `color-error`                          |
| `colorInfo`          | `color-info`                           |
| `colorText`          | `color-text`                           |
| `colorTextSecondary` | `color-text-secondary`                 |
| `colorTextDisabled`  | `color-text-disabled`                  |
| `colorBgContainer`   | `color-bg-container`                   |
| `colorBgLayout`      | `color-bg-layout`                      |
| `colorBorder`        | `color-border`                         |
| `borderRadius`       | `radius`                               |
| `fontFamily`         | `font-family-base`                     |
| `fontSize`           | `font-size`                            |
| `lineHeight`         | `line-height`                          |


组件映射示例：


| AntD component token     | 来源                         |
| ------------------------ | -------------------------- |
| `Button.defaultBg`       | `button-default-bg`        |
| `Button.defaultColor`    | `button-default-color`     |
| `Button.primaryColor`    | `button-primary-color`     |
| `Input.hoverBorderColor` | `input-hover-border-color` |
| `Table.headerBg`         | `table-header-bg`          |
| `Menu.itemSelectedBg`    | `menu-item-selected-bg`    |


## 9. Light / Dark 主题规则

主题必须在 `design/tokens.lib.pen` 中定义，不允许只在 CSS 或 React 中定义。

规则：

- Palette Token 可以有 light/dark 双值，例如 `color-blue-6` 与 `color-blue-6-dark`。
- Map Token 必须提供主题后的最终语义值，例如 Light 下 `color-bg-container = color-gray-1`，Dark 下 `color-bg-container = color-gray-12`。
- Alias Token 和 Component Token 原则上引用 Map Token，由 Map Token 承担主题切换。
- 只有确实存在组件特殊暗色规则时，Component Token 才定义主题差异。
- CSS 输出必须支持 `[data-theme='light']` 与 `[data-theme='dark']`。
- React 组件不得通过条件判断手写主题颜色。

推荐结构：

```text
color-blue-6
color-blue-6-dark
color-bg-container.light -> color-gray-1
color-bg-container.dark -> color-gray-12
button-primary-bg -> color-primary
```

## 10. 字体族、字号、字重、行高规则

### 字体族

必须定义：

- `font-family-base`
- `font-family-heading`
- `font-family-mono`

引用规则：

- 正文使用 `font-family-base`。
- 标题默认使用 `font-family-heading`，若产品无需区分，可映射到同一字体。
- 代码、编号、技术字段使用 `font-family-mono`。

### 字号

字号使用固定阶梯，不按视口宽度缩放。

推荐 token：

- `font-size-xxs`
- `font-size-xs`
- `font-size-sm`
- `font-size`
- `font-size-lg`
- `font-size-xl`
- `font-size-heading-1`
- `font-size-heading-2`
- `font-size-heading-3`
- `font-size-heading-4`
- `font-size-heading-5`

### 字重

必须定义：

- `font-weight-regular`
- `font-weight-medium`
- `font-weight-semibold`
- `font-weight-bold`

组件中禁止直接使用 `normal`、`bold`、`700` 等硬编码字重。

### 行高

必须定义：

- `line-height-xs`
- `line-height-sm`
- `line-height`
- `line-height-lg`
- `line-height-heading`
- `line-height-compact`
- `line-height-relaxed`
- `line-height-loose`

文本样式应使用字号和行高组合，不允许只定义字号。

## 11. 间距、圆角、描边、阴影、动效、响应式规则

### 间距

间距 token 使用 `space-*`，值以 px 为基础。

推荐基础集：

- `space-0`
- `space-2`
- `space-4`
- `space-6`
- `space-8`
- `space-12`
- `space-16`
- `space-20`
- `space-24`
- `space-32`
- `space-40`
- `space-48`

组件内部 padding、gap、margin 必须优先引用 spacing token 或组件 token。

### 圆角

圆角 token 使用 `radius*`。

推荐基础集：

- `radius-none`
- `radius-xs`
- `radius-sm`
- `radius`
- `radius-lg`
- `radius-xl`
- `radius-xxl`
- `radius-full`

React 中应通过 Tailwind `borderRadius` token 或组件 token 使用，不直接依赖 Tailwind 默认 `rounded-*`。

### 描边

必须定义：

- `line-width`
- `line-width-bold`
- `line-width-focus`
- `line-type`
- `color-border`
- `color-border-secondary`

组件描边颜色应使用 `color-border*` 或组件 token。

### 阴影

阴影 token 使用语义命名：

- `shadow-sm`
- `shadow`
- `shadow-lg`
- `shadow-card`
- `shadow-popover`
- `shadow-modal`
- `shadow-focus`

禁止在组件中直接写 `0 2px 8px ...`，应沉淀为 token。

### 动效

动效 token 分为 duration、easing、motion。

示例：

- `motion-duration-fast`
- `motion-duration-base`
- `motion-duration-slow`
- `motion-ease-out`
- `motion-ease-in`
- `motion-ease-in-out`
- `motion-unit`

组件 hover、active、open、close 动效必须使用动效 token。

### 响应式

响应式 token 使用 screen/device 命名：

- `screen-xs`
- `screen-sm`
- `screen-md`
- `screen-lg`
- `screen-xl`
- `screen-xxl`
- `device-mobile`
- `device-tablet`
- `device-desktop`
- `page-gutter`
- `page-offset`

响应式规则必须先定义 token，再进入 Tailwind screens 或布局组件。

## 12. 组件 token 规则

组件 token 必须服务于具体组件，不得泛化成全局别名。

命名格式：

```text
{component}-{part}-{property}-{state?}-{size?}
```

常用字段：

- component：`button`、`input`、`select`、`table`、`menu`、`tag`
- part：`root`、`icon`、`label`、`header`、`body`、`item`
- property：`bg`、`color`、`border-color`、`shadow`、`height`、`padding`
- state：`default`、`hover`、`active`、`disabled`、`selected`、`danger`
- size：`sm`、`md`、`lg`

示例：

- `button-root-height-sm`
- `button-primary-bg`
- `button-primary-bg-hover`
- `button-primary-color`
- `button-border-color-disabled`
- `input-root-height`
- `input-border-color-hover`
- `table-header-bg`
- `menu-item-bg-selected`
- `tag-default-border-color`

规则：

- Component Token 可以引用 Palette、Map、Alias Token。
- Component Token 不允许被无关组件复用。
- 如果两个组件需要相同规则，应抽象为 Alias Token，而不是互相引用组件 token。
- Pencil 组件库和 React 组件库必须使用同一组组件 token。

## 13. 禁止事项

禁止：

- 在 `globals.css` 手写新增未存在于 `tokens.lib.pen` 的 token。
- 在 `tailwind.config.ts` 写死颜色、字号、间距、圆角。
- 在 React 组件中直接写十六进制颜色。
- 在 React 组件中直接写固定阴影，例如 `0 2px 8px ...`。
- 在 React 组件中长期依赖 Tailwind 默认 `rounded-*`、`text-*`、`gap-*` 表达设计系统决策。
- 在 Pencil 组件库中长期保留未进入 `tokens.lib.pen` 的本地语义变量。
- 使用 `color-1677ff` 这类原始色值变量作为业务语义。
- 使用 `test-*`、`temp-*`、`new-*` 等临时命名进入正式 token。
- 让业务页面定义或覆盖设计系统 token。
- 为了修复单个页面而新增全局 token。

## 14. 审计规则

每次设计系统变更必须执行以下审计：

### Source 审计

检查 `design/tokens.lib.pen`：

- variables 是否包含所有输出 token。
- 是否存在临时 token，例如 `test-var`。
- 是否存在画板规范未沉淀为 variables。
- Light / Dark 是否都有完整定义。

### Pencil 组件库审计

检查 `design/components/*.lib.pen`：

- 每个文件的本地 variables 数量。
- 每个 `$token` 是否存在于 `design/tokens.lib.pen`。
- 是否存在硬编码 `fill`、`fontSize`、`fontFamily`、`fontWeight`、`lineHeight`、`cornerRadius`、`gap`、`padding`、`stroke`、`shadow`。

### Runtime 审计

检查 `frontend/src/styles/globals.css`：

- 所有 `--xxx` 是否都能回溯到 `tokens.lib.pen`。
- 是否有孤立 CSS variable。
- 是否有主题缺失。

检查 `frontend/tailwind.config.ts`：

- 所有 `var(--xxx)` 是否都来自 `tokens.lib.pen`。
- 是否暴露必要的 color、spacing、radius、font、lineHeight、shadow、screen。
- 是否存在硬编码值。

检查 `frontend/src/components`：

- 所有 `var(--xxx)` 是否存在于 `tokens.lib.pen`。
- 是否存在直接 hex 色值。
- 是否存在固定 px、任意值尺寸、默认圆角、默认字号、默认间距。
- 是否存在组件应使用 Component Token 却直接使用 Map Token 的情况。

### 审计通过标准

必须满足：

- Runtime 输出 token 全部可回溯到 `tokens.lib.pen`。
- 新增组件没有未登记 token。
- 新增 token 有明确分层、命名、用途和引用范围。
- Light / Dark 都有明确结果。

## 15. 后续维护流程

### 新增 token 流程

1. 提出 token 需求：说明场景、组件、状态、主题影响。
2. 判断分层：Seed、Palette、Map、Alias、Component、Runtime。
3. 在 `design/tokens.lib.pen` 增加变量和画板说明。
4. 更新或生成 `globals.css`。
5. 更新或生成 `tailwind.config.ts`。
6. 更新 AntD theme 映射。
7. 更新 Pencil 组件库引用。
8. 更新 React 组件库引用。
9. 执行审计。

### 修改 token 流程

1. 确认影响范围：Pencil 组件、React 组件、AntD、主题、业务页面。
2. 禁止直接改 Runtime 输出。
3. 先改 `design/tokens.lib.pen`。
4. 重新派生 CSS、Tailwind、AntD 映射。
5. 对受影响组件做视觉和交互回归。

### 删除 token 流程

1. 搜索 Pencil、CSS、Tailwind、React、AntD 是否仍引用。
2. 提供替代 token。
3. 先迁移引用，再删除源 token。
4. 删除 Runtime 输出。
5. 执行审计，确认无孤立引用。

### 版本管理

建议 token 变更按语义版本记录：

- Patch：修正错误映射或注释，不改变视觉。
- Minor：新增 token 或新增组件 token。
- Major：删除 token、重命名 token、改变核心视觉语义。

### 文档维护

每次 token 变更必须同步更新：

- token 分层说明。
- 组件 token 列表。
- AntD 映射表。
- Light / Dark 差异说明。
- 审计报告。

## 附录：当前项目治理起点

当前审计显示：

- `tokens.lib.pen` 已包含大量 Palette Token、字号、间距、圆角，但语义色、字体族、字重、常用行高、阴影、动效、响应式、组件 token 尚未完整沉淀。
- `design/components/*.lib.pen` 存在大量本地变量，很多 `$token` 不在 `tokens.lib.pen` 中。
- `globals.css` 和 `tailwind.config.ts` 当前包含多项 `tokens.lib.pen` 中不存在的变量。
- React 组件库未来应重建，不以现有业务页面为规范依据。

因此第一阶段治理应优先补齐 `tokens.lib.pen` 的 Map、Alias、Component Token，再统一派生 Runtime Token。
