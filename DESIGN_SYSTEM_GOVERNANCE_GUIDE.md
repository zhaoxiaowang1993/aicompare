# Design System Governance Guide

面向设计、前端代码小白的设计系统治理教程。

本教程用于把当前项目治理成一套可复用的设计系统资产链：

```txt
design/tokens.lib.pen
  -> design/components/*.lib.pen
  -> frontend/src/styles/globals.css
  -> frontend/tailwind.config.ts
  -> frontend/src/components
```

当前阶段的重点不是业务页面，也不是业务前端重构，而是建立一套完整、稳定、可迁移到其他系统的设计系统。

---

## 0. 先理解几个核心概念

### 0.1 什么是 token

Token 是设计系统里的最小规范单位。它把颜色、字号、间距、圆角、阴影、动效等视觉决策变成可复用的名字。

错误方式：

```txt
按钮背景色 = #1677ff
正文颜色 = #000000 88%
卡片圆角 = 8
```

正确方式：

```txt
按钮背景色 = color-primary
正文颜色 = color-text
卡片圆角 = radius-lg
```

这样做的好处是：以后换品牌色、换暗色模式、换业务系统，不需要逐个页面改，只要改 token。

### 0.2 什么是 tokens.lib.pen

`design/tokens.lib.pen` 应该是设计系统的唯一源头，也就是 source of truth。

它应该负责定义：

- 基础色板
- 语义颜色
- 字体族
- 字号
- 字重
- 行高
- 间距
- 圆角
- 描边
- 控件高度
- 阴影
- 动效
- 响应式断点
- z-index
- 组件级 token
- Light / Dark 主题

### 0.3 什么是组件 Pencil 文件

`design/components/*.lib.pen` 是设计组件库。它应该消费 `tokens.lib.pen` 里的 token，而不是自己偷偷定义一套新规范。

组件文件里可以有组件展示、组件变体、状态说明，但核心样式应该来自 token。

### 0.4 什么是 frontend/src/components

`frontend/src/components` 是前端组件库。它应该和 Pencil 组件库保持同一套规则：

- 使用同一套颜色 token
- 使用同一套字号/字重/行高
- 使用同一套间距/圆角/阴影
- 状态、尺寸、变体和设计稿一致

### 0.5 什么是 globals.css 和 tailwind.config.ts

`globals.css` 负责把设计 token 转成 CSS variables。

例如：

```css
:root {
  --color-primary: #1677ff;
  --color-text: rgba(0, 0, 0, 0.88);
  --font-size: 14px;
}
```

`tailwind.config.ts` 负责让前端开发可以用 Tailwind 类名消费这些 token。

例如：

```ts
colors: {
  primary: 'var(--color-primary)',
  text: 'var(--color-text)'
}
```

---

## 1. 治理总原则

### 1.1 一切以 tokens.lib.pen 为源头

业务页面、Pencil 组件、React 组件、CSS、Tailwind、AntD theme 都应该从 `tokens.lib.pen` 派生。

不要让每个地方各自定义一套颜色、字号和间距。

### 1.2 页面不能直接写基础值

页面设计稿不应该直接写：

```txt
#1677ff
14
8
PingFang SC
```

页面应该使用：

```txt
color-primary
font-size
radius-lg
font-family-base
```

### 1.3 组件不能直接引用低层 token

组件可以引用：

- Alias token
- Component token
- 必要时引用 Map token

组件尽量不要直接引用：

- 基础色板，例如 `color-blue-6`
- Seed token，例如 `color-primary-base`
- 裸值，例如 `#1677ff`、`14`、`8`

### 1.4 先治理基础设施，再做业务页面

推荐顺序：

```txt
tokens.lib.pen
  -> design/components
  -> frontend token output
  -> frontend components
  -> business pages
```

不要反过来先做业务页面，否则页面会把临时规范带进系统。

### 1.5 每次只治理一个范围

例如：

- 一次只治理 typography
- 一次只治理 color
- 一次只治理 Button
- 一次只治理 Input

这样更容易检查，也更容易回滚。

---

## 2. 推荐文件结构

目标结构：

```txt
design/
  tokens.lib.pen
  components/
    general-new.lib.pen
    data-entry-new.lib.pen
    data-display-new.lib.pen
    feedback-new.lib.pen
    navigation-new.lib.pen
    layout-new.lib.pen
  pages/
    ...

frontend/
  src/
    styles/
      globals.css
      antd-theme.ts
    components/
      general/
      data-entry/
      data-display/
      feedback/
      navigation/
      layout/
  tailwind.config.ts

scripts/
  audit-design-tokens.ts
  sync-design-tokens.ts
```

`design/pages` 可以是业务系统专属资产。  
`design/tokens.lib.pen` 和 `design/components` 应该尽量可复用到其他系统。

---

## 3. 治理阶段总览

建议分 10 个阶段：

