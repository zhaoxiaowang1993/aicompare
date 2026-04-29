# Token Governance Status

日期：2026-04-29

## 文档作用

本文档记录当前 `design/tokens.lib.pen` 的 token 治理现状，用于说明变量区、顶层规范画板、沉淀完成度、规范符合度和特殊规则覆盖情况。

本文档不是 token 总纲，不替代 `design/specs/token-guidebook.md`；也不是特殊规则清单，不替代 `design/specs/token-special-case.md`。后续治理 `design/components/*.lib.pen`、CSS variables、Tailwind、AntD theme 和 React 组件库时，可用本文档判断当前 token source of truth 的基线状态。

## 一、tokens.lib.pen 审计

当前 variables 总数：`1226`

### 1. variables 分类统计

| 类别 | 数量 |
|---|---:|
| Seed | 32 |
| Palette Color | 253 |
| Semantic Color | 103 |
| Component | 640 |
| Responsive | 49 |
| Opacity | 26 |
| Padding | 15 |
| Control / Size | 14 |
| Line Height | 14 |
| Motion | 13 |
| Font Size | 12 |
| Spacing Scale | 12 |
| Radius | 9 |
| Margin | 8 |
| Shadow | 7 |
| Line Width / Stroke | 5 |
| Font Weight | 4 |
| Font Family | 3 |
| Font Style | 3 |
| Link | 3 |
| Z-index | 1 |
| Other | 0 |

### 2. 顶层画板规范统计

| 画板 | 规范数量 | 沉淀情况 |
|---|---:|---|
| Seed | 32 | 32/32 已覆盖 |
| Colors | 133 | 133/133 已覆盖 |
| Map | 113 | 113/113 已覆盖 |
| Alias | 115 | 115/115 已覆盖 |
| Responsive | 13 | 已通过 responsive runtime token 矩阵覆盖 |
| Text Styles | 7 组 | 已通过 typography token 覆盖 |
| Components | 56 个组件 / 630 条 | 630/630 已覆盖 |

说明：当前文件里有两个名为 `Colors` 的顶层节点。审计采用的是包含 `red / volcano / orange / gold / yellow / lime / green / cyan / blue / geekblue / purple / magenta / gray` 的基础色板画板。另一个 `Colors` 更像封面或展示节点，后续脚本不要只按 name 定位，应按结构或 id 定位。

### 3. 剩余未沉淀规范

剩余未沉淀成 variables 的规范：`0`。

其中 `transparent` 没有作为全局 token 沉淀，这是 `design/specs/token-special-case.md` 已明确的特殊规则，不计为缺口。

## 二、审计结论

### 1. 完成度

`tokens.lib.pen` 治理已经达到当前阶段闭环。

Seed、Palette、Map、Alias、Responsive、Text Styles、Components 均已完成沉淀，或有明确特殊规则解释。

第三阶段收尾后的 8 个问题已经处理完：有效项已沉淀，源文件错误项已清理。

### 2. 规范度

整体符合当前规范文件。

仓库中现行纲领文件是 `design/specs/token-guidebook.md`，也就是原 `token-governance-spec.md` 的更名版本。

未发现明确违反规范的变量命名。所有 variables 都能归入治理分类，没有孤立 Other token。

### 3. 准确度

| 模块 | 对比结论 |
|---|---|
| Seed | 与画板一致；`motionBase`、`wireframe` 已补为 `seed-motion-base`、`seed-wireframe` |
| Colors | 133 个基础色板均已沉淀 |
| Map | 已覆盖；`color*Base` 映射到 `seed-color-*`，`borderRadius*` 映射到 `radius-*` |
| Alias | 已覆盖；`fontWeightNormal/Strong` 映射为 `font-weight-regular/bold`，italic 样式已沉淀 |
| Responsive | 不是一行一 token，而是沉淀为 `screen-*`、`responsive-device-*`、`responsive-query-*`、`responsive-only-*`、`responsive-hide-*` 等矩阵 |
| Text Styles | 已由 font family / size / weight / line-height / font-style token 覆盖 |
| Components | 630 条组件规范均有对应变量；组件 shadow 使用全局 shadow alias，符合治理决策 |

### 4. 可解释度

本轮对比中用到的特殊规则均已在 `design/specs/token-special-case.md` 中体现，包括：

- Component Token 可引用全局 token
- `$responsive-query-*` 是 media query 引用列表
- `screen-*` 与 `responsive-*` 分工
- `transparent` 不作为全局 token
- Component raw hex 可暂存为组件私有值
- shadow 当前是最小集
- `fontWeightNormal/Strong` 不作为正式变量
- `borderRadius*` 映射为 `radius-*`
- Heading 编号带连字符
- opacity 按实际值命名
- Seed runtime 输入项
- `font-size-icon` 独立 Alias Token
- italic text style 是复合样式 token
- string token 不都适合 Pencil 直接消费