1. 建立安全工作方式
2. 只读审计当前 token 和组件
3. 制定 Token Governance Spec
4. 重构 tokens.lib.pen
5. 治理 Pencil 组件库
6. 生成前端 token 输出
7. 实现 React 组件库
8. 增加 demo / story / 文档
9. 建立自动审计脚本
10. 验收并固化维护流程

下面每一步都包含：

- 目标
- 操作说明
- 检查点
- 可直接复制的提示词模板

---

## Step 1. 建立安全工作方式

### 目标

在开始治理前，先保证不会误改业务代码、不会丢失 Pencil 文件、不会把临时改动混进系统。

### 操作说明

1. 确认当前工作目标是设计系统治理，不是业务系统开发。
2. 确认所有业务页面都不是这次治理的依据。
3. 确认每一步操作前先审计、后修改。
4. 修改 `.pen` 文件后必须确认已经落盘。
5. 每次完成一个阶段后，做一次审计报告。

### 检查点

- 是否知道这次治理的源头是 `design/tokens.lib.pen`
- 是否知道 `design/pages` 不是当前治理重点
- 是否知道现有业务前端会重构，不作为约束
- 是否知道 Pencil 显示 Edited 时要保存

### 提示词模板

```txt
请你进入设计系统治理模式。

当前目标不是开发业务页面，也不是修复现有业务前端，而是构建一整套可复用的设计系统。

治理范围：
1. design/tokens.lib.pen 作为唯一 token source of truth
2. design/components/*.lib.pen 作为 Pencil 组件库
3. frontend/src/components 作为 React 组件库
4. frontend/src/styles/globals.css 作为 CSS variables 输出
5. frontend/tailwind.config.ts 作为 Tailwind token 输出

请先只读检查当前项目状态，不做任何修改。
重点确认：
- 当前有哪些设计系统相关文件
- 当前工作区是否有未提交改动
- 哪些文件属于设计系统治理范围
- 哪些文件应该暂时忽略

输出一份简短的风险提示和建议执行顺序。
```

---

## Step 2. 只读审计当前 token 和组件

### 目标

弄清楚当前到底有什么，而不是凭感觉治理。

### 操作说明

审计三类东西：

1. `tokens.lib.pen` 实际定义了哪些变量
2. `tokens.lib.pen` 各画板展示了哪些规范
3. `design/components` 实际引用了哪些 token，哪些是硬编码

### 应该产出的审计信息

Token 源文件：

- 变量总数
- 变量分类
- Seed / Map / Alias / Text Styles / Responsive / Components 画板内容
- 画板内容和变量区是否一致

Pencil 组件库：

- 每个组件文件有多少本地变量
- 每个组件文件引用了多少 token
- 哪些 token 不在 `tokens.lib.pen` 里
- 哪些地方还写死颜色、字号、圆角、间距、字体、字重

前端侧：

- `globals.css` 定义了哪些 CSS variables
- `tailwind.config.ts` 暴露了哪些 token
- React 组件用了哪些 `var(--xxx)`
- 是否存在 `#xxxxxx`、`text-[13px]` 这类硬编码

### 检查点

- 是否知道源 token 缺什么
- 是否知道组件 token 和源 token 是否一致
- 是否知道前端 token 和源 token 是否一致
- 是否没有做任何文件修改

### 提示词模板

```txt
请对当前设计系统做一次只读审计，不要做任何修改。

审计范围：
1. design/tokens.lib.pen
2. design/components/*.lib.pen
3. frontend/src/styles/globals.css
4. frontend/tailwind.config.ts
5. frontend/src/components

请输出以下内容：

一、tokens.lib.pen 审计
- variables 区实际有哪些 token
- 按颜色、字号、字重、行高、间距、圆角、描边、阴影、动效、响应式、z-index、组件 token 分类统计
- Seed / Map / Alias / Responsive / Text Styles / Components 画板上定义了哪些规范
- 哪些画板规范没有沉淀成 variables

二、design/components 审计
- 每个 .lib.pen 文件的本地变量数量
- 每个文件引用了哪些 $token
- 哪些 $token 不存在于 tokens.lib.pen
- 哪些属性仍然硬编码，例如 fill、textColor、fontSize、fontFamily、fontWeight、lineHeight、cornerRadius、gap、padding、shadow

三、frontend 审计
- globals.css 定义了哪些 CSS variables
- tailwind.config.ts 暴露了哪些 token
- React 组件使用了哪些 var(--xxx)
- 哪些 var(--xxx) 不存在于 tokens.lib.pen
- 是否存在硬编码颜色、字号、间距、圆角

四、结论
- 当前系统是否已经完全由 tokens.lib.pen 驱动
- 主要断层在哪里
- 推荐治理优先级

注意：
- 只读审计
- 不要修改任何文件
- 不要格式化任何文件
```

---

## Step 3. 制定 Token Governance Spec

### 目标

先定规则，再动文件。否则治理会变成“哪里缺补哪里”，最后越来越乱。

### 操作说明

新建一份规范文档，例如：

```txt
DESIGN_TOKEN_GOVERNANCE_SPEC.md
```

这份文档要回答：

- token 分几层
- 每层 token 的职责是什么
- 每层 token 谁可以引用
- 命名用 kebab-case 还是 camelCase
- Pencil token 如何映射到 CSS variables
- CSS variables 如何映射到 Tailwind
- CSS variables 如何映射到 AntD theme
- 哪些硬编码禁止出现

### 推荐 token 分层

```txt
Seed Token
Palette Token
Map Token
Alias Token
Component Token
Runtime Token
```

说明：

- Seed Token：品牌和基础输入
- Palette Token：基础色板
- Map Token：语义映射
- Alias Token：产品常用别名
- Component Token：组件专属样式
- Runtime Token：前端运行时需要的派生变量

### 推荐引用规则

```txt
页面设计稿：
  可以引用 Alias Token、Component Token
  不允许引用 Seed Token
  不建议直接引用 Palette Token

Pencil 组件库：
  优先引用 Component Token
  可以引用 Alias Token
  必要时引用 Map Token
  不直接引用裸色值和裸尺寸

前端组件库：
  使用 CSS variables / Tailwind token / AntD theme
  不直接写 hex 色值
  不随意写 text-[13px]、rounded-[7px]

业务系统：
  只消费组件和公开 token
  不改设计系统底层 token
```

### 检查点

- 是否确定 token 分层
- 是否确定 token 命名规则
- 是否确定每一层谁可以引用
- 是否确定 Pencil / CSS / Tailwind / AntD 的映射方式

### 提示词模板

```txt
请基于当前项目情况，为我的设计系统编写一份 Token Governance Spec。

背景：
- 当前项目以 design/tokens.lib.pen 作为唯一设计源头
- design/components/*.lib.pen 是 Pencil 组件库
- frontend/src/components 是未来要重建的 React 组件库
- frontend/src/styles/globals.css 和 frontend/tailwind.config.ts 都应该从 tokens.lib.pen 派生
- 现有业务页面和业务代码会被重构，不作为本次规范依据

请输出一份 markdown 规范，至少包含：

1. 设计系统目标
2. token 分层模型
   - Seed Token
   - Palette Token
   - Map Token
   - Alias Token
   - Component Token
   - Runtime Token
3. 每一层 token 的定义、用途、命名示例
4. 每一层 token 允许被谁引用
5. Pencil token 命名规范
6. CSS variable 命名规范
7. Tailwind token 命名规范
8. AntD theme token 映射规则
9. Light / Dark 主题规则
10. 字体族、字号、字重、行高规则
11. 间距、圆角、描边、阴影、动效、响应式规则
12. 组件 token 规则
13. 禁止事项
14. 审计规则
15. 后续维护流程

要求：
- 面向设计和前端都能理解
- 规则要能落地执行
- 不要修改任何文件，先只输出规范草案
```

---

## Step 4. 重构 tokens.lib.pen

### 目标

把 `tokens.lib.pen` 从“展示规范的画板文件”治理成真正的 token source of truth。

### 操作说明

重构时不要一次性全改。建议按类别逐步处理：

1. 清理无效变量
2. 补齐字体 token
3. 补齐语义颜色 token
4. 补齐行高和字重 token
5. 补齐控件尺寸 token
6. 补齐描边、阴影、透明度、动效 token
7. 补齐响应式 token
8. 补齐组件 token
9. 更新画板说明
10. 保存并验证

### 4.1 清理变量区

要检查：

- 是否有测试变量
- 是否有重复变量
- 是否有命名不规范变量
- 是否有组件文件里用到但源文件没定义的变量

### 提示词模板：清理前审计

```txt
请只读检查 design/tokens.lib.pen 的 variables 区。

输出：
1. 当前变量总数
2. 按类别分组
3. 疑似测试变量
4. 疑似重复变量
5. 命名不符合规范的变量
6. 组件和前端正在使用但 tokens.lib.pen 没有定义的变量
7. 建议新增、重命名、删除的变量清单

注意：
- 不要修改文件
- 只输出清单和建议
```

### 4.2 补齐字体系统

字体系统至少包括：

```txt
font-family-base
font-family-heading
font-family-code
font-size-xxs
font-size-xs
font-size-sm
font-size
font-size-lg
font-size-xl
font-size-heading-1
font-size-heading-2
font-size-heading-3
font-size-heading-4
font-size-heading-5
font-weight-regular
font-weight-medium
font-weight-semibold
font-weight-bold
line-height
line-height-sm
line-height-lg
line-height-heading-1
line-height-heading-2
line-height-heading-3
line-height-heading-4
line-height-heading-5
```

### 提示词模板：字体治理

```txt
请治理 design/tokens.lib.pen 的字体系统。

目标：
- tokens.lib.pen 必须成为字体族、字号、字重、行高的唯一源头
- Text Styles 画板必须和 variables 区一致
- 后续 Pencil 组件和前端组件都应消费这些 token

请执行：
1. 读取 Text Styles 画板
2. 读取 variables 区已有字体相关 token
3. 对比缺失项
4. 给出建议字体 token 表
5. 等我确认后，再写入 tokens.lib.pen

字体 token 至少包含：
- font-family-base
- font-family-heading
- font-family-code
- font-size-xxs/xs/sm/base/lg/xl
- font-size-heading-1..5
- font-weight-regular/medium/semibold/bold
- line-height base/sm/lg
- line-height-heading-1..5

注意：
- 如果发现 Text Styles 中 Medium 实际是 700，需要明确指出这个命名和数值不一致
- 不要擅自决定 Medium 是 500 还是 700，先让我确认
- 未确认前不要修改文件
```

### 4.3 补齐语义颜色系统

语义颜色至少包括：

```txt
color-primary
color-primary-hover
color-primary-active
color-primary-bg
color-primary-bg-hover
color-primary-border
color-success
color-warning
color-error
color-info
color-text
color-text-secondary
color-text-tertiary
color-text-disabled
color-text-placeholder
color-bg-layout
color-bg-container
color-bg-elevated
color-bg-mask
color-border
color-border-secondary
color-fill
color-fill-secondary
color-fill-tertiary
color-fill-quaternary
```

### 提示词模板：颜色治理

```txt
请治理 design/tokens.lib.pen 的语义颜色系统。

目标：
- 基础色板继续保留
- 补齐 Ant Design 风格的语义颜色 token
- 让 Pencil 组件和前端组件优先使用语义色，而不是直接使用基础色板

请先只读分析：
1. Colors 画板里有哪些基础色板
2. Seed / Map / Alias 画板里有哪些语义颜色
3. variables 区已经有哪些颜色变量
4. design/components 当前高频引用了哪些颜色 token
5. frontend 当前高频引用了哪些颜色 CSS variables

然后输出：
1. 建议补齐的 color token 清单
2. 每个 token 的 Light 值
3. 每个 token 的 Dark 值，如果当前文件有定义
4. 每个 token 对应的 AntD token 名称
5. 该 token 属于 Seed / Palette / Map / Alias / Component 哪一层

注意：
- 先输出建议，不要修改文件
- 不要把所有随机 hex 色都提升为核心 token
- 优先沉淀高频、语义明确、组件需要的 token
```

### 4.4 补齐尺寸、描边、动效、响应式

需要治理：

```txt
control-height
control-height-sm
control-height-lg
line-width
line-width-bold
line-width-focus
opacity-loading
z-index-popup-base
motion-duration-fast
motion-duration-base
motion-duration-slow
motion-ease-in-out
motion-ease-out
screen-xs
screen-sm
screen-md
screen-lg
screen-xl
screen-xxl
```

### 提示词模板：非颜色 token 治理

```txt
请治理 design/tokens.lib.pen 中除颜色和字体之外的基础 token。

范围：
1. control height
2. size scale
3. spacing
4. radius
5. line width
6. opacity
7. shadow
8. z-index
9. motion
10. responsive screens

请先只读分析：
- Seed 画板中有哪些基础输入
- Map 画板中有哪些派生尺寸
- Alias 画板中有哪些 padding、margin、screen、opacity、layout token
- Responsive 画板中有哪些断点和显示规则
- variables 区已经沉淀了哪些
- design/components 和 frontend 当前实际用了哪些

然后输出：
- 必须补齐的 token
- 可选补齐的 token
- 暂时不建议沉淀的 token
- 每个 token 的建议命名、数值、所属层级、用途

不要修改文件，先输出建议表。
```

### 4.5 保存和落盘验证

`.pen` 文件被 Pencil 打开时，修改后要确认已经保存。

### 提示词模板：保存验证

```txt
请确认 design/tokens.lib.pen 的修改已经落盘。

检查要求：
1. 从磁盘重新读取 design/tokens.lib.pen
2. 确认新增/修改的 token 存在
3. 如果 Pencil 当前打开该文件，请确认窗口是否仍显示 Edited
4. 如果仍显示 Edited，请执行保存
5. 保存后再次确认窗口不显示 Edited

请输出：
- 是否已经写入磁盘
- 是否已经保存到 Pencil
- 我现在是否可以安全关闭 Pencil 文件
```

---

## Step 5. 治理 Pencil 组件库

### 目标

让 `design/components/*.lib.pen` 成为真正消费 `tokens.lib.pen` 的组件库。

### 推荐治理顺序

```txt
1. general-new.lib.pen
2. data-entry-new.lib.pen
3. feedback-new.lib.pen
4. navigation-new.lib.pen
5. data-display-new.lib.pen
6. layout-new.lib.pen
```

原因：

- General 里的 Button / Typography 是基础
- Data Entry 里的 Input / Select / Form 依赖基础 token
- Feedback / Navigation / Data Display 会复用前面规则
- Layout 往往和业务系统壳有关，最后治理更稳

### 组件治理标准

每个组件至少要有：

- 默认态
- Hover
- Active
- Focus
- Disabled
- Loading，如果适用
- Error / Warning，如果适用
- Small / Middle / Large，如果适用
- Light / Dark，如果适用
- 组件 token 表

### 禁止事项

组件中不要出现：

```txt
fill: #1677ff
fontSize: 14
fontFamily: PingFang SC
cornerRadius: 8
gap: 12
```

应该改成：

```txt
fill: $color-primary
fontSize: $font-size
fontFamily: $font-family-base
cornerRadius: $radius-lg
gap: $space-12
```

### 提示词模板：单个 Pencil 组件文件治理

```txt
请治理 design/components/[组件文件名].lib.pen。

目标：
- 该组件文件必须以 design/tokens.lib.pen 为 token 源
- 组件视觉样式要符合 tokens.lib.pen 的 Seed / Map / Alias / Component token 规范
- 不要引入新的散乱本地变量
- 不要硬编码颜色、字号、圆角、间距、字体、字重、行高

请先只读审计该文件：
1. 本地 variables 数量
2. 当前引用的 $token 清单
3. 哪些 $token 不存在于 tokens.lib.pen
4. 哪些样式属性仍然硬编码
5. 哪些 token 应该改成 Alias token
6. 哪些 token 应该改成 Component token

然后输出治理方案：
1. 本次建议治理哪些组件
2. 哪些变量需要先补到 tokens.lib.pen
3. 哪些硬编码可以安全替换
4. 哪些硬编码属于展示画板，不建议替换
5. 修改风险

在我确认前不要修改文件。
```

### 提示词模板：确认后执行单文件治理

```txt
请按已确认方案治理 design/components/[组件文件名].lib.pen。

执行规则：
1. 只修改这个组件文件
2. 不修改 design/pages
3. 不修改业务前端页面
4. 不删除组件展示内容
5. 将核心组件样式替换为 tokens.lib.pen 中已定义的 token
6. 如果发现需要的新 token 不存在，停止并告诉我，不要临时发明本地 token

完成后请验证：
1. 文件可被 JSON 解析
2. 没有引用不存在的 $token
3. 核心组件没有硬编码颜色
4. 核心组件没有硬编码字体大小
5. 核心组件没有硬编码字体族
6. 输出修改摘要和剩余问题
```

---

## Step 6. 生成前端 token 输出

### 目标

让前端代码不直接依赖 Pencil 文件，而是通过稳定的中间产物消费 token。

推荐输出：

```txt
frontend/src/styles/globals.css
frontend/src/styles/antd-theme.ts
frontend/tailwind.config.ts
frontend/src/styles/tokens.json
```

### 6.1 globals.css

`globals.css` 应该包含：

- CSS variables
- Light theme
- Dark theme
- body 默认字体、背景、文字颜色

示例：

```css
:root {
  --color-primary: #1677ff;
  --color-text: rgba(0, 0, 0, 0.88);
  --font-family-base: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  --font-size: 14px;
}

[data-theme="dark"] {
  --color-primary: #1668dc;
  --color-text: rgba(255, 255, 255, 0.85);
}
```

### 6.2 tailwind.config.ts

Tailwind 只暴露设计系统允许使用的 token。

不建议让业务开发随便写：

```txt
text-[13px]
bg-[#1677ff]
rounded-[7px]
```

应该提供：

```txt
text-base
bg-primary
rounded-lg
```

### 6.3 antd-theme.ts

建议把 AntD theme 单独放进一个文件：

```txt
frontend/src/styles/antd-theme.ts
```

不要长期把所有 theme token 写在 `main.tsx` 里。

### 提示词模板：前端 token 输出设计

```txt
请基于 design/tokens.lib.pen 设计前端 token 输出方案。

目标：
- frontend/src/styles/globals.css 从 tokens.lib.pen 派生
- frontend/tailwind.config.ts 从同一套 token 派生
- frontend/src/styles/antd-theme.ts 从同一套 token 派生
- 不以现有业务页面为依据，因为业务代码会重构

请先输出方案，不要修改文件：

1. globals.css 应该包含哪些 CSS variables
2. Light / Dark theme 如何组织
3. Tailwind 应该暴露哪些 colors、spacing、radius、fontSize、fontFamily、fontWeight、lineHeight、boxShadow、screens、zIndex、transition
4. AntD theme 应该映射哪些 token
5. 哪些 token 不应该暴露给业务开发
6. 是否建议增加 tokens.json
7. 是否建议增加 sync-design-tokens.ts
```

### 提示词模板：执行前端 token 输出

```txt
请按已确认方案更新前端 token 基础设施。

允许修改：
- frontend/src/styles/globals.css
- frontend/tailwind.config.ts
- frontend/src/styles/antd-theme.ts
- frontend/src/styles/tokens.json，如果需要
- scripts/sync-design-tokens.ts，如果需要

禁止修改：
- 业务页面
- 业务接口代码
- 与设计系统无关的文件

要求：
1. 所有 CSS variables 必须能追溯到 design/tokens.lib.pen
2. Tailwind config 不能暴露未登记 token
3. AntD theme token 必须从 CSS variables 或 tokens.json 映射
4. 不要硬编码业务专属颜色
5. 完成后运行类型检查或构建，如果项目支持

输出：
- 修改了哪些文件
- 每个文件承担什么职责
- 哪些 token 已经打通
- 哪些 token 仍待补齐
```

---

## Step 7. 重建 frontend/src/components 组件库

### 目标

建立一个和 Pencil 组件库一致的 React 组件库。它不是业务代码，而是未来业务系统复用的基础。

### 推荐组件目录

```txt
frontend/src/components/
  general/
    Button/
    IconButton/
    Typography/
  data-entry/
    Input/
    Select/
    Checkbox/
    Radio/
    Switch/
    Form/
    Upload/
  data-display/
    Card/
    Table/
    Tag/
    Badge/
    Empty/
  feedback/
    Alert/
    Modal/
    Drawer/
    Message/
    Notification/
    Result/
  navigation/
    Menu/
    Tabs/
    Breadcrumb/
    Pagination/
  layout/
    Layout/
    Header/
    Sider/
```

### 每个组件应该包含

```txt
index.ts
ComponentName.tsx
ComponentName.types.ts
ComponentName.demo.tsx
README.md
```

### 组件实现原则

1. 优先基于 Ant Design 组件封装。
2. 封装层只暴露设计系统允许的 variant、size、state。
3. 样式只使用 CSS variables / Tailwind token / AntD theme。
4. 不直接写 hex 色值。
5. 不直接写业务文案。
6. 不写业务接口逻辑。

### 提示词模板：单个 React 组件设计

```txt
请为设计系统实现 frontend/src/components/[分类]/[组件名] 组件。

背景：
- 这是可复用设计系统组件，不是业务页面
- 设计源来自 design/tokens.lib.pen
- 设计表现参考 design/components/[对应 Pencil 文件].lib.pen
- 前端使用 Ant Design 6.x 风格
- 样式必须通过 CSS variables、Tailwind token 或 AntD theme 消费

请先只读分析：
1. 对应 Pencil 组件有哪些变体
2. 有哪些状态：default、hover、active、focus、disabled、loading、error、warning
3. 有哪些尺寸：small、middle、large
4. 使用了哪些 token
5. AntD 原生组件提供了哪些能力

然后输出实现方案：
1. 组件 API
2. props 类型
3. variant / size / state 设计
4. token 使用方式
5. 文件结构
6. demo 覆盖范围

先不要修改文件，等我确认。
```

### 提示词模板：执行单个 React 组件

```txt
请按已确认方案实现 frontend/src/components/[分类]/[组件名]。

允许修改：
- frontend/src/components/[分类]/[组件名]/**
- 必要的 barrel export 文件
- 该组件的 demo/README

禁止修改：
- 业务页面
- 业务接口
- 与该组件无关的组件

实现要求：
1. 使用 TypeScript
2. 基于 Ant Design 能力封装
3. 使用设计系统 token
4. 不硬编码 hex 色值
5. 不硬编码非 token 字号
6. 覆盖 default、hover、active、focus、disabled、loading、error/warning 等适用状态
7. 提供 demo
8. 导出类型

完成后运行：
- npm run lint，如果可用
- npm run build，如果可用

输出：
- 修改文件
- 组件 API
- token 使用说明
- 验证结果
```

---

## Step 8. 建立 demo / story / 文档

### 目标

设计系统不是只有代码，还需要让设计师和前端都能看懂、能验证。

### 推荐产物

```txt
frontend/src/components/[category]/[component]/README.md
frontend/src/components/[category]/[component]/[Component].demo.tsx
frontend/src/design-system-demo/
```

如果将来引入 Storybook，可以再迁移。

### 每个组件文档应包含

- 组件用途
- 何时使用
- 何时不使用
- Props
- Variant
- Size
- State
- Token 映射
- 与 AntD 原组件的关系
- 示例

### 提示词模板：组件文档

```txt
请为 frontend/src/components/[分类]/[组件名] 编写设计系统组件文档。

文档面向：
- 设计师
- 前端开发
- 产品经理

请包含：
1. 组件用途
2. 何时使用
3. 何时不使用
4. Props 表
5. Variant 说明
6. Size 说明
7. State 说明
8. Token 映射表
9. 与 Ant Design 原组件的关系
10. 使用示例
11. 注意事项

要求：
- 不写业务系统专属内容
- 文档要能被其他项目复用
- 示例代码必须使用设计系统 token 和组件 API
```

---

## Step 9. 建立自动审计脚本

### 目标

防止设计系统后续再次变乱。

### 推荐脚本

```txt
scripts/audit-design-tokens.ts
scripts/audit-pencil-components.ts
scripts/audit-frontend-tokens.ts
```

### 审计规则

Pencil 文件检查：

- 是否引用了不存在的 `$token`
- 是否存在裸 hex 色值
- 是否存在裸字号
- 是否存在裸字体族
- 是否存在组件本地重复变量

前端文件检查：

- 是否存在 `#xxxxxx`
- 是否存在 `text-[13px]`
- 是否存在 `rounded-[7px]`
- 是否存在未登记 CSS variable
- Tailwind config 是否引用了未定义 CSS variable

### 提示词模板：审计脚本

```txt
请为当前设计系统建立自动审计脚本。

目标：
- 检查 design/tokens.lib.pen、design/components/*.lib.pen、frontend token 文件、frontend/src/components 是否符合设计系统治理规则

请先设计脚本方案，不要修改文件：

1. 需要哪些脚本
2. 每个脚本检查什么
3. 输入文件是什么
4. 输出报告格式是什么
5. 哪些问题属于 error
6. 哪些问题属于 warning
7. 哪些问题可以忽略

审计至少覆盖：
- 未定义 token 引用
- 裸 hex 色值
- 裸字号
- 裸字体族
- 裸圆角
- 裸间距
- 未登记 CSS variable
- Tailwind config 和 globals.css 不一致
- React 组件硬编码颜色/字号

输出方案后等待我确认。
```

### 提示词模板：执行审计脚本

```txt
请按已确认方案实现设计系统审计脚本。

允许新增：
- scripts/audit-design-tokens.ts
- scripts/audit-pencil-components.ts
- scripts/audit-frontend-tokens.ts
- 必要的 package.json scripts，如果需要

要求：
1. 脚本只读，不修改文件
2. 输出清晰的 error/warning
3. 能定位到文件
4. 能统计总数
5. 能用于后续 CI

完成后运行脚本，并输出审计结果摘要。
```

---

## Step 10. 验收设计系统

### 目标

确认治理不是“看起来改了”，而是真的形成完整链路。

### 验收清单

`tokens.lib.pen`：

- [ ] 变量区包含完整基础 token
- [ ] 变量区包含完整语义 token
- [ ] 变量区包含字体族、字号、字重、行高
- [ ] 变量区包含响应式、动效、阴影、z-index
- [ ] 画板说明和 variables 一致
- [ ] Light / Dark 规则明确

`design/components`：

- [ ] 核心组件引用源 token
- [ ] 没有关键样式硬编码
- [ ] 状态完整
- [ ] 尺寸完整
- [ ] 组件 token 表完整

`frontend`：

- [ ] CSS variables 可追溯到 tokens.lib.pen
- [ ] Tailwind config 只暴露允许 token
- [ ] AntD theme 从 token 映射
- [ ] React 组件不硬编码颜色和字号
- [ ] 组件 demo 覆盖主要状态

自动审计：

- [ ] 能检查 Pencil token
- [ ] 能检查 CSS variables
- [ ] 能检查 Tailwind config
- [ ] 能检查 React 组件硬编码
- [ ] 能输出 error/warning

### 提示词模板：整体验收

```txt
请对当前设计系统做一次整体验收审计。

范围：
1. design/tokens.lib.pen
2. design/components/*.lib.pen
3. frontend/src/styles/globals.css
4. frontend/tailwind.config.ts
5. frontend/src/styles/antd-theme.ts
6. frontend/src/components
7. scripts/audit-*.ts

请检查：
- tokens.lib.pen 是否是唯一 source of truth
- Pencil 组件库是否消费 tokens.lib.pen
- 前端 CSS variables 是否从 tokens.lib.pen 派生
- Tailwind config 是否和 CSS variables 一致
- AntD theme 是否和 token 一致
- React 组件是否使用设计系统 token
- 是否还有硬编码颜色、字号、圆角、间距
- 是否还有未定义 token 引用
- 是否存在 Light / Dark 断层
- 是否存在字体规范断层

输出：
1. 验收通过项
2. 阻塞问题
3. 非阻塞问题
4. 后续优化建议
5. 是否建议进入业务页面设计阶段

注意：
- 只读检查
- 不修改文件
```

---

## Step 11. 迁移到其他系统时怎么用

### 目标

让这套设计系统不绑定当前业务。

### 可复用资产

可以迁移：

```txt
design/tokens.lib.pen
design/components/*.lib.pen
frontend/src/styles/globals.css
frontend/src/styles/antd-theme.ts
frontend/tailwind.config.ts
frontend/src/components
scripts/audit-*.ts
```

不一定迁移：

```txt
design/pages
frontend/src/pages
业务 API
业务路由
业务状态管理
```

### 新系统接入流程

1. 复制 tokens 和 components
2. 修改 Seed Token，例如品牌色、字体、圆角
3. 重新生成 CSS variables
4. 运行审计脚本
5. 基于组件库搭建业务页面

### 提示词模板：迁移到新系统

```txt
我要把当前设计系统迁移到一个新业务系统中。

请帮我制定迁移方案。

当前可复用资产：
- design/tokens.lib.pen
- design/components/*.lib.pen
- frontend/src/styles/globals.css
- frontend/tailwind.config.ts
- frontend/src/styles/antd-theme.ts
- frontend/src/components
- scripts/audit-*.ts

新系统需要替换：
- 品牌色
- 系统名称
- 业务页面
- 业务路由
- 业务 API

请输出：
1. 哪些文件直接复制
2. 哪些 token 需要改
3. 哪些文件不能复制
4. 新系统接入顺序
5. 验收清单
6. 风险点
```

---

## 12. 常用提示词合集

### 12.1 只读模式总提示词

```txt
请只读分析当前设计系统，不要做任何修改。

分析范围：
- design/tokens.lib.pen
- design/components
- frontend/src/styles
- frontend/tailwind.config.ts
- frontend/src/components

输出：
- 当前结构
- 主要问题
- 风险
- 推荐下一步

注意：
- 不要改文件
- 不要格式化文件
- 不要启动业务开发
```

### 12.2 修改前确认提示词

```txt
请在修改前输出详细执行计划。

计划必须包含：
1. 要修改哪些文件
2. 每个文件为什么要改
3. 每个文件具体改什么
4. 哪些文件不会改
5. 修改风险
6. 验证方式

等我确认后再执行。
```

### 12.3 执行治理提示词

```txt
请按照已确认计划执行治理。

要求：
1. 严格限制修改范围
2. 不改业务页面
3. 不改无关文件
4. 不引入临时 token
5. 不绕过 tokens.lib.pen
6. 修改后运行审计
7. 输出修改摘要和剩余问题
```

### 12.4 Pencil 保存提示词

```txt
请确认刚才修改的 Pencil 文件已经保存并落盘。

请检查：
1. 磁盘文件是否包含刚才的修改
2. Pencil 窗口标题是否仍显示 Edited
3. 如果显示 Edited，请执行保存
4. 保存后再次确认

输出：
- 是否落盘
- 是否保存
- 我是否可以安全关闭 Pencil
```

### 12.5 发现断层时的提示词

```txt
我发现设计系统可能存在断层。

请帮我只读检查：
1. tokens.lib.pen 是否有对应 token
2. design/components 是否使用了这个 token
3. globals.css 是否输出了这个 token
4. tailwind.config.ts 是否暴露了这个 token
5. React 组件是否消费了这个 token

请输出断层位置和修复建议，不要直接修改。
```

---

## 13. 小白最容易犯的错误

### 错误 1：看到缺颜色就新增一个颜色

不要这样做。先判断它是：

- 基础色板
- 语义颜色
- 组件状态色
- 业务专属颜色
- 临时展示色

只有高频、稳定、语义明确的颜色才应该进入 token。

### 错误 2：把所有 AntD token 都一次性变量化

不建议一口气变量化所有 token。先治理高频、核心、会被组件真正使用的 token。

### 错误 3：组件里继续写死尺寸

例如：

```txt
height: 32
padding: 8
radius: 6
```

应该转成：

```txt
control-height
padding-sm
radius
```

### 错误 4：前端只改 Tailwind，不改设计源

如果 `tailwind.config.ts` 里有 token，但 `tokens.lib.pen` 没有，这就不是完整设计系统。

### 错误 5：页面先行

设计系统还没稳定时先做业务页面，会导致页面带着临时规范四处扩散。

---

## 14. 推荐第一轮实际执行计划

第一轮不要追求全部完成。建议先跑通最小闭环。

### 第一轮范围

```txt
tokens.lib.pen:
  typography
  semantic colors
  spacing
  radius
  control height

design/components:
  general-new.lib.pen 中的 Button 和 Typography

frontend:
  globals.css
  tailwind.config.ts
  antd-theme.ts
  frontend/src/components/general/Button
  frontend/src/components/general/Typography

scripts:
  audit-design-tokens.ts
```

### 第一轮验收目标

1. Button 的设计稿、CSS token、Tailwind、AntD theme、React 组件全部打通。
2. Typography 的字体族、字号、字重、行高全部打通。
3. 审计脚本能发现未定义 token 和硬编码颜色。

### 第一轮启动提示词

```txt
请启动设计系统治理第一轮最小闭环。

第一轮目标：
1. 治理 tokens.lib.pen 的 typography、semantic colors、spacing、radius、control height
2. 治理 design/components/general-new.lib.pen 中的 Button 和 Typography
3. 生成 frontend/src/styles/globals.css、frontend/tailwind.config.ts、frontend/src/styles/antd-theme.ts
4. 实现 frontend/src/components/general/Button 和 Typography
5. 建立基础审计脚本 audit-design-tokens.ts

请先不要修改文件。
请输出：
1. 当前文件审计摘要
2. 第一轮详细执行计划
3. 每个阶段要修改的文件
4. 每个阶段的验收标准
5. 风险点
6. 需要我确认的问题

我确认后再开始执行。
```

---

## 15. 最终完成标准

当下面这些都成立时，设计系统治理才算完成：

1. `tokens.lib.pen` 是唯一 token 源。
2. 所有核心 token 都有清晰分层。
3. Pencil 组件库引用源 token。
4. 前端 CSS variables 来自源 token。
5. Tailwind config 和 CSS variables 一致。
6. AntD theme 和源 token 一致。
7. React 组件库不依赖业务代码。
8. 组件状态、尺寸、变体完整。
9. 审计脚本能持续发现偏差。
10. `design/` 除 pages 外可以迁移到其他系统复用。

